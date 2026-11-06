import React, { useState, useMemo } from "react";
import { 
  User, MapPin, Building2, Video, Calendar, Search, 
  Heart, Users, Grid, List, Globe, BookOpen, 
  ShieldCheck, Mail, Star, PlayCircle, X, Sparkles,
  Phone, CheckCircle2, ChevronRight, Map as MapIcon, Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { MONKS_DATA, Monk } from "../data/monksData";
import { InviteMonkModal } from "../components/monks/InviteMonkModal";
import { MonkProgramsModal } from "../components/monks/MonkProgramsModal";
import { InteractiveEntityMap, MapMarkerItem } from "../components/maps/InteractiveEntityMap";
import { getCoordinatesForLocation } from "../utils/googleMapsConfig";
import { subscribeMonks, addMonkToDb } from "../lib/firestoreService";

export { MONKS_DATA as MONKS };

export function Monks() {
  const [activeTab, setActiveTab] = useState("All Monks");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [likedMonkIds, setLikedMonkIds] = useState<number[]>([]);
  const [monksFromDb, setMonksFromDb] = useState<Monk[]>([]);

  React.useEffect(() => {
    const unsub = subscribeMonks((items) => {
      setMonksFromDb(items);
    });
    return () => unsub();
  }, []);
  
  // Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTargetMonk, setInviteTargetMonk] = useState<Monk | null>(null);
  const [isProgramsModalOpen, setIsProgramsModalOpen] = useState(false);
  const [selectedMonkForPrograms, setSelectedMonkForPrograms] = useState<Monk | null>(null);
  const [isAddMonkModalOpen, setIsAddMonkModalOpen] = useState(false);
  const [isSubmittingMonk, setIsSubmittingMonk] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newMonkForm, setNewMonkForm] = useState({
    name: "",
    monasticTitle: "Ven. Thero",
    temple: "",
    city: "",
    country: "Sri Lanka",
    tradition: "Theravada",
    languages: "Sinhala, English",
    tags: "Dhamma Talk, Meditation, Sutta Study",
    ordinationYear: new Date().getFullYear() - 10,
    phone: "",
    email: "",
    bio: "",
    img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600"
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenInvite = (monk?: Monk) => {
    setInviteTargetMonk(monk || null);
    setIsInviteModalOpen(true);
  };

  const handleOpenPrograms = (monk: Monk) => {
    setSelectedMonkForPrograms(monk);
    setIsProgramsModalOpen(true);
  };

  const handleAddMonkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonkForm.name.trim() || !newMonkForm.temple.trim()) {
      showToast("Please enter the monk's name and temple.");
      return;
    }
    setIsSubmittingMonk(true);
    try {
      const monkObj: Monk = {
        id: `monk-${Date.now()}` as any,
        name: newMonkForm.name.trim(),
        monasticTitle: newMonkForm.monasticTitle || "Ven. Thero",
        temple: newMonkForm.temple.trim(),
        loc: `${newMonkForm.city ? newMonkForm.city + ", " : ""}${newMonkForm.country}`,
        city: newMonkForm.city.trim() || "Colombo",
        country: newMonkForm.country.trim(),
        tradition: newMonkForm.tradition || "Theravada",
        languages: newMonkForm.languages.split(',').map(s => s.trim()).filter(Boolean),
        tags: newMonkForm.tags.split(',').map(s => s.trim()).filter(Boolean),
        ordinationYear: Number(newMonkForm.ordinationYear) || 2012,
        rating: 5.0,
        reviewsCount: 1,
        programs: 1,
        videos: 1,
        verified: true,
        availableForPrograms: true,
        dhammaSchoolTeacher: true,
        onlineTeacher: true,
        phone: newMonkForm.phone.trim(),
        mobile: newMonkForm.phone.trim(),
        email: newMonkForm.email.trim(),
        website: "",
        bio: newMonkForm.bio.trim() || `Venerable ${newMonkForm.name} resides at ${newMonkForm.temple}.`,
        aboutMe: [newMonkForm.bio.trim() || "Dedicated to sharing Dhamma teachings, meditation, and community guidance."],
        img: newMonkForm.img.trim() || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
        banaPrograms: [],
        videoList: [],
        reviews: []
      };
      await addMonkToDb(monkObj);
      showToast(`Sadhu! ${newMonkForm.name} was successfully registered.`);
      setIsAddMonkModalOpen(false);
      setNewMonkForm({
        name: "",
        monasticTitle: "Ven. Thero",
        temple: "",
        city: "",
        country: "Sri Lanka",
        tradition: "Theravada",
        languages: "Sinhala, English",
        tags: "Dhamma Talk, Meditation, Sutta Study",
        ordinationYear: new Date().getFullYear() - 10,
        phone: "",
        email: "",
        bio: "",
        img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600"
      });
    } catch (err) {
      console.error("Failed to add monk to database:", err);
      showToast("Error saving monk profile to database.");
    } finally {
      setIsSubmittingMonk(false);
    }
  };


  const toggleFavorite = (id: number, name: string) => {
    if (likedMonkIds.includes(id)) {
      setLikedMonkIds(likedMonkIds.filter(i => i !== id));
      showToast(`Removed ${name} from your bookmarked spiritual mentors.`);
    } else {
      setLikedMonkIds([...likedMonkIds, id]);
      showToast(`Added ${name} to your spiritual bookmarks.`);
    }
  };

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("All Countries");
    setSelectedLanguage("All Languages");
    setSelectedSpecializations([]);
    setActiveTab("All Monks");
    showToast("Filters reset to default.");
  };

  const monksSource = monksFromDb;

  const totalMonks = monksSource.length;
  const totalCountries = useMemo(() => new Set(monksSource.map(m => m.country).filter(Boolean)).size, [monksSource]);
  const totalTemples = useMemo(() => new Set(monksSource.map(m => m.temple).filter(Boolean)).size, [monksSource]);
  const totalVideos = useMemo(() => monksSource.reduce((acc, m) => acc + (m.videos || (m.videoList ? m.videoList.length : 0)), 0), [monksSource]);
  const totalPrograms = useMemo(() => monksSource.reduce((acc, m) => acc + (m.programs || (m.banaPrograms ? m.banaPrograms.length : 0)), 0), [monksSource]);

  const filteredMonks = useMemo(() => {
    return monksSource.filter((monk) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        monk.name.toLowerCase().includes(q) ||
        monk.temple.toLowerCase().includes(q) ||
        monk.loc.toLowerCase().includes(q) ||
        monk.tags.some(t => t.toLowerCase().includes(q));

      const matchesCountry =
        selectedCountry === "All Countries" ||
        monk.country.toLowerCase() === selectedCountry.toLowerCase() ||
        monk.loc.toLowerCase().includes(selectedCountry.toLowerCase());

      const matchesLanguage =
        selectedLanguage === "All Languages" ||
        monk.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());

      const matchesSpecs =
        selectedSpecializations.length === 0 ||
        selectedSpecializations.some(spec => monk.tags.includes(spec));

      const matchesTab =
        activeTab === "All Monks" ||
        (activeTab === "Available for Programs" && monk.availableForPrograms) ||
        (activeTab === "Dhamma School Teachers" && monk.dhammaSchoolTeacher) ||
        (activeTab === "Online Teachers" && monk.onlineTeacher);

      return matchesSearch && matchesCountry && matchesLanguage && matchesSpecs && matchesTab;
    }).sort((a, b) => {
      if (sortBy === "Highest Rated") return b.rating - a.rating;
      if (sortBy === "Most Programs") return b.programs - a.programs;
      if (sortBy === "Ordination Year") return a.ordinationYear - b.ordinationYear;
      return 0;
    });
  }, [monksSource, searchQuery, selectedCountry, selectedLanguage, selectedSpecializations, activeTab, sortBy]);

  const monkMapMarkers: MapMarkerItem[] = useMemo(() => {
    return filteredMonks.map((m) => {
      const coords = getCoordinatesForLocation(m.loc || m.temple);
      return {
        id: m.id,
        name: m.name,
        subtitle: `${m.temple} • ${m.loc} • ${m.programs} Programs`,
        address: `${m.temple}, ${m.loc}`,
        lat: coords.lat,
        lng: coords.lng,
        rating: m.rating,
        reviews: m.reviewsCount || 52,
        image: m.img,
        category: m.country,
        link: `/monks/${m.id}`
      };
    });
  }, [filteredMonks]);

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invite Modal */}
      <InviteMonkModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        selectedMonk={inviteTargetMonk}
        monks={monksSource}
        onSuccess={(details) => {
          showToast(`Invitation sent for ${details.monkName}! Reference logged.`);
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-200 shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">Monks Register</h1>
            <p className="text-neutral-500">
              Find venerable monks around the world and invite them for bana programs, Katina, and Dhamma school.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsAddMonkModalOpen(true)}
            className="bg-neutral-900 hover:bg-black active:scale-95 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Register Monk Profile
          </button>
          <button 
            onClick={() => handleOpenInvite()}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md whitespace-nowrap"
          >
            <Calendar className="w-5 h-5" />
            Invite Monk for Bana Program
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-2xl text-neutral-900 leading-none">{totalMonks}</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">Registered Monks</div>
            <div className="text-[10px] text-neutral-500">In Database</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-2xl text-neutral-900 leading-none">{totalCountries}</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">Countries</div>
            <div className="text-[10px] text-neutral-500">Around the World</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-2xl text-neutral-900 leading-none">{totalTemples}</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">Temples</div>
            <div className="text-[10px] text-neutral-500">Represented</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-2xl text-neutral-900 leading-none">{totalVideos}</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">Videos & Teachings</div>
            <div className="text-[10px] text-neutral-500">Shared</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-2xl text-neutral-900 leading-none">{totalPrograms}</div>
            <div className="text-xs font-bold text-neutral-700 mt-1">Bana Programs</div>
            <div className="text-[10px] text-neutral-500">Scheduled</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-base">Filters</h2>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Search Monk
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, temple, city or tag..." 
                  className="w-full pl-3 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
                />
                <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Country
              </label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>All Countries</option>
                <option>Sri Lanka</option>
                <option>USA</option>
                <option>Australia</option>
                <option>Canada</option>
                <option>UK</option>
                <option>Singapore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Specialization
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {["Meditation", "Dhamma Sermons", "Dhamma School", "Pali & Scriptures", "Youth Programs", "Counseling"].map(spec => (
                  <label key={spec} className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <input 
                      type="checkbox" 
                      checked={selectedSpecializations.includes(spec)}
                      onChange={() => toggleSpecialization(spec)}
                      className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 cursor-pointer" 
                    />
                    <span className="text-xs text-neutral-700 group-hover:text-orange-600 font-medium transition-colors">
                      {spec}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Language
              </label>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>All Languages</option>
                <option>Sinhala</option>
                <option>English</option>
                <option>Pali</option>
              </select>
            </div>

            <button 
              onClick={() => showToast(`Filters applied: showing ${filteredMonks.length} monks.`)}
              className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
            >
              Apply Active Filters ({filteredMonks.length})
            </button>
          </div>

          {/* Quick Invite Box */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/80 p-5 flex flex-col items-center text-center shadow-xs">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-purple-950 text-base mb-1">Invite a Monk</h3>
            <p className="text-xs text-purple-800 mb-4">
              Need a venerable monk for a family alms giving, house blessing, or temple ceremony?
            </p>
            <button 
              onClick={() => handleOpenInvite()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors w-full justify-center shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Send Direct Invitation
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 pb-2">
            <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {[
                "All Monks", 
                "Available for Programs", 
                "Dhamma School Teachers", 
                "Online Teachers"
              ].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-orange-600 text-neutral-900' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="font-bold text-neutral-900 bg-transparent outline-none cursor-pointer"
                >
                  <option>Most Relevant</option>
                  <option>Highest Rated</option>
                  <option>Most Programs</option>
                  <option>Ordination Year</option>
                </select>
              </div>

              <div className="flex items-center gap-1 border border-neutral-200 rounded-xl p-1 bg-white">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-400 hover:text-neutral-600'}`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-400 hover:text-neutral-600'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('map')} 
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${viewMode === 'map' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-neutral-400 hover:text-neutral-600'}`}
                  title="Interactive Map view"
                >
                  <MapIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === "map" ? (
            <InteractiveEntityMap
              items={monkMapMarkers}
              title="Global Buddhist Monks & Monasteries Map"
              description="Explore residing monasteries of venerable Theros worldwide. Click any pin to view programs, contact info, or get directions."
              height="620px"
              pinColor="#c2410c"
            />
          ) : filteredMonks.length === 0 ? (
            monksSource.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
                <User className="w-14 h-14 text-neutral-300 mx-auto" />
                <h3 className="font-bold text-neutral-800 text-xl">No monks registered yet in database</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Connect Buddhist teachers and monastics worldwide. Register venerable monks to list their temple, Dhamma programs, and contact channels.
                </p>
                <button 
                  onClick={() => setIsAddMonkModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Register First Monk Profile
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
                <User className="w-12 h-12 text-neutral-300 mx-auto" />
                <h3 className="font-bold text-neutral-800 text-lg">No monks match your filter</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try clearing some tags or resetting your search to discover all registered monks.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            )
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMonks.map((monk) => (
                <div 
                  key={monk.id} 
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-neutral-100">
                    <img 
                      src={monk.img} 
                      alt={monk.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {monk.verified && (
                      <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" /> Verified Monk
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(monk.id, monk.name);
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        likedMonkIds.includes(monk.id) 
                          ? "bg-rose-500 text-white" 
                          : "bg-white/90 backdrop-blur-xs text-neutral-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <Link 
                      to={`/monks/${monk.id}`} 
                      className="font-bold text-neutral-900 mb-1 hover:text-orange-600 transition-colors text-base"
                    >
                      {monk.name}
                    </Link>
                    <p className="text-xs text-neutral-600 font-medium mb-0.5">{monk.temple}</p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3 text-rose-500" /> {monk.loc}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      {monk.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            i === 0 
                              ? 'bg-orange-50 text-orange-700 border-orange-100' 
                              : 'bg-neutral-50 text-neutral-600 border-neutral-100'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-3">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {monk.rating}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenPrograms(monk);
                        }}
                        className="flex items-center gap-1 text-orange-600 font-semibold hover:underline"
                        title="Click to view programs & schedule"
                      >
                        <Calendar className="w-3.5 h-3.5 text-orange-600" /> {monk.programs} Programs
                      </button>
                      <div className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-neutral-400" /> {monk.videos}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-50">
                      <Link
                        to={`/monks/${monk.id}`}
                        className="py-2 text-center text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleOpenPrograms(monk)}
                        className="py-2 text-center text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200"
                      >
                        Programs
                      </button>
                      <button
                        onClick={() => handleOpenInvite(monk)}
                        className="py-2 text-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMonks.map((monk) => (
                <div 
                  key={monk.id} 
                  className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-orange-300 transition-all hover:shadow-sm"
                >
                  <img 
                    src={monk.img} 
                    alt={monk.name} 
                    className="w-20 h-20 rounded-xl object-cover shrink-0" 
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <Link to={`/monks/${monk.id}`} className="font-bold text-neutral-900 hover:text-orange-600 text-base">
                        {monk.name}
                      </Link>
                      {monk.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600">{monk.temple} • {monk.loc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                      {monk.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-50 text-neutral-600 border border-neutral-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <Link 
                      to={`/monks/${monk.id}`}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-center"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleOpenPrograms(monk)}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-center"
                    >
                      Programs & Map
                    </button>
                    <button 
                      onClick={() => handleOpenInvite(monk)}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Promo Banner */}
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-xs shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-950 mb-0.5">
                  Looking for a monk for your event or Dhamma school?
                </h3>
                <p className="text-xs text-orange-800">
                  Invite monks for bana programs, special occasions, Dhamma school, or online teachings worldwide.
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenInvite()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap transition-all shadow-md active:scale-95"
            >
              Invite Monk Now
            </button>
          </div>

          {/* Recently Added Monks */}
          {monksSource.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-900 text-base">Recently Active Monks</h3>
                <button 
                  onClick={() => showToast("Showing all registered monks.")}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {monksSource.slice(0, 5).map((rm) => (
                  <Link 
                    key={rm.id} 
                    to={`/monks/${rm.id}`}
                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <img 
                      src={rm.img || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=300"} 
                      alt={rm.name} 
                      className="w-11 h-11 rounded-full border border-neutral-200 object-cover group-hover:border-orange-400 transition-colors shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 group-hover:text-orange-600 transition-colors truncate">
                        {rm.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">{rm.loc || rm.temple}</div>
                      <div className="text-[9px] text-orange-600 font-semibold mt-0.5">Active Monk</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 pb-2 border-t border-neutral-200">
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 mb-1">Verified Monks</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">All monks are verified for authentic ordination</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 mb-1">Easy Invitation</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">Invite monks for events and bana programs</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 mb-1">Global Community</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">Connect with monks worldwide</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 mb-1">Dhamma Resources</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">Access teachings, audio and video sermons</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 mb-1">Community Driven</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">Maintained by devotees across the globe</p>
        </div>
      </div>

      {/* Monk Programs & Map Modal */}
      <MonkProgramsModal
        isOpen={isProgramsModalOpen}
        onClose={() => setIsProgramsModalOpen(false)}
        monk={selectedMonkForPrograms}
        onInvite={handleOpenInvite}
      />

      {/* Register Monk Modal */}
      {isAddMonkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddMonkModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Register Venerable Monk</h3>
                <p className="text-xs text-neutral-500">Add a spiritual teacher or thero to the global directory</p>
              </div>
            </div>

            <form onSubmit={handleAddMonkSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Monastic Title</label>
                  <select
                    value={newMonkForm.monasticTitle}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, monasticTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  >
                    <option>Ven. Thero</option>
                    <option>Ven. Maha Thero</option>
                    <option>Most Ven.</option>
                    <option>Ven. Dr.</option>
                    <option>Ajahn</option>
                    <option>Bhante</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Monk Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kiribathgoda Gnanananda Thero"
                    value={newMonkForm.name}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Residing Temple / Hermitage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahamevnawa Buddhist Monastery"
                    value={newMonkForm.temple}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, temple: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Tradition / Nikaya</label>
                  <select
                    value={newMonkForm.tradition}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, tradition: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  >
                    <option>Theravada</option>
                    <option>Siam Nikaya (Malwatta / Asgiriya)</option>
                    <option>Amarapura Nikaya</option>
                    <option>Ramanna Nikaya</option>
                    <option>Forest Tradition (Aranya Senasanaya)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Polgahawela"
                    value={newMonkForm.city}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Lanka"
                    value={newMonkForm.country}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, country: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Ordination Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 1998"
                    value={newMonkForm.ordinationYear}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, ordinationYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Sinhala, English, Pali"
                    value={newMonkForm.languages}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, languages: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Specializations / Tags</label>
                  <input
                    type="text"
                    placeholder="Meditation, Sutta Study, Katina"
                    value={newMonkForm.tags}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, tags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={newMonkForm.phone}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Email / Temple Office</label>
                  <input
                    type="email"
                    placeholder="temple@example.com"
                    value={newMonkForm.email}
                    onChange={(e) => setNewMonkForm({ ...newMonkForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newMonkForm.img}
                  onChange={(e) => setNewMonkForm({ ...newMonkForm, img: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Biography & Dhamma Guidance</label>
                <textarea
                  rows={3}
                  placeholder="Share details about the monk's teachings, monastery history, and spiritual background..."
                  value={newMonkForm.bio}
                  onChange={(e) => setNewMonkForm({ ...newMonkForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddMonkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-xs hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMonk}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmittingMonk ? "Saving to Database..." : "Register Monk Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

