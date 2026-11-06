import React, { useState, useMemo, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import {
  GOOGLE_MAPS_API_KEY,
  getCoordinatesForLocation
} from '../../utils/googleMapsConfig';
import { EventItem } from '../../data/eventsData';
import { 
  Calendar, Clock, MapPin, Users, Share2, Check, X, 
  Navigation, Globe, Sparkles, Video, Repeat, QrCode, 
  Download, CalendarPlus, Heart, Bell, AlertTriangle, 
  Send, UserCheck, ShieldCheck, ExternalLink, Ticket,
  Lock, Edit3
} from 'lucide-react';
import { 
  submitRsvp, 
  cancelRsvp, 
  getUserRsvpForEvent,
  getEventRsvps,
  EventRsvpRecord,
  downloadIcsFile,
  generateGoogleCalendarUrl,
  getFollowedOrganizers,
  toggleFollowOrganizer,
  getEventReminders,
  setEventReminder,
  submitEventReport
} from '../../utils/userEventsStorage';
import { triggerOneHourAlert } from '../../utils/eventNotificationSystem';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | any | null;
  currentUserEmail?: string;
  currentUserName?: string;
  onRsvpChange?: () => void;
  onToggleRsvp?: (eventId: string) => void;
  onEditEvent?: (event: EventItem) => void;
  onShowToast?: (msg: string) => void;
}

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  currentUserEmail = "damika1316@gmail.com",
  currentUserName = "Damika Fernando",
  onRsvpChange,
  onToggleRsvp,
  onEditEvent,
  onShowToast = (msg: string) => console.log(msg)
}: EventDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [guestsCount, setGuestsCount] = useState<number>(0);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate content");
  const [reportDetails, setReportDetails] = useState("");
  const [userRsvpVersion, setUserRsvpVersion] = useState(0);

  // Form fields for registration
  const [rsvpName, setRsvpName] = useState(currentUserName);
  const [rsvpEmail, setRsvpEmail] = useState(currentUserEmail);
  const [rsvpPhone, setRsvpPhone] = useState("+1 (213) 555-0177");

  // Check active RSVP for current user
  const userRsvp = useMemo(() => {
    if (!event) return undefined;
    void userRsvpVersion;
    return getUserRsvpForEvent(event.id, currentUserEmail);
  }, [event, currentUserEmail, userRsvpVersion]);

  // All event RSVPs for capacity checking
  const allEventRsvps = useMemo(() => {
    if (!event) return [];
    void userRsvpVersion;
    return getEventRsvps(event.id);
  }, [event, userRsvpVersion]);

  const confirmedAttendees = allEventRsvps.filter(r => r.status === "confirmed");
  const totalConfirmedSpots = confirmedAttendees.reduce((sum, r) => sum + 1 + (r.guests || 0), 0);
  const capacity = event?.capacity || 0;
  const isFull = capacity > 0 && totalConfirmedSpots >= capacity;
  const availableSpaces = capacity > 0 ? Math.max(0, capacity - totalConfirmedSpots) : null;

  // Organiser follow state
  const isFollowed = useMemo(() => {
    if (!event?.organizer) return false;
    return getFollowedOrganizers().includes(event.organizer);
  }, [event?.organizer, userRsvpVersion]);

  // Reminder state
  const isReminderSet = useMemo(() => {
    if (!event) return false;
    const reminders = getEventReminders();
    return !!reminders[event.id]?.enabled;
  }, [event, userRsvpVersion]);

  useEffect(() => {
    if (userRsvp) {
      setGuestsCount(userRsvp.guests || 0);
    } else {
      setGuestsCount(0);
    }
  }, [userRsvp]);

  if (!isOpen || !event) return null;

  const coords = event.coordinates || getCoordinatesForLocation(event.loc);

  const handleShare = () => {
    const url = `${window.location.origin}/events?selected=${event.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast("Event link copied to clipboard!");
    }
  };

  const handleSubmitRsvpAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpEmail.trim()) {
      onShowToast("Please enter your name and email.");
      return;
    }

    const res = submitRsvp({
      eventId: event.id,
      userId: currentUserEmail,
      userName: rsvpName.trim(),
      userEmail: rsvpEmail.trim(),
      userPhone: rsvpPhone.trim(),
      guests: guestsCount
    });

    setUserRsvpVersion(v => v + 1);
    setShowRsvpForm(false);
    onShowToast(res.message);
    if (onRsvpChange) onRsvpChange();
  };

  const handleCancelAttendance = () => {
    if (confirm("Are you sure you want to cancel your attendance? If you cancel, your space may be released to the next person on the waiting list.")) {
      const res = cancelRsvp(event.id, currentUserEmail);
      setUserRsvpVersion(v => v + 1);
      if (res.promotedRecord) {
        onShowToast(`Attendance cancelled. Spot allocated to waiting list: ${res.promotedRecord.userName}!`);
      } else {
        onShowToast("Your RSVP has been cancelled.");
      }
      if (onRsvpChange) onRsvpChange();
    }
  };

  const handleToggleFollow = () => {
    const res = toggleFollowOrganizer(event.organizer);
    setUserRsvpVersion(v => v + 1);
    onShowToast(res.isFollowed ? `Following ${event.organizer}!` : `Unfollowed ${event.organizer}.`);
  };

  const handleToggleReminder = () => {
    const next = !isReminderSet;
    setEventReminder(event.id, next ? "1h" : false);
    setUserRsvpVersion(v => v + 1);
    if (next) {
      triggerOneHourAlert(event, false);
      onShowToast("Reminder set! You will receive a 1-hour notification before the event.");
    } else {
      onShowToast("Reminder removed.");
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;

    submitEventReport({
      eventId: event.id,
      eventTitle: event.title,
      reporterName: currentUserName,
      reporterEmail: currentUserEmail,
      reason: reportReason,
      details: reportDetails.trim()
    });

    setShowReportModal(false);
    setReportDetails("");
    onShowToast("Report submitted. Our safety team will investigate.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/80 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                {event.category}
              </span>
              {event.isOnline && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Video className="w-3 h-3" /> Online Event
                </span>
              )}
              {event.isRecurring && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Repeat className="w-3 h-3" /> {event.recurrenceRule || 'Recurring'}
                </span>
              )}
              {event.visibility === "private" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private / Unlisted
                </span>
              )}
              {event.isCancelled && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Cancelled
                </span>
              )}
            </div>

            <h3 className="font-bold text-lg md:text-xl text-neutral-900 leading-snug">
              {event.title}
            </h3>

            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{event.date}</span>
            </p>
          </div>

          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Cancellation Notice Banner if Cancelled */}
          {event.isCancelled && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">This gathering has been cancelled</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Reason: {event.cancellationReason || "Scheduled program postponed or cancelled by organiser."}
                </p>
              </div>
            </div>
          )}

          {/* Announcements Banner */}
          {event.announcements && event.announcements.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Organiser Update ({event.announcements[0].date})</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {event.announcements[0].message}
              </p>
            </div>
          )}

          {/* Cover Photo */}
          {event.img && (
            <div className="rounded-xl overflow-hidden aspect-video bg-neutral-100 relative shadow-2xs">
              <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  {event.mon} {event.day}
                </span>
              </div>
            </div>
          )}

          {/* Location & Directions Card */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
            {event.isOnline ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Virtual Video Conference</span>
                </div>
                <p className="text-neutral-600 text-[11px]">
                  This is a live online broadcast accessible worldwide.
                </p>
                {event.onlineMeetingUrl && (
                  <a
                    href={event.onlineMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join Online Meeting Stream</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 text-neutral-800">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900">{event.loc}</span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Physical gathering venue</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      event.coordinates ? `${coords.lat},${coords.lng}` : event.loc
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    <span>Get Directions</span>
                  </a>
                </div>

                {/* Google Map Preview Mini Window */}
                <div className="h-44 w-full rounded-xl overflow-hidden border border-neutral-200 shadow-inner">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      defaultCenter={coords}
                      defaultZoom={14}
                      gestureHandling="cooperative"
                      disableDefaultUI={true}
                      mapId="DEMO_MAP_ID"
                      className="w-full h-full"
                    >
                      <AdvancedMarker position={coords} title={event.title}>
                        <Pin background="#ea580c" borderColor="#ffffff" glyphColor="#ffffff" scale={1.1} />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
              </div>
            )}
          </div>

          {/* Capacity & Spaces Indicator */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Attendance & Capacity</span>
              </span>
              <span className="font-semibold text-neutral-600">
                {totalConfirmedSpots} {capacity > 0 ? `/ ${capacity} spaces booked` : 'devotees attending'}
              </span>
            </div>

            {capacity > 0 && (
              <div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((totalConfirmedSpots / capacity) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1">
                  <span>{isFull ? "Capacity Reached" : `${availableSpaces} spaces left`}</span>
                  <span>{Math.round((totalConfirmedSpots / capacity) * 100)}% filled</span>
                </div>
              </div>
            )}
          </div>

          {/* Current User Registration Status / RSVP Flow */}
          <div className="p-4 rounded-xl border bg-neutral-50/60 border-neutral-200 space-y-3">
            {userRsvp ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      userRsvp.status === "confirmed"
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <UserCheck className="w-3.5 h-3.5" />
                      {userRsvp.status === "confirmed" ? "You're Registered" : "On Waiting List"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {userRsvp.guests > 0 ? `+${userRsvp.guests} guests included` : "Solo attendance"}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-neutral-600" />
                    <span>View Digital Ticket</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                  <button
                    onClick={() => setShowRsvpForm(true)}
                    className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Update Guests
                  </button>
                  <button
                    onClick={handleCancelAttendance}
                    className="py-2 px-4 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel RSVP
                  </button>
                </div>
              </div>
            ) : showRsvpForm ? (
              <form onSubmit={handleSubmitRsvpAction} className="space-y-3">
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                  {isFull ? "Join the Priority Waiting List" : "Confirm Gathering RSVP"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-0.5">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-0.5">Your Email</label>
                    <input
                      type="email"
                      required
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {event.allowGuests !== false && (
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-0.5">
                      Bringing additional family members / guests?
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium"
                    >
                      <option value={0}>Just me (1 attendee)</option>
                      {Array.from({ length: event.maxGuestsPerAttendee || 3 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          + {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'} ({i + 2} total)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRsvpForm(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    {isFull ? "Join Waiting List" : "Confirm RSVP"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">
                    {isFull ? "Capacity limit reached for this gathering" : "Join fellow devotees at this gathering"}
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    {isFull 
                      ? "Join the waiting list. If an attendee cancels, spaces are automatically awarded."
                      : "Free registration with digital QR ticket and instant calendar sync."}
                  </p>
                </div>

                <button
                  onClick={() => setShowRsvpForm(true)}
                  disabled={event.isCancelled}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-2xs shrink-0 ${
                    event.isCancelled
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : isFull
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {isFull ? "Join Waiting List" : "RSVP to Attend"}
                </button>
              </div>
            )}
          </div>

          {/* Description & Schedule */}
          <div>
            <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider mb-2">
              About This Gathering
            </h4>
            <div className="bg-white p-3.5 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {event.desc || "No description provided."}
            </div>
          </div>

          {/* Organiser Card & Follow */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Organised by</span>
              <h5 className="font-bold text-neutral-900 text-sm mt-0.5">{event.organizer}</h5>
              {event.organizerEmail && (
                <p className="text-[11px] text-neutral-500">{event.organizerEmail}</p>
              )}
            </div>

            <button
              onClick={handleToggleFollow}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors border ${
                isFollowed
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
              }`}
            >
              {isFollowed ? "Following Organiser ✓" : "+ Follow Organiser"}
            </button>
          </div>

          {/* Action Toolbar: Add to Personal Calendar, Reminders, Share & Report */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add to Personal Calendar Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shadow-2xs">
                <a
                  href={generateGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 hover:bg-neutral-100 rounded text-[11px] font-bold text-neutral-700 flex items-center gap-1"
                  title="Add to Google Calendar"
                >
                  <CalendarPlus className="w-3 h-3 text-orange-600" />
                  <span>Google Cal</span>
                </a>
                <span className="text-neutral-300">|</span>
                <button
                  onClick={() => {
                    downloadIcsFile(event);
                    onShowToast("Calendar .ics file downloaded!");
                  }}
                  className="px-2.5 py-1 hover:bg-neutral-100 rounded text-[11px] font-bold text-neutral-700 flex items-center gap-1"
                  title="Download iCal .ics for Apple / Outlook"
                >
                  <Download className="w-3 h-3 text-neutral-600" />
                  <span>iCal / Apple</span>
                </button>
              </div>

              {/* Set Reminder */}
              <button
                onClick={handleToggleReminder}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-colors ${
                  isReminderSet
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
                title="Receive notification alert before gathering"
              >
                <Bell className={`w-3.5 h-3.5 ${isReminderSet ? 'fill-current text-amber-600' : 'text-neutral-400'}`} />
                <span>{isReminderSet ? "Reminder On (1h)" : "Remind Me"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg text-neutral-600"
                title="Share Event Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Report Suspicious Event"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>

              {onEditEvent && (
                <button
                  onClick={() => {
                    onClose();
                    onEditEvent(event);
                  }}
                  className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-neutral-200"
                  title="Edit Gathering"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Modal: Digital Pass & Ticket QR Code */}
      {showTicketModal && userRsvp && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h4 className="font-bold text-sm text-neutral-900">Your Gathering Pass</h4>
              <button onClick={() => setShowTicketModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Simulation Card */}
            <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-3">
              <div className="w-36 h-36 bg-white mx-auto p-2 rounded-xl shadow-xs border border-orange-200 flex flex-col items-center justify-center">
                <QrCode className="w-28 h-28 text-neutral-900" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-600">Ticket Code</span>
                <div className="text-sm font-mono font-black text-neutral-900 tracking-wider">
                  {userRsvp.ticketCode}
                </div>
              </div>
            </div>

            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-bold text-neutral-800">{userRsvp.userName}</p>
              <p>{event.title}</p>
              <p className="text-neutral-500">{event.date}</p>
              <p className="text-[11px] text-emerald-700 font-bold">
                Status: {userRsvp.status.toUpperCase()} {userRsvp.guests > 0 ? `(+${userRsvp.guests} guests)` : ''}
              </p>
            </div>

            <button
              onClick={() => setShowTicketModal(false)}
              className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Sub-Modal: Report Event */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-neutral-900">Report This Gathering</h4>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                >
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Inaccurate venue location">Inaccurate venue location</option>
                  <option value="Fraudulent or commercial solicitation">Fraudulent or commercial solicitation</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Safety concern">Safety concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Elaborate details *</label>
                <textarea
                  rows={3}
                  required
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this listing violates community standards..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
