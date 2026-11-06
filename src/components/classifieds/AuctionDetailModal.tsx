import React, { useState, useEffect } from "react";
import { 
  X, Clock, Gavel, ShieldCheck, User, MapPin, 
  Phone, MessageSquare, CheckCircle2, AlertCircle, 
  Zap, Share2, Sparkles, RefreshCw, Trophy, Mail,
  Truck, Package, CreditCard, ExternalLink, Eye, Copy,
  Check, PhoneCall, Lock, AlertTriangle, ShieldAlert,
  RotateCcw, Send, Star, HelpCircle
} from "lucide-react";
import { 
  AuctionItem, 
  BuyerContactDetails,
  DEFAULT_USER_CONTACT,
  placeBidOnAuction, 
  buyNowAuction, 
  simulateOutbid, 
  toggleAuctionEndStatus,
  updateAuctionSettlement,
  formatAuctionCountdown,
  sendSecondChanceOffer,
  relistAuction,
  submitPlatformReport
} from "../../utils/classifiedsAuctionStorage";
import { playTempleBellChime } from "../../utils/eventNotificationSystem";

interface AuctionDetailModalProps {
  auction: AuctionItem | null;
  onClose: () => void;
  onAuctionUpdated: (updated: AuctionItem) => void;
  onShowToast: (message: string) => void;
  onOpenGuidelines?: () => void;
}

export function AuctionDetailModal({
  auction,
  onClose,
  onAuctionUpdated,
  onShowToast,
  onOpenGuidelines
}: AuctionDetailModalProps) {
  if (!auction) return null;

  const [activeAuction, setActiveAuction] = useState<AuctionItem>(auction);
  const [customBidInput, setCustomBidInput] = useState<string>("");
  const [maxAutoBidInput, setMaxAutoBidInput] = useState<string>("");
  const [enableMaxBid, setEnableMaxBid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"bidding" | "history" | "contacts" | "seller">("bidding");
  const [countdown, setCountdown] = useState(() => formatAuctionCountdown(auction.endTime));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<"Non-Responsive Buyer/Seller" | "Prohibited Item" | "Suspected Shill Bidding" | "Misrepresented Item">("Suspected Shill Bidding");
  const [reportDetails, setReportDetails] = useState("");

  // Role preview toggle: allow user to inspect modal as Buyer or Seller
  const isActualSeller = activeAuction.seller.toLowerCase().includes("damika");
  const [viewRole, setViewRole] = useState<"buyer" | "seller">(isActualSeller ? "seller" : "buyer");

  // Buyer contact state for placing bids
  const [showContactForm, setShowContactForm] = useState(false);
  const [buyerContact, setBuyerContact] = useState<BuyerContactDetails>({
    fullName: DEFAULT_USER_CONTACT.fullName,
    phone: DEFAULT_USER_CONTACT.phone,
    email: DEFAULT_USER_CONTACT.email,
    fulfillmentPreference: DEFAULT_USER_CONTACT.fulfillmentPreference,
    address: DEFAULT_USER_CONTACT.address,
    notes: DEFAULT_USER_CONTACT.notes
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync internal state when prop changes
  useEffect(() => {
    setActiveAuction(auction);
    const minNext = auction.currentBid + (auction.minIncrement || 10);
    setCustomBidInput(minNext.toString());
  }, [auction]);

  // Live ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatAuctionCountdown(activeAuction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAuction.endTime]);

  const minNextBid = activeAuction.currentBid + (activeAuction.minIncrement || 10);
  const isAuctionFinished = activeAuction.isEnded || countdown.isEnded;
  const isReserveMet = activeAuction.reservePrice ? activeAuction.currentBid >= activeAuction.reservePrice : true;
  const closedWithoutWinner = isAuctionFinished && !isReserveMet;
  const isUserWinner = activeAuction.isUserHighestBidder && isAuctionFinished && isReserveMet;
  const isSeller = viewRole === "seller";
  const isSelfBuyer = Boolean(activeAuction.isUserHighestBidder);

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
      onShowToast(`Copied ${label}: ${text}`);
    }
  };

  const handlePlaceCustomBid = (amountToBid: number) => {
    setErrorMsg("");
    
    // Check self-bidding prevention
    if (isActualSeller) {
      setErrorMsg("Platform Integrity Rule: Sellers are prohibited from bidding on their own listings.");
      return;
    }

    if (isNaN(amountToBid) || amountToBid < minNextBid) {
      setErrorMsg(`Bid must be at least $${minNextBid}. ($${activeAuction.currentBid} + $${activeAuction.minIncrement} increment)`);
      return;
    }

    if (!buyerContact.phone || !buyerContact.email) {
      setErrorMsg("Please provide your phone number and email so the seller can arrange payment/fulfillment within 48 hours.");
      setShowContactForm(true);
      return;
    }

    const maxLimit = enableMaxBid && maxAutoBidInput ? parseFloat(maxAutoBidInput) : undefined;

    setIsSubmitting(true);
    const res = placeBidOnAuction(activeAuction.id, amountToBid, buyerContact, maxLimit);
    setIsSubmitting(false);

    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
      playTempleBellChime();
      setCustomBidInput((amountToBid + (activeAuction.minIncrement || 10)).toString());
    } else {
      setErrorMsg(res.message);
      onShowToast(res.message);
    }
  };

  const handleQuickIncrement = (increment: number) => {
    const targetBid = activeAuction.currentBid + increment;
    handlePlaceCustomBid(targetBid);
  };

  const handleBuyNow = () => {
    if (isActualSeller) {
      setErrorMsg("Sellers cannot buy their own listings.");
      return;
    }
    if (!activeAuction.buyNowPrice) return;
    const confirmBuy = window.confirm(`Confirm immediate purchase of "${activeAuction.title}" for $${activeAuction.buyNowPrice}?\n\nNote: The platform does not process payments or shipping. Your contact number will be provided to the seller to arrange payment and handover within 48 hours.`);
    if (!confirmBuy) return;

    const res = buyNowAuction(activeAuction.id, buyerContact);
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
      playTempleBellChime();
      setActiveTab("contacts");
    }
  };

  const handleSimulateOutbid = () => {
    const res = simulateOutbid(activeAuction.id);
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
      const nextSuggested = res.updatedAuction.currentBid + (res.updatedAuction.minIncrement || 10);
      setCustomBidInput(nextSuggested.toString());
    }
  };

  const handleToggleEndStatus = () => {
    const res = toggleAuctionEndStatus(activeAuction.id);
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
    }
  };

  const handleUpdateSettlementStatus = (newStatus: any) => {
    const res = updateAuctionSettlement(activeAuction.id, { settlementStatus: newStatus });
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(`Settlement status updated to: ${newStatus}`);
    }
  };

  const handleSendSecondChance = () => {
    const res = sendSecondChanceOffer(activeAuction.id);
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
    } else {
      onShowToast(res.message);
    }
  };

  const handleRelist = () => {
    const res = relistAuction(activeAuction.id);
    if (res.success && res.updatedAuction) {
      setActiveAuction(res.updatedAuction);
      onAuctionUpdated(res.updatedAuction);
      onShowToast(res.message);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails) return;
    submitPlatformReport({
      targetType: "auction",
      targetId: activeAuction.id,
      targetTitle: activeAuction.title,
      reportedUser: activeAuction.seller,
      reporterName: "Damika (You)",
      reporterPhone: "+1 (323) 555-0144",
      reason: reportReason,
      details: reportDetails
    });
    setShowReportModal(false);
    setReportDetails("");
    onShowToast("Report filed successfully with platform administrators.");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    onShowToast("Auction link copied to clipboard!");
  };

  // Winning buyer contact resolution
  const winningContact = activeAuction.winningBidderContact || {
    fullName: activeAuction.highestBidder || "Leading Bidder",
    phone: "+1 (323) 555-0144",
    email: "damika1316@gmail.com",
    fulfillmentPreference: "Pickup",
    address: activeAuction.location,
    notes: "Awaiting seller contact within 48h to arrange payment and pickup."
  };

  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Gavel className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  Live Community Auction
                </span>
                <span className="text-[10px] text-neutral-500 font-medium">
                  ID: #{activeAuction.id}
                </span>
                {isAuctionFinished && (
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                    closedWithoutWinner ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    <CheckCircle2 className="w-3 h-3" /> {closedWithoutWinner ? "Closed (Reserve Not Met)" : "Auction Ended"}
                  </span>
                )}
                {activeAuction.extendedByTwoMinutes && (
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" /> Soft-Close +2m Active
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 line-clamp-1 mt-0.5">
                {activeAuction.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Role Switcher */}
            <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => setViewRole("buyer")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewRole === "buyer" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <User className="w-3 h-3" />
                <span>Buyer View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewRole("seller")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewRole === "seller" ? "bg-amber-600 text-white shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Seller View</span>
              </button>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Report listing or suspicious bidding"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
              title="Share auction"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* PLATFORM DIRECT ARRANGEMENT NOTICE BANNER */}
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold block">Platform Direct Transaction Policy:</span>
              <span>
                This platform only connects buyers and sellers. We do <strong>not</strong> accept payments, transfer funds, or provide shipping services. Both parties must contact each other within <strong>48 hours</strong> of winning to confirm the sale and arrange payment, shipping costs, or pickup handover directly.
              </span>
            </div>
            {onOpenGuidelines && (
              <button
                onClick={onOpenGuidelines}
                className="text-[11px] font-bold text-amber-800 hover:underline shrink-0 flex items-center gap-1"
              >
                <span>Rules</span>
                <HelpCircle className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ANTI-SNIPING ALERT BANNER (If under 2 minutes or extended) */}
          {(countdown.isUnderTwoMinutes || activeAuction.extendedByTwoMinutes) && !isAuctionFinished && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-900 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Anti-Sniping Soft Close Active:</strong> Any bid placed in the final 2 minutes extends the closing time by 2 minutes, giving other bidders an opportunity to respond.
                </span>
              </div>
              <span className="text-[10px] font-bold bg-red-200 text-red-950 px-2 py-0.5 rounded shrink-0">
                Fair Close Rule
              </span>
            </div>
          )}

          {/* RESERVE NOT MET NOTICE WHEN CLOSED */}
          {closedWithoutWinner && (
            <div className="bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Auction Closed Without a Winner (Reserve Price Not Met)</span>
              </div>
              <p>
                The highest bid of <strong>${activeAuction.currentBid}</strong> did not reach the seller's confidential reserve price of <strong>${activeAuction.reservePrice}</strong>. In accordance with platform guidelines, the item remains unsold and neither party is obligated to proceed.
              </p>
              {isActualSeller && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleRelist}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Relist Item with Lower Reserve
                  </button>
                  <button
                    onClick={handleSendSecondChance}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Make Offer to Highest Bidder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Visual & Key Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img 
                src={activeAuction.img} 
                alt={activeAuction.title} 
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-2.5 left-2.5 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 ${
                isAuctionFinished ? "bg-neutral-800" : countdown.isUnderTwoMinutes ? "bg-red-600 animate-pulse" : "bg-red-600"
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isAuctionFinished ? (closedWithoutWinner ? "Reserve Not Met" : "Auction Ended") : countdown.formatted}</span>
              </span>
              <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                Condition: {activeAuction.condition}
              </span>
            </div>

            {/* Current Price & Bidding Status Card */}
            <div className="md:col-span-7 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>{isAuctionFinished ? "Winning Final Bid" : "Current Highest Bid"}</span>
                  <span className="font-semibold text-neutral-700">{activeAuction.bidsCount} bids placed</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">
                    ${activeAuction.currentBid}
                  </span>
                  <span className="text-xs text-neutral-500">USD</span>
                </div>

                {/* High Bidder / Winner Indicator */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {activeAuction.isUserHighestBidder ? (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAuctionFinished ? (closedWithoutWinner ? "High Bidder (Reserve Not Met)" : "You Won This Auction! 48h Contact active below") : "You are currently the highest bidder!"}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Highest Bidder: <strong>{activeAuction.highestBidder || 'None yet'}</strong></span>
                    </div>
                  )}

                  {activeAuction.settlementStatus && !closedWithoutWinner && (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      Status: {activeAuction.settlementStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Auction Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-amber-200/70">
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-neutral-400 block">Min. Increment</span>
                  <span className="font-bold text-neutral-800">+${activeAuction.minIncrement}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-neutral-400 block">Next Minimum Bid</span>
                  <span className="font-bold text-emerald-700">${minNextBid}</span>
                </div>
                {activeAuction.reservePrice && (
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] text-neutral-400 block">Reserve Price Status</span>
                    <span className={`font-bold ${isReserveMet ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {isReserveMet ? '✓ Reserve Met' : `Reserve: $${activeAuction.reservePrice} (Not Met)`}
                    </span>
                  </div>
                )}
                {activeAuction.buyNowPrice && (
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] text-neutral-400 block">Buy It Now Price</span>
                    <span className="font-bold text-amber-700">${activeAuction.buyNowPrice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KEY BANNER 1: WINNING BUYER REVEAL CARD (48-Hour mutual contact active) */}
          {(isUserWinner || (activeAuction.isUserHighestBidder && isReserveMet)) && !closedWithoutWinner && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/40 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Trophy className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                      <span>{isAuctionFinished ? "🎉 Congratulations! You Won This Item" : "⭐ Leading Bidder: Seller Contact Unlocked"}</span>
                    </h4>
                    <p className="text-xs text-emerald-800">
                      <strong>48-Hour Rule:</strong> Both parties must make contact within 48 hours to confirm the purchase and agree on payment & pickup/delivery details.
                    </p>
                  </div>
                </div>

                <span className="bg-emerald-200/80 text-emerald-900 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 48h Contact Active
                </span>
              </div>

              {/* Seller's direct contact coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Phone */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> Seller Phone
                    </span>
                    <button 
                      onClick={() => copyToClipboard(activeAuction.sellerPhone, "Phone")}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      {copiedField === "Phone" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <a 
                    href={`tel:${activeAuction.sellerPhone}`}
                    className="font-extrabold text-neutral-900 hover:text-emerald-700 text-sm block"
                  >
                    {activeAuction.sellerPhone}
                  </a>
                  <span className="text-[10px] text-neutral-500">Contact: {activeAuction.seller}</span>
                </div>

                {/* Email */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-600" /> Seller Email
                    </span>
                    <button 
                      onClick={() => copyToClipboard(activeAuction.sellerEmail || "seller@lanka.org", "Email")}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      {copiedField === "Email" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <a 
                    href={`mailto:${activeAuction.sellerEmail}?subject=Auction%20Settlement%20for%20${encodeURIComponent(activeAuction.title)}`}
                    className="font-extrabold text-neutral-900 hover:text-emerald-700 text-xs block truncate"
                    title={activeAuction.sellerEmail}
                  >
                    {activeAuction.sellerEmail || "seller@lanka.org"}
                  </a>
                  <span className="text-[10px] text-neutral-500">Fast email response</span>
                </div>

                {/* Pickup Address */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Pickup Location
                    </span>
                    <button 
                      onClick={() => copyToClipboard(activeAuction.pickupAddress || activeAuction.location, "Address")}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      {copiedField === "Address" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="font-bold text-neutral-900 text-xs line-clamp-1">
                    {activeAuction.pickupAddress || activeAuction.location}
                  </p>
                  <span className="text-[10px] text-neutral-500">Local handover point</span>
                </div>
              </div>

              {/* Direct Action Buttons for Buyer */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`tel:${activeAuction.sellerPhone}`}
                  className="flex-1 min-w-[140px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Seller ({activeAuction.sellerPhone})</span>
                </a>
                <a
                  href={`https://wa.me/${activeAuction.sellerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${activeAuction.seller}, I won the auction for "${activeAuction.title}" ($${activeAuction.currentBid}) on Lanka Community Hub. Let's arrange payment and pickup/shipping!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[140px] py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Seller</span>
                </a>
              </div>
            </div>
          )}

          {/* KEY BANNER 2: SELLER VIEW - WINNING BUYER DETAILS CARD (Shown strictly to seller) */}
          {isSeller && !closedWithoutWinner && (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">
                        Seller Dashboard: Buyer Contact & Settlement Coordinator
                      </h4>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" /> SELLER PRIVILEGED ACCESS
                      </span>
                    </div>
                    <p className="text-xs text-amber-800">
                      <strong>48-Hour Obligation:</strong> You must contact the winning buyer within 48 hours to confirm the sale and coordinate payment and pickup/delivery.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Winning Bid</span>
                  <span className="font-black text-amber-700 text-sm sm:text-base">${activeAuction.currentBid}</span>
                </div>
              </div>

              {/* Buyer Contact Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Buyer Full Name & Phone */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-600" /> Buyer Name & Phone
                  </span>
                  <p className="font-bold text-neutral-900 text-sm">
                    {winningContact.fullName}
                  </p>
                  <a 
                    href={`tel:${winningContact.phone}`}
                    className="font-extrabold text-emerald-700 hover:underline text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{winningContact.phone}</span>
                  </a>
                  <span className="text-[10px] text-neutral-400 block">Confidential to seller only</span>
                </div>

                {/* Buyer Email */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-600" /> Buyer Email Address
                  </span>
                  <a 
                    href={`mailto:${winningContact.email}?subject=Payment%20and%20Pickup%20for%20${encodeURIComponent(activeAuction.title)}`}
                    className="font-bold text-neutral-900 hover:text-amber-700 text-xs block truncate"
                    title={winningContact.email}
                  >
                    {winningContact.email}
                  </a>
                  <span className="text-[10px] text-neutral-500 block">Verified community member</span>
                </div>

                {/* Fulfillment Preference & Address */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      {winningContact.fulfillmentPreference === "Shipping" ? <Truck className="w-3 h-3 text-amber-600" /> : <MapPin className="w-3 h-3 text-amber-600" />}
                      Fulfillment
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      winningContact.fulfillmentPreference === "Shipping" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {winningContact.fulfillmentPreference}
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-800 text-xs line-clamp-2">
                    {winningContact.address || "Local Pickup at designated seller location"}
                  </p>
                  {winningContact.notes && (
                    <p className="text-[10px] text-neutral-500 italic line-clamp-1">
                      Note: "{winningContact.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Non-Responsive Buyer & Second-Chance Offer Tools */}
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Buyer Non-Response & Second-Chance Options:</span>
                </span>
                <p className="text-[11px] text-neutral-600">
                  If the winning buyer does not respond to calls or messages within 48 hours, you can issue a Second-Chance Offer to the runner-up bidder or relist the auction.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleSendSecondChance}
                    className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Second-Chance Offer to Runner-Up</span>
                  </button>
                  <button
                    onClick={handleRelist}
                    className="py-1.5 px-3 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Relist Item</span>
                  </button>
                  <button
                    onClick={() => {
                      setReportReason("Non-Responsive Buyer/Seller");
                      setReportDetails(`Winning buyer ${winningContact.fullName} did not respond within 48 hours.`);
                      setShowReportModal(true);
                    }}
                    className="py-1.5 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Report Non-Responsive Buyer</span>
                  </button>
                </div>
              </div>

              {/* Seller Actions & Settlement Workflow */}
              <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-700">Update Settlement Status:</span>
                  <div className="flex gap-1 flex-wrap">
                    {([
                      "Terms Agreed (Arranging Pickup/Delivery)", 
                      "Item Collected / Shipped", 
                      "Transaction Completed"
                    ] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateSettlementStatus(status)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                          activeAuction.settlementStatus === status
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-amber-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${winningContact.phone}`}
                    className="py-1.5 px-3 bg-white border border-amber-300 hover:bg-amber-100/80 text-amber-900 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Buyer</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-100 text-xs font-bold gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("bidding")}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "bidding"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Place Bid / Buy</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "history"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Bid History ({activeAuction.bidsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "contacts"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>48h Mutual Contacts</span>
            </button>
            <button
              onClick={() => setActiveTab("seller")}
              className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "seller"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Item & Pickup Details</span>
            </button>
          </div>

          {/* Tab 1: Place Bid Form */}
          {activeTab === "bidding" && (
            <div className="space-y-4">
              {isAuctionFinished ? (
                <div className="p-4 bg-neutral-100 rounded-xl text-center text-neutral-700 font-bold text-sm">
                  {closedWithoutWinner
                    ? `This auction has ended without a winner because the reserve price ($${activeAuction.reservePrice}) was not met.`
                    : `This auction has ended. Winning bid: $${activeAuction.currentBid} by ${activeAuction.highestBidder}. Check the contacts tab to finalize payment and shipping/pickup!`}
                </div>
              ) : isActualSeller ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center text-amber-900 font-bold text-xs space-y-1">
                  <span className="block text-sm">You are the seller of this listing.</span>
                  <p className="text-neutral-600 font-medium text-[11px]">
                    Platform Integrity Rule: Sellers are not permitted to bid on their own items. Once active bidding starts, core auction details are locked.
                  </p>
                </div>
              ) : (
                <>
                  {/* Quick Bid Increment Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-2">
                      Quick Bid (Instant Increment):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[10, 25, 50, 100].map((inc) => {
                        const targetAmt = activeAuction.currentBid + inc;
                        return (
                          <button
                            key={inc}
                            onClick={() => handleQuickIncrement(inc)}
                            disabled={isSubmitting}
                            className="py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex flex-col items-center justify-center shadow-2xs group"
                          >
                            <span className="text-amber-700 font-extrabold">+${inc}</span>
                            <span className="text-[10px] text-neutral-500 font-normal">
                              Bid ${targetAmt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Bid Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700">
                      Or Enter Custom Bid Amount ($USD):
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min={minNextBid}
                          step={activeAuction.minIncrement || 10}
                          value={customBidInput}
                          onChange={(e) => setCustomBidInput(e.target.value)}
                          placeholder={`Min. $${minNextBid}`}
                          className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handlePlaceCustomBid(parseFloat(customBidInput))}
                        disabled={isSubmitting || !customBidInput}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Gavel className="w-4 h-4" />
                        <span>Place Bid</span>
                      </button>
                    </div>

                    {/* Automatic Maximum Proxy Bidding Option */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                        <input
                          type="checkbox"
                          checked={enableMaxBid}
                          onChange={(e) => setEnableMaxBid(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Enable Automatic Maximum Bidding (Proxy Auto-Bid)</span>
                      </label>
                      {enableMaxBid && (
                        <div className="mt-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-xs space-y-1">
                          <label className="block text-[11px] font-bold text-amber-900">
                            Your Maximum Bid Ceiling ($USD):
                          </label>
                          <input
                            type="number"
                            min={minNextBid + 10}
                            value={maxAutoBidInput}
                            onChange={(e) => setMaxAutoBidInput(e.target.value)}
                            placeholder={`e.g. ${minNextBid + 100}`}
                            className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                          />
                          <p className="text-[10px] text-neutral-500">
                            The system will automatically place minimum required bids on your behalf up to this maximum whenever counter-bids are placed.
                          </p>
                        </div>
                      )}
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMsg}</span>
                      </p>
                    )}
                  </div>

                  {/* Buyer Contact Registration Confirmation Bar */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Your Contact Details (Shared strictly with seller if you win):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowContactForm(!showContactForm)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold"
                      >
                        {showContactForm ? "Hide Editor" : "Edit Contact Info"}
                      </button>
                    </div>

                    {!showContactForm ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-100">
                        <div>
                          <span className="text-neutral-400 block">Name</span>
                          <span className="font-semibold text-neutral-900">{buyerContact.fullName}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block">Phone</span>
                          <span className="font-semibold text-neutral-900">{buyerContact.phone}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block">Email</span>
                          <span className="font-semibold text-neutral-900 truncate block">{buyerContact.email}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block">Delivery</span>
                          <span className="font-semibold text-emerald-700">{buyerContact.fulfillmentPreference}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-200">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Your Full Name</label>
                          <input
                            type="text"
                            value={buyerContact.fullName}
                            onChange={(e) => setBuyerContact({ ...buyerContact, fullName: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Your Phone Number</label>
                          <input
                            type="text"
                            value={buyerContact.phone}
                            onChange={(e) => setBuyerContact({ ...buyerContact, phone: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Your Email</label>
                          <input
                            type="email"
                            value={buyerContact.email}
                            onChange={(e) => setBuyerContact({ ...buyerContact, email: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Preferred Fulfillment</label>
                          <select
                            value={buyerContact.fulfillmentPreference}
                            onChange={(e) => setBuyerContact({ ...buyerContact, fulfillmentPreference: e.target.value as "Pickup" | "Shipping" })}
                            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                          >
                            <option value="Pickup">Local Pickup in Person</option>
                            <option value="Shipping">Courier / Mail Shipping</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Your Address or Delivery Note</label>
                          <input
                            type="text"
                            value={buyerContact.address || ""}
                            onChange={(e) => setBuyerContact({ ...buyerContact, address: e.target.value })}
                            placeholder="Street, City, Postal code (or meeting preference)"
                            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buy It Now Option if available */}
                  {activeAuction.buyNowPrice && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Instant Purchase (Buy Now)
                        </span>
                        <p className="text-xs font-semibold text-neutral-800">
                          Skip the auction and own this item immediately for <strong>${activeAuction.buyNowPrice}</strong>
                        </p>
                      </div>
                      <button
                        onClick={handleBuyNow}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Buy It Now</span>
                      </button>
                    </div>
                  )}

                  {/* Simulation / Testing Helpers */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
                    <span className="text-[11px] font-medium">Evaluation tools:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleToggleEndStatus}
                        className="text-xs text-neutral-700 hover:text-neutral-900 font-bold flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg border border-neutral-300 transition-colors"
                        title="Toggles whether this auction is officially ended so you can test winning/reserve settlement"
                      >
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>{isAuctionFinished ? "Reopen Auction" : "Simulate End (Check Reserve)"}</span>
                      </button>
                      <button
                        onClick={handleSimulateOutbid}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                        title="Simulates another community member placing a counter-bid (tests outbid notice and 2-min rule)"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-600" />
                        <span>Simulate Counter-Bid</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Bid History */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                <span>Bidder & Details</span>
                <span>Amount & Status</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeAuction.bidsHistory && activeAuction.bidsHistory.length > 0 ? (
                  activeAuction.bidsHistory.map((bid, i) => (
                    <div 
                      key={bid.id || i}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        i === 0 
                          ? "bg-amber-50/80 border-amber-200 font-bold" 
                          : "bg-neutral-50/60 border-neutral-100 text-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          bid.isUser ? "bg-amber-600 text-white" : "bg-neutral-200 text-neutral-700"
                        }`}>
                          {bid.bidderName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-neutral-900">{bid.bidderName}</span>
                            {i === 0 && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">
                                Highest
                              </span>
                            )}
                            {bid.fulfillmentPreference && (
                              <span className="text-[9px] font-medium bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded">
                                {bid.fulfillmentPreference}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(bid.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            {isSeller && bid.bidderPhone ? (
                              <span className="text-amber-700 font-semibold ml-1.5 inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5 text-amber-600 inline" />
                                <span>Seller Only: {bid.bidderPhone}</span>
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-700 block">${bid.amount}</span>
                        {i === 0 ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Leading Bid</span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Outbid</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-neutral-400">No bids placed yet. Be the first to bid!</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Dedicated Buyer & Seller Contacts Tab */}
          {activeTab === "contacts" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-neutral-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>48-Hour Mutual Contact Obligation:</strong> When an auction concludes with a winner, buyer and seller receive access to each other's contact phone number. Both parties must contact each other within 48 hours to confirm the purchase and agree on payment & handover details directly.
                </span>
              </div>

              {/* Two Column Layout: Seller Details & Buyer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Seller Contact & Instructions */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h5 className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>Seller Contact Information</span>
                    </h5>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Listing Owner
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Seller Name</span>
                      <span className="font-bold text-neutral-900 text-sm">{activeAuction.seller}</span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Seller Phone</span>
                      <a 
                        href={`tel:${activeAuction.sellerPhone}`}
                        className="font-extrabold text-emerald-700 hover:underline text-sm flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{activeAuction.sellerPhone}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Seller Email</span>
                      <a 
                        href={`mailto:${activeAuction.sellerEmail}`}
                        className="font-semibold text-neutral-800 hover:text-amber-700 text-xs flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{activeAuction.sellerEmail || "seller@lanka.org"}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Pickup Handover Location</span>
                      <span className="font-semibold text-neutral-800 text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{activeAuction.pickupAddress || activeAuction.location}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Accepted Payment Methods</span>
                      <span className="font-semibold text-neutral-800 text-xs">
                        {(activeAuction.paymentMethodsAccepted || ["Cash on Pickup", "Bank Transfer", "Zelle"]).join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`tel:${activeAuction.sellerPhone}`}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Seller ({activeAuction.sellerPhone})</span>
                    </a>
                  </div>
                </div>

                {/* Column 2: Winning / Leading Buyer Details */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h5 className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                      <span>Winning / Leading Buyer</span>
                    </h5>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      High Bidder
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Buyer Name</span>
                      <span className="font-bold text-neutral-900 text-sm">{winningContact.fullName}</span>
                    </div>

                    {/* Buyer Phone: STRICT PRIVACY - ONLY SHOWN TO SELLER */}
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Buyer Phone</span>
                      {isSeller ? (
                        <div>
                          <a 
                            href={`tel:${winningContact.phone}`}
                            className="font-extrabold text-emerald-700 hover:underline text-sm flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{winningContact.phone}</span>
                          </a>
                          <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Visible only to you as seller to arrange pickup / shipping</span>
                          </span>
                        </div>
                      ) : isSelfBuyer ? (
                        <div>
                          <span className="font-bold text-neutral-800 text-sm flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{winningContact.phone}</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                            (Your registered phone — disclosed exclusively to the seller)
                          </span>
                        </div>
                      ) : (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs flex items-center gap-2 text-neutral-600">
                          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>•••••••••••• <strong className="text-neutral-700">(Private • Only visible to seller)</strong></span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Buyer Email</span>
                      {isSeller ? (
                        <a 
                          href={`mailto:${winningContact.email}`}
                          className="font-semibold text-neutral-800 hover:text-amber-700 text-xs flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{winningContact.email}</span>
                        </a>
                      ) : isSelfBuyer ? (
                        <span className="font-semibold text-neutral-800 text-xs flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{winningContact.email} (Your email)</span>
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-xs flex items-center gap-1">
                          <Lock className="w-3 h-3 text-neutral-400" />
                          <span>Protected • Visible only to seller</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Fulfillment Preference</span>
                      <span className="font-bold text-neutral-900 text-xs flex items-center gap-1">
                        {winningContact.fulfillmentPreference === "Shipping" ? <Truck className="w-3.5 h-3.5 text-blue-600" /> : <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{winningContact.fulfillmentPreference}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px]">Delivery / Billing Address</span>
                      {isSeller || isSelfBuyer ? (
                        <span className="font-semibold text-neutral-800 text-xs">
                          {winningContact.address || "Local Pickup address confirmed upon call"}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-xs flex items-center gap-1">
                          <Lock className="w-3 h-3 text-neutral-400" />
                          <span>Private address • Shared only with seller</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    {isSeller ? (
                      <a
                        href={`tel:${winningContact.phone}`}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Buyer ({winningContact.phone})</span>
                      </a>
                    ) : (
                      <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Buyer phone number is strictly private and accessible only by the seller.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Item & Seller Details */}
          {activeTab === "seller" && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1.5">Description</h4>
                <p className="leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-neutral-700">
                  {activeAuction.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Item Condition</span>
                  <span className="font-bold text-neutral-800">{activeAuction.condition}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Category</span>
                  <span className="font-bold text-neutral-800">{activeAuction.category}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Location</span>
                  <span className="font-bold text-neutral-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{activeAuction.location}</span>
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Starting Bid</span>
                  <span className="font-bold text-neutral-800">${activeAuction.startingBid}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Listed By</span>
                  <span className="font-bold text-neutral-900 text-sm">{activeAuction.seller}</span>
                  <p className="text-[11px] text-neutral-500">Verified Community Seller • {activeAuction.sellerPhone}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${activeAuction.sellerPhone}`}
                    className="p-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl font-bold flex items-center gap-1.5 text-neutral-700 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`/directory?view=messages&to=${encodeURIComponent(activeAuction.seller)}`}
                    className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Platform Escrow Rules & 48-Hour Mutual Contact Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-neutral-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-neutral-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Report Listing / Bidding Issue</span>
              </h4>
              <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                >
                  <option value="Suspected Shill Bidding">Suspected Shill Bidding</option>
                  <option value="Non-Responsive Buyer/Seller">Non-Responsive Buyer or Seller</option>
                  <option value="Prohibited Item">Prohibited Item or Counterfeit</option>
                  <option value="Misrepresented Item">Misrepresented Item Details</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Details & Observations</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context so administrators can investigate..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
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
