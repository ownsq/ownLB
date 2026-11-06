import React, { useState } from "react";
import { 
  X, ShieldAlert, CheckCircle2, AlertTriangle, Trash2, 
  UserX, FileText, Clock, Ban, Eye, Check, RefreshCw, ShieldCheck
} from "lucide-react";
import { 
  PlatformReport, 
  AuditLogEntry, 
  AuctionItem, 
  ClassifiedListing,
  resolvePlatformReport, 
  saveAuctions,
  saveListings,
  getAuctions,
  getListings,
  addAuditLog
} from "../../utils/classifiedsAuctionStorage";

interface AdminSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: PlatformReport[];
  auditLogs: AuditLogEntry[];
  auctions: AuctionItem[];
  listings: ClassifiedListing[];
  onRefreshData: () => void;
  onShowToast: (message: string) => void;
}

export function AdminSafetyModal({
  isOpen,
  onClose,
  reports,
  auditLogs,
  auctions,
  listings,
  onRefreshData,
  onShowToast
}: AdminSafetyModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"reports" | "audit" | "monitor">("reports");
  const [selectedReport, setSelectedReport] = useState<PlatformReport | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const handleResolve = (reportId: string, actionTaken: string, status: "resolved" | "dismissed") => {
    const res = resolvePlatformReport(reportId, actionTaken, status);
    onShowToast(res.message);
    setSelectedReport(null);
    setActionNotes("");
    onRefreshData();
  };

  const handleRemoveListing = (listingId: string, title: string) => {
    const confirm = window.confirm(`Administrator Action: Confirm removal of prohibited advertisement "${title}"?`);
    if (!confirm) return;

    const currentListings = getListings();
    const updated = currentListings.filter(l => l.id !== listingId);
    saveListings(updated);

    addAuditLog({
      action: "ADMIN_REMOVED_PROHIBITED_AD",
      targetTitle: title,
      performedBy: "Administrator",
      details: "Advertisement removed for violation of community commerce guidelines."
    });

    onShowToast(`Listing "${title}" removed by administrator.`);
    onRefreshData();
  };

  const handleCancelAuction = (auctionId: string, title: string) => {
    const confirm = window.confirm(`Administrator Action: Confirm immediate cancellation of auction "${title}" for investigation?`);
    if (!confirm) return;

    const currentAuctions = getAuctions();
    const updated = currentAuctions.filter(a => a.id !== auctionId);
    saveAuctions(updated);

    addAuditLog({
      action: "ADMIN_CANCELLED_AUCTION",
      targetTitle: title,
      performedBy: "Administrator",
      details: "Auction cancelled and archived following investigation."
    });

    onShowToast(`Auction "${title}" cancelled by administrator.`);
    onRefreshData();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  Trust & Safety / Admin Center
                </h3>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Staff Only
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Monitor live bidding, investigate reports, remove prohibited ads, and audit actions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-5 pt-3 gap-6 text-xs font-bold bg-neutral-50/50">
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reports & Complaints ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail & Records ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "monitor"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Monitor & Moderation</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* TAB 1: REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Investigate flagged advertisements, suspicious bids, or non-responsive users.</span>
              </div>

              {reports.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-400">
                  No pending community complaints or reports.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div 
                      key={rep.id} 
                      className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-red-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-neutral-900 text-sm">{rep.targetTitle}</span>
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">
                              {rep.reason}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              rep.status === "pending" ? "bg-amber-100 text-amber-800" :
                              rep.status === "investigating" ? "bg-blue-100 text-blue-800" :
                              "bg-emerald-100 text-emerald-800"
                            }`}>
                              Status: {rep.status}
                            </span>
                          </div>
                          <p className="text-neutral-500 mt-1">
                            Reported User: <strong className="text-neutral-800">{rep.reportedUser}</strong> • Filed by: <strong>{rep.reporterName}</strong> ({rep.reporterPhone})
                          </p>
                          <p className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60 text-neutral-700 mt-2 font-medium">
                            "{rep.details}"
                          </p>
                          {rep.adminActionTaken && (
                            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                              Action Taken: {rep.adminActionTaken}
                            </p>
                          )}
                        </div>

                        {/* Admin Action Buttons */}
                        {rep.status !== "resolved" && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => handleResolve(rep.id, "Account warned & listing placed under strict escrow monitoring.", "resolved")}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs"
                            >
                              Resolve & Warn
                            </button>
                            <button
                              onClick={() => handleResolve(rep.id, "Report dismissed after investigation; no fraudulent activity detected.", "dismissed")}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-xs"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 flex items-center justify-between">
                <span>System retention log of all placed bids, status modifications, cancellations, and administrator interventions.</span>
                <span className="font-bold text-neutral-800">{auditLogs.length} Records</span>
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-neutral-100 bg-white shadow-2xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="font-bold text-neutral-900">{log.targetTitle}</span>
                      </div>
                      <p className="text-neutral-600 text-[11px]">
                        {log.details}
                      </p>
                      <span className="text-[10px] text-neutral-400 block">
                        Actor: <strong>{log.performedBy}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MONITOR & MODERATION */}
          {activeTab === "monitor" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-neutral-900 text-sm">Active Community Auctions</h4>
              <div className="space-y-2">
                {auctions.map((auc) => (
                  <div key={auc.id} className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-neutral-900 text-sm block">{auc.title}</span>
                      <span className="text-neutral-500">
                        Seller: {auc.seller} ({auc.sellerPhone}) • Current: <strong>${auc.currentBid}</strong> ({auc.bidsCount} bids) • Reserve: <strong>{auc.reservePrice ? `$${auc.reservePrice}` : 'None'}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancelAuction(auc.id, auc.title)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Auction</span>
                    </button>
                  </div>
                ))}
              </div>

              <h4 className="font-bold text-neutral-900 text-sm pt-3 border-t">Classified Advertisements</h4>
              <div className="space-y-2">
                {listings.map((list) => (
                  <div key={list.id} className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-neutral-900 text-sm block">{list.title}</span>
                      <span className="text-neutral-500">
                        Seller: {list.seller} ({list.phone}) • {list.price} • Status: <strong>{list.status}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveListing(list.id, list.title)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Remove Ad</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Safety Center
          </button>
        </div>
      </div>
    </div>
  );
}
