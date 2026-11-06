import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar as CalendarIcon, MapPin, Search, Plus, Filter, 
  ChevronDown, Heart, Share2, Users, Bookmark, CheckCircle, 
  ShieldCheck, Globe, List as ListIcon, X, Sparkles, Clock, CalendarCheck, Check,
  Music, Briefcase, GraduationCap, Wrench, MessageSquare, BookOpen, Layers, Tag,
  Bell, Play, Map as MapIcon, Repeat, Video, Lock, ShieldAlert, UserCheck, Download,
  CalendarPlus, QrCode, AlertTriangle, Edit3, Settings
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { EventItem } from "../data/eventsData";
export type { EventItem } from "../data/eventsData";
import { EventLocationPickerModal, LocationSelection } from "../components/events/EventLocationPickerModal";
import { EventsCalendarView } from "../components/events/EventsCalendarView";
import { EventsMapView } from "../components/events/EventsMapView";
import { EventDetailModal } from "../components/events/EventDetailModal";
import { OrganiserDashboardModal } from "../components/events/OrganiserDashboardModal";
import { AdminEventsModal } from "../components/events/AdminEventsModal";
import { EventCreateEditModal } from "../components/events/EventCreateEditModal";
import { 
  getFavoriteEventIds, 
  toggleFavoriteEventId, 
  getAllCommunityEvents, 
  saveCommunityEvent,
  updateCommunityEvent,
  getAllRsvps,
  getUserRsvps,
  downloadIcsFile,
  generateGoogleCalendarUrl
} from "../utils/userEventsStorage";
import { triggerOneHourAlert } from "../utils/eventNotificationSystem";
import { subscribeEvents } from "../lib/firestoreService";

export interface EventCategoryOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  badgeColor: string;
  description: string;
}

export const EVENT_CATEGORIES: EventCategoryOption[] = [
  { id: "All", label: "All Gatherings", icon: Sparkles, color: "text-amber-600", bgColor: "bg-amber-50", badgeColor: "bg-amber-100 text-amber-900 border-amber-200", description: "All community events worldwide" },
  { id: "Meditation", label: "Meditation", icon: Heart, color: "text-rose-600", bgColor: "bg-rose-50", badgeColor: "bg-rose-100 text-rose-800 border-rose-200", description: "Vipassana, Metta & mindfulness retreats" },
  { id: "Talk", label: "Talks & Bana", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50", badgeColor: "bg-blue-100 text-blue-800 border-blue-200", description: "Dhamma sermons & discourse panels" },
  { id: "Learning", label: "Learning", icon: BookOpen, color: "text-indigo-600", bgColor: "bg-indigo-50", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200", description: "Sutta study, Pali & Buddhist philosophy" },
  { id: "Music", label: "Music & Chants", icon: Music, color: "text-purple-600", bgColor: "bg-purple-50", badgeColor: "bg-purple-100 text-purple-800 border-purple-200", description: "Bhakthi Gee, traditional drumming & chanting" },
  { id: "Business", label: "Business", icon: Briefcase, color: "text-emerald-600", bgColor: "bg-emerald-50", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200", description: "Professional networking & entrepreneur meetups" },
  { id: "Education", label: "Education", icon: GraduationCap, color: "text-teal-600", bgColor: "bg-teal-50", badgeColor: "bg-teal-100 text-teal-800 border-teal-200", description: "Dhamma schools, youth seminars & logic" },
  { id: "Workshop", label: "Workshops", icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50", badgeColor: "bg-orange-100 text-orange-800 border-orange-200", description: "Lantern making, mindful cooking & craft" }
];

export const getCategoryBadgeStyle = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'meditation':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'talk':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'learning':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'music':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'business':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'education':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'workshop':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-neutral-50 text-neutral-700 border-neutral-200';
  }
};

export function Events() {
  const [toastMessage, setToastMessage] = useState("");
  const [events, setEvents] = useState<EventItem[]>(getAllCommunityEvents);
  const [savedEvents, setSavedEvents] = useState<string[]>(getFavoriteEventIds);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formatFilter, setFormatFilter] = useState<"all" | "in_person" | "online" | "recurring" | "private">("all");
  const [viewMode, setViewMode] = useState<"list" | "map" | "calendar">("list");
  const [searchParams] = useSearchParams();

  // Active user identity
  const currentUserEmail = "damika1316@gmail.com";
  const currentUserName = "Damika Fernando";

  // RSVPs State
  const [allRsvpsState, setAllRsvpsState] = useState(getAllRsvps);

  // Synchronize rsvps array for active user
  const userRsvpsList = useMemo(() => {
    return getUserRsvps(currentUserEmail).filter(r => r.status !== "cancelled");
  }, [allRsvpsState, currentUserEmail]);

  const userRsvpdEventIds = useMemo(() => {
    return userRsvpsList.map(r => r.eventId);
  }, [userRsvpsList]);

  // Modals state
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<LocationSelection | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);
  const [showOrganiserModal, setShowOrganiserModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Listen for custom events
  useEffect(() => {
    const favHandler = () => setSavedEvents(getFavoriteEventIds());
    const rsvpHandler = () => setAllRsvpsState(getAllRsvps());
    const eventsHandler = () => setEvents(getAllCommunityEvents());

    window.addEventListener('lanka_favorites_updated', favHandler);
    const unsub = subscribeEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
    });

    window.addEventListener('lanka_rsvps_updated', rsvpHandler);
    window.addEventListener('lanka_events_updated', eventsHandler);

    return () => {
      unsub();
      window.removeEventListener('lanka_favorites_updated', favHandler);
      window.removeEventListener('lanka_rsvps_updated', rsvpHandler);
      window.removeEventListener('lanka_events_updated', eventsHandler);
    };
  }, []);

  // Deep-linking from notification or URL param (e.g. ?selected=e1)
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && events.length > 0) {
      const found = events.find(e => e.id === selectedId);
      if (found) {
        setSelectedEventModal(found);
      }
    }
  }, [searchParams, events]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { isFavorite, favorites } = toggleFavoriteEventId(id);
    setSavedEvents(favorites);
    showToast(
      isFavorite 
        ? "Favorited! Event saved to Profile with automatic 1-Hour Push & Toast Alert." 
        : "Removed from 'My Bookmarked Events'."
    );
  };

  const handleToggleRsvp = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const match = events.find(ev => ev.id === eventId);
    if (match) {
      setSelectedEventModal(match);
    }
  };

  const handleSaveEvent = (savedEvent: EventItem) => {
    if (eventToEdit) {
      updateCommunityEvent(savedEvent);
      showToast(`Event "${savedEvent.title}" updated successfully!`);
    } else {
      saveCommunityEvent(savedEvent);
      showToast(`Gathering "${savedEvent.title}" published to community network!`);
    }
    setEvents(getAllCommunityEvents());
    setEventToEdit(null);
  };

  const handleOpenEditEvent = (event: EventItem) => {
    setEventToEdit(event);
    setShowCreateEditModal(true);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: events.length
    };
    EVENT_CATEGORIES.forEach(cat => {
      if (cat.id !== "All") {
        counts[cat.id] = events.filter(e => 
          e.category?.toLowerCase() === cat.id.toLowerCase() ||
          e.tags.some(t => t.toLowerCase() === cat.id.toLowerCase())
        ).length;
      }
    });
    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLoc = locationFilter === "" || e.loc.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchCat = selectedCategory === "All" || 
        e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase());
      
      // Format Filter
      let matchFormat = true;
      if (formatFilter === "in_person") matchFormat = !e.isOnline;
      if (formatFilter === "online") matchFormat = !!e.isOnline;
      if (formatFilter === "recurring") matchFormat = !!e.isRecurring;
      if (formatFilter === "private") matchFormat = e.visibility === "private";

      // Tab filter
      let matchTab = true;
      if (activeTab === "my") matchTab = userRsvpdEventIds.includes(e.id);
      if (activeTab === "saved") matchTab = savedEvents.includes(e.id);
      if (activeTab === "past") matchTab = e.isPast;
      if (activeTab === "online") matchTab = !!e.isOnline;
      if (activeTab === "recurring") matchTab = !!e.isRecurring;

      return matchSearch && matchLoc && matchCat && matchFormat && matchTab;
    });
  }, [events, searchQuery, locationFilter, selectedCategory, formatFilter, activeTab, userRsvpdEventIds, savedEvents]);

  return (
    <div className="space-y-6 relative max-w-[1600px] mx-auto pb-12">
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

      {/* Header & Quick Action Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shadow-2xs">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                  Events & Gatherings Planner
                </h2>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Live Global Network
                </span>
              </div>
              <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
                Discover, organize, and RSVP to spiritual, cultural, and community gatherings worldwide with interactive maps and directions.
              </p>
            </div>
          </div>
          
          {/* Quick Action Center: Organize, Organiser Dashboard, Admin Center */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button 
              onClick={() => {
                setEventToEdit(null);
                setShowCreateEditModal(true);
              }} 
              className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Organize Gathering</span>
            </button>

            <button
              onClick={() => setShowOrganiserModal(true)}
              className="flex-1 sm:flex-initial bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Settings className="w-4 h-4 text-neutral-600" />
              <span>Organiser Dashboard</span>
            </button>

            <button
              onClick={() => setShowAdminModal(true)}
              className="p-2.5 text-neutral-400 hover:text-rose-700 hover:bg-rose-50 border border-neutral-200 rounded-xl transition-colors shrink-0"
              title="Staff Safety & Admin Panel"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </button>
          </div>
        </div>
        
        {/* Search Controls Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gathering title, organiser, speaker, or keyword..." 
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500" 
            />
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="City, country, or venue" 
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500" 
            />
          </div>

          <div className="md:col-span-2 relative">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none text-neutral-700 font-semibold"
            >
              {EVENT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label} ({categoryCounts[c.id] || 0})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          <div className="md:col-span-2 relative">
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as any)}
              className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none text-neutral-700 font-semibold"
            >
              <option value="all">All Formats</option>
              <option value="in_person">In-Person Only</option>
              <option value="online">Online Broadcasts</option>
              <option value="recurring">Recurring Series</option>
              <option value="private">Private / Unlisted</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Visual Category Filter Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>Gathering Themes</span>
            </div>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset to All Gatherings</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {EVENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm ring-1 ring-neutral-900/10'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  <div className={`p-1 rounded-md ${isActive ? 'bg-white/20 text-white' : `${cat.bgColor} ${cat.color}`}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Events Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
        
        {/* Navigation Tabs and View Switcher */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {[
              { id: "all", label: "All Gatherings" },
              { id: "my", label: `My Events (${userRsvpsList.length})` },
              { id: "saved", label: `Saved (${savedEvents.length})` },
              { id: "online", label: "Online" },
              { id: "recurring", label: "Recurring" },
              { id: "past", label: "Past" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-2xs' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-neutral-500 font-semibold">
              Showing {filteredEvents.length} gatherings
            </span>

            {/* List vs Map vs Calendar View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 shrink-0">
              <button 
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>

              <button 
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "map"
                    ? "bg-white text-orange-600 shadow-2xs ring-1 ring-orange-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                title="Interactive Map View with Turn-by-Turn Directions"
              >
                <MapIcon className="w-3.5 h-3.5 text-orange-600" />
                <span>Map</span>
              </button>

              <button 
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "calendar"
                    ? "bg-white text-rose-600 shadow-2xs ring-1 ring-rose-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                title="Monthly Calendar View"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated "My Events" Personal Calendar & Sync Banner */}
        {activeTab === "my" && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Your Personal RSVP Schedule ({userRsvpsList.length} Gatherings)
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Synchronize all your confirmed gatherings with your phone, Apple Calendar, or Google Calendar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => {
                  userRsvpdEventIds.forEach(id => {
                    const ev = events.find(e => e.id === id);
                    if (ev) downloadIcsFile(ev);
                  });
                  showToast("Downloaded calendar .ics invites for all your gatherings!");
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download All (.ics)</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Summary Pill */}
        {selectedCategory !== "All" && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-neutral-700">Filtering theme:</span>
              <span className="font-bold text-amber-950 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" />
                {selectedCategory}
              </span>
              <span className="text-neutral-500">— {filteredEvents.length} gatherings</span>
            </div>
            <button 
              onClick={() => setSelectedCategory("All")}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Dynamic View Rendering: Map vs Calendar vs List */}
        {viewMode === "map" ? (
          <EventsMapView
            events={filteredEvents}
            onSelectEvent={setSelectedEventModal}
            rsvps={userRsvpdEventIds}
            onToggleRsvp={handleToggleRsvp}
          />
        ) : viewMode === "calendar" ? (
          <EventsCalendarView
            events={filteredEvents}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectEvent={setSelectedEventModal}
            rsvps={userRsvpdEventIds}
            onToggleRsvp={handleToggleRsvp}
            savedEvents={savedEvents}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          filteredEvents.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <CalendarIcon className="w-12 h-12 text-neutral-300 mx-auto" />
              <h4 className="font-bold text-neutral-800 text-sm">No gatherings found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No events match your current filter criteria. Try resetting filters or switching tabs.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setFormatFilter("all");
                    setActiveTab("all");
                    setSearchQuery("");
                    setLocationFilter("");
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredEvents.map((event) => {
                const isRsvpd = userRsvpdEventIds.includes(event.id);
                const isSaved = savedEvents.includes(event.id);

                return (
                  <div 
                    key={event.id}
                    onClick={() => setSelectedEventModal(event)}
                    className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row gap-4 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    {/* Left Thumbnail Banner */}
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden shrink-0 relative bg-neutral-100">
                      <img 
                        referrerPolicy="no-referrer" 
                        src={event.img} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      
                      {/* Category & Status Overlay Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {event.category && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs bg-white/95 backdrop-blur-xs ${getCategoryBadgeStyle(event.category)}`}>
                            {event.category}
                          </span>
                        )}
                        {event.isOnline && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-900/90 text-white backdrop-blur-xs flex items-center gap-1">
                            <Video className="w-2.5 h-2.5" /> Online
                          </span>
                        )}
                        {event.isRecurring && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/90 text-white backdrop-blur-xs flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" /> {event.recurrenceRule || 'Recurring'}
                          </span>
                        )}
                        {event.isCancelled && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white backdrop-blur-xs">
                            Cancelled
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => handleToggleBookmark(event.id, e)} 
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 hover:bg-white backdrop-blur-xs rounded-full flex items-center justify-center transition-all shadow-2xs"
                        title={isSaved ? "Saved in Favorites" : "Save to Favorites"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-neutral-600'}`} />
                      </button>
                    </div>
                    
                    {/* Event Info Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex gap-3">
                          {/* Calendar Date Block */}
                          <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-xl w-12 h-12 shrink-0">
                            <span className="text-[9px] font-bold uppercase">{event.mon}</span>
                            <span className="text-lg font-black leading-none">{event.day}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-neutral-900 text-base group-hover:text-amber-700 transition-colors line-clamp-1 leading-snug">
                              {event.title}
                            </h4>
                            
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span>{event.loc}</span>
                            </p>
                            
                            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>{event.date}</span>
                            </p>
                          </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-neutral-600 line-clamp-2 mt-2 leading-relaxed">
                          {event.desc}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {event.tags.map(t => (
                            <span key={t} className="text-[10px] font-medium px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Bottom Toolbar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs border-t border-neutral-100 pt-3 mt-3 gap-2">
                        <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                          <span className="flex items-center gap-1 font-semibold text-neutral-700">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{event.attendees + (isRsvpd ? 1 : 0)} Attending</span>
                          </span>

                          {event.capacity && event.capacity > 0 && (
                            <span className="text-neutral-400">
                              • Limit: {event.capacity}
                            </span>
                          )}

                          <span>
                            • By <strong>{event.organizer}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {/* Calendar Quick Sync */}
                          <a
                            href={generateGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-neutral-500 hover:text-orange-600 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-neutral-600" />
                          </a>

                          {/* RSVP Button */}
                          <button 
                            onClick={(e) => handleToggleRsvp(event.id, e)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs ${
                              isRsvpd
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                            }`}
                          >
                            {isRsvpd ? "Attending ✓" : "RSVP Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Event Details & RSVP Modal */}
      <EventDetailModal
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        event={selectedEventModal}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        onRsvpChange={() => setAllRsvpsState(getAllRsvps())}
        onEditEvent={handleOpenEditEvent}
        onShowToast={showToast}
      />

      {/* Create / Edit Gathering Modal */}
      <EventCreateEditModal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setEventToEdit(null);
        }}
        eventToEdit={eventToEdit}
        onSaveEvent={handleSaveEvent}
        onOpenMapPicker={() => setShowMapPickerModal(true)}
        selectedLocation={selectedLocationCoords}
      />

      {/* Google Maps Location Picker Modal */}
      <EventLocationPickerModal
        isOpen={showMapPickerModal}
        onClose={() => setShowMapPickerModal(false)}
        onSelectLocation={(selection) => {
          setSelectedLocationCoords(selection);
          showToast(`Location selected: ${selection.name || selection.address}`);
        }}
        initialLocationText=""
      />

      {/* Organiser Dashboard Modal */}
      <OrganiserDashboardModal
        isOpen={showOrganiserModal}
        onClose={() => setShowOrganiserModal(false)}
        events={events}
        currentUserEmail={currentUserEmail}
        onRefreshEvents={() => setEvents(getAllCommunityEvents())}
        onShowToast={showToast}
      />

      {/* Safety & Administrator Moderation Modal */}
      <AdminEventsModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        events={events}
        onRefreshEvents={() => setEvents(getAllCommunityEvents())}
        onShowToast={showToast}
      />
    </div>
  );
}

export default Events;
