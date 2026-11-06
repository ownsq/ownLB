import React, { useState } from "react";
import { 
  X, User, ShieldCheck, Tag, Gavel, CheckCircle2, 
  Clock, Phone, Mail, MapPin, Eye, Check, AlertCircle, 
  RotateCcw, Send, Trophy, ArrowRight, Star
} from "lucide-react";
import { 
  ClassifiedListing, 
  AuctionItem, 
  UserProfile, 
  updateListingStatus, 
  respondToSecondChanceOffer,
  saveUserProfile,
  updateAuctionSettlement
} from "../../utils/classifiedsAuctionStorage";

interface UserHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: ClassifiedListing[];
  auctions: AuctionItem[];
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onRefreshData: () => void;
  onShowToast: (message: string) => void;
}

export function UserHubModal({
  isOpen,
  onClose,
  listings,
  auctions,
  userProfile,
  onProfileUpdated,
  onRefreshData,
  onShowToast
}: UserHubModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"listings" | "bids" | "profile">("listings");
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [listingFilter, setListingFilter] = useState<"all" | "available" | "reserved" | "sold" | "withdrawn">("all");

  // User's own listings (where seller matches Damika)
  const myListings = listings.filter(l => l.seller.toLowerCase().includes("damika"));
  const filteredMyListings = listingFilter === "all" ? myListings : myListings.filter(l => l.status === listingFilter);

  // Auctions where user has placed bids or won
  const myAuctions = auctions.filter(a => 
    a.isUserHighestBidder || 
    (a.bidsHistory && a.bidsHistory.some(b => b.isUser))
  );

  const handleStatusChange = (listingId: string, newStatus: "available" | "reserved" | "sold" | "withdrawn") => {
    const res = updateListingStatus(listingId, newStatus);
    onShowToast(res.message);
    onRefreshData();
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profileForm);
    onProfileUpdated(profileForm);
    onShowToast("User profile and verification preferences updated!");
  };

  const handleSecondChance = (auctionId: string, accept: boolean) => {
    const res = respondToSecondChanceOffer(auctionId, accept);
    onShowToast(res.message);
    onRefreshData();
  };

  const handleMarkTransactionCompleted = (auctionId: string) => {
    const res = updateAuctionSettlement(auctionId, { settlementStatus: "Transaction Completed" });
    onShowToast("Transaction marked as completed! Handover finalized.");
    onRefreshData();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                  {userProfile.name}'s Hub
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Member
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Manage your classified listings, track active bids, and view verified contact details
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
            onClick={() => setActiveTab("listings")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "listings"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>My Listings ({myListings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("bids")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "bids"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>My Bids & Won Items ({myAuctions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Verifications</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* TAB 1: MY LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-neutral-600">Filter by Status:</span>
                <div className="flex gap-1.5 text-xs font-bold">
                  {(["all", "available", "reserved", "sold", "withdrawn"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setListingFilter(st)}
                      className={`px-2.5 py-1 rounded-lg border capitalize transition-colors ${
                        listingFilter === st
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMyListings.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
                  No listings found for this status. Use the "+ Post an Ad" button to publish an item!
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMyListings.map((listing) => (
                    <div 
                      key={listing.id}
                      className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-amber-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <img 
                            src={listing.img} 
                            alt={listing.title} 
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-100" 
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-neutral-900 text-sm">{listing.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                listing.status === "available" ? "bg-emerald-100 text-emerald-800" :
                                listing.status === "reserved" ? "bg-amber-100 text-amber-800" :
                                listing.status === "sold" ? "bg-neutral-200 text-neutral-800" :
                                "bg-rose-100 text-rose-800"
                              }`}>
                                {listing.status}
                              </span>
                              {listing.isNegotiable && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                                  Negotiable
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {listing.cat} • {listing.loc} • Posted {listing.time}
                            </p>
                            <span className="font-extrabold text-amber-700 text-sm">{listing.price}</span>
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] text-neutral-400 font-medium">Update Status:</span>
                          <div className="flex gap-1">
                            {(["available", "reserved", "sold", "withdrawn"] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(listing.id, st)}
                                disabled={listing.status === st}
                                className={`text-[10px] font-bold px-2 py-1 rounded border capitalize transition-colors ${
                                  listing.status === st
                                    ? "bg-neutral-900 text-white border-neutral-900 cursor-default"
                                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Offers received for this listing */}
                      {listing.offers && listing.offers.length > 0 && (
                        <div className="pt-2 border-t border-neutral-100 space-y-2">
                          <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Offers Received ({listing.offers.length}):</span>
                          </span>
                          <div className="space-y-1.5">
                            {listing.offers.map((off) => (
                              <div key={off.id} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-neutral-900">{off.buyerName}</span> offered <strong className="text-amber-800">${off.amount}</strong>
                                  <span className="text-neutral-500 block text-[11px]">
                                    Proposed: {off.proposedDate} at {off.proposedLocation} • Tel: {off.buyerPhone}
                                  </span>
                                </div>
                                <div className="flex gap-1.5">
                                  <a 
                                    href={`tel:${off.buyerPhone}`}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] hover:bg-emerald-700"
                                  >
                                    Call Buyer
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY BIDS & WON ITEMS */}
          {activeTab === "bids" && (
            <div className="space-y-4">
              {myAuctions.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
                  You have not placed bids on any auctions yet. Browse the Live Auctions section to participate!
                </div>
              ) : (
                <div className="space-y-3">
                  {myAuctions.map((auction) => {
                    const isWinner = auction.isUserHighestBidder;
                    return (
                      <div 
                        key={auction.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isWinner 
                            ? "bg-emerald-50/40 border-emerald-300" 
                            : "bg-white border-neutral-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <img 
                              src={auction.img} 
                              alt={auction.title} 
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-100" 
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-neutral-900 text-sm">{auction.title}</h4>
                                {isWinner && (
                                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-emerald-600" />
                                    {auction.isEnded ? "Auction Won!" : "Leading Bidder"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                Seller: {auction.seller} • Location: {auction.location}
                              </p>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-black text-amber-700 text-sm">
                                  Your / Leading Bid: ${auction.currentBid}
                                </span>
                                {auction.reservePrice && (
                                  <span className="text-[10px] text-neutral-500">
                                    (Reserve: ${auction.reservePrice} • {auction.reserveMet ? "Met" : "Pending"})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold block text-neutral-400">STATUS</span>
                            <span className="text-xs font-bold text-neutral-800">
                              {auction.settlementStatus || "Active Bidding"}
                            </span>
                          </div>
                        </div>

                        {/* 48-Hour Contact details if won */}
                        {isWinner && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-emerald-900 font-bold">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                <span>48-Hour Contact Rule: Settle Directly with Seller</span>
                              </span>
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                Within 48 Hours
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-700">
                              <div>
                                <span className="text-neutral-400 block">Seller Phone:</span>
                                <a href={`tel:${auction.sellerPhone}`} className="font-bold text-emerald-700 hover:underline">
                                  {auction.sellerPhone}
                                </a>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Pickup Location:</span>
                                <span className="font-semibold text-neutral-900">{auction.pickupAddress || auction.location}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1 border-t border-neutral-100">
                              <a
                                href={`tel:${auction.sellerPhone}`}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" /> Call Seller to Arrange Handover
                              </a>
                              {auction.settlementStatus !== "Transaction Completed" && (
                                <button
                                  onClick={() => handleMarkTransactionCompleted(auction.id)}
                                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Mark Collected & Done
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Second Chance Offer notification if received */}
                        {auction.secondChanceOffer && auction.secondChanceOffer.runnerUpName.includes("Damika") && auction.secondChanceOffer.status === "pending" && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-amber-900">
                              <span>🎁 Second-Chance Offer Received!</span>
                              <span>${auction.secondChanceOffer.amount}</span>
                            </div>
                            <p className="text-[11px] text-amber-800">
                              The winning bidder did not proceed. The seller is offering you the item at your last bid of <strong>${auction.secondChanceOffer.amount}</strong>!
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSecondChance(auction.id, true)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                              >
                                Accept Purchase
                              </button>
                              <button
                                onClick={() => handleSecondChance(auction.id, false)}
                                className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold rounded-lg text-xs"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & VERIFICATIONS */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              {/* Verification Badges Section */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trust & Verification Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Phone Verification</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-bold text-neutral-900 block mt-1">{profileForm.phone}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">SMS Confirmed</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Email Verification</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-bold text-neutral-900 block mt-1 truncate">{profileForm.email}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Registered Account</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-medium">Community Trust</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="font-bold text-neutral-900 block mt-1">{profileForm.communityScore} / 5.0</span>
                    <span className="text-[10px] text-neutral-500">Member since {profileForm.memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Primary Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Default City / Region</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Community Bio</label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-neutral-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-2xs"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
