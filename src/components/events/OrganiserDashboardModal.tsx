import React, { useState, useMemo } from 'react';
import { EventItem } from '../../data/eventsData';
import { 
  EventRsvpRecord, 
  getAllRsvps, 
  getEventRsvps, 
  toggleCheckIn, 
  checkInByTicketCode,
  sendEventAnnouncement,
  manageCoOrganizers,
  cancelCommunityEvent,
  downloadAttendeeCsv
} from '../../utils/userEventsStorage';
import { 
  X, Users, UserCheck, Clock, Download, Send, 
  UserPlus, AlertTriangle, Search, Check, Sparkles, 
  QrCode, Calendar, ShieldCheck, Mail, Phone, Ban
} from 'lucide-react';

interface OrganiserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  currentUserEmail?: string;
  onRefreshEvents: () => void;
  onShowToast: (msg: string) => void;
}

export function OrganiserDashboardModal({
  isOpen,
  onClose,
  events,
  currentUserEmail = "damika1316@gmail.com",
  onRefreshEvents,
  onShowToast
}: OrganiserDashboardModalProps) {
  // Select first event by default
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "e1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rsvpsVersion, setRsvpsVersion] = useState(0);

  // Sub-modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [showCoOrganizersModal, setShowCoOrganizersModal] = useState(false);
  const [coOrganizerEmail, setCoOrganizerEmail] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Fetch attendees for this event
  const attendees = useMemo(() => {
    if (!selectedEvent) return [];
    // Dependency on rsvpsVersion ensures updates immediately trigger re-render
    void rsvpsVersion;
    return getEventRsvps(selectedEvent.id);
  }, [selectedEvent, rsvpsVersion]);

  // Calculate stats
  const stats = useMemo(() => {
    const confirmedList = attendees.filter(a => a.status === "confirmed");
    const confirmedCount = confirmedList.reduce((sum, a) => sum + 1 + (a.guests || 0), 0);
    const capacity = selectedEvent?.capacity || 0;
    const availableSpaces = capacity > 0 ? Math.max(0, capacity - confirmedCount) : "Unlimited";
    const waitlistCount = attendees.filter(a => a.status === "waitlist").length;
    const cancelledCount = attendees.filter(a => a.status === "cancelled").length;
    const checkedInCount = confirmedList.filter(a => a.checkedIn).length;

    return {
      confirmedSpots: confirmedCount,
      confirmedAttendees: confirmedList.length,
      availableSpaces,
      capacity: capacity > 0 ? capacity : "Unlimited",
      waitlistCount,
      cancelledCount,
      checkedInCount
    };
  }, [attendees, selectedEvent]);

  // Filtered roster
  const filteredAttendees = useMemo(() => {
    return attendees.filter(a => {
      const matchSearch = 
        a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ticketCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "checked_in") return a.checkedIn;
      return a.status === statusFilter;
    });
  }, [attendees, searchQuery, statusFilter]);

  if (!isOpen) return null;

  const handleToggleAttendeeCheckIn = (rsvpId: string, current: boolean) => {
    toggleCheckIn(rsvpId, !current);
    setRsvpsVersion(v => v + 1);
    onShowToast(!current ? "Attendee checked in successfully!" : "Check-in reverted.");
  };

  const handleTicketCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput.trim() || !selectedEvent) return;

    const res = checkInByTicketCode(selectedEvent.id, qrCodeInput.trim());
    setScanResult({ success: res.success, message: res.message });
    if (res.success) {
      setRsvpsVersion(v => v + 1);
      setQrCodeInput("");
      onShowToast(res.message);
    }
  };

  const handleSendAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !selectedEvent) return;

    sendEventAnnouncement(selectedEvent.id, announcementText.trim(), "Event Organiser");
    setShowAnnouncementModal(false);
    setAnnouncementText("");
    onRefreshEvents();
    onShowToast(`Broadcast update sent to ${stats.confirmedSpots} attendees!`);
  };

  const handleAddCoOrganizerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coOrganizerEmail.trim() || !selectedEvent) return;

    const currentCo = selectedEvent.coOrganizers || [];
    if (currentCo.includes(coOrganizerEmail.trim())) {
      onShowToast("This co-organiser is already added.");
      return;
    }
    const updated = [...currentCo, coOrganizerEmail.trim()];
    manageCoOrganizers(selectedEvent.id, updated);
    setCoOrganizerEmail("");
    onRefreshEvents();
    onShowToast(`Added co-organiser: ${coOrganizerEmail}`);
  };

  const handleRemoveCoOrganizer = (email: string) => {
    if (!selectedEvent) return;
    const currentCo = selectedEvent.coOrganizers || [];
    const updated = currentCo.filter(c => c !== email);
    manageCoOrganizers(selectedEvent.id, updated);
    onRefreshEvents();
    onShowToast(`Removed co-organiser: ${email}`);
  };

  const handleCancelEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim() || !selectedEvent) return;

    cancelCommunityEvent(selectedEvent.id, cancelReason.trim());
    setShowCancelModal(false);
    onRefreshEvents();
    onShowToast(`Event marked as CANCELLED. Notice sent to all participants.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                Organiser Command Center
              </span>
              {selectedEvent?.isCancelled && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Event Cancelled
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mt-1">
              Event Management & Attendee Check-In
            </h2>
            <p className="text-xs text-neutral-500">
              Real-time attendance tracking, QR ticket check-ins, capacity management, and participant broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Event Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setScanResult(null);
                }}
                className="pl-3 pr-8 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500 max-w-[240px] truncate"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.mon} {ev.day})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Real-Time Stats Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
              <div className="text-[11px] font-semibold text-neutral-500">Confirmed RSVPs</div>
              <div className="text-xl font-black text-neutral-900 mt-1">
                {stats.confirmedSpots}
              </div>
              <div className="text-[10px] text-neutral-400">
                {stats.confirmedAttendees} registrations
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <div className="text-[11px] font-semibold text-emerald-700">Spaces Left</div>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {stats.availableSpaces}
              </div>
              <div className="text-[10px] text-emerald-600">
                Cap: {stats.capacity}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <div className="text-[11px] font-semibold text-amber-700">Waiting List</div>
              <div className="text-xl font-black text-amber-800 mt-1">
                {stats.waitlistCount}
              </div>
              <div className="text-[10px] text-amber-600">
                Auto-promotes on cancel
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <div className="text-[11px] font-semibold text-indigo-700">Checked In</div>
              <div className="text-xl font-black text-indigo-800 mt-1">
                {stats.checkedInCount} / {stats.confirmedAttendees}
              </div>
              <div className="text-[10px] text-indigo-600">
                {stats.confirmedAttendees > 0 
                  ? `${Math.round((stats.checkedInCount / stats.confirmedAttendees) * 100)}% attendance`
                  : '0% attendance'}
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-rose-700">Cancellations</div>
              <div className="text-xl font-black text-rose-800 mt-1">
                {stats.cancelledCount}
              </div>
              <div className="text-[10px] text-rose-600">
                Historical record
              </div>
            </div>
          </div>

          {/* Organiser Action Toolbar */}
          <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Update</span>
              </button>

              <button
                onClick={() => {
                  if (selectedEvent) {
                    downloadAttendeeCsv(selectedEvent.id, selectedEvent.title);
                    onShowToast("Attendee CSV file downloaded!");
                  }
                }}
                className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export CSV List</span>
              </button>

              <button
                onClick={() => setShowCoOrganizersModal(true)}
                className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
                <span>Co-Organisers ({selectedEvent?.coOrganizers?.length || 0})</span>
              </button>
            </div>

            {!selectedEvent?.isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-2 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cancel Gathering</span>
              </button>
            )}
          </div>

          {/* Quick Check-In / Ticket Scanner Bar */}
          <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-xs text-orange-950 uppercase tracking-wider">
                  Ticket Scanner & Verification (QR / Code)
                </h4>
              </div>
              <span className="text-[11px] text-orange-800">
                Enter ticket code from attendee's digital pass or scan QR code
              </span>
            </div>

            <form onSubmit={handleTicketCheckInSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TKT-E1-4821 or paste QR payload..."
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify & Check In</span>
              </button>
            </form>

            {scanResult && (
              <div className={`mt-2.5 p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                scanResult.success 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-100 text-rose-900 border border-rose-200'
              }`}>
                <span>{scanResult.message}</span>
                <button onClick={() => setScanResult(null)} className="text-xs font-bold underline">Dismiss</button>
              </div>
            )}
          </div>

          {/* Attendee Roster Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-neutral-900">
                  Attendee Roster ({filteredAttendees.length})
                </h4>
                <p className="text-xs text-neutral-500">
                  Manage confirmed registrations, guest passes, waiting lists, and live check-ins
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search attendee or ticket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed Only</option>
                  <option value="checked_in">Checked In Only</option>
                  <option value="waitlist">Waiting List</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Attendee</th>
                      <th className="p-3">Ticket Code</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check-In</th>
                      <th className="p-3 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-400 italic">
                          No attendees match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map(att => (
                        <tr key={att.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-neutral-900">{att.userName}</div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-neutral-400" /> {att.userEmail}
                              </span>
                              {att.userPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-neutral-400" /> {att.userPhone}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-mono text-[11px] text-neutral-700">
                            {att.ticketCode}
                          </td>

                          <td className="p-3 font-semibold text-neutral-700">
                            {att.guests > 0 ? `+${att.guests} guests` : "Solo"}
                          </td>

                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              att.status === "confirmed" 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : att.status === "waitlist"
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                            }`}>
                              {att.status}
                            </span>
                          </td>

                          <td className="p-3">
                            {att.status === "confirmed" ? (
                              <button
                                onClick={() => handleToggleAttendeeCheckIn(att.id, att.checkedIn)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                  att.checkedIn
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                                }`}
                              >
                                {att.checkedIn ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Checked In ({att.checkedInAt || 'Present'})</span>
                                  </>
                                ) : (
                                  <span>Mark Present</span>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-neutral-400 italic">N/A</span>
                            )}
                          </td>

                          <td className="p-3 text-right text-neutral-500 text-[11px]">
                            {att.createdAt}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
          <span className="text-xs text-neutral-500">
            Selected gathering: <strong className="text-neutral-800">{selectedEvent?.title}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>

      {/* Sub-Modal: Send Announcement */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Broadcast Attendee Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendAnnouncementSubmit} className="space-y-3">
              <p className="text-xs text-neutral-500">
                This message will be attached to the event listing and displayed as a priority update to all {stats.confirmedSpots} confirmed attendees.
              </p>
              <textarea
                rows={4}
                required
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Please note that parking is available on 3rd street. Bring white attire for the Sil campaign..."
                className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-2xs"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Modal: Co-Organisers */}
      {showCoOrganizersModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Manage Co-Organisers</h3>
              <button onClick={() => setShowCoOrganizersModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Co-organisers can check in attendees, export lists, and publish announcements.
              </p>

              <form onSubmit={handleAddCoOrganizerSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="co-organizer@gmail.com"
                  value={coOrganizerEmail}
                  onChange={(e) => setCoOrganizerEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h5 className="font-bold text-xs text-neutral-800">Current Co-Organisers</h5>
                {(!selectedEvent?.coOrganizers || selectedEvent.coOrganizers.length === 0) ? (
                  <p className="text-xs text-neutral-400 italic">No co-organisers assigned yet.</p>
                ) : (
                  selectedEvent.coOrganizers.map(email => (
                    <div key={email} className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-xs">
                      <span className="font-medium text-neutral-700">{email}</span>
                      <button
                        onClick={() => handleRemoveCoOrganizer(email)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCoOrganizersModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Cancel Gathering */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-neutral-900">Cancel Gathering</h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCancelEventSubmit} className="space-y-3">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Cancelling this event will display a prominent cancellation banner on the public page and notify all registered attendees.
              </p>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for Cancellation *</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Inclement weather conditions or rescheduling to next Poya day..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Keep Event Active
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
