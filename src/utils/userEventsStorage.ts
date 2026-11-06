import { EventItem, INITIAL_EVENTS } from '../data/eventsData';
import { addCommunityEvent, deleteCommunityEvent as deleteCommunityEventFromDb, saveEventRsvp } from '../lib/firestoreService';

const FAVORITES_STORAGE_KEY = 'lanka_favorite_events';
const COMMUNITY_EVENTS_KEY = 'lanka_community_events';
const RSVPS_STORAGE_KEY = 'lanka_event_rsvps_v2';
const FOLLOWED_ORGANIZERS_KEY = 'lanka_followed_organizers';
const EVENT_REMINDERS_KEY = 'lanka_event_reminders';
const EVENT_REPORTS_KEY = 'lanka_event_reports';

// Clear legacy mock events from localStorage
try {
  const cached = localStorage.getItem(COMMUNITY_EVENTS_KEY);
  if (cached && (cached.includes('"e1"') || cached.includes('"e2"') || cached.includes('"e3"'))) {
    localStorage.removeItem(COMMUNITY_EVENTS_KEY);
  }
  const cachedRsvps = localStorage.getItem(RSVPS_STORAGE_KEY);
  if (cachedRsvps && cachedRsvps.includes('"rsvp-1"')) {
    localStorage.removeItem(RSVPS_STORAGE_KEY);
  }
} catch {
  // Ignore
}

const DEFAULT_FAVORITES: string[] = [];

export interface EventRsvpRecord {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  guests: number;
  status: "confirmed" | "waitlist" | "cancelled";
  createdAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  ticketCode: string;
}

export interface EventReport {
  id: string;
  eventId: string;
  eventTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
  adminNote?: string;
}

// Initial seed RSVPs empty array for live database
const INITIAL_RSVPS: EventRsvpRecord[] = [];

// Initial seed reports
const INITIAL_REPORTS: EventReport[] = [];

// ==========================================
// FAVORITES / SAVED EVENTS
// ==========================================

export function getFavoriteEventIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function isEventFavorited(eventId: string): boolean {
  const favs = getFavoriteEventIds();
  return favs.includes(eventId);
}

export function toggleFavoriteEventId(eventId: string): { isFavorite: boolean; favorites: string[] } {
  try {
    const current = getFavoriteEventIds();
    let updated: string[];
    let isFavorite: boolean;
    if (current.includes(eventId)) {
      updated = current.filter(id => id !== eventId);
      isFavorite = false;
    } else {
      updated = [...current, eventId];
      isFavorite = true;
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_favorites_updated', { detail: { favorites: updated, eventId, isFavorite } }));
    return { isFavorite, favorites: updated };
  } catch {
    return { isFavorite: false, favorites: [] };
  }
}

export function getFavoriteEvents(sourceEvents?: EventItem[]): EventItem[] {
  const favIds = getFavoriteEventIds();
  const pool = sourceEvents && sourceEvents.length > 0 ? sourceEvents : getAllCommunityEvents();
  return pool.filter(e => favIds.includes(e.id));
}

// ==========================================
// ALL COMMUNITY EVENTS (CRUD)
// ==========================================

export function getAllCommunityEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(COMMUNITY_EVENTS_KEY);
    const custom: EventItem[] = raw ? JSON.parse(raw) : [];
    const customIds = new Set(custom.map(c => c.id));
    const combined = [...custom, ...INITIAL_EVENTS.filter(e => !customIds.has(e.id))];
    return combined;
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveCommunityEvent(event: EventItem): void {
  try {
    const raw = localStorage.getItem(COMMUNITY_EVENTS_KEY);
    const existing: EventItem[] = raw ? JSON.parse(raw) : [];
    const updated = [event, ...existing.filter(e => e.id !== event.id)];
    localStorage.setItem(COMMUNITY_EVENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_events_updated', { detail: { event } }));
    // Asynchronously sync event to live Firestore database
    addCommunityEvent(event, event.id).catch(err => {
      console.warn("Firestore sync warning for event:", err);
    });
  } catch (err) {
    console.error('Error saving community event', err);
  }
}

export function updateCommunityEvent(updatedEvent: EventItem): void {
  saveCommunityEvent(updatedEvent);
}

export function cancelCommunityEvent(eventId: string, reason: string): boolean {
  try {
    const events = getAllCommunityEvents();
    const target = events.find(e => e.id === eventId);
    if (!target) return false;

    const updated: EventItem = {
      ...target,
      isCancelled: true,
      cancellationReason: reason,
      announcements: [
        {
          id: `ann-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          message: `EVENT CANCELLED: ${reason}`,
          author: target.organizer
        },
        ...(target.announcements || [])
      ]
    };
    saveCommunityEvent(updated);
    return true;
  } catch {
    return false;
  }
}

export function sendEventAnnouncement(eventId: string, message: string, author: string): boolean {
  try {
    const events = getAllCommunityEvents();
    const target = events.find(e => e.id === eventId);
    if (!target) return false;

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      message,
      author: author || target.organizer
    };

    const updated: EventItem = {
      ...target,
      announcements: [newAnnouncement, ...(target.announcements || [])]
    };
    saveCommunityEvent(updated);
    return true;
  } catch {
    return false;
  }
}

export function manageCoOrganizers(eventId: string, coOrganizers: string[]): boolean {
  try {
    const events = getAllCommunityEvents();
    const target = events.find(e => e.id === eventId);
    if (!target) return false;

    const updated: EventItem = {
      ...target,
      coOrganizers
    };
    saveCommunityEvent(updated);
    return true;
  } catch {
    return false;
  }
}

export function deleteCommunityEvent(eventId: string): boolean {
  try {
    const raw = localStorage.getItem(COMMUNITY_EVENTS_KEY);
    const existing: EventItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(e => e.id !== eventId);
    localStorage.setItem(COMMUNITY_EVENTS_KEY, JSON.stringify(filtered));
    deleteCommunityEventFromDb(eventId).catch(console.error);
    window.dispatchEvent(new CustomEvent('lanka_events_updated', { detail: { deletedId: eventId } }));
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// RSVP, GUEST & WAITING LIST MANAGEMENT
// ==========================================

export function getAllRsvps(): EventRsvpRecord[] {
  try {
    const raw = localStorage.getItem(RSVPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(INITIAL_RSVPS));
      return INITIAL_RSVPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RSVPS;
  }
}

export function saveAllRsvps(rsvps: EventRsvpRecord[]): void {
  try {
    localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(rsvps));
    window.dispatchEvent(new CustomEvent('lanka_rsvps_updated', { detail: { count: rsvps.length } }));
  } catch (err) {
    console.error("Error saving RSVPs:", err);
  }
}

export function getEventRsvps(eventId: string): EventRsvpRecord[] {
  const all = getAllRsvps();
  return all.filter(r => r.eventId === eventId);
}

export function getUserRsvps(userEmailOrId: string): EventRsvpRecord[] {
  const all = getAllRsvps();
  const searchKey = userEmailOrId.toLowerCase().trim();
  return all.filter(r => 
    r.userEmail.toLowerCase() === searchKey || 
    r.userId.toLowerCase() === searchKey ||
    r.userName.toLowerCase() === searchKey
  );
}

export function getUserRsvpForEvent(eventId: string, userEmailOrId: string): EventRsvpRecord | undefined {
  const all = getAllRsvps();
  const searchKey = userEmailOrId.toLowerCase().trim();
  return all.find(r => 
    r.eventId === eventId && 
    (r.userEmail.toLowerCase() === searchKey || r.userId.toLowerCase() === searchKey || r.userName.toLowerCase() === searchKey) &&
    r.status !== "cancelled"
  );
}

export function submitRsvp(params: {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  guests: number;
}): { success: boolean; record: EventRsvpRecord; isWaitlist: boolean; message: string } {
  const all = getAllRsvps();
  const events = getAllCommunityEvents();
  const event = events.find(e => e.id === params.eventId);

  const normalizedEmail = params.userEmail.toLowerCase().trim();

  // Check for existing active RSVP (duplicate prevention)
  const existingIndex = all.findIndex(r => 
    r.eventId === params.eventId && 
    (r.userEmail.toLowerCase() === normalizedEmail || r.userId === params.userId)
  );

  const capacity = event?.capacity || 0;
  // Calculate total confirmed spots booked
  const confirmedSpots = all
    .filter(r => r.eventId === params.eventId && r.status === "confirmed")
    .reduce((sum, r) => sum + 1 + (r.guests || 0), 0);

  const requestedSpots = 1 + (params.guests || 0);
  const isFull = capacity > 0 && (confirmedSpots + requestedSpots > capacity);
  const targetStatus: "confirmed" | "waitlist" = isFull ? "waitlist" : "confirmed";

  const ticketCode = `TKT-${params.eventId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (existingIndex >= 0) {
    const existing = all[existingIndex];
    if (existing.status !== "cancelled") {
      // Update existing RSVP guest count
      const updatedRecord: EventRsvpRecord = {
        ...existing,
        guests: params.guests,
        userName: params.userName || existing.userName,
        userPhone: params.userPhone || existing.userPhone
      };
      all[existingIndex] = updatedRecord;
      saveAllRsvps(all);
      return {
        success: true,
        record: updatedRecord,
        isWaitlist: updatedRecord.status === "waitlist",
        message: `Your RSVP has been updated (${1 + params.guests} total attending)!`
      };
    } else {
      // Re-activate cancelled RSVP
      const reactivatedRecord: EventRsvpRecord = {
        ...existing,
        userName: params.userName,
        userPhone: params.userPhone,
        guests: params.guests,
        status: targetStatus,
        createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        checkedIn: false
      };
      all[existingIndex] = reactivatedRecord;
      saveAllRsvps(all);
      return {
        success: true,
        record: reactivatedRecord,
        isWaitlist: targetStatus === "waitlist",
        message: targetStatus === "waitlist" 
          ? "Capacity reached. You have been placed on the Priority Waiting List!" 
          : "RSVP confirmed! See you at the gathering."
      };
    }
  }

  // Create fresh RSVP
  const newRecord: EventRsvpRecord = {
    id: `rsvp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId: params.eventId,
    userId: params.userId || `usr-${Date.now()}`,
    userName: params.userName,
    userEmail: params.userEmail,
    userPhone: params.userPhone,
    guests: params.guests,
    status: targetStatus,
    createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    checkedIn: false,
    ticketCode
  };

  all.unshift(newRecord);
  saveAllRsvps(all);

  return {
    success: true,
    record: newRecord,
    isWaitlist: targetStatus === "waitlist",
    message: targetStatus === "waitlist"
      ? "Capacity limit reached. You have been added to the Priority Waiting List!"
      : "RSVP Confirmed! Your registration and digital ticket are ready."
  };
}

export function cancelRsvp(eventId: string, userEmailOrId: string): { success: boolean; promotedRecord?: EventRsvpRecord } {
  const all = getAllRsvps();
  const searchKey = userEmailOrId.toLowerCase().trim();

  const targetIndex = all.findIndex(r => 
    r.eventId === eventId && 
    (r.userEmail.toLowerCase() === searchKey || r.userId.toLowerCase() === searchKey || r.userName.toLowerCase() === searchKey) &&
    r.status !== "cancelled"
  );

  if (targetIndex < 0) {
    return { success: false };
  }

  const cancelledRecord = all[targetIndex];
  all[targetIndex] = {
    ...cancelledRecord,
    status: "cancelled",
    checkedIn: false
  };

  // If a confirmed spot was freed, auto-promote the earliest waitlist attendee
  let promotedRecord: EventRsvpRecord | undefined;
  if (cancelledRecord.status === "confirmed") {
    const waitlistIndex = all.findIndex(r => r.eventId === eventId && r.status === "waitlist");
    if (waitlistIndex >= 0) {
      all[waitlistIndex] = {
        ...all[waitlistIndex],
        status: "confirmed"
      };
      promotedRecord = all[waitlistIndex];
    }
  }

  saveAllRsvps(all);
  return { success: true, promotedRecord };
}

export function toggleCheckIn(rsvpId: string, checkedIn: boolean): boolean {
  const all = getAllRsvps();
  const index = all.findIndex(r => r.id === rsvpId);
  if (index < 0) return false;

  all[index] = {
    ...all[index],
    checkedIn,
    checkedInAt: checkedIn ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined
  };

  saveAllRsvps(all);
  return true;
}

export function checkInByTicketCode(eventId: string, ticketCode: string): { success: boolean; attendee?: EventRsvpRecord; message: string } {
  const all = getAllRsvps();
  const normalized = ticketCode.trim().toUpperCase();

  const match = all.find(r => r.eventId === eventId && r.ticketCode.toUpperCase() === normalized);
  if (!match) {
    return { success: false, message: "Invalid ticket code or attendee not registered for this event." };
  }

  if (match.status !== "confirmed") {
    return { success: false, message: `Ticket status is '${match.status}'. Cannot check in non-confirmed registrations.` };
  }

  if (match.checkedIn) {
    return { success: true, attendee: match, message: `Already checked in earlier at ${match.checkedInAt || 'registration'}.` };
  }

  match.checkedIn = true;
  match.checkedInAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  saveAllRsvps(all);

  return {
    success: true,
    attendee: match,
    message: `Check-in successful! Welcome ${match.userName} (+${match.guests} guests).`
  };
}

// ==========================================
// FOLLOWING ORGANISERS
// ==========================================

export function getFollowedOrganizers(): string[] {
  try {
    const raw = localStorage.getItem(FOLLOWED_ORGANIZERS_KEY);
    if (!raw) {
      const defaults = ["Sri Lanka Buddhist Vihara LA Dayaka Sabha"];
      localStorage.setItem(FOLLOWED_ORGANIZERS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleFollowOrganizer(organizerName: string): { isFollowed: boolean; list: string[] } {
  try {
    const current = getFollowedOrganizers();
    let updated: string[];
    let isFollowed: boolean;

    if (current.includes(organizerName)) {
      updated = current.filter(o => o !== organizerName);
      isFollowed = false;
    } else {
      updated = [...current, organizerName];
      isFollowed = true;
    }

    localStorage.setItem(FOLLOWED_ORGANIZERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_followed_organizers_updated', { detail: { organizerName, isFollowed } }));
    return { isFollowed, list: updated };
  } catch {
    return { isFollowed: false, list: [] };
  }
}

// ==========================================
// EVENT REMINDERS
// ==========================================

export function getEventReminders(): Record<string, { enabled: boolean; timing: "24h" | "1h" | "both" }> {
  try {
    const raw = localStorage.getItem(EVENT_REMINDERS_KEY);
    return raw ? JSON.parse(raw) : { e1: { enabled: true, timing: "1h" } };
  } catch {
    return {};
  }
}

export function setEventReminder(eventId: string, timing: "24h" | "1h" | "both" | false): void {
  try {
    const current = getEventReminders();
    if (!timing) {
      delete current[eventId];
    } else {
      current[eventId] = { enabled: true, timing };
    }
    localStorage.setItem(EVENT_REMINDERS_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('lanka_event_reminders_updated', { detail: { eventId, timing } }));
  } catch (err) {
    console.error("Error setting event reminder:", err);
  }
}

// ==========================================
// EVENT REPORTS & MODERATION
// ==========================================

export function getEventReports(): EventReport[] {
  try {
    const raw = localStorage.getItem(EVENT_REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(EVENT_REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function submitEventReport(report: Omit<EventReport, 'id' | 'createdAt' | 'status'>): EventReport {
  const current = getEventReports();
  const newReport: EventReport = {
    ...report,
    id: `rep-${Date.now()}`,
    createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: "pending"
  };

  const updated = [newReport, ...current];
  try {
    localStorage.setItem(EVENT_REPORTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error submitting event report:", err);
  }
  return newReport;
}

export function resolveEventReport(reportId: string, resolution: "resolved" | "dismissed", adminNote?: string): void {
  const current = getEventReports();
  const updated = current.map(r => r.id === reportId ? { ...r, status: resolution, adminNote } : r);
  try {
    localStorage.setItem(EVENT_REPORTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error resolving report:", err);
  }
}

// ==========================================
// EXPORT ICS & GOOGLE CALENDAR
// ==========================================

export function generateIcsFileContent(event: EventItem): string {
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `event-${event.id}@lankabuddhist.com`;
  
  // Format rough approximate dates
  const year = 2025;
  const monthMap: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };
  const mm = monthMap[event.mon.toUpperCase()] || '05';
  const dd = String(event.day).padStart(2, '0');
  const dtStart = `${year}${mm}${dd}T100000Z`;
  const dtEnd = `${year}${mm}${dd}T140000Z`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LankaBuddhist//Community Gatherings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${(event.desc || '').replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
    `LOCATION:${(event.loc || '').replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

export function downloadIcsFile(event: EventItem): void {
  const content = generateIcsFileContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(event: EventItem): string {
  const monthMap: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };
  const year = 2025;
  const mm = monthMap[event.mon.toUpperCase()] || '05';
  const dd = String(event.day).padStart(2, '0');
  const dates = `${year}${mm}${dd}T100000Z/${year}${mm}${dd}T140000Z`;

  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = new URLSearchParams({
    text: event.title,
    dates,
    details: `${event.desc || ''}\n\nOrganizer: ${event.organizer}\nView on LankaBuddhist.com`,
    location: event.loc
  });

  return `${baseUrl}&${params.toString()}`;
}

export function downloadAttendeeCsv(eventId: string, eventTitle: string): void {
  const rsvps = getEventRsvps(eventId);
  const headers = ["Ticket Code", "Name", "Email", "Phone", "Status", "Guests", "Checked In", "Check-In Time", "RSVP Date"];
  
  const rows = rsvps.map(r => [
    `"${r.ticketCode}"`,
    `"${r.userName}"`,
    `"${r.userEmail}"`,
    `"${r.userPhone || ''}"`,
    `"${r.status}"`,
    `"${r.guests || 0}"`,
    `"${r.checkedIn ? 'YES' : 'NO'}"`,
    `"${r.checkedInAt || ''}"`,
    `"${r.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Attendees_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
