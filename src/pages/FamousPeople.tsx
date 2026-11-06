import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen, Users, Search, Calendar, MessageSquare,
  MapPin, Star, UserPlus, Music, Video, Building2, UserCheck,
  Award, Heart, List as ListIcon, Grid as GridIcon,
  CheckCircle2, ShieldCheck, Mail, Globe, ArrowRight, Quote, Plus,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FamousPerson, FamousPersonModal } from "../components/famous/FamousPersonModal";
import { AddFamousPersonModal } from "../components/famous/AddFamousPersonModal";
import { subscribeFamousPeople } from "../lib/firestoreService";

const BASE_CATEGORIES = [
  { name: "All", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Musicians", icon: Music, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Actors", icon: Video, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Business", icon: Building2, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Athletes", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Chefs", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
  { name: "Scholars & Authors", icon: BookOpen, color: "text-rose-500", bg: "bg-rose-50" },
];

export function FamousPeople() {
  const [famousPeople, setFamousPeople] = useState<FamousPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Detail Modal State
  const [modalPerson, setModalPerson] = useState<FamousPerson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Personality Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Subscribe to real Firestore collection
  useEffect(() => {
    const unsub = subscribeFamousPeople((items) => {
      setFamousPeople(items as FamousPerson[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute selected person safely
  const selectedPerson = useMemo(() => {
    if (famousPeople.length === 0) return null;
    if (selectedId) {
      const found = famousPeople.find((p) => String(p.id) === String(selectedId));
      if (found) return found;
    }
    return famousPeople[0];
  }, [famousPeople, selectedId]);

  const handleCardClick = (person: FamousPerson) => {
    setSelectedId(person.id);
    setModalPerson(person);
    setIsModalOpen(true);
  };

  const handleOpenModal = (person: FamousPerson | null) => {
    if (!person) {
      setIsAddModalOpen(true);
      return;
    }
    setSelectedId(person.id);
    setModalPerson(person);
    setIsModalOpen(true);
  };

  // Category counts computed dynamically from Firestore data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: famousPeople.length };
    famousPeople.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [famousPeople]);

  const availableCount = useMemo(
    () => famousPeople.filter((p) => p.available).length,
    [famousPeople]
  );
  const topRatedCount = useMemo(
    () => famousPeople.filter((p) => (p.rating || 0) >= 4.8).length,
    [famousPeople]
  );

  // Filtered List based on Search & Category & Active Tab
  const filteredPeople = useMemo(() => {
    return famousPeople.filter((person) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.tags && person.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === "All" ||
        person.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Available" && person.available) ||
        (activeTab === "TopRated" && (person.rating || 0) >= 4.8) ||
        activeTab === "NewlyJoined";

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [famousPeople, searchQuery, selectedCategory, activeTab]);

  // Compute dynamic stats
  const totalFollowersEstimate = useMemo(() => {
    return famousPeople.length * 150;
  }, [famousPeople]);

  const distinctCountries = useMemo(() => {
    const s = new Set(famousPeople.map((p) => p.country).filter(Boolean));
    return s.size || (famousPeople.length > 0 ? 1 : 0);
  }, [famousPeople]);

  return (
    <div className="space-y-6">
      {/* Detail Modal Component */}
      <FamousPersonModal
        person={modalPerson}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenInvite={(person) => {
          setSelectedId(person.id);
        }}
      />

      {/* Add Famous Person Modal */}
      <AddFamousPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newId) => {
          setSelectedId(newId);
        }}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 flex-shrink-0 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-neutral-900">Famous People Directory</h1>
              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Live Database ({famousPeople.length})
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xl">
              Connect with influential Sri Lankan and global luminaries. Click any profile to view full biography, milestones, and engagement options.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Register Notable Person
          </button>
          {selectedPerson && (
            <button
              type="button"
              onClick={() => handleOpenModal(selectedPerson)}
              className="flex-1 md:flex-none bg-white border border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-xs"
            >
              <Calendar className="w-4 h-4" /> Invite for Event
            </button>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {BASE_CATEGORIES.map((cat, i) => {
          const isSelected = selectedCategory === cat.name;
          const count = categoryCounts[cat.name] || 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`rounded-xl p-3 flex items-center gap-3 min-w-[170px] text-left transition-all border ${
                isSelected
                  ? "bg-purple-50/80 border-purple-400 shadow-sm"
                  : "bg-white border-neutral-200 hover:border-purple-200 hover:shadow-xs"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.bg} ${cat.color} shrink-0`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-xs ${isSelected ? "text-purple-900" : "text-neutral-900"}`}>
                  {cat.name}
                </h3>
                <p className="text-[10px] text-neutral-500">{count} {count === 1 ? "Profile" : "Profiles"}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sidebar (Filters) */}
        <div className="xl:col-span-3 space-y-6 hidden lg:block">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">Search & Filters</h2>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                Reset Filters
              </button>
            )}
          </div>
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, genre, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Categories</option>
                <option value="Musicians">Musicians</option>
                <option value="Actors">Actors</option>
                <option value="Athletes">Athletes</option>
                <option value="Business">Business</option>
                <option value="Chefs">Chefs</option>
                <option value="Scholars & Authors">Scholars & Authors</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-900 mb-2.5">Available Engagement Types</h3>
              <div className="space-y-2">
                {[
                  "Live Shows & Concerts",
                  "Motivational Speaking",
                  "Brand Endorsements",
                  "Philanthropy & Sasana Drives"
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
                    />
                    <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 text-xs text-purple-800">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Live Firestore Database
                </div>
                All profiles are loaded directly from the Firebase Firestore database with instant live synchronization.
              </div>
            </div>
          </div>

          {/* Register Notable Card */}
          <div className="bg-white rounded-2xl border border-purple-200 p-6 flex flex-col items-center text-center shadow-xs relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="font-bold text-neutral-900 text-base mb-1.5 relative z-10">Add Notable Profile</h3>
            <p className="text-xs text-neutral-500 mb-5 relative z-10">
              Know an accomplished Sri Lankan artist, scholar, or business icon? Add their official profile to our directory.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-purple-700 text-white hover:bg-purple-800 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm mb-4 relative z-10 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Person Profile
            </button>
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-2 relative z-10 border border-amber-100">
              <Award className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mb-1 relative z-10">
              <Star className="w-3.5 h-3.5 fill-amber-600" /> Verified Coordination
            </div>
            <p className="text-[11px] text-neutral-500 relative z-10">Direct access to verified management teams.</p>
          </div>
        </div>

        {/* Center Main Area: Famous People Cards */}
        <div className="xl:col-span-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {[
                { label: `All People (${famousPeople.length})`, key: "All" },
                { label: `Available for Events (${availableCount})`, key: "Available" },
                { label: `Top Rated (${topRatedCount})`, key: "TopRated" },
                { label: "Newly Joined", key: "NewlyJoined" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-purple-600 text-purple-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded ${viewMode === "grid" ? "bg-purple-50 text-purple-600" : "text-neutral-400 hover:text-neutral-600"}`}
                  title="Grid View"
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded ${viewMode === "list" ? "bg-purple-50 text-purple-600" : "text-neutral-400 hover:text-neutral-600"}`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards List or Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-600">Loading personalities from Firestore...</p>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 mb-1">
                {famousPeople.length === 0 ? "No Personalities in Database Yet" : "No matching personalities found"}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                {famousPeople.length === 0
                  ? "All mock records have been removed. Add Sri Lankan cultural icons, musicians, artists, and scholars to populate the directory."
                  : "We couldn't find anyone matching your filter criteria. Try resetting your search query."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (famousPeople.length === 0) {
                    setIsAddModalOpen(true);
                  } else {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setActiveTab("All");
                  }
                }}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                {famousPeople.length === 0 ? (
                  <>
                    <Plus className="w-4 h-4" /> Register First Personality
                  </>
                ) : (
                  "Show All Personalities"
                )}
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPeople.map((person) => {
                const isSelected = selectedPerson && String(selectedPerson.id) === String(person.id);
                return (
                  <div
                    key={person.id}
                    onClick={() => handleCardClick(person)}
                    className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-purple-500 shadow-md ring-2 ring-purple-500/20"
                        : "border-neutral-200 hover:border-purple-300"
                    }`}
                  >
                    <div>
                      {/* Cover Photo & Badges */}
                      <div className="h-28 relative bg-neutral-900 overflow-hidden">
                        <img
                          src={person.cover}
                          alt="Cover"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-neutral-900 px-2 py-0.5 rounded-full shadow-xs">
                            {person.category}
                          </span>
                        </div>
                        {person.available && (
                          <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Available
                          </div>
                        )}
                      </div>

                      {/* Avatar and Basic Info */}
                      <div className="px-4 pt-0 pb-3 relative">
                        <div className="flex items-end justify-between -mt-8 mb-2">
                          <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-neutral-100 flex-shrink-0">
                            <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{person.rating || 4.9}</span>
                            <span className="text-neutral-400 font-normal text-[10px]">({person.reviews || 0})</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                              {person.name}
                            </h3>
                            {person.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          </div>
                          <p className="text-xs font-medium text-purple-700 line-clamp-1">{person.role}</p>
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">{person.bio}</p>
                        </div>

                        {/* Tags */}
                        {person.tags && person.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {person.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-medium bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs mt-2">
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" /> {person.country}
                      </span>
                      <span className="font-bold text-purple-700 text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        View Bio <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPeople.map((person) => {
                const isSelected = selectedPerson && String(selectedPerson.id) === String(person.id);
                return (
                  <div
                    key={person.id}
                    onClick={() => handleCardClick(person)}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all duration-200 group flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md ${
                      isSelected
                        ? "border-purple-500 shadow-sm ring-2 ring-purple-500/20"
                        : "border-neutral-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-neutral-900 group-hover:text-purple-700 transition-colors truncate">
                            {person.name}
                          </h3>
                          {person.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {person.available && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                              Available
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-purple-800 mb-0.5">{person.role}</p>
                        <p className="text-xs text-neutral-500 line-clamp-1">{person.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {person.rating || 4.9}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(person);
                        }}
                        className="text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 px-4 py-1.5 rounded-xl transition-all shadow-xs"
                      >
                        View Biography
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Profile Detail Preview */}
        <div className="xl:col-span-3">
          {selectedPerson ? (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs sticky top-6">
              <div className="h-32 relative">
                <img src={selectedPerson.cover} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {selectedPerson.available && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 relative">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md mx-auto -mt-10 mb-3 relative overflow-hidden bg-neutral-100">
                  <img src={selectedPerson.img} alt={selectedPerson.name} className="w-full h-full object-cover" />
                </div>

                <div className="text-center mb-3">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center justify-center gap-1">
                    {selectedPerson.name}
                    {selectedPerson.verified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                  </h2>
                  <p className="text-xs text-neutral-600 mb-0.5">{selectedPerson.role}</p>
                  <p className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedPerson.country}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenModal(selectedPerson)}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md shadow-purple-600/20 mb-4"
                >
                  <Sparkles className="w-3.5 h-3.5" /> View Full Biography & Profile
                </button>

                {selectedPerson.quote && (
                  <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 mb-4 text-xs italic text-purple-900 relative">
                    <Quote className="w-4 h-4 text-purple-300 absolute top-2 right-2" />
                    &ldquo;{selectedPerson.quote}&rdquo;
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-neutral-100 mb-4">
                  <div>
                    <div className="font-bold text-sm text-neutral-900">{selectedPerson.events || 12}</div>
                    <div className="text-[9px] text-neutral-400 uppercase font-semibold">Events</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-900">{selectedPerson.followers || "500K"}</div>
                    <div className="text-[9px] text-neutral-400 uppercase font-semibold">Followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-900">{selectedPerson.collabs || 8}</div>
                    <div className="text-[9px] text-neutral-400 uppercase font-semibold">Collabs</div>
                  </div>
                </div>

                {selectedPerson.availableFor && selectedPerson.availableFor.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 mb-2">Available For</h4>
                    <div className="space-y-1.5">
                      {selectedPerson.availableFor.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-xs sticky top-6">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm mb-1">No Profile Selected</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Click any personality card from the directory to review their detailed bio and booking options.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Register Person Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Featured Personalities (when available in Firestore) */}
      {famousPeople.length > 0 && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Featured Notable Personalities</h2>
              <p className="text-xs text-neutral-500">Profiles synchronized directly from the Firestore database.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {famousPeople.slice(0, 4).map((person) => (
              <div
                key={person.id}
                onClick={() => handleCardClick(person)}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="h-32 relative bg-neutral-900 overflow-hidden">
                  <img
                    src={person.img}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={person.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-neutral-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {person.category}
                  </div>
                  <div className="absolute bottom-2 left-3 text-white">
                    <p className="text-xs font-bold truncate">{person.name}</p>
                    <p className="text-[10px] text-neutral-300 truncate">{person.role}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-3">{person.bio}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400">{person.country}</span>
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                      View Bio <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer - Dynamically Calculated */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 pb-2 border-t border-neutral-200 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-neutral-900 leading-tight">{famousPeople.length}</div>
            <div className="text-[10px] text-neutral-500">Famous People</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-neutral-900 leading-tight">{availableCount}</div>
            <div className="text-[10px] text-neutral-500">Available for Events</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-neutral-900 leading-tight">
              {famousPeople.reduce((sum, p) => sum + (p.events || 0), 0)}
            </div>
            <div className="text-[10px] text-neutral-500">Total Events</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-neutral-900 leading-tight">
              {famousPeople.reduce((sum, p) => sum + (p.collabs || 0), 0)}
            </div>
            <div className="text-[10px] text-neutral-500">Collaborations</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg text-neutral-900 leading-tight">{distinctCountries}</div>
            <div className="text-[10px] text-neutral-500">Countries Represented</div>
          </div>
        </div>
      </div>
    </div>
  );
}
