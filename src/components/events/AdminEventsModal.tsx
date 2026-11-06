import React, { useState, useMemo } from 'react';
import { EventItem } from '../../data/eventsData';
import { 
  EventReport, 
  getEventReports, 
  resolveEventReport, 
  cancelCommunityEvent, 
  deleteCommunityEvent 
} from '../../utils/userEventsStorage';
import { 
  X, ShieldAlert, CheckCircle2, AlertTriangle, 
  Trash2, Eye, Ban, Calendar, Users, Filter, Search, Tag, ExternalLink
} from 'lucide-react';

interface AdminEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onRefreshEvents: () => void;
  onShowToast: (msg: string) => void;
}

export function AdminEventsModal({
  isOpen,
  onClose,
  events,
  onRefreshEvents,
  onShowToast
}: AdminEventsModalProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "all_events" | "moderation">("reports");
  const [reportsVersion, setReportsVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const reports = useMemo(() => {
    void reportsVersion;
    return getEventReports();
  }, [reportsVersion]);

  if (!isOpen) return null;

  const handleResolve = (reportId: string, status: "resolved" | "dismissed") => {
    resolveEventReport(reportId, status, adminNote || undefined);
    setReportsVersion(v => v + 1);
    setSelectedReport(null);
    setAdminNote("");
    onShowToast(`Report marked as ${status}!`);
  };

  const handleAdminCancelEvent = (eventId: string, title: string) => {
    const reason = prompt(`Enter administrative cancellation reason for "${title}":`, "Violates community trust and safety guidelines");
    if (!reason) return;

    cancelCommunityEvent(eventId, reason);
    onRefreshEvents();
    onShowToast(`Event "${title}" administratively cancelled.`);
  };

  const handleAdminDeleteEvent = (eventId: string, title: string) => {
    if (confirm(`Permanently remove event "${title}" from the community network?`)) {
      deleteCommunityEvent(eventId);
      onRefreshEvents();
      onShowToast(`Event deleted.`);
    }
  };

  const pendingReportsCount = reports.filter(r => r.status === "pending").length;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Community Safety & Events Admin</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-900/80 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded">
                  Staff Access
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Review complaints, enforce Dhamma community guidelines, and moderate listings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-neutral-100 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>User Reports</span>
            {pendingReportsCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("all_events")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "all_events"
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>All Events ({events.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-neutral-900">
                  Reported Events & User Inquiries ({reports.length})
                </h4>
                <span className="text-xs text-neutral-500">
                  {pendingReportsCount} pending investigation
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 italic bg-neutral-50 rounded-xl">
                  No active reports on file. The community events feed is in good standing!
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(rep => (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rep.status === "pending"
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-white border-neutral-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              {rep.reason}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {rep.createdAt}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-neutral-900 mt-1">
                            Event: {rep.eventTitle}
                          </h4>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            "{rep.details}"
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Reported by <strong>{rep.reporterName}</strong> ({rep.reporterEmail})
                          </p>

                          {rep.adminNote && (
                            <div className="mt-2 text-xs bg-white p-2 rounded-lg border border-neutral-200 text-neutral-700">
                              <strong className="text-emerald-700">Admin Resolution Note:</strong> {rep.adminNote}
                            </div>
                          )}
                        </div>

                        {rep.status === "pending" ? (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                const note = prompt("Enter resolution notes:", "Investigated and verified safe");
                                if (note) {
                                  setAdminNote(note);
                                  handleResolve(rep.id, "resolved");
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolve(rep.id, "dismissed")}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            rep.status === "resolved" 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {rep.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "all_events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Filter events by title or organiser..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Gathering</th>
                        <th className="p-3">Format / Type</th>
                        <th className="p-3">Organiser</th>
                        <th className="p-3">Capacity</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {events
                        .filter(e => 
                          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.organizer.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(ev => (
                          <tr key={ev.id} className="hover:bg-neutral-50/60">
                            <td className="p-3">
                              <div className="font-bold text-neutral-900 line-clamp-1">{ev.title}</div>
                              <div className="text-[11px] text-neutral-500">{ev.date} • {ev.loc}</div>
                            </td>

                            <td className="p-3">
                              <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-medium">
                                {ev.type} {ev.isOnline ? '(Online)' : ''}
                              </span>
                            </td>

                            <td className="p-3 font-medium text-neutral-800">
                              {ev.organizer}
                            </td>

                            <td className="p-3">
                              {ev.capacity ? `${ev.capacity} max` : "Unlimited"}
                            </td>

                            <td className="p-3">
                              {ev.isCancelled ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!ev.isCancelled && (
                                  <button
                                    onClick={() => handleAdminCancelEvent(ev.id, ev.title)}
                                    className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                                    title="Cancel Event"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleAdminDeleteEvent(ev.id, ev.title)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Permanently Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
          >
            Close Admin Center
          </button>
        </div>
      </div>
    </div>
  );
}
