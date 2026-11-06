import { EventItem } from '../data/eventsData';
import { getFavoriteEventIds, getAllCommunityEvents } from './userEventsStorage';

export interface NotificationSettings {
  browserPushEnabled: boolean;
  toastEnabled: boolean;
  soundEnabled: boolean;
  reminderMinutes: number; // default 60 (1 hour)
}

export interface TriggeredAlert {
  id: string;
  eventId: string;
  eventTitle: string;
  eventLoc: string;
  eventImg?: string;
  eventCategory?: string;
  eventDate: string;
  triggeredAt: number;
  timeUntilLabel: string;
  isSimulated?: boolean;
}

const SETTINGS_KEY = 'lanka_event_notification_settings';
const TRIGGERED_ALERTS_KEY = 'lanka_triggered_event_alerts';
const UNREAD_ALERTS_KEY = 'lanka_unread_event_alerts';

const DEFAULT_SETTINGS: NotificationSettings = {
  browserPushEnabled: false,
  toastEnabled: true,
  soundEnabled: true,
  reminderMinutes: 60,
};

// Get stored settings
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Update settings
export function saveNotificationSettings(newSettings: Partial<NotificationSettings>): NotificationSettings {
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_notification_settings_updated', { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Check browser push permission
export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission for Web Push Notifications
export async function requestBrowserPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      saveNotificationSettings({ browserPushEnabled: true });
      return true;
    } else {
      saveNotificationSettings({ browserPushEnabled: false });
      return false;
    }
  } catch (err) {
    console.error('Error requesting push permission:', err);
    return false;
  }
}

// Harmonious Buddhist temple bell chime synthesized via Web Audio API
export function playTempleBellChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play dual resonant chime (D5 587Hz & harmonic octave with gentle decay)
    const now = ctx.currentTime;
    
    // Primary resonant tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5 note
    osc1.frequency.exponentialRampToValueAtTime(584.0, now + 1.8);
    
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Overtone for bell ring sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now); // D6 harmonic
    
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.3);
    osc2.stop(now + 1.3);
  } catch (err) {
    console.warn('Web Audio chime could not play:', err);
  }
}

// Parse event start Date from string like "May 25, 2025 • 10:00 AM - 7:00 PM"
export function parseEventStartDate(event: EventItem): Date | null {
  try {
    if (!event.date) return null;
    
    // Example: "May 25, 2025 • 10:00 AM - 7:00 PM"
    const [datePart, timePart] = event.date.split('•').map(s => s.trim());
    if (!datePart) return null;

    // Parse datePart: e.g. "May 25, 2025" or "Jun 8, 2025"
    let parsedYear = new Date().getFullYear();
    const yearMatch = datePart.match(/\b(202[4-9]|203[0-9])\b/);
    if (yearMatch) {
      parsedYear = parseInt(yearMatch[1], 10);
    }

    const monthNames = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    let parsedMonth = -1;
    for (let i = 0; i < monthNames.length; i++) {
      if (datePart.toLowerCase().includes(monthNames[i])) {
        parsedMonth = i;
        break;
      }
    }
    if (parsedMonth === -1) {
      // Fallback to event.mon
      const monIndex = monthNames.indexOf((event.mon || '').toLowerCase().substring(0, 3));
      if (monIndex !== -1) parsedMonth = monIndex;
      else parsedMonth = new Date().getMonth();
    }

    let parsedDay = 1;
    const dayMatch = datePart.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    if (dayMatch) {
      parsedDay = parseInt(dayMatch[1], 10);
    } else if (event.day) {
      parsedDay = parseInt(event.day, 10) || 1;
    }

    let parsedHour = 9;
    let parsedMinute = 0;

    if (timePart) {
      // Format: "10:00 AM - 7:00 PM" or "6:30 PM"
      const startTimeStr = timePart.split('-')[0].trim();
      const timeMatch = startTimeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const meridian = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';

        if (meridian === 'PM' && hour < 12) hour += 12;
        if (meridian === 'AM' && hour === 12) hour = 0;

        parsedHour = hour;
        parsedMinute = minute;
      }
    }

    const targetDate = new Date(parsedYear, parsedMonth, parsedDay, parsedHour, parsedMinute, 0);
    return targetDate;
  } catch (err) {
    console.error('Error parsing event start date:', err);
    return null;
  }
}

// Calculate time remaining until event
export function getEventTimeRemaining(event: EventItem): {
  msUntil: number;
  minutesUntil: number;
  hoursUntil: number;
  daysUntil: number;
  formattedCountdown: string;
  isStartingSoon: boolean; // within 60 minutes
  isPast: boolean;
} {
  const startDate = parseEventStartDate(event);
  if (!startDate) {
    return {
      msUntil: 0,
      minutesUntil: 0,
      hoursUntil: 0,
      daysUntil: 0,
      formattedCountdown: 'Unknown date',
      isStartingSoon: false,
      isPast: event.isPast || false
    };
  }

  const now = new Date();
  const msUntil = startDate.getTime() - now.getTime();
  const minutesUntil = Math.floor(msUntil / (1000 * 60));
  const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
  const daysUntil = Math.floor(msUntil / (1000 * 60 * 60 * 24));

  let formattedCountdown = '';
  if (msUntil < 0) {
    formattedCountdown = 'Already started / Completed';
  } else if (minutesUntil <= 1) {
    formattedCountdown = 'Starting in < 1 minute!';
  } else if (minutesUntil < 60) {
    formattedCountdown = `Starts in ${minutesUntil} mins`;
  } else if (hoursUntil < 24) {
    const remainMins = minutesUntil % 60;
    formattedCountdown = `Starts in ${hoursUntil}h ${remainMins}m`;
  } else {
    formattedCountdown = `In ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
  }

  const isStartingSoon = msUntil > 0 && minutesUntil <= 60;
  const isPast = msUntil < 0 || event.isPast;

  return {
    msUntil,
    minutesUntil,
    hoursUntil,
    daysUntil,
    formattedCountdown,
    isStartingSoon,
    isPast
  };
}

// Stored triggered alerts
export function getTriggeredAlerts(): TriggeredAlert[] {
  try {
    const raw = localStorage.getItem(TRIGGERED_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTriggeredAlert(alert: TriggeredAlert): void {
  try {
    const existing = getTriggeredAlerts();
    // Keep max 20 alerts
    const filtered = existing.filter(a => a.id !== alert.id);
    const updated = [alert, ...filtered].slice(0, 20);
    localStorage.setItem(TRIGGERED_ALERTS_KEY, JSON.stringify(updated));
    
    // Also track unread count
    const unreadRaw = localStorage.getItem(UNREAD_ALERTS_KEY);
    const unread = unreadRaw ? parseInt(unreadRaw, 10) : 0;
    localStorage.setItem(UNREAD_ALERTS_KEY, (unread + 1).toString());
    
    window.dispatchEvent(new CustomEvent('lanka_triggered_alerts_updated', { detail: updated }));
  } catch (err) {
    console.error('Error saving triggered alert:', err);
  }
}

export function getUnreadAlertCount(): number {
  try {
    const unreadRaw = localStorage.getItem(UNREAD_ALERTS_KEY);
    return unreadRaw ? parseInt(unreadRaw, 10) : 0;
  } catch {
    return 0;
  }
}

export function clearUnreadAlertCount(): void {
  try {
    localStorage.setItem(UNREAD_ALERTS_KEY, '0');
    window.dispatchEvent(new CustomEvent('lanka_alerts_read'));
  } catch (err) {
    console.error('Error clearing unread alerts:', err);
  }
}

// Trigger 1-Hour Alert (Web Push + In-App Banner + Sound Chime)
export function triggerOneHourAlert(event: EventItem, isSimulation = false): TriggeredAlert {
  const settings = getNotificationSettings();
  const alertId = `alert-${event.id}-${isSimulation ? Date.now() : 'scheduled'}`;
  
  const timeLabel = isSimulation 
    ? 'Starts in 55 mins (Simulation)' 
    : 'Starting within the hour!';

  const alertData: TriggeredAlert = {
    id: alertId,
    eventId: event.id,
    eventTitle: event.title,
    eventLoc: event.loc,
    eventImg: event.img,
    eventCategory: event.category,
    eventDate: event.date,
    triggeredAt: Date.now(),
    timeUntilLabel: timeLabel,
    isSimulated: isSimulation
  };

  // 1. Play serene Buddhist chime
  if (settings.soundEnabled) {
    playTempleBellChime();
  }

  // 2. Browser Web Push Notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const pushTitle = `⏰ 1-Hour Reminder: ${event.title}`;
      const pushOptions: NotificationOptions = {
        body: `Gathering starts soon at ${event.loc}.\nScheduled: ${event.date}`,
        icon: event.img || 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=128',
        tag: `event-reminder-${event.id}`,
      };
      
      const notif = new Notification(pushTitle, pushOptions);
      notif.onclick = () => {
        window.focus();
        window.location.href = `/events?selected=${event.id}`;
      };
    } catch (pushErr) {
      console.warn('Native notification failed:', pushErr);
    }
  }

  // 3. Save to alerts history
  saveTriggeredAlert(alertData);

  // 4. Dispatch custom event for persistent in-app floating banner & toast
  window.dispatchEvent(new CustomEvent('lanka_event_1hr_alert', { 
    detail: { alert: alertData, event } 
  }));

  return alertData;
}

// Periodic check: inspect favorited events and trigger if start is within 1 hour
export function checkUpcomingFavoriteEvents(): void {
  const settings = getNotificationSettings();
  const favoriteIds = getFavoriteEventIds();
  if (favoriteIds.length === 0) return;

  const allEvents = getAllCommunityEvents();
  const favoritedEvents = allEvents.filter(e => favoriteIds.includes(e.id));
  const triggeredAlerts = getTriggeredAlerts();
  const alreadyTriggeredIds = new Set(triggeredAlerts.map(a => a.eventId));

  const targetMinutes = settings.reminderMinutes || 60;

  favoritedEvents.forEach(event => {
    // If already triggered for this event (non-simulated), skip to avoid spam
    if (alreadyTriggeredIds.has(event.id)) return;

    const { msUntil, minutesUntil, isPast } = getEventTimeRemaining(event);
    if (!isPast && msUntil > 0 && minutesUntil <= targetMinutes) {
      triggerOneHourAlert(event, false);
    }
  });
}
