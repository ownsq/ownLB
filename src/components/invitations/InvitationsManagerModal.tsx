import React, { useState, useMemo } from 'react';
import { 
  EventInvitation, 
  getAllInvitations, 
  getUserInvitations, 
  updateInvitationStatus 
} from '../../utils/invitationsStorage';
import { 
  X, Calendar, Clock, MapPin, Users, CheckCircle2, 
  AlertTriangle, MessageSquare, Car, Sparkles, Filter, 
  Send, ExternalLink, ArrowRight, UserCheck, ShieldCheck
} from 'lucide-react';

interface InvitationsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  onShowToast?: (msg: string) => void;
}

export function InvitationsManagerModal({
  isOpen,
  onClose,
  currentUserEmail = "damika1316@gmail.com",
  onShowToast = (msg: string) => console.log(msg)
}: InvitationsManagerModalProps) {
  const [invitationsVersion, setInvitationsVersion] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "monk" | "famous_person">("all");
  const [selectedInvitation, setSelectedInvitation] = useState<EventInvitation | null>(null);

  const invitations = useMemo(() => {
    void invitationsVersion;
    return getUserInvitations(currentUserEmail);
  }, [currentUserEmail, invitationsVersion]);

  const filtered = useMemo(() => {
    if (filterType === "all") return invitations;
    return invitations.filter(i => i.targetType === filterType);
  }, [invitations, filterType]);

  if (!isOpen) return null;

  const handleSimulateResponse = (invitationId: string, status: "accepted" | "declined" | "changes_suggested") => {
    let notes: string | undefined;
    if (status === "changes_suggested") {
      notes = prompt("Enter suggested schedule/transport adjustment:", "Can start 30 minutes earlier to accommodate evening temple chanting.") || undefined;
    }
    updateInvitationStatus(invitationId, status, notes);
    setInvitationsVersion(v => v + 1);
    setSelectedInvitation(null);
    onShowToast(`Invitation status updated to: ${status.replace('_', ' ').toUpperCase()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                Ceremony & Event Coordination
              </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 mt-1">
              Monks & Public Figures Invitation Tracker
            </h2>
            <p className="text-xs text-neutral-500">
              Track ceremony invitations to venerable monks and official event proposals to verified public figures.
            </p>
          </div>

          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white">
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Invitations" },
              { id: "monk", label: "Buddhist Monks (Ceremonies)" },
              { id: "famous_person", label: "Public Figures (Events)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterType === tab.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-neutral-400 font-medium">
            {filtered.length} invitations on file
          </span>
        </div>

        {/* Invitations List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 italic">
              No invitations sent yet. You can invite monks from the Monks Directory or propose events from Famous People.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(inv => {
                const isMonk = inv.targetType === "monk";

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl border border-neutral-200 bg-white hover:border-orange-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={inv.targetAvatar}
                          alt={inv.targetName}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-neutral-900">{inv.targetName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              {isMonk ? "Sangha Member" : "Public Figure"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-orange-700 mt-0.5">
                            {inv.eventTitle} ({inv.eventType})
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{inv.date} at {inv.time} • {inv.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        inv.status === "accepted" ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        inv.status === "declined" ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        inv.status === "changes_suggested" ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {inv.status === "accepted" ? "Confirmed ✓" : inv.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Participation & Transport Info */}
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-xs text-neutral-700 space-y-1.5">
                      <p><strong>Arrangements:</strong> {inv.participationArrangements}</p>
                      {inv.transportProvided && (
                        <p className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Car className="w-3.5 h-3.5" />
                          <span>Transport Arranged: {inv.transportDetails}</span>
                        </p>
                      )}
                      {inv.suggestedChanges && (
                        <div className="p-2 bg-purple-50 text-purple-900 rounded-lg border border-purple-200 font-medium">
                          <strong>Suggested Modification by Representative:</strong> {inv.suggestedChanges}
                        </div>
                      )}
                    </div>

                    {/* Actions and Representative Simulation */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <span className="text-[11px] text-neutral-400">
                        Submitted on {inv.createdAt} {inv.respondedAt ? `• Responded on ${inv.respondedAt}` : ''}
                      </span>

                      {/* Simulation buttons for testing accepted/declined response */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 font-semibold mr-1">
                          Simulate Response:
                        </span>
                        <button
                          onClick={() => handleSimulateResponse(inv.id, "accepted")}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px]"
                          title="Simulate representative accepting the invitation"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleSimulateResponse(inv.id, "changes_suggested")}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-[11px]"
                          title="Simulate proposing an alternate time or requirement"
                        >
                          Suggest Change
                        </button>
                        <button
                          onClick={() => handleSimulateResponse(inv.id, "declined")}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-[11px]"
                          title="Simulate decline due to prior commitments"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
