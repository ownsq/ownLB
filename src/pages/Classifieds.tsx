import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, MapPin, Plus, ShieldCheck, Heart, 
  ChevronDown, ChevronRight, Car, Home, Smartphone, 
  Tv, Shirt, Briefcase, Book, Dribbble, MoreHorizontal, 
  Clock, Lock, MessageSquare, Handshake, CheckCircle2,
  Sparkles, X, Send, DollarSign, Eye, Phone,
  Gavel, Share2, Zap, Check, Trophy, AlertCircle, Tag,
  AlertTriangle, FileText, ShieldAlert, RotateCcw, HelpCircle,
  Calendar, PhoneCall, User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuctionDetailModal } from "../components/classifieds/AuctionDetailModal";
import { PlatformGuidelinesModal } from "../components/classifieds/PlatformGuidelinesModal";
import { UserHubModal } from "../components/classifieds/UserHubModal";
import { AdminSafetyModal } from "../components/classifieds/AdminSafetyModal";
import { 
  AuctionItem, 
  ClassifiedListing, 
  PlatformReport,
  AuditLogEntry,
  UserProfile,
  getAuctions, 
  saveAuctions, 
  getListings, 
  saveListings, 
  getPlatformReports,
  getAuditLogs,
  getUserProfile,
  formatAuctionCountdown,
  makeClassifiedOffer,
  submitPlatformReport,
  addAuditLog
} from "../utils/classifiedsAuctionStorage";
import { isUserBanned } from "../utils/userManagementStorage";
import { subscribeClassifieds } from "../lib/firestoreService";

const CATEGORIES_BASE = [
  { name: "Vehicles", icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Property", icon: Home, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Electronics", icon: Smartphone, color: "text-purple-600", bg: "bg-purple-50" },
  { name: "Home & Garden", icon: Tv, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Fashion & Beauty", icon: Shirt, color: "text-rose-600", bg: "bg-rose-50" },
  { name: "Services", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
  { name: "Jobs", icon: Briefcase, color: "text-cyan-600", bg: "bg-cyan-50" },
  { name: "Books & Education", icon: Book, color: "text-amber-600", bg: "bg-amber-100" },
  { name: "Sports & Hobbies", icon: Dribbble, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Other", icon: MoreHorizontal, color: "text-neutral-500", bg: "bg-neutral-100" },
];

export function Classifieds() {
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("All Listings");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("All Locations");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showUserHubModal, setShowUserHubModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [selectedListing, setSelectedListing] = useState<ClassifiedListing | null>(null);

  // Make an Offer state for Classified Listings
  const [offerAmount, setOfferAmount] = useState("");
  const [offerDate, setOfferDate] = useState("Saturday 11:00 AM");
  const [offerLocation, setOfferLocation] = useState("");
  const [offerFulfillment, setOfferFulfillment] = useState<"Pickup" | "Shipping">("Pickup");
  const [offerNotes, setOfferNotes] = useState("");

  // Post form state (supports both Classified Ad and Live Auction)
  const [postType, setPostType] = useState<"listing" | "auction">("listing");
  const [newAd, setNewAd] = useState({
    title: "",
    price: "",
    isNegotiable: true,
    loc: "Los Angeles, USA",
    cat: "Electronics",
    desc: "",
    seller: "Damika",
    phone: "+1 (323) 555-0144",
    email: "damika1316@gmail.com",
    img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600"
  });

  const [newAuctionForm, setNewAuctionForm] = useState({
    title: "",
    startingBid: 100,
    minIncrement: 15,
    buyNowPrice: 250,
    reservePrice: 150,
    durationHours: 48,
    category: "Home & Garden",
    condition: "Antique / Rare" as const,
    location: "Los Angeles, USA",
    sellerPhone: "+1 (323) 555-0144",
    sellerEmail: "damika1316@gmail.com",
    pickupAddress: "10834 Palms Blvd, Los Angeles, CA 90034",
    desc: "",
    img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600"
  });

  // Data state loaded from persistent storage
  const [listings, setListings] = useState<ClassifiedListing[]>(getListings);
  const [auctions, setAuctions] = useState<AuctionItem[]>(getAuctions);
  const [reports, setReports] = useState<PlatformReport[]>(getPlatformReports);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(getAuditLogs);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile);

  // Dynamic category counts from live database
  const CATEGORIES = useMemo(() => {
    return CATEGORIES_BASE.map(cat => {
      const count = listings.filter(item => item.cat === cat.name).length;
      return {
        ...cat,
        count: `${count} ${count === 1 ? 'Listing' : 'Listings'}`
      };
    });
  }, [listings]);

  const refreshAllData = () => {
    setListings(getListings());
    setAuctions(getAuctions());
    setReports(getPlatformReports());
    setAuditLogs(getAuditLogs());
    setUserProfile(getUserProfile());
  };

  useEffect(() => {
    const unsub = subscribeClassifieds((liveItems) => {
      setListings(liveItems || []);
    });

    const handleAuctionsUpdated = (e: CustomEvent<AuctionItem[]>) => {
      if (e.detail) setAuctions(e.detail);
      else setAuctions(getAuctions());
    };
    const handleListingsUpdated = (e: CustomEvent<ClassifiedListing[]>) => {
      if (e.detail) setListings(e.detail);
      else setListings(getListings());
    };
    const handleReportsUpdated = (e: CustomEvent<PlatformReport[]>) => {
      if (e.detail) setReports(e.detail);
      else setReports(getPlatformReports());
    };
    const handleAuditUpdated = (e: CustomEvent<AuditLogEntry[]>) => {
      if (e.detail) setAuditLogs(e.detail);
      else setAuditLogs(getAuditLogs());
    };

    window.addEventListener("lanka_auctions_updated", handleAuctionsUpdated as EventListener);
    window.addEventListener("lanka_listings_updated", handleListingsUpdated as EventListener);
    window.addEventListener("lanka_reports_updated", handleReportsUpdated as EventListener);
    window.addEventListener("lanka_audit_updated", handleAuditUpdated as EventListener);
    return () => {
      unsub();
      window.removeEventListener("lanka_auctions_updated", handleAuctionsUpdated as EventListener);
      window.removeEventListener("lanka_listings_updated", handleListingsUpdated as EventListener);
      window.removeEventListener("lanka_reports_updated", handleReportsUpdated as EventListener);
      window.removeEventListener("lanka_audit_updated", handleAuditUpdated as EventListener);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      showToast("Removed from saved items");
    } else {
      setFavorites([...favorites, id]);
      showToast("Added to saved items!");
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const banCheck = isUserBanned(newAd.email) || isUserBanned(userProfile.email);
    if (banCheck.banned) {
      showToast(`Account Suspended: ${banCheck.reason || "Posting privileges restricted."}`);
      return;
    }
    if (postType === "listing") {
      if (!newAd.title || !newAd.price) {
        showToast("Please provide an item title and price");
        return;
      }
      const raw = parseFloat(newAd.price.replace(/[^0-9.]/g, "")) || 100;
      const created: ClassifiedListing = {
        id: "l" + Date.now(),
        title: newAd.title,
        price: newAd.price.startsWith("$") ? newAd.price : "$" + newAd.price,
        rawPrice: raw,
        isNegotiable: newAd.isNegotiable,
        sellingMethod: "classified",
        status: "available",
        loc: newAd.loc,
        cat: newAd.cat,
        time: "Just now",
        img: newAd.img || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=400",
        featured: true,
        seller: newAd.seller,
        phone: newAd.phone,
        email: newAd.email,
        desc: newAd.desc || "Item posted by community member.",
        condition: "Used",
        viewsCount: 1,
        offers: []
      };
      const updated = [created, ...listings];
      setListings(updated);
      saveListings(updated);

      addAuditLog({
        action: "LISTING_PUBLISHED",
        targetTitle: created.title,
        performedBy: created.seller,
        details: `Published classified ad with price ${created.price} (${created.isNegotiable ? "Negotiable" : "Fixed Price"}).`
      });

      showToast("Your classified ad has been published successfully!");
    } else {
      // Create Live Auction
      if (!newAuctionForm.title || !newAuctionForm.startingBid) {
        showToast("Please provide auction title and starting bid");
        return;
      }
      const createdAuction: AuctionItem = {
        id: "a" + Date.now(),
        title: newAuctionForm.title,
        desc: newAuctionForm.desc || "Community auction item in excellent condition.",
        startingBid: Number(newAuctionForm.startingBid),
        currentBid: Number(newAuctionForm.startingBid),
        minIncrement: Number(newAuctionForm.minIncrement) || 15,
        bidsCount: 0,
        bidsHistory: [],
        endTime: Date.now() + (Number(newAuctionForm.durationHours) || 48) * 3600 * 1000,
        img: newAuctionForm.img || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
        category: newAuctionForm.category,
        seller: "Damika",
        sellerPhone: newAuctionForm.sellerPhone || "+1 (323) 555-0144",
        sellerEmail: newAuctionForm.sellerEmail || "damika1316@gmail.com",
        pickupAddress: newAuctionForm.pickupAddress || "10834 Palms Blvd, Los Angeles, CA 90034",
        paymentMethodsAccepted: ["Cash on Pickup", "Zelle", "Bank Wire / Transfer"],
        location: newAuctionForm.location,
        condition: newAuctionForm.condition,
        buyNowPrice: newAuctionForm.buyNowPrice ? Number(newAuctionForm.buyNowPrice) : undefined,
        reservePrice: newAuctionForm.reservePrice ? Number(newAuctionForm.reservePrice) : undefined,
        reserveMet: false,
        highestBidder: undefined,
        isUserHighestBidder: false,
        antiSnipingExtensionsCount: 0,
        settlementStatus: "Awaiting 48h Mutual Contact"
      };
      const updated = [createdAuction, ...auctions];
      setAuctions(updated);
      saveAuctions(updated);

      addAuditLog({
        action: "AUCTION_CREATED",
        targetTitle: createdAuction.title,
        performedBy: createdAuction.seller,
        details: `Created auction with starting bid $${createdAuction.startingBid}, reserve $${createdAuction.reservePrice || 'None'}.`
      });

      showToast(`Live Auction for "${newAuctionForm.title}" is now open for bidding!`);
      setSelectedAuction(createdAuction);
    }

    setShowPostModal(false);
  };

  const handleMakeClassifiedOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !offerAmount) return;

    const res = makeClassifiedOffer(selectedListing.id, {
      amount: parseFloat(offerAmount),
      buyerName: userProfile.name,
      buyerPhone: userProfile.phone,
      buyerEmail: userProfile.email,
      proposedDate: offerDate,
      proposedLocation: offerLocation || selectedListing.loc,
      fulfillment: offerFulfillment,
      notes: offerNotes
    });

    showToast(res.message);
    setOfferAmount("");
    setOfferNotes("");
    refreshAllData();
  };

  const handleReportSelectedListing = () => {
    if (!selectedListing) return;
    submitPlatformReport({
      targetType: "listing",
      targetId: selectedListing.id,
      targetTitle: selectedListing.title,
      reportedUser: selectedListing.seller,
      reporterName: userProfile.name,
      reporterPhone: userProfile.phone,
      reason: "Misrepresented Item",
      details: "User reported advertisement for investigation by administrators."
    });
    showToast("Report submitted to platform safety administrators.");
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLoc = locationQuery === "" || item.loc.toLowerCase().includes(locationQuery.toLowerCase());
      const matchCat = selectedCategory === "All" || item.cat.toLowerCase() === selectedCategory.toLowerCase();
      const matchLocFilter = selectedLocationFilter === "All Locations" || item.loc.toLowerCase().includes(selectedLocationFilter.toLowerCase().split(',')[0]);
      
      let matchTab = true;
      if (activeTab === "Recent") matchTab = item.time.includes("h ago") || item.time.includes("Just now");
      if (activeTab === "Popular") matchTab = item.featured;
      if (activeTab === "Available Only") matchTab = item.status === "available" || !item.status;
      if (activeTab === "Negotiable") matchTab = item.isNegotiable;

      return matchSearch && matchLoc && matchCat && matchLocFilter && matchTab;
    });
  }, [listings, searchQuery, locationQuery, selectedCategory, selectedLocationFilter, activeTab]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PLATFORM MANDATORY DIRECT TRANSACTION POLICY BANNER */}
      <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-neutral-900 text-sm">
                Community Direct Arrangement & Auction Platform
              </h4>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                NO PAYMENT OR SHIPPING INTERMEDIATION
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl leading-relaxed">
              This platform only connects buyers and sellers. We do <strong>not</strong> accept payments, hold funds, or organise delivery. Both parties must contact each other within <strong>48 hours</strong> of an auction win or accepted offer to agree on payment, shipping charges, or pickup handover directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="flex-1 md:flex-initial px-3 py-2 bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Platform Rules & 48h Guide</span>
          </button>
          <button
            onClick={() => setShowUserHubModal(true)}
            className="flex-1 md:flex-initial px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Hub ({listings.filter(l => l.seller.toLowerCase().includes("damika")).length} listings)</span>
          </button>
          <button
            onClick={() => setShowAdminModal(true)}
            className="p-2 text-neutral-400 hover:text-red-700 hover:bg-red-50 border border-neutral-200 rounded-xl transition-colors"
            title="Administrator Safety & Audit Center"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Post Listing / Create Auction Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">Post an Ad or Create Auction</h3>
                <p className="text-xs text-neutral-500">Reach the Sri Lankan community worldwide with direct arrangements</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Type Selector */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mt-4 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPostType("listing")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  postType === "listing"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Classified Ad (Direct Offer)</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType("auction")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  postType === "auction"
                    ? "bg-white text-amber-700 shadow-xs ring-1 ring-amber-300"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Gavel className="w-3.5 h-3.5 text-amber-600" />
                <span>Live Auction (48h Bidding System)</span>
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              {postType === "listing" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Item Title</label>
                    <input 
                      type="text" 
                      value={newAd.title} 
                      onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} 
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                      placeholder="e.g. Toyota RAV4 2018 / Solid Teak Dining Table" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Asking Price (USD)</label>
                      <input 
                        type="text" 
                        value={newAd.price} 
                        onChange={(e) => setNewAd({ ...newAd, price: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="$450" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Pricing Flexibility</label>
                      <select 
                        value={newAd.isNegotiable ? "negotiable" : "fixed"} 
                        onChange={(e) => setNewAd({ ...newAd, isNegotiable: e.target.value === "negotiable" })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                      >
                        <option value="negotiable">Price Negotiable (OBO)</option>
                        <option value="fixed">Fixed Price</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                      <select 
                        value={newAd.cat} 
                        onChange={(e) => setNewAd({ ...newAd, cat: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                      >
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">City / Country</label>
                      <input 
                        type="text" 
                        value={newAd.loc} 
                        onChange={(e) => setNewAd({ ...newAd, loc: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="Los Angeles, USA" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Your Phone / WhatsApp</label>
                      <input 
                        type="tel" 
                        value={newAd.phone} 
                        onChange={(e) => setNewAd({ ...newAd, phone: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="+1 (323) 555-0144" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Your Email</label>
                      <input 
                        type="email" 
                        value={newAd.email} 
                        onChange={(e) => setNewAd({ ...newAd, email: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="damika1316@gmail.com" 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Description & Handover Terms</label>
                    <textarea 
                      rows={3} 
                      value={newAd.desc} 
                      onChange={(e) => setNewAd({ ...newAd, desc: e.target.value })} 
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                      placeholder="Describe condition, specifications, inspection arrangements, or pickup terms..." 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Auction Item Title</label>
                    <input 
                      type="text" 
                      value={newAuctionForm.title} 
                      onChange={(e) => setNewAuctionForm({ ...newAuctionForm, title: e.target.value })} 
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                      placeholder="e.g. Antique Handcarved Wooden Mask / Rare Coin Collection" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Starting Bid ($USD)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newAuctionForm.startingBid} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, startingBid: parseFloat(e.target.value) || 0 })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold" 
                        placeholder="100" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Min. Increment ($USD)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newAuctionForm.minIncrement} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, minIncrement: parseFloat(e.target.value) || 10 })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="15" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Reserve Price (Optional $USD)</label>
                      <input 
                        type="number" 
                        value={newAuctionForm.reservePrice || ""} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, reservePrice: parseFloat(e.target.value) || 0 })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="e.g. 200 (Won't sell below)" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Buy It Now Price (Optional)</label>
                      <input 
                        type="number" 
                        value={newAuctionForm.buyNowPrice || ""} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, buyNowPrice: parseFloat(e.target.value) || 0 })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="e.g. 350" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Auction Duration</label>
                      <select 
                        value={newAuctionForm.durationHours} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, durationHours: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                      >
                        <option value={24}>24 Hours (1 Day)</option>
                        <option value={48}>48 Hours (2 Days)</option>
                        <option value={72}>72 Hours (3 Days)</option>
                        <option value={168}>7 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Condition</label>
                      <select 
                        value={newAuctionForm.condition} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, condition: e.target.value as any })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                      >
                        <option value="Antique / Rare">Antique / Rare</option>
                        <option value="Brand New">Brand New</option>
                        <option value="Restored">Restored</option>
                        <option value="Like New">Like New</option>
                        <option value="Used">Used</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Seller Phone / WhatsApp (For Winner)</label>
                      <input 
                        type="tel" 
                        value={newAuctionForm.sellerPhone} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, sellerPhone: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="+1 (323) 555-0144" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Seller Email Address</label>
                      <input 
                        type="email" 
                        value={newAuctionForm.sellerEmail} 
                        onChange={(e) => setNewAuctionForm({ ...newAuctionForm, sellerEmail: e.target.value })} 
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                        placeholder="damika1316@gmail.com" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Pickup Handover Address / Location</label>
                    <input 
                      type="text" 
                      value={newAuctionForm.pickupAddress} 
                      onChange={(e) => setNewAuctionForm({ ...newAuctionForm, pickupAddress: e.target.value })} 
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                      placeholder="e.g. 10834 Palms Blvd, Los Angeles, CA 90034" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Description & Provenance</label>
                    <textarea 
                      rows={3} 
                      value={newAuctionForm.desc} 
                      onChange={(e) => setNewAuctionForm({ ...newAuctionForm, desc: e.target.value })} 
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                      placeholder="Detail authenticity, history, materials, and pickup/shipping terms..." 
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-sm text-neutral-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm shadow-sm flex items-center gap-1.5">
                  {postType === "listing" ? "Publish Classified" : "Start Live Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Auction Detail & Bidding Modal */}
      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
          onAuctionUpdated={(updated) => {
            setAuctions(getAuctions());
            setSelectedAuction(updated);
          }}
          onShowToast={showToast}
          onOpenGuidelines={() => setShowGuidelinesModal(true)}
        />
      )}

      {/* Classified Listing Detail & Offer Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedListing(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  selectedListing.status === "available" ? "bg-emerald-100 text-emerald-800" :
                  selectedListing.status === "reserved" ? "bg-amber-100 text-amber-800" :
                  selectedListing.status === "sold" ? "bg-neutral-200 text-neutral-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {selectedListing.status || "available"}
                </span>
                <span className="text-xs text-neutral-500 font-medium">{selectedListing.cat}</span>
              </div>
              <button onClick={() => setSelectedListing(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-neutral-100 relative">
                <img src={selectedListing.img} alt={selectedListing.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {selectedListing.isNegotiable ? "Price Negotiable (OBO)" : "Fixed Asking Price"}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-neutral-900">{selectedListing.title}</h3>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-amber-700">{selectedListing.price}</span>
                  <span className="text-xs text-neutral-500">
                    {selectedListing.isNegotiable ? "(Negotiable with seller)" : "(Fixed price)"}
                  </span>
                </div>
              </div>

              {/* Direct Policy Warning */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Direct Arrangement:</strong> Agree on payment and inspection with the seller directly. Platform does not process payments or delivery.
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-700">
                <h4 className="font-bold text-neutral-900">Item Description</h4>
                <p className="leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-xs text-neutral-700">
                  {selectedListing.desc}
                </p>
              </div>

              {/* Make an Offer & Arrange Inspection Section */}
              <form onSubmit={handleMakeClassifiedOfferSubmit} className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>Make an Offer & Propose Handover</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">48h Direct Followup</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Offer Amount ($)"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Proposed Date / Time (e.g. Sat 2pm)"
                      value={offerDate}
                      onChange={(e) => setOfferDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Preferred Handover Spot or Courier Address"
                      value={offerLocation}
                      onChange={(e) => setOfferLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer & Contact Seller</span>
                </button>
              </form>

              {/* Seller Coordinates */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Location</span>
                  <span className="font-bold text-neutral-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {selectedListing.loc}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Seller Name</span>
                  <span className="font-bold text-neutral-800">{selectedListing.seller}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Seller Phone</span>
                  <a href={`tel:${selectedListing.phone}`} className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{selectedListing.phone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Seller Email</span>
                  <a href={`mailto:${selectedListing.email || "seller@lanka.org"}?subject=Inquiry:%20${encodeURIComponent(selectedListing.title)}`} className="font-bold text-neutral-800 hover:text-amber-700 truncate block">
                    {selectedListing.email || "seller@lanka.org"}
                  </a>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => toggleFavorite(selectedListing.id)}
                  className={`p-3 border rounded-xl transition-colors ${
                    favorites.includes(selectedListing.id)
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                  }`}
                  title="Save Item"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(selectedListing.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <a 
                  href={`tel:${selectedListing.phone}`}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" /> Call Seller
                </a>
                <a 
                  href={`https://wa.me/${selectedListing.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selectedListing.seller}, I am interested in your listing "${selectedListing.title}" (${selectedListing.price}) on Lanka Community Hub.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
                <button
                  onClick={handleReportSelectedListing}
                  className="p-3 border border-neutral-200 hover:bg-rose-50 hover:text-rose-600 text-neutral-400 rounded-xl transition-colors"
                  title="Report Suspicious Ad"
                >
                  <ShieldAlert className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Modal */}
      <PlatformGuidelinesModal
        isOpen={showGuidelinesModal}
        onClose={() => setShowGuidelinesModal(false)}
      />

      {/* User Hub Modal */}
      <UserHubModal
        isOpen={showUserHubModal}
        onClose={() => setShowUserHubModal(false)}
        listings={listings}
        auctions={auctions}
        userProfile={userProfile}
        onProfileUpdated={setUserProfile}
        onRefreshData={refreshAllData}
        onShowToast={showToast}
      />

      {/* Admin Safety Modal */}
      <AdminSafetyModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        reports={reports}
        auditLogs={auditLogs}
        auctions={auctions}
        listings={listings}
        onRefreshData={refreshAllData}
        onShowToast={showToast}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium">Classifieds & Auction</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
          <Handshake className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Classifieds & Live Auctions</h1>
          <p className="text-sm text-neutral-500">
            Direct community commerce: Advertise items, place progressive auction bids, and arrange payments & collection directly.
          </p>
        </div>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classified ads or auction items..." 
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div className="flex-1 md:max-w-xs relative">
            <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="City, state, or country" 
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-neutral-700"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => showToast(`Showing results for "${searchQuery || 'all items'}"`)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Search
          </button>
          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap md:ml-4 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Post Ad / Auction
          </button>
        </div>
        
        {/* Trust & Policy Badges */}
        <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-neutral-100 text-[11px] font-medium text-neutral-600">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Direct Buyer-Seller Arrangement</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> 48-Hour Contact Rule</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-neutral-500" /> Phone Confidential to Counterpart Only</span>
          <span className="flex items-center gap-1.5"><Gavel className="w-3.5 h-3.5 text-blue-600" /> 2-Min Anti-Sniping Soft Close</span>
        </div>
      </div>

      {/* Browse Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Browse Categories</h2>
          <button 
            onClick={() => { setSelectedCategory("All"); showToast("Showing all categories"); }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all categories
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {CATEGORIES.map((cat, i) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div 
                key={i} 
                onClick={() => {
                  setSelectedCategory(isSelected ? "All" : cat.name);
                  showToast(isSelected ? "Cleared category filter" : `Filtered by ${cat.name}`);
                }}
                className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500' 
                    : 'bg-white border-neutral-200 hover:border-amber-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 ${cat.bg} ${cat.color} rounded-full flex items-center justify-center mb-2`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xs text-neutral-900 line-clamp-1">{cat.name}</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Auctions Section */}
      <div id="live-auctions" className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-none">Live Community Auctions</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Progressive bidding with reserve protection, 2-minute soft close, and 48-hour mutual contact
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
              {auctions.length} Active Auctions
            </span>
            <button
              onClick={() => {
                setPostType("auction");
                setShowPostModal(true);
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
            >
              + Create Auction
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {auctions.map((auction) => {
            const timeInfo = formatAuctionCountdown(auction.endTime);
            const reserveMet = auction.reservePrice ? auction.currentBid >= auction.reservePrice : true;
            return (
              <div 
                key={auction.id} 
                onClick={() => setSelectedAuction(auction)}
                className="border border-neutral-200 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between hover:border-amber-400 hover:shadow-lg transition-all bg-white cursor-pointer group"
              >
                <div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-neutral-100">
                    <img 
                      src={auction.img} 
                      alt={auction.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1 ${
                      timeInfo.isUnderTwoMinutes ? "bg-red-600 animate-pulse" : "bg-red-600/95"
                    }`}>
                      <Clock className="w-3 h-3 inline" />
                      <span>{timeInfo.formatted}</span>
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                      {auction.condition}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-1 leading-snug">
                      {auction.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{auction.location}</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mb-2">Seller: {auction.seller}</p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 mt-2 space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">Current Bid</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-amber-700">${auction.currentBid}</span>
                        <span className="text-[10px] text-neutral-400">({auction.bidsCount} bids)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {auction.reservePrice && (
                        <span className={`text-[9px] font-bold block ${reserveMet ? 'text-emerald-700' : 'text-amber-800'}`}>
                          {reserveMet ? 'Reserve Met ✓' : 'Reserve Pending'}
                        </span>
                      )}
                      {auction.isUserHighestBidder && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          Leading
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAuction(auction);
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>View & Place Bid</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Listings Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-neutral-100 pb-4 mb-6">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All Listings', 'Available Only', 'Negotiable', 'Live Auctions', 'Recent', 'Popular'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-[17px] ${
                  activeTab === tab ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab === 'Live Auctions' ? (
                  <span className="flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-amber-600" />
                    <span>Live Auctions ({auctions.length})</span>
                  </span>
                ) : tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-neutral-500 font-medium">
              {activeTab === 'Live Auctions' ? `Showing ${auctions.length} auctions` : `Showing ${filteredListings.length} items`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 text-sm">Filters</h3>
              <button 
                onClick={() => {
                  setSelectedLocationFilter("All Locations");
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setLocationQuery("");
                  showToast("Filters reset");
                }} 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Location Filter */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 mb-3">Location</h4>
                <div className="space-y-2.5">
                  {[
                    "All Locations",
                    "Los Angeles, USA",
                    "New York, USA",
                    "Toronto, Canada",
                    "Melbourne, Australia",
                    "Kandy, Sri Lanka",
                    "Colombo, Sri Lanka"
                  ].map((loc) => (
                    <label 
                      key={loc} 
                      onClick={() => setSelectedLocationFilter(loc)}
                      className="flex items-center gap-2 cursor-pointer group text-xs text-neutral-700"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedLocationFilter === loc ? 'border-amber-600' : 'border-neutral-300'}`}>
                        {selectedLocationFilter === loc && <div className="w-2 h-2 bg-amber-600 rounded-full" />}
                      </div>
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Direct Transaction Safety Tips */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs text-neutral-900">Direct Trade Notice</h4>
                </div>
                <ul className="space-y-1.5 text-[11px] text-neutral-600">
                  <li>• Platform does not handle money or shipping</li>
                  <li>• Contact each other within 48 hours</li>
                  <li>• Inspect items in safe public spaces</li>
                  <li>• Settle payment directly upon handover</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-9">
            {activeTab === "Live Auctions" ? (
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-semibold text-neutral-800">
                      Viewing all active community auctions with real-time bidding & 48h settlement rules.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPostType("auction");
                      setShowPostModal(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    + Create Auction
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {auctions.map((auction) => {
                    const timeInfo = formatAuctionCountdown(auction.endTime);
                    const reserveMet = auction.reservePrice ? auction.currentBid >= auction.reservePrice : true;
                    return (
                      <div
                        key={auction.id}
                        onClick={() => setSelectedAuction(auction)}
                        className="bg-white border-2 border-amber-200/80 hover:border-amber-400 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                            <img 
                              src={auction.img} 
                              alt={auction.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {timeInfo.formatted}
                            </span>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                              {auction.condition}
                            </span>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                              {auction.title}
                            </h3>
                            <div className="flex items-baseline justify-between mt-1 mb-2">
                              <span className="text-xl font-black text-amber-700">${auction.currentBid}</span>
                              <span className="text-xs text-neutral-500 font-medium">({auction.bidsCount} bids)</span>
                            </div>
                            {auction.reservePrice && (
                              <span className={`text-[10px] font-bold block mb-1.5 ${reserveMet ? 'text-emerald-700' : 'text-amber-800'}`}>
                                {reserveMet ? 'Reserve Met ✓' : `Reserve: $${auction.reservePrice} (Pending)`}
                              </span>
                            )}
                            <p className="text-xs text-neutral-600 line-clamp-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                              {auction.desc}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAuction(auction);
                            }}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Bid Now (${auction.currentBid + (auction.minIncrement || 10)} min)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                <Search className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <h4 className="font-bold text-neutral-800 text-sm">No listings found</h4>
                <p className="text-xs text-neutral-500 mt-1">Try clearing your filters or changing location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {filteredListings.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedListing(item)}
                    className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img referrerPolicy="no-referrer" src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {item.featured && (
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm ${
                          item.status === "available" ? "bg-emerald-600 text-white" :
                          item.status === "reserved" ? "bg-amber-600 text-white" :
                          item.status === "sold" ? "bg-neutral-800 text-white" : "bg-rose-600 text-white"
                        }`}>
                          {item.status || "available"}
                        </span>
                      </div>

                      <button 
                        onClick={(e) => toggleFavorite(item.id, e)} 
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-white transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {item.isNegotiable && (
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                          Negotiable
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-neutral-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="font-black text-lg text-neutral-900">{item.price}</span>
                        <span className="text-[10px] text-neutral-400">
                          {item.isNegotiable ? "OBO" : "Fixed"}
                        </span>
                      </div>
                      <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" /> {item.loc}
                        </span>
                        <span className="text-amber-700 font-bold group-hover:underline">
                          View Ad &rarr;
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded">{item.cat}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner CTA */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-600">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900">Have something to sell or auction?</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Reach thousands of Sri Lankans around the world. Free classifieds and transparent live auctions.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setPostType("listing");
              setShowPostModal(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm text-sm"
          >
            Post Classified Ad
          </button>
          <button 
            onClick={() => {
              setPostType("auction");
              setShowPostModal(true);
            }}
            className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm text-sm flex items-center gap-1.5"
          >
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>Create Live Auction</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Classifieds;
