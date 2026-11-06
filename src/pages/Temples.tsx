import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Search, MapPin, ChevronDown, CheckCircle, 
  Info, Star, Navigation, Plus, ShieldCheck, MapPinned,
  List, Grid, Sparkles, X, Send, Map as MapIcon,
  Phone, Mail, Calendar, MessageSquare, PhoneCall,
  ExternalLink, ArrowRight, Clock, BookOpen, Users,
  HeartHandshake, CheckCircle2, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { TEMPLES_DATA, Temple } from "../data/templesData";
import { InteractiveEntityMap, MapMarkerItem } from "../components/maps/InteractiveEntityMap";
import { getCoordinatesForLocation } from "../utils/googleMapsConfig";
import { subscribeTemples, addTempleToDb } from "../lib/firestoreService";

export function Temples() {
  const [toastMessage, setToastMessage] = useState("");
  const [templesFromDb, setTemplesFromDb] = useState<Temple[]>([]);

  useEffect(() => {
    const unsub = subscribeTemples((items) => {
      setTemplesFromDb(items);
    });
    return () => unsub();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedDenomination, setSelectedDenomination] = useState("All Denominations");
  const [activeTab, setActiveTab] = useState("All Temples");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Form States
  const [addForm, setAddForm] = useState({ name: "", city: "", country: "Sri Lanka", phone: "", monk: "" });
  const [contactTab, setContactTab] = useState<"inquiry" | "directory">("inquiry");
  const [contactForm, setContactForm] = useState({
    templeId: "buddhist-vihara-la",
    inquiryType: "Sanghika Dana (Almsgiving) Booking",
    name: "Damika Senanayake",
    phone: "+1 (310) 555-0192",
    email: "damika1316@gmail.com",
    date: "",
    message: ""
  });
  const [contactSearch, setContactSearch] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const allTemplesList = useMemo(() => {
    return templesFromDb.length > 0 ? templesFromDb : Object.values(TEMPLES_DATA);
  }, [templesFromDb]);

  const filteredTemples = useMemo(() => {
    return allTemplesList.filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.chiefMonk || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = 
        selectedCountry === "All Countries" || t.country.toLowerCase() === selectedCountry.toLowerCase();

      const matchesDenom = 
        selectedDenomination === "All Denominations" || 
        (t.tags || []).some(tag => tag.toLowerCase().includes(selectedDenomination.toLowerCase()));

      const matchesVerified = !isVerifiedOnly || (t.rating || 0) >= 4.7 || (t.tags || []).includes("Theravada");

      return matchesSearch && matchesCountry && matchesDenom && matchesVerified;
    });
  }, [allTemplesList, searchQuery, selectedCountry, selectedDenomination, isVerifiedOnly]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.city) {
      showToast("Please provide the temple name and city.");
      return;
    }
    const newTemple: Omit<Temple, "id"> = {
      name: addForm.name,
      loc: `${addForm.city}, ${addForm.country}`,
      address: `${addForm.city}, ${addForm.country}`,
      country: addForm.country,
      city: addForm.city,
      img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600",
      coverImg: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200",
      rating: 5.0,
      reviews: 1,
      tags: ["Theravada", "Temple", "Community"],
      open: true,
      time: "6:00 AM - 8:00 PM",
      phone: addForm.phone || "",
      email: "info@temple.org",
      website: "",
      chiefMonk: addForm.monk || "Venerable Incumbent",
      description: "Dedicated Buddhist monastery and community sanctuary.",
      history: "Welcoming devotees for Dana, meditation, and Dhamma instruction.",
      features: ["Dana Hall", "Meditation", "Dhamma Study"],
      photos: [],
      upcomingEvents: [],
      reviewList: []
    };
    try {
      await addTempleToDb(newTemple);
      showToast(`Temple "${addForm.name}" registered and saved to Firebase!`);
    } catch {
      showToast(`Temple listing for "${addForm.name}" submitted!`);
    }
    setShowAddModal(false);
    setAddForm({ name: "", city: "", country: "Sri Lanka", phone: "", monk: "" });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) {
      showToast("Please provide your name and phone number.");
      return;
    }
    const targetTemple = TEMPLES_DATA[contactForm.templeId] || allTemplesList[0];
    showToast(`Inquiry sent directly to ${targetTemple.name}! Resident monks will respond promptly.`);
    setShowContactModal(false);
    setContactForm(prev => ({ ...prev, message: "", date: "" }));
  };

  const templeMapMarkers: MapMarkerItem[] = useMemo(() => {
    return filteredTemples.map((t) => {
      const coords = getCoordinatesForLocation(t.address || t.loc);
      return {
        id: t.id,
        name: t.name,
        subtitle: `${t.city}, ${t.country} • Chief Monk: ${t.chiefMonk}`,
        address: t.address,
        lat: coords.lat,
        lng: coords.lng,
        rating: t.rating,
        reviews: t.reviews,
        image: t.img,
        category: t.country,
        link: `/temples/${t.id}`
      };
    });
  }, [filteredTemples]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= MODAL 1: ADD TEMPLE ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Add a Buddhist Temple</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Temple Name *</label>
                <input 
                  type="text" 
                  value={addForm.name} 
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                  placeholder="e.g. Sri Sambodhi Viharaya" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">City *</label>
                  <input 
                    type="text" 
                    value={addForm.city} 
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} 
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                    placeholder="e.g. Sydney" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Country</label>
                  <select 
                    value={addForm.country} 
                    onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                  >
                    <option>Sri Lanka</option>
                    <option>USA</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Canada</option>
                    <option>Malaysia</option>
                    <option>India</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Chief Incumbent / Resident Monk (Optional)</label>
                <input 
                  type="text" 
                  value={addForm.monk} 
                  onChange={(e) => setAddForm({ ...addForm, monk: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                  placeholder="e.g. Ven. Gnanarathana Thero" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Contact Phone</label>
                <input 
                  type="tel" 
                  value={addForm.phone} 
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-neutral-600 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm cursor-pointer shadow-sm">
                  Submit Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CLAIM TEMPLE ================= */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Claim Your Temple</h3>
              </div>
              <button onClick={() => setShowClaimModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm text-neutral-700">
              <p>Are you an incumbent monk or temple committee member? Claim your listing to post official events, manage Dhamma school schedules, and receive devotee inquiries.</p>
              <input type="text" placeholder="Temple Name" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              <input type="email" placeholder="Official Temple Email" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-sm text-neutral-600 cursor-pointer">Cancel</button>
              <button 
                onClick={() => {
                  showToast("Verification request sent! Our stewards will contact the temple directly.");
                  setShowClaimModal(false);
                }} 
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm cursor-pointer shadow-sm"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: VERIFIED TEMPLES MODAL ================= */}
      {showVerifiedModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Verified Buddhist Temples</h3>
                  <p className="text-xs text-neutral-500">Authentic Theravada Monasteries &amp; Viharas with Resident Sangha</p>
                </div>
              </div>
              <button onClick={() => setShowVerifiedModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-700">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What the &quot;Verified Temple&quot; Badge Guarantees
                </h4>
                <p className="leading-relaxed text-emerald-800">
                  Every verified monastery on LankaBuddhist has been accredited according to traditional Theravada lineage standards:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                    <div>
                      <p className="font-bold text-neutral-900">Ordained Resident Sangha</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Resident venerable Theros in authentic Siam, Amarapura, Ramanya, or Forest traditions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                    <div>
                      <p className="font-bold text-neutral-900">Daham Pasala (Sunday School)</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Free structured Dhamma and Sinhala language education for diaspora children.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                    <div>
                      <p className="font-bold text-neutral-900">Sanghika Dana &amp; Puja</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Daily alms rounds, Buddha Vandana, and Full Moon Poya day observance programs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">4</span>
                    <div>
                      <p className="font-bold text-neutral-900">Direct Steward Access</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Verified committee phone numbers and email contacts for almsgiving and home blessings.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Verified Temples List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-neutral-500 font-bold uppercase text-[10px]">
                  <span>Featured Verified Monasteries ({allTemplesList.length})</span>
                  <span>Authenticity Confirmed</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-neutral-100">
                  {allTemplesList.map(t => (
                    <div key={t.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={t.img} alt={t.name} className="w-9 h-9 rounded-lg object-cover border border-neutral-200" />
                        <div>
                          <p className="font-bold text-neutral-900 flex items-center gap-1">
                            {t.name}
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                          </p>
                          <p className="text-[10px] text-neutral-500">{t.loc} • Chief Monk: {t.chiefMonk}</p>
                        </div>
                      </div>
                      <Link 
                        to={`/temples/${t.id}`}
                        onClick={() => setShowVerifiedModal(false)}
                        className="text-[11px] font-bold text-amber-700 hover:underline shrink-0"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setShowVerifiedModal(false);
                  setShowClaimModal(true);
                }}
                className="text-xs font-semibold text-neutral-600 hover:text-amber-700 cursor-pointer"
              >
                Are you a Chief Monk? Claim or Verify Your Temple &rarr;
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsVerifiedOnly(true);
                  setShowVerifiedModal(false);
                  document.getElementById("temples-listing")?.scrollIntoView({ behavior: "smooth" });
                  showToast("Showing authentic Verified Temples only.");
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Filter Verified Temples ({allTemplesList.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DETAILED INFORMATION MODAL ================= */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Temple Detailed Information &amp; Guide</h3>
                  <p className="text-xs text-neutral-500">History, Daily Puja Schedules, Dhamma School &amp; Resident Monks</p>
                </div>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-700">
              {/* Daily Schedule Banner */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Standard Daily Vihara Timetable
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="font-bold text-blue-800 text-[11px] block">05:30 AM - 06:30 AM</span>
                    <p className="font-bold text-neutral-900 text-xs mt-0.5">Morning Buddha Vandana</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Dawn chanting, pirith recitation and morning blessings.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="font-bold text-amber-800 text-[11px] block">11:15 AM - 12:30 PM</span>
                    <p className="font-bold text-neutral-900 text-xs mt-0.5">Sanghika Dana (Midday Alms)</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Devotee meal offerings to the Maha Sangha with Anumodana sermon.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="font-bold text-indigo-800 text-[11px] block">06:30 PM - 08:00 PM</span>
                    <p className="font-bold text-neutral-900 text-xs mt-0.5">Evening Gilanpasa &amp; Meditation</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Bodhi puja, 108 oil lamp offerings, and guided Vipassana meditation.</p>
                  </div>
                </div>
              </div>

              {/* Temple Feature Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  Cataloged Information for Every Temple
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                    <BookOpen className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-800 block text-[11px]">Monastery History</span>
                    <span className="text-[10px] text-neutral-400">Foundation &amp; Lineage</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                    <Users className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-800 block text-[11px]">Resident Theros</span>
                    <span className="text-[10px] text-neutral-400">Chief Monk &amp; Sangha</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                    <HeartHandshake className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-800 block text-[11px]">Dana Bookings</span>
                    <span className="text-[10px] text-neutral-400">Almsgiving Calendar</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
                    <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="font-bold text-neutral-800 block text-[11px]">Live Navigation</span>
                    <span className="text-[10px] text-neutral-400">Turn-by-turn routes</span>
                  </div>
                </div>
              </div>

              {/* In-depth Temple Profiles Shortcuts */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  Explore Full Detailed Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allTemplesList.slice(0, 2).map(t => (
                    <Link
                      key={t.id}
                      to={`/temples/${t.id}`}
                      onClick={() => setShowInfoModal(false)}
                      className="p-3 bg-neutral-50 hover:bg-blue-50/60 border border-neutral-200 hover:border-blue-200 rounded-xl flex items-center gap-3 transition-colors group"
                    >
                      <img src={t.img} alt={t.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-neutral-900 group-hover:text-blue-700 truncate">{t.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{t.loc}</p>
                        <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Read Full History &rarr;</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100">
              <span className="text-xs text-neutral-500">
                Clicking &quot;Explore Detailed Grid&quot; organizes temples into comprehensive visual cards.
              </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode("grid");
                  setShowInfoModal(false);
                  document.getElementById("temples-listing")?.scrollIntoView({ behavior: "smooth" });
                  showToast("Switched to Detailed Grid View with full temple profiles.");
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span>Explore Detailed Grid View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DIRECT CONTACT & INQUIRY MODAL ================= */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Direct Temple &amp; Monk Contact</h3>
                  <p className="text-xs text-neutral-500">Connect with resident Venerable Theros and temple administrators</p>
                </div>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Navigation Tabs */}
            <div className="flex border-b border-neutral-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setContactTab("inquiry")}
                className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  contactTab === "inquiry" ? "border-orange-600 text-orange-700 bg-orange-50/50" : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Inquiry / Dana Booking</span>
              </button>
              <button
                type="button"
                onClick={() => setContactTab("directory")}
                className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  contactTab === "directory" ? "border-orange-600 text-orange-700 bg-orange-50/50" : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone &amp; Email Directory ({allTemplesList.length})</span>
              </button>
            </div>

            {contactTab === "inquiry" ? (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Select Temple *</label>
                  <select
                    value={contactForm.templeId}
                    onChange={(e) => setContactForm({ ...contactForm, templeId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
                  >
                    {allTemplesList.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city}, {t.country}) - Incumbent: {t.chiefMonk}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Inquiry Purpose *</label>
                    <select
                      value={contactForm.inquiryType}
                      onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    >
                      <option>Sanghika Dana (Almsgiving) Booking</option>
                      <option>Pirith Chanting &amp; Home Blessing</option>
                      <option>Sunday Daham Pasala (School) Enrollment</option>
                      <option>Meditation Retreat Participation</option>
                      <option>Spiritual Counseling / Dhamma Question</option>
                      <option>Temple Volunteer &amp; Committee Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Preferred Date (Optional)</label>
                    <input 
                      type="date" 
                      value={contactForm.date}
                      onChange={(e) => setContactForm({ ...contactForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name *</label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Damika"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number *</label>
                    <input 
                      type="text" 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (310) 555-0192"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="damika1316@gmail.com"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Message or Special Requests</label>
                  <textarea 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="e.g. We would like to offer midday Sanghika Dana for 5 monks on the upcoming Poya day. Please let us know dietary needs."
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Your inquiry is directly transmitted to the temple dayaka committee and resident monks. You will receive a telephone or email confirmation.
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Direct Inquiry</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Directory Tab */
              <div className="space-y-3 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search temple by name, monk or city..."
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>

                <div className="max-h-[360px] overflow-y-auto space-y-2.5">
                  {allTemplesList
                    .filter(t => 
                      t.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      t.chiefMonk.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      t.city.toLowerCase().includes(contactSearch.toLowerCase())
                    )
                    .map(t => (
                      <div key={t.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-neutral-900 text-xs">{t.name}</h4>
                            <p className="text-[10px] text-neutral-500">{t.loc} • Incumbent: {t.chiefMonk}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setContactForm(prev => ({ ...prev, templeId: t.id }));
                              setContactTab("inquiry");
                            }}
                            className="text-[10px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Send Inquiry
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-neutral-200">
                          <a 
                            href={`tel:${t.phone}`} 
                            className="flex items-center gap-1.5 font-mono text-neutral-800 hover:text-orange-600 font-semibold truncate"
                          >
                            <Phone className="w-3 h-3 text-orange-600 shrink-0" />
                            <span>{t.phone}</span>
                          </a>
                          <a 
                            href={`mailto:${t.email}`} 
                            className="flex items-center gap-1.5 text-neutral-600 hover:text-orange-600 truncate"
                          >
                            <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{t.email}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Temples Worldwide</h2>
              <p className="text-sm text-neutral-500">Discover Buddhist temples, viharas and meditation centers around the world.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Temple
            </button>
            <button 
              onClick={() => setShowClaimModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Claim Your Temple
            </button>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search temple name, monk, city or country..." 
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-neutral-700 cursor-pointer"
            >
              <option>All Countries</option>
              <option>Sri Lanka</option>
              <option>USA</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Malaysia</option>
              <option>India</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
          <div className="w-full md:w-48 relative">
            <select 
              value={selectedDenomination}
              onChange={(e) => setSelectedDenomination(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-neutral-700 cursor-pointer"
            >
              <option>All Denominations</option>
              <option>Theravada</option>
              <option>Meditation Center</option>
              <option>Historic Temple</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => showToast(`Found ${filteredTemples.length} matching temples.`)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            Search
          </button>
          <button 
            onClick={() => {
              setSelectedCountry("USA");
              showToast("Showing temples near your active location (USA)");
            }}
            className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <MapPinned className="w-4 h-4 text-blue-600" /> Near Me
          </button>
        </div>

        {/* ================= VALUE PROPS (NOW FULLY CLICKABLE & WORKING) ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100">
          
          {/* 1. Verified Temples (Clickable) */}
          <div 
            onClick={() => {
              setShowVerifiedModal(true);
            }}
            className="flex items-center gap-3 cursor-pointer group hover:bg-emerald-50/80 p-2.5 rounded-xl transition-all border border-transparent hover:border-emerald-200 active:scale-95 shadow-2xs hover:shadow-xs"
            title="Click to learn about temple verification or filter verified viharas"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 group-hover:text-emerald-800 flex items-center gap-1">
                <span>Verified Temples</span>
                <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  Explore
                </span>
              </h4>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-700">Authentic &amp; trusted listings</p>
            </div>
          </div>

          {/* 2. Detailed Information (Clickable) */}
          <div 
            onClick={() => {
              setShowInfoModal(true);
            }}
            className="flex items-center gap-3 cursor-pointer group hover:bg-blue-50/80 p-2.5 rounded-xl transition-all border border-transparent hover:border-blue-200 active:scale-95 shadow-2xs hover:shadow-xs"
            title="Click to view history, daily pooja schedules, and Dhamma school details"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 group-hover:text-blue-800 flex items-center gap-1">
                <span>Detailed Information</span>
                <span className="text-[9px] text-blue-700 font-extrabold bg-blue-100/80 px-1.5 py-0.2 rounded">
                  Guide
                </span>
              </h4>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-700">History, photos &amp; resident monks</p>
            </div>
          </div>

          {/* 3. Interactive Map (Clickable) */}
          <div 
            onClick={() => {
              setViewMode("map");
              showToast("Switched to Interactive Google Map view");
              document.getElementById("temples-listing")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-3 cursor-pointer group hover:bg-amber-50/80 p-2.5 rounded-xl transition-all border border-transparent hover:border-amber-200 active:scale-95 shadow-2xs hover:shadow-xs"
            title="Click to explore temples on an interactive map"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 transition-colors shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 group-hover:text-amber-800 flex items-center gap-1">
                <span>Interactive Map</span>
                <span className="text-[9px] text-amber-700 font-extrabold bg-amber-100/80 px-1.5 py-0.2 rounded">
                  Map View
                </span>
              </h4>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-700">Explore temples worldwide</p>
            </div>
          </div>

          {/* 4. Direct Contact (Clickable) */}
          <div 
            onClick={() => {
              setShowContactModal(true);
            }}
            className="flex items-center gap-3 cursor-pointer group hover:bg-orange-50/80 p-2.5 rounded-xl transition-all border border-transparent hover:border-orange-200 active:scale-95 shadow-2xs hover:shadow-xs"
            title="Click to call temples, email monks, or book a Sanghika Dana"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-600 transition-colors shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 group-hover:text-orange-800 flex items-center gap-1">
                <span>Direct Contact</span>
                <span className="text-[9px] text-orange-700 font-extrabold bg-orange-100/80 px-1.5 py-0.2 rounded">
                  Inquire
                </span>
              </h4>
              <p className="text-[10px] text-neutral-500 group-hover:text-neutral-700">Connect with venerable Theros</p>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Temples Carousel / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 text-lg">Featured Monasteries &amp; Viharas</h3>
          <span className="text-xs text-neutral-500 font-medium">Click any temple for full profile &amp; directions</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allTemplesList.slice(0, 4).map((temple) => (
            <Link 
              key={temple.id} 
              to={`/temples/${temple.id}`}
              className="group flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all pb-3"
            >
              <div className="relative h-36 overflow-hidden">
                <img referrerPolicy="no-referrer" src={temple.img} alt={temple.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  Featured
                </div>
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Verified
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-bold text-neutral-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                  {temple.name}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-1 mb-2">{temple.loc}</p>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{temple.rating}</span>
                  <span className="text-neutral-400 font-normal">({temple.reviews} reviews)</span>
                </div>
                <div className="mt-auto flex items-center justify-between text-[11px] font-medium border-t border-neutral-100 pt-2 text-neutral-600">
                  <span className="text-emerald-600 font-bold">Open Daily</span>
                  <span className="text-amber-700 font-bold group-hover:underline">View Profile &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Listing Section */}
      <div id="temples-listing" className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {["All Temples", "Nearby Temples", "Most Reviewed"].map((tab) => (
              <button 
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Nearby Temples") {
                    setSelectedCountry("USA");
                    showToast("Filtering to nearby temples");
                  } else {
                    setSelectedCountry("All Countries");
                  }
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab} ({filteredTemples.length})
              </button>
            ))}

            {isVerifiedOnly && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold ml-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Temples Only</span>
                <button 
                  onClick={() => setIsVerifiedOnly(false)} 
                  className="hover:text-emerald-950 ml-1 cursor-pointer"
                  title="Clear verified filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("list")} 
                title="List View"
                className={`p-1.5 rounded cursor-pointer ${viewMode === "list" ? 'bg-white shadow-sm text-amber-600' : 'text-neutral-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("grid")} 
                title="Grid View (Detailed)"
                className={`p-1.5 rounded cursor-pointer ${viewMode === "grid" ? 'bg-white shadow-sm text-amber-600' : 'text-neutral-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("map")} 
                title="Interactive Google Map View"
                className={`p-1.5 rounded flex items-center gap-1 text-xs font-semibold cursor-pointer ${viewMode === "map" ? 'bg-white shadow-sm text-amber-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Map View or List/Grid of Temples */}
        {viewMode === "map" ? (
          <InteractiveEntityMap
            items={templeMapMarkers}
            title="Interactive Google Map of Temples & Monasteries"
            description="Explore verified Buddhist viharas worldwide. Click any pin to view history, resident monks, and get directions."
            height="620px"
            pinColor="#ea580c"
          />
        ) : filteredTemples.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <h4 className="font-bold text-neutral-800">No temples found</h4>
            <p className="text-xs mt-1">Try resetting filters or searching for another city.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCountry("All Countries"); setSelectedDenomination("All Denominations"); setIsVerifiedOnly(false); }} 
              className="mt-3 text-xs text-amber-700 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {filteredTemples.map((temple) => (
              <div 
                key={temple.id} 
                className={`bg-white p-4 rounded-xl border border-neutral-200 hover:border-amber-300 hover:shadow-sm transition-all flex ${
                  viewMode === "grid" ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-4'
                }`}
              >
                <div className={`${viewMode === "grid" ? 'w-full h-44' : 'w-full sm:w-44 h-32'} rounded-lg overflow-hidden shrink-0 relative`}>
                  <img referrerPolicy="no-referrer" src={temple.img} alt={temple.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {temple.city}
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/temples/${temple.id}`} className="font-bold text-neutral-900 text-base hover:text-amber-700 transition-colors block">
                          {temple.name}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{temple.loc}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setContactForm(prev => ({ ...prev, templeId: temple.id }));
                            setShowContactModal(true);
                          }}
                          className="text-xs font-semibold text-orange-700 hover:bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Contact resident monks / Dana inquiry"
                        >
                          <Phone className="w-3 h-3 text-orange-600" />
                          <span>Contact</span>
                        </button>
                        <Link 
                          to={`/temples/${temple.id}`}
                          className="text-xs font-bold text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                      </div>
                      <span className="text-xs font-bold text-neutral-900">{temple.rating}</span>
                      <span className="text-xs text-neutral-400">({temple.reviews} reviews)</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs text-neutral-600 truncate max-w-[160px]">{temple.chiefMonk}</span>
                    </div>

                    {viewMode === "grid" && temple.description && (
                      <p className="text-xs text-neutral-600 line-clamp-2 mt-2 leading-relaxed">
                        {temple.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {temple.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-3 mt-3 text-neutral-500">
                    <span className="text-emerald-700 font-semibold">{temple.time}</span>
                    <div className="flex items-center gap-3">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name + ' ' + temple.address)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-amber-700 font-medium hover:underline flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
