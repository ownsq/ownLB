import { 
  Search, Filter, Plane, Calendar, MapPin, MessageSquare, X, Plus, 
  Sparkles, Send, DollarSign, Tag, Users, CheckCircle, ShieldCheck, 
  Clock, Lock, Check, UserCheck, Compass, Trash2, Loader2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeTravelPlans, 
  addTravelPlanToDb, 
  updateTravelPlanInDb, 
  deleteTravelPlanFromDb 
} from '../../lib/firestoreService';

export interface JoinRequest {
  id: string;
  applicantName: string;
  applicantAvatar: string;
  applicantLoc: string;
  message: string;
  contactPhone: string;
  datesAlignment: string;
  status: "pending" | "approved" | "declined";
  submittedAt: string;
}

export interface ApprovedCompanion {
  name: string;
  avatar: string;
  loc: string;
  phone?: string;
  role: string;
}

export interface TravelPlan {
  id: string;
  name: string;
  authorId?: string;
  loc: string;
  img: string;
  destination: string;
  dates: string;
  budget: string;
  interests: string[];
  desc: string;
  isOwner?: boolean;
  joinRequests: JoinRequest[];
  approvedCompanions: ApprovedCompanion[];
  coordinationNotes?: string[];
  createdAt?: string;
}

const AVAILABLE_INTERESTS = [
  "All Interests",
  "Monasteries & Meditation",
  "Ancient Cities",
  "Cab Sharing",
  "Scenic Trains",
  "Hiking & Nature",
  "Beach & Coastal",
  "Vegetarian Food",
  "Photography"
];

export function TravelView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("All Interests");
  const [toastMessage, setToastMessage] = useState("");

  // Post Trip Modal State
  const [isPostTripModalOpen, setIsPostTripModalOpen] = useState(false);
  const [tripForm, setTripForm] = useState({
    destination: "",
    dates: "",
    budget: "$1,000 - $1,800 USD",
    interests: ["Monasteries & Meditation", "Ancient Cities"],
    desc: ""
  });

  // Request to Join Modal State
  const [selectedTripForJoin, setSelectedTripForJoin] = useState<TravelPlan | null>(null);
  const [joinForm, setJoinForm] = useState({
    message: "",
    contactPhone: "",
    datesAlignment: "Flexible with your dates"
  });

  // Private Coordination Room Modal
  const [coordinationTrip, setCoordinationTrip] = useState<TravelPlan | null>(null);
  const [newCoordNote, setNewCoordNote] = useState("");

  // Subscribe to live Firestore travel_plans
  useEffect(() => {
    const unsub = subscribeTravelPlans((livePlans) => {
      setPlans(livePlans);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync coordination trip if plans update
  useEffect(() => {
    if (coordinationTrip) {
      const updated = plans.find(p => p.id === coordinationTrip.id);
      if (updated) setCoordinationTrip(updated);
    }
  }, [plans]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handlePostTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.destination.trim()) return;

    const newTrip = {
      name: user?.name || "Community Member",
      authorId: user?.id || "damika-user",
      loc: user?.country || user?.location || "Sri Lanka",
      img: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      destination: tripForm.destination.trim(),
      dates: tripForm.dates.trim() || "Upcoming Season",
      budget: tripForm.budget.trim() || "Flexible",
      interests: tripForm.interests.length > 0 ? tripForm.interests : ["General Travel"],
      desc: tripForm.desc.trim() || "Looking forward to exploring with fellow community members and Dhamma friends.",
      joinRequests: [],
      approvedCompanions: [],
      coordinationNotes: []
    };

    try {
      await addTravelPlanToDb(newTrip);
      setIsPostTripModalOpen(false);
      setTripForm({
        destination: "",
        dates: "",
        budget: "$1,000 - $1,800 USD",
        interests: ["Monasteries & Meditation", "Ancient Cities"],
        desc: ""
      });
      showToast("Your travel buddy notice has been published to Firebase!");
    } catch (err) {
      console.error("Failed to post travel plan:", err);
      showToast("Unable to publish travel plan. Please check permissions.");
    }
  };

  const handleSendJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForJoin) return;

    const newRequest: JoinRequest = {
      id: "req-" + Date.now(),
      applicantName: user?.name || "Community Member",
      applicantAvatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      applicantLoc: user?.country || user?.location || "Sri Lanka",
      message: joinForm.message.trim() || "Hi! I would love to join your travel plan. Please let me know if we can coordinate.",
      contactPhone: joinForm.contactPhone.trim() || user?.phone || "Not specified",
      datesAlignment: joinForm.datesAlignment.trim(),
      status: "pending",
      submittedAt: new Date().toLocaleDateString()
    };

    const currentRequests = selectedTripForJoin.joinRequests || [];
    const updatedRequests = [...currentRequests, newRequest];

    try {
      await updateTravelPlanInDb(selectedTripForJoin.id, { joinRequests: updatedRequests });
      setSelectedTripForJoin(null);
      setJoinForm({
        message: "",
        contactPhone: "",
        datesAlignment: "Flexible with your dates"
      });
      showToast("Request to join trip sent to the organizer!");
    } catch (err) {
      console.error("Failed to submit join request:", err);
      showToast("Unable to send request. Please try again.");
    }
  };

  const handleUpdateRequestStatus = async (tripId: string, requestId: string, newStatus: "approved" | "declined") => {
    const targetPlan = plans.find(p => p.id === tripId);
    if (!targetPlan) return;

    const targetReq = (targetPlan.joinRequests || []).find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedRequests = targetPlan.joinRequests.map(r => 
      r.id === requestId ? { ...r, status: newStatus } : r
    );

    let updatedCompanions = [...(targetPlan.approvedCompanions || [])];
    if (newStatus === "approved" && !updatedCompanions.some(c => c.name === targetReq.applicantName)) {
      updatedCompanions.push({
        name: targetReq.applicantName,
        avatar: targetReq.applicantAvatar,
        loc: targetReq.applicantLoc,
        phone: targetReq.contactPhone,
        role: "Approved Travel Companion"
      });
    }

    try {
      await updateTravelPlanInDb(tripId, {
        joinRequests: updatedRequests,
        approvedCompanions: updatedCompanions
      });
      showToast(newStatus === "approved" ? "Companion approved! Added to your Private Coordination Room." : "Join request declined.");
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update companion status.");
    }
  };

  const handleAddCoordinationNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinationTrip || !newCoordNote.trim()) return;

    const notes = coordinationTrip.coordinationNotes || [];
    const updatedNotes = [...notes, `${user?.name || 'Organizer'}: ${newCoordNote.trim()} (${new Date().toLocaleDateString()})`];

    try {
      await updateTravelPlanInDb(coordinationTrip.id, { coordinationNotes: updatedNotes });
      setNewCoordNote("");
      showToast("Coordination note shared with approved participants!");
    } catch (err) {
      console.error("Failed to save note:", err);
      showToast("Failed to post note.");
    }
  };

  const handleDeletePlan = async (tripId: string) => {
    if (!window.confirm("Are you sure you want to delete this travel buddy notice?")) return;
    try {
      await deleteTravelPlanFromDb(tripId);
      showToast("Travel plan removed.");
    } catch (err) {
      console.error("Failed to delete plan:", err);
      showToast("Failed to delete notice.");
    }
  };

  const filteredPlans = plans.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.destination?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.loc?.toLowerCase().includes(q) ||
      p.desc?.toLowerCase().includes(q) ||
      p.interests?.some(i => i.toLowerCase().includes(q));

    const matchesInterest = selectedInterest === "All Interests" || p.interests?.includes(selectedInterest);

    return matchesSearch && matchesInterest;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-purple-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none">
          <Plane className="w-96 h-96 -mr-16 -mt-16 text-white" />
        </div>
        
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
            <Compass className="w-3.5 h-3.5" /> Sri Lankan Community Travel Buddies
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find Travel Companions & Share Journeys
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
            Planning a pilgrimage to Anuradhapura & Kandy, a trip back home to Sri Lanka, or global Dhamma tours? Connect with trusted community members, split vehicle costs, and explore safely together.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPostTripModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Post Your Travel Notice
            </button>
            <div className="flex items-center gap-2 text-xs text-purple-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Google Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-xl flex items-center shadow-2xs">
          <Search className="w-4 h-4 absolute left-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by destination, interest, or organizer city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none rounded-xl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="pr-3 text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none shadow-2xs cursor-pointer min-w-[160px]"
          >
            {AVAILABLE_INTERESTS.map(interest => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Connecting to Firebase travel notices...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
            <Plane className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="font-bold text-neutral-800">
              {plans.length === 0 ? "No Travel Buddy Notices Posted Yet" : "No travel plans match your search"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {plans.length === 0 
                ? "Planning a pilgrimage, airport cab sharing, or vacation? Be the first to share your travel dates with fellow community members."
                : "Try adjusting your keywords or interest filter to discover other journeys."}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  if (plans.length === 0) {
                    setIsPostTripModalOpen(true);
                  } else {
                    setSearchQuery("");
                    setSelectedInterest("All Interests");
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {plans.length === 0 ? "Post First Travel Notice" : "Clear Filters"}
              </button>
            </div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isUserOwner = plan.authorId === user?.id || (user?.email === 'damika1316@gmail.com') || (user?.name && plan.name === user?.name);
            const hasJoined = (plan.approvedCompanions || []).some(c => c.name === user?.name);
            const hasPendingRequest = (plan.joinRequests || []).some(r => r.applicantName === user?.name && r.status === "pending");

            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs ${
                  isUserOwner ? 'border-purple-300 ring-1 ring-purple-100' : 'border-neutral-200 hover:border-purple-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img 
                      referrerPolicy="no-referrer" 
                      src={plan.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                      alt={plan.name} 
                      className="w-14 h-14 rounded-2xl border-2 border-neutral-100 object-cover shrink-0" 
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 text-base">{plan.name}</h4>
                        {isUserOwner && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Your Trip Notice
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" /> Based in {plan.loc}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
                    {isUserOwner || hasJoined ? (
                      <button
                        onClick={() => setCoordinationTrip(plan)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-200" /> Private Coordination Room
                        {(plan.approvedCompanions || []).length > 0 && (
                          <span className="ml-1 bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                            {(plan.approvedCompanions || []).length + 1}
                          </span>
                        )}
                      </button>
                    ) : hasPendingRequest ? (
                      <span className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Join Request Pending
                      </span>
                    ) : (
                      <button 
                        onClick={() => setSelectedTripForJoin(plan)} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" /> Request to Join Trip
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <Link 
                        to="/directory?view=messages" 
                        className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Message</span>
                      </Link>
                      {isUserOwner && (
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-neutral-50/70 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Destination</span>
                      <span className="font-bold text-neutral-900 flex items-center gap-1 mt-0.5">
                        <Plane className="w-3.5 h-3.5 text-purple-600" /> {plan.destination}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Travel Window</span>
                      <span className="font-semibold text-neutral-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" /> {plan.dates}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estimated Budget</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {plan.budget}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                    {plan.desc}
                  </p>

                  {/* Interests Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(plan.interests || []).map((interest, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Owner's Request Management Panel */}
                {isUserOwner && (plan.joinRequests || []).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        Join Requests ({plan.joinRequests.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {plan.joinRequests.map((req) => (
                        <div 
                          key={req.id} 
                          className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <img 
                              referrerPolicy="no-referrer" 
                              src={req.applicantAvatar} 
                              alt={req.applicantName} 
                              className="w-8 h-8 rounded-full object-cover shrink-0" 
                            />
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <span>{req.applicantName}</span>
                                <span className="text-neutral-400 font-normal">({req.applicantLoc})</span>
                              </div>
                              <p className="text-neutral-600 text-xs mt-0.5">&ldquo;{req.message}&rdquo;</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-600">
                                <span>📅 {req.datesAlignment}</span>
                                <span>📞 {req.contactPhone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {req.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleUpdateRequestStatus(plan.id, req.id, "approved")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(plan.id, req.id, "declined")}
                                  className="px-3 py-1.5 border border-neutral-300 text-neutral-600 hover:bg-neutral-100 rounded-lg text-xs cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            ) : req.status === "approved" ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Approved Companion
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                Declined
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Trip Notice Modal */}
      {isPostTripModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-neutral-900">Publish Travel Plan & Companion Request</h3>
              </div>
              <button onClick={() => setIsPostTripModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostTrip} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Destination & Regions</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Lanka (Kandy, Nuwara Eliya & Galle), Thailand, India"
                  value={tripForm.destination}
                  onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Travel Dates / Window</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 15 - Dec 10, 2026"
                    value={tripForm.dates}
                    onChange={(e) => setTripForm({ ...tripForm, dates: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. $1,200 - $1,800 USD"
                    value={tripForm.budget}
                    onChange={(e) => setTripForm({ ...tripForm, budget: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Interests & Travel Style</label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {[
                    "Monasteries & Meditation", "Ancient Cities", "Cab Sharing", 
                    "Scenic Trains", "Hiking & Nature", "Beach & Coastal", "Vegetarian Food", "Photography"
                  ].map(interest => {
                    const isSelected = tripForm.interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => {
                          const next = isSelected 
                            ? tripForm.interests.filter(i => i !== interest)
                            : [...tripForm.interests, interest];
                          setTripForm({ ...tripForm, interests: next });
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          isSelected 
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Plan Overview & Coordination Requests</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail your itinerary, transport plans (cab sharing, train journeys), room sharing preferences, or sacred temple visits..."
                  value={tripForm.desc}
                  onChange={(e) => setTripForm({ ...tripForm, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  Interested members will submit join requests for your review. Once approved, you can coordinate flight timings, cabs, and private contact info in the Private Coordination Room.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostTripModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Post Travel Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request to Join Trip Modal */}
      {selectedTripForJoin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-neutral-900">Request to Join {selectedTripForJoin.name}&apos;s Trip</h3>
              </div>
              <button onClick={() => setSelectedTripForJoin(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1">
              <p className="font-bold text-neutral-900 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-purple-600" /> {selectedTripForJoin.destination}
              </p>
              <p className="text-neutral-600">📅 {selectedTripForJoin.dates} • 💰 Budget: {selectedTripForJoin.budget}</p>
            </div>

            <form onSubmit={handleSendJoinRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Availability / Dates Alignment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Available for full trip duration, or specific weeks"
                  value={joinForm.datesAlignment}
                  onChange={(e) => setJoinForm({ ...joinForm, datesAlignment: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Contact Phone / WhatsApp (Provided only to organizer)</label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 123 4567 or international number"
                  value={joinForm.contactPhone}
                  onChange={(e) => setJoinForm({ ...joinForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Message to Organizer</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Introduce yourself, mention shared interests (e.g., meditation, cab sharing), and any questions..."
                  value={joinForm.message}
                  onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTripForJoin(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Join Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Private Coordination Room Modal */}
      {coordinationTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Private Travel Coordination Room</h3>
                  <p className="text-[11px] text-neutral-500">{coordinationTrip.destination}</p>
                </div>
              </div>
              <button onClick={() => setCoordinationTrip(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Approved Companions */}
            <div>
              <h4 className="text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Confirmed Travel Group
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Organizer */}
                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs">
                  <img referrerPolicy="no-referrer" src={coordinationTrip.img || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-900 block">{coordinationTrip.name}</span>
                    <span className="text-[10px] text-purple-700 font-semibold">Trip Organizer • {coordinationTrip.loc}</span>
                  </div>
                </div>

                {/* Approved Companions */}
                {(coordinationTrip.approvedCompanions || []).map((comp, idx) => (
                  <div key={idx} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs">
                    <img referrerPolicy="no-referrer" src={comp.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-neutral-900 block truncate">{comp.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                        {comp.loc} {comp.phone && `• ${comp.phone}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Notes & Coordination Log */}
            <div>
              <h4 className="text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" /> Itinerary Updates & Shared Flight Timings
              </h4>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 max-h-48 overflow-y-auto space-y-2 text-xs">
                {(coordinationTrip.coordinationNotes || []).length === 0 ? (
                  <p className="text-neutral-400 italic text-center py-4">
                    No coordination notes posted yet. Post flight arrival times, hotel links, or cab sharing points below.
                  </p>
                ) : (
                  coordinationTrip.coordinationNotes?.map((note, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-neutral-100 text-neutral-800 shadow-2xs">
                      {note}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Coordination Note Form */}
            <form onSubmit={handleAddCoordinationNote} className="space-y-2 pt-1 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-700">Add Shared Note / Cab Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Flight arrival UL 455 landing at 8:40 AM, van reserved for 4 people..."
                  value={newCoordNote}
                  onChange={(e) => setNewCoordNote(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newCoordNote.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
