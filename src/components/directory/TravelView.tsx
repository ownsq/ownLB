import { 
  Search, Filter, Plane, Calendar, MapPin, MessageSquare, X, Plus, 
  Sparkles, Send, DollarSign, Tag, Users, CheckCircle, ShieldCheck, 
  Clock, Lock, Check, UserCheck, Compass
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
}

const DEFAULT_TRAVEL_PLANS: TravelPlan[] = [
  {
    id: "tp-1",
    name: "Sahan Jayasekara",
    loc: "Tokyo, Japan",
    img: "https://i.pravatar.cc/150?u=sahan",
    destination: "Sri Lanka (Kandy, Dambulla & Anuradhapura)",
    dates: "Nov 15 - Dec 10, 2025",
    budget: "$1,200 - $1,800 USD",
    interests: ["Ancient Cities", "Monasteries & Meditation", "Cab Sharing", "Photography"],
    desc: "Looking for someone to share a private cab from BIA Katunayake to Kandy, visit forest hermitages, and do cultural sightseeing together.",
    joinRequests: [],
    approvedCompanions: [
      { name: "Prabath Senaratne", avatar: "https://i.pravatar.cc/150?u=prabath", loc: "Colombo", phone: "+94 77 123 4567", role: "Confirmed Companion" }
    ],
    coordinationNotes: [
      "Airport arrival flight UL 455 landing at 8:40 AM on Nov 15th.",
      "Reserved 7-seater van with AC for airport to Kandy transfer."
    ]
  },
  {
    id: "tp-2",
    name: "Rashmi De Silva",
    loc: "London, UK",
    img: "https://i.pravatar.cc/150?u=rashmi",
    destination: "Europe (Austria, Switzerland & Italy)",
    dates: "Aug 1 - Aug 25, 2025",
    budget: "$2,500 - $3,500 USD",
    interests: ["Scenic Trains", "Hiking & Nature", "Cultural Heritage", "Vegetarian Food"],
    desc: "Planning a summer backpacking and train tour through the Alps and historic Italian cities. Looking for 1-2 friendly Sri Lankan diaspora travel companions.",
    joinRequests: [],
    approvedCompanions: []
  },
  {
    id: "tp-3",
    name: "Saminda Fernando (You)",
    loc: "Los Angeles, USA",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
    destination: "Sri Lanka (Southern Coast & Ruhuna Temples)",
    dates: "Dec 1 - Dec 28, 2025",
    budget: "Flexible ($1,500 - $2,200)",
    interests: ["Beach & Coastal", "Temple Pujas", "Family Visits", "Local Wildlife"],
    desc: "Visiting home for the holidays. Want to organize a group trip down south (Galle, Matara, Yala and Kataragama) and split transport costs.",
    isOwner: true,
    joinRequests: [
      {
        id: "req-1",
        applicantName: "Sewmini Dissanayake",
        applicantAvatar: "https://i.pravatar.cc/150?u=sewmini",
        applicantLoc: "New York, USA",
        message: "Hi Saminda! I will also be in Sri Lanka from Dec 5th to 22nd. Would love to join for the Galle and Kataragama segment! I can share van and hotel booking costs.",
        contactPhone: "+1 (212) 555-8392",
        datesAlignment: "Available Dec 5 - Dec 20",
        status: "pending",
        submittedAt: "Yesterday"
      }
    ],
    approvedCompanions: [
      { name: "Chamika Jayawardena", avatar: "https://i.pravatar.cc/150?u=chamika", loc: "Toronto, Canada", phone: "+1 (416) 555-0143", role: "Confirmed Companion" }
    ],
    coordinationNotes: [
      "Dec 10th: Leaving Colombo Fort early morning via Southern Expressway.",
      "Hotel reserved at Mirissa Beach and Kataragama pilgrim rest."
    ]
  },
  {
    id: "tp-4",
    name: "Sewmini Dissanayake",
    loc: "New York, USA",
    img: "https://i.pravatar.cc/150?u=sewmini",
    destination: "Northern Thailand (Chiang Mai & Forest Monasteries)",
    dates: "Jan 10 - Jan 25, 2026",
    budget: "$900 - $1,400 USD",
    interests: ["Forest Monasteries", "Vipassana Meditation", "Quiet Travel", "Temples"],
    desc: "First time visiting Chiang Mai and Pa Pae Peace Village. Looking for calm, respectful companions interested in meditation retreats and Dhamma discussions.",
    joinRequests: [],
    approvedCompanions: []
  }
];

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
  const [plans, setPlans] = useState<TravelPlan[]>(DEFAULT_TRAVEL_PLANS);
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
    contactPhone: "+1 (310) 555-0198",
    datesAlignment: "Flexible with your dates"
  });

  // Private Coordination Room Modal
  const [coordinationTrip, setCoordinationTrip] = useState<TravelPlan | null>(null);
  const [newCoordNote, setNewCoordNote] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handlePostTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.destination.trim()) return;

    const newTrip: TravelPlan = {
      id: "tp-" + Date.now(),
      name: "Saminda Fernando (You)",
      loc: "Los Angeles, USA",
      img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
      destination: tripForm.destination.trim(),
      dates: tripForm.dates.trim() || "Upcoming Season",
      budget: tripForm.budget.trim() || "Flexible",
      interests: tripForm.interests.length > 0 ? tripForm.interests : ["General Travel"],
      desc: tripForm.desc.trim() || "Looking forward to exploring with fellow community members and Dhamma friends.",
      isOwner: true,
      joinRequests: [],
      approvedCompanions: [],
      coordinationNotes: []
    };

    setPlans([newTrip, ...plans]);
    setIsPostTripModalOpen(false);
    setTripForm({
      destination: "",
      dates: "",
      budget: "$1,000 - $1,800 USD",
      interests: ["Monasteries & Meditation", "Ancient Cities"],
      desc: ""
    });
    showToast("Your travel buddy notice has been published!");
  };

  const handleSendJoinRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForJoin) return;

    const newRequest: JoinRequest = {
      id: "req-" + Date.now(),
      applicantName: "Saminda Fernando",
      applicantAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
      applicantLoc: "Los Angeles, USA",
      message: joinForm.message.trim() || "Hi! I would love to join your travel plan. Please let me know if we can coordinate.",
      contactPhone: joinForm.contactPhone.trim(),
      datesAlignment: joinForm.datesAlignment.trim(),
      status: "pending",
      submittedAt: "Just now"
    };

    setPlans(plans.map(p => {
      if (p.id === selectedTripForJoin.id) {
        return {
          ...p,
          joinRequests: [...p.joinRequests, newRequest]
        };
      }
      return p;
    }));

    setSelectedTripForJoin(null);
    setJoinForm({
      message: "",
      contactPhone: "+1 (310) 555-0198",
      datesAlignment: "Flexible with your dates"
    });
    showToast("Request to join trip sent to the organizer! They will review your details.");
  };

  const handleUpdateRequestStatus = (tripId: string, requestId: string, newStatus: "approved" | "declined") => {
    setPlans(plans.map(plan => {
      if (plan.id !== tripId) return plan;

      const targetReq = plan.joinRequests.find(r => r.id === requestId);
      if (!targetReq) return plan;

      const updatedRequests = plan.joinRequests.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      );

      let updatedCompanions = [...plan.approvedCompanions];
      if (newStatus === "approved" && !updatedCompanions.some(c => c.name === targetReq.applicantName)) {
        updatedCompanions.push({
          name: targetReq.applicantName,
          avatar: targetReq.applicantAvatar,
          loc: targetReq.applicantLoc,
          phone: targetReq.contactPhone,
          role: "Approved Travel Companion"
        });
      }

      return {
        ...plan,
        joinRequests: updatedRequests,
        approvedCompanions: updatedCompanions
      };
    }));

    showToast(newStatus === "approved" ? "Companion approved! Added to your Private Coordination Room." : "Join request declined.");
  };

  const handleAddCoordinationNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinationTrip || !newCoordNote.trim()) return;

    const updatedPlans = plans.map(p => {
      if (p.id === coordinationTrip.id) {
        const notes = p.coordinationNotes || [];
        return { ...p, coordinationNotes: [...notes, newCoordNote.trim()] };
      }
      return p;
    });

    setPlans(updatedPlans);
    setCoordinationTrip(updatedPlans.find(p => p.id === coordinationTrip.id) || null);
    setNewCoordNote("");
    showToast("Coordination note shared with approved participants!");
  };

  const filteredPlans = plans.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.destination.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.loc.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.interests.some(i => i.toLowerCase().includes(q));

    const matchesInterest = selectedInterest === "All Interests" || p.interests.includes(selectedInterest);

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold mb-2">
            <Plane className="w-3.5 h-3.5" /> Travel Buddies & Pilgrimage Coordination
          </div>
          <h2 className="text-xl md:text-2xl font-black">Find Travel Companions & Share Journeys</h2>
          <p className="text-xs text-purple-100 max-w-xl mt-1 leading-relaxed">
            Publish your travel plans with destinations, dates, budgets, and interests. Connect safely, request to join trips, and coordinate arrangements privately with approved companions.
          </p>
        </div>
        <button
          onClick={() => setIsPostTripModalOpen(true)}
          className="bg-white text-purple-900 hover:bg-purple-50 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4 text-purple-700" /> Post Travel Plan
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by destination (e.g. Sri Lanka, Thailand, Europe) or traveler name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
        </div>

        {/* Interests Quick Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 text-[11px] font-bold uppercase shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Interests:
          </span>
          {AVAILABLE_INTERESTS.map((interest) => (
            <button
              key={interest}
              onClick={() => setSelectedInterest(interest)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                selectedInterest === interest
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Travelers & Trips List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
            <Plane className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="font-bold text-neutral-800">No travel plans match your search</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your destination keywords or interest filter, or post your own trip notice to invite fellow companions.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedInterest("All Interests"); }}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-100"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isUserOwner = plan.isOwner;
            const hasJoined = plan.approvedCompanions.some(c => c.name === "Saminda Fernando");
            const hasPendingRequest = plan.joinRequests.some(r => r.applicantName === "Saminda Fernando" && r.status === "pending");

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
                      src={plan.img} 
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
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-200" /> Private Coordination Room
                        {plan.approvedCompanions.length > 0 && (
                          <span className="ml-1 bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                            {plan.approvedCompanions.length + 1}
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
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5" /> Request to Join Trip
                      </button>
                    )}

                    <Link 
                      to="/directory?view=messages" 
                      className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-neutral-500" /> Private Chat
                    </Link>
                  </div>
                </div>

                {/* Trip Details Card */}
                <div className="mt-4 bg-purple-50/60 p-4 rounded-xl border border-purple-100/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-purple-600 font-bold block uppercase">Destination</span>
                        <span className="text-xs font-bold text-neutral-900 truncate block">{plan.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-purple-600 font-bold block uppercase">Travel Dates</span>
                        <span className="text-xs font-bold text-neutral-900 truncate block">{plan.dates}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-700 font-bold block uppercase">Estimated Budget</span>
                        <span className="text-xs font-bold text-neutral-900 truncate block">{plan.budget}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed pt-1 border-t border-purple-100/60">
                    &ldquo;{plan.desc}&rdquo;
                  </p>

                  {/* Interests Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-purple-500 mr-0.5" />
                    {plan.interests.map((interest, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-white text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-md">
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Approved Companions */}
                  {plan.approvedCompanions.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-purple-100/60">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved Companions ({plan.approvedCompanions.length}):
                      </span>
                      <div className="flex items-center -space-x-2">
                        {plan.approvedCompanions.map((comp, ci) => (
                          <img
                            key={ci}
                            src={comp.avatar}
                            alt={comp.name}
                            title={`${comp.name} (${comp.role})`}
                            className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-neutral-600">
                        {plan.approvedCompanions.map(c => c.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Organizer Management Area (if owner has pending join requests) */}
                {isUserOwner && plan.joinRequests.length > 0 && (
                  <div className="mt-4 bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-600" /> Pending Join Requests ({plan.joinRequests.filter(r => r.status === "pending").length})
                      </span>
                      <span className="text-[11px] text-amber-700 font-medium">Review and coordinate privately</span>
                    </div>

                    <div className="space-y-2">
                      {plan.joinRequests.map(req => (
                        <div key={req.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <img src={req.applicantAvatar} alt={req.applicantName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900">{req.applicantName}</span>
                                <span className="text-[10px] text-neutral-500">from {req.applicantLoc}</span>
                                <span className="text-[10px] text-neutral-400">• {req.submittedAt}</span>
                              </div>
                              <p className="text-neutral-700 mt-1 italic">&ldquo;{req.message}&rdquo;</p>
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
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(plan.id, req.id, "declined")}
                                  className="px-3 py-1.5 border border-neutral-300 text-neutral-600 hover:bg-neutral-100 rounded-lg text-xs"
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
                    placeholder="e.g. Nov 15 - Dec 10, 2025"
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
                          if (isSelected) {
                            setTripForm({ ...tripForm, interests: tripForm.interests.filter(i => i !== interest) });
                          } else {
                            setTripForm({ ...tripForm, interests: [...tripForm.interests, interest] });
                          }
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Trip Details & Companion Requirements</label>
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
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
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
                  placeholder="e.g. Available Dec 5 - Dec 20, or full trip duration"
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
                  value={joinForm.contactPhone}
                  onChange={(e) => setJoinForm({ ...joinForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Introduction & Why You&apos;d Like to Join</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share a brief introduction, your travel style, and how you would like to split transport or participate..."
                  value={joinForm.message}
                  onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTripForJoin(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Private Trip Coordination Room Modal */}
      {coordinationTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Private Trip Coordination Room</h3>
                  <p className="text-[11px] text-neutral-500">{coordinationTrip.destination} • {coordinationTrip.dates}</p>
                </div>
              </div>
              <button onClick={() => setCoordinationTrip(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Approved Participants Roster */}
            <div>
              <span className="text-xs font-bold text-neutral-700 mb-2 block uppercase tracking-wider">
                Confirmed Participants ({coordinationTrip.approvedCompanions.length + 1})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Trip Leader */}
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2.5">
                  <img src={coordinationTrip.img} alt={coordinationTrip.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-900 block truncate">{coordinationTrip.name}</span>
                    <span className="text-[10px] text-purple-700 font-semibold">Trip Leader &bull; {coordinationTrip.loc}</span>
                  </div>
                </div>

                {/* Approved Companions */}
                {coordinationTrip.approvedCompanions.map((comp, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                    <img src={comp.avatar} alt={comp.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-neutral-900 block truncate">{comp.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold truncate block">
                        {comp.phone || comp.loc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Coordination Notes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 block uppercase tracking-wider">
                Shared Itinerary & Cab/Transport Notes
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {(!coordinationTrip.coordinationNotes || coordinationTrip.coordinationNotes.length === 0) ? (
                  <p className="text-xs text-neutral-400 italic bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    No notes added yet. Post flight arrival times, cab booking info, or hotel arrangements below.
                  </p>
                ) : (
                  coordinationTrip.coordinationNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 flex items-start gap-2">
                      <span className="font-bold text-emerald-600 mt-0.5">•</span>
                      <span>{note}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddCoordinationNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add flight timing, cab share details, or pilgrim rest note..."
                  value={newCoordNote}
                  onChange={(e) => setNewCoordNote(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <Send className="w-3 h-3" /> Post Note
                </button>
              </form>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCoordinationTrip(null)}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold"
              >
                Close Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
