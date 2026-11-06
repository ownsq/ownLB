import { X, 
  Users, Search, Plane, MessageSquare, Calendar, 
  User, Rss, Grid, Bookmark, Bell, Settings,
  MapPin, Image as ImageIcon, Video, BarChart2, Smile, Filter,
  ThumbsUp, Share2, Plus, Star, Globe, Map as MapIcon,
  Heart, CreditCard, Sparkles, Send
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { FeedView } from "../components/directory/FeedView";
import { PeopleView } from "../components/directory/PeopleView";
import { GroupsView, GROUPS } from "../components/directory/GroupsView";
import { addGroupToDb } from "../lib/firestoreService";
import { TravelView } from "../components/directory/TravelView";
import { BoardView } from "../components/directory/BoardView";
import { MessagesView } from "../components/directory/MessagesView";
import { NotificationsView } from "../components/directory/NotificationsView";
import { useState, useEffect, useMemo } from "react";
import { BookmarksView } from "../components/directory/BookmarksView";
import { useAuth } from "../contexts/AuthContext";
import { useAd } from "../contexts/AdContext";
import { motion, AnimatePresence } from "motion/react";
import { EventDetailModal } from "../components/events/EventDetailModal";
import { InteractiveEntityMap, MapMarkerItem } from "../components/maps/InteractiveEntityMap";
import { MatrimonialSection } from "../components/matrimonial/MatrimonialSection";
import { DigitalCardsManagerModal } from "../components/cards/DigitalCardsManagerModal";
import { InvitationsManagerModal } from "../components/invitations/InvitationsManagerModal";
import { GoogleAdSense } from "../components/ads/GoogleAdSense";
import { useSectionConfig, SectionGuard, SectionKey } from "../contexts/SectionContext";
import { subscribeEvents, subscribeTemples, subscribeGroups, subscribeUsers } from "../lib/firestoreService";
import { getCoordinatesForLocation } from "../utils/googleMapsConfig";

export function Directory() {
  const [toastMessage, setToastMessage] = useState("");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({ title: '', desc: '', type: 'Public Group' });
  const [selectedEventModal, setSelectedEventModal] = useState<any | null>(null);
  const [rsvpdEvents, setRsvpdEvents] = useState<Record<string, boolean>>({});
  const [isDigitalCardsOpen, setIsDigitalCardsOpen] = useState(false);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);

  // Live Firestore Data States
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbTemples, setDbTemples] = useState<any[]>([]);
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsubE = subscribeEvents((list) => setDbEvents(list));
    const unsubT = subscribeTemples((list) => setDbTemples(list));
    const unsubG = subscribeGroups((list) => setDbGroups(list));
    const unsubU = subscribeUsers((list) => setDbUsers(list));
    return () => {
      unsubE();
      unsubT();
      unsubG();
      unsubU();
    };
  }, []);

  // Compute dynamic global map markers from live database
  const communityGlobalItems = useMemo(() => {
    const items: MapMarkerItem[] = [];
    dbTemples.forEach((t) => {
      const coords = (t.lat && t.lng) 
        ? { lat: Number(t.lat), lng: Number(t.lng) } 
        : getCoordinatesForLocation(t.address || t.loc || t.city || t.name);
      items.push({
        id: `temple-${t.id}`,
        name: t.name,
        subtitle: `${t.city || t.loc || 'Temple'} • ${t.sect || 'Theravada'}`,
        address: t.address || t.loc || t.city || 'Buddhist Vihara',
        lat: coords.lat,
        lng: coords.lng,
        category: 'Temple',
        badge: t.tags?.[0] || 'Temple',
        link: `/temples/${t.id}`
      });
    });

    dbEvents.forEach((e) => {
      const coords = (e.lat && e.lng) 
        ? { lat: Number(e.lat), lng: Number(e.lng) } 
        : getCoordinatesForLocation(e.location || e.city || e.title);
      items.push({
        id: `event-${e.id}`,
        name: e.title,
        subtitle: `${e.date} • ${e.time || 'All Day'} • ${e.location}`,
        address: e.location || e.city || 'Event Venue',
        lat: coords.lat,
        lng: coords.lng,
        category: 'Upcoming Event',
        badge: e.category || 'Event',
        link: '/events'
      });
    });

    dbGroups.forEach((g) => {
      const coords = getCoordinatesForLocation(g.city || g.country || g.name);
      items.push({
        id: `group-${g.id}`,
        name: g.name,
        subtitle: `${g.category || 'Community Group'} • ${g.membersCount || 1} Members`,
        address: g.city || g.country || 'Global Hub',
        lat: coords.lat,
        lng: coords.lng,
        category: 'Community Chapter',
        badge: `${g.membersCount || 1} Members`,
        link: '/directory?view=groups'
      });
    });

    return items;
  }, [dbTemples, dbEvents, dbGroups]);

  // Distinct countries count
  const distinctCountriesCount = useMemo(() => {
    const set = new Set<string>();
    dbUsers.forEach(u => { if (u.country || u.location) set.add(u.country || u.location); });
    dbTemples.forEach(t => { if (t.country || t.city) set.add(t.country || t.city); });
    dbEvents.forEach(e => { if (e.location) set.add(e.location); });
    return Math.max(set.size, 1);
  }, [dbUsers, dbTemples, dbEvents]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleRSVP = (eventId: string | number) => {
    const key = String(eventId);
    const next = !rsvpdEvents[key];
    setRsvpdEvents(prev => ({ ...prev, [key]: next }));
    if (selectedEventModal && String(selectedEventModal.id) === key) {
      setSelectedEventModal((prev: any) => ({ ...prev, isAttending: next }));
    }
    showToast(next ? `RSVP confirmed for "${key}"!` : `RSVP cancelled for "${key}".`);
  };

  const { user } = useAuth();
  const { adConfig } = useAd();
  const { isSectionEnabled } = useSectionConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "feed";
  const setView = (v: string, extraParams?: Record<string, string>) => {
    const nextParams: Record<string, string> = { view: v };
    if (extraParams) {
      Object.assign(nextParams, extraParams);
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Community Directory</h2>
            <p className="text-sm text-neutral-500">Connect, collaborate and grow with Sri Lankans around the world.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCreateGroupModalOpen(true)} className="bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Group
          </button>
          {isSectionEnabled("events") && (
            <Link to="/events" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4" /> Organize Event
            </Link>
          )}
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {[
          { id: "people", icon: Users, title: "Find People", desc: "Connect worldwide", color: "text-blue-600", bg: "bg-blue-50" },
          { id: "groups", icon: Grid, title: "Discover Groups", desc: "Join communities", color: "text-emerald-600", bg: "bg-emerald-50" },
          { id: "map", icon: Globe, title: "Global Map", desc: "Explore world map", color: "text-amber-600", bg: "bg-amber-50" },
          { id: "travel", icon: Plane, title: "Travel Buddies", desc: "Find companions", color: "text-purple-600", bg: "bg-purple-50", sectionKey: "travelBuddies" as SectionKey },
          { id: "board", icon: MessageSquare, title: "Community Board", desc: "Discuss & share", color: "text-orange-600", bg: "bg-orange-50", sectionKey: "communityBoard" as SectionKey },
          { id: "matrimonial", icon: Heart, title: "Matrimonial (18+)", desc: "Verified proposals", color: "text-rose-600", bg: "bg-rose-50", sectionKey: "matrimonial" as SectionKey },
          { id: "cards_modal", icon: CreditCard, title: "Digital Cards", desc: "Share & QR vCard", color: "text-indigo-600", bg: "bg-indigo-50", action: () => setIsDigitalCardsOpen(true), sectionKey: "digitalCards" as SectionKey },
          { id: "events", icon: Calendar, title: "Events", desc: "Join events", color: "text-amber-700", bg: "bg-amber-100/60", link: "/events", sectionKey: "events" as SectionKey },
        ].filter((item) => !item.sectionKey || isSectionEnabled(item.sectionKey)).map((item, i) => {
          if (item.link) {
            return (
              <Link to={item.link} key={i} className="bg-white p-3.5 rounded-xl border border-neutral-200 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2">
                <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-lg flex items-center justify-center`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-neutral-900">{item.title}</h3>
                  <p className="text-[10px] leading-tight text-neutral-500 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            );
          }
          return (
            <div 
              key={i} 
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setView(item.id);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${view === item.id ? 'bg-orange-50 border-orange-400 shadow-sm ring-1 ring-orange-400' : 'bg-white border-neutral-200 hover:border-orange-300 hover:shadow-sm'}`}
            >
              <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-lg flex items-center justify-center`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-neutral-900">{item.title}</h3>
                <p className="text-[10px] leading-tight text-neutral-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:self-start">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-5 flex flex-col items-center text-center border-b border-neutral-100">
              <div className="relative mb-3">
                <img referrerPolicy="no-referrer" src={user?.avatar || "https://i.pravatar.cc/150?u=saminda"} alt={user?.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <h3 className="font-bold text-neutral-900">{user?.name || "Saminda Fernando"}</h3>
              <p className="text-xs text-neutral-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> Los Angeles, USA
              </p>
              <div className="mt-3 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-purple-100">
                <Star className="w-3 h-3" /> Level 5 Contributor
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-neutral-100 p-4 text-center">
              <div>
                <div className="font-bold text-neutral-900">125</div>
                <div className="text-xs text-neutral-500">Posts</div>
              </div>
              <div>
                <div className="font-bold text-neutral-900">78</div>
                <div className="text-xs text-neutral-500">Connections</div>
              </div>
              <div>
                <div className="font-bold text-neutral-900">12</div>
                <div className="text-xs text-neutral-500">Groups</div>
              </div>
            </div>
            <div className="p-2 space-y-1 bg-neutral-50 border-t border-neutral-100">
              {[
                { icon: User, label: "My Profile & Dashboard", path: "/profile" },
                { icon: Rss, label: "My Feed", active: view === "feed", id: "feed" },
                { icon: MessageSquare, label: "Community Board", active: view === "board", id: "board", sectionKey: "communityBoard" as SectionKey },
                { icon: Globe, label: "Community Map", id: "map", active: view === "map" },
                { icon: Users, label: "My Connections", id: "people" },
                { icon: Plane, label: "Travel Buddies", id: "travel", active: view === "travel", sectionKey: "travelBuddies" as SectionKey },
                { icon: Heart, label: "Matrimonial (18+)", id: "matrimonial", active: view === "matrimonial", badge: "18+", sectionKey: "matrimonial" as SectionKey },
                { icon: CreditCard, label: "Digital Cards", onClick: () => setIsDigitalCardsOpen(true), sectionKey: "digitalCards" as SectionKey },
                { icon: Send, label: "Ceremony Invitations", onClick: () => setIsInvitationsOpen(true) },
                { icon: Grid, label: "My Groups", id: "groups" },
                { icon: Calendar, label: "My Events", path: "/events", sectionKey: "events" as SectionKey },
                { icon: Bookmark, label: "My Bookmarks", id: "bookmarks", active: view === "bookmarks" },
                { icon: MessageSquare, label: "Messages", badge: "3", id: "messages" },
                { icon: Bell, label: "Notifications", badge: "8", id: "notifications" },
                { icon: Settings, label: "Settings", path: "/profile" },
              ].filter((item) => !item.sectionKey || isSectionEnabled(item.sectionKey)).map((item, i) => (
                item.path ? (
                  <Link key={i} to={item.path} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${item.active ? 'bg-amber-100 text-amber-900 font-bold' : 'text-neutral-600 hover:bg-neutral-200'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (item.id) {
                        setView(item.id);
                      }
                    }} 
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${view === item.id || item.active ? 'bg-amber-100 text-amber-900 font-bold' : 'text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.id === 'matrimonial' ? 'bg-rose-600' : 'bg-amber-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Explore by Region */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-bold text-neutral-900 mb-4">Explore by Region</h3>
            <div className="space-y-3">
              {[
                { label: "North America", count: "2.1K" },
                { label: "Europe", count: "1.8K" },
                { label: "Australia & NZ", count: "980" },
                { label: "Asia", count: "1.6K" },
                { label: "Middle East", count: "620" },
                { label: "Africa", count: "430" },
                { label: "South America", count: "310" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm cursor-pointer group">
                  <span className="text-neutral-600 group-hover:text-orange-600 transition-colors">{item.label}</span>
                  <span className="text-xs text-neutral-400 group-hover:text-orange-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Connections */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-bold text-neutral-900 mb-4">Suggested Connections</h3>
            <div className="space-y-4">
              {[
                { name: "Nadeesha Perera", loc: "Melbourne, Australia", img: "https://i.pravatar.cc/150?u=nadeesha" },
                { name: "Chamika Jayawardena", loc: "Toronto, Canada", img: "https://i.pravatar.cc/150?u=chamika" },
                { name: "Tharindu Senarathne", loc: "London, UK", img: "https://i.pravatar.cc/150?u=tharindu" },
                { name: "Sewmini Dissanayake", loc: "New York, USA", img: "https://i.pravatar.cc/150?u=sewmini" },
                { name: "Dilshan Wijesinghe", loc: "Sydney, Australia", img: "https://i.pravatar.cc/150?u=dilshan" },
              ].map((person, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img referrerPolicy="no-referrer" src={person.img} alt={person.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-900">{person.name}</h4>
                      <p className="text-[10px] text-neutral-500">{person.loc}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-medium text-orange-600 border border-orange-200 px-2 py-1 rounded-full hover:bg-orange-50 transition-colors">
                    Connect
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setView('people')} className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-700">View All</button>
          </div>
        </div>

                {/* Middle Content */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
               key={view}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
          {view === 'feed' && <FeedView />}
          {view === 'people' && <PeopleView />}
          {view === 'groups' && <GroupsView />}
          {view === 'travel' && (
            <SectionGuard sectionKey="travelBuddies">
              <TravelView />
            </SectionGuard>
          )}
          {view === 'matrimonial' && (
            <SectionGuard sectionKey="matrimonial">
              <MatrimonialSection />
            </SectionGuard>
          )}
          {view === 'board' && (
            <SectionGuard sectionKey="communityBoard">
              <BoardView />
            </SectionGuard>
          )}
          {view === 'messages' && <MessagesView />}
          {view === 'notifications' && <NotificationsView />}
          {view === 'bookmarks' && <BookmarksView />}
          {view === 'map' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    Global Community & Events Map
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Explore Sri Lankan Buddhist community chapters, groups, and upcoming events worldwide
                  </p>
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" /> Post Community Event
                </button>
              </div>

              <div className="h-[520px] w-full rounded-xl overflow-hidden border border-neutral-200 shadow-inner">
                <InteractiveEntityMap
                  items={communityGlobalItems}
                  height="100%"
                  defaultZoom={2}
                  onItemClick={(item) => {
                    if (item.category === 'Upcoming Event') {
                      const evId = String(item.id).replace('event-', '');
                      const matched = dbEvents.find(e => e.id === evId || e.title === item.name);
                      setSelectedEventModal({
                        id: matched?.id || String(item.id),
                        title: matched?.title || item.name,
                        date: matched?.date || "Upcoming",
                        time: matched?.time || "Evening",
                        location: matched?.location || item.address || "Community Center",
                        category: matched?.category || "Community Event",
                        description: matched?.description || `${item.subtitle || ''}. Click directions or RSVP to attend.`,
                        isAttending: rsvpdEvents[matched?.id || String(item.id)] || false,
                        organizer: matched?.organizer || "Global Community Directory"
                      });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                  <div className="font-bold text-base text-neutral-900">
                    {Math.max(1, new Set([...dbTemples.map(t => t.country).filter(Boolean), ...dbEvents.map(e => e.country).filter(Boolean)]).size)}
                  </div>
                  <div className="text-[10px] text-neutral-500">Countries Represented</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                  <div className="font-bold text-base text-emerald-600">{dbTemples.length + dbGroups.length}</div>
                  <div className="text-[10px] text-neutral-500">Temples & Chapters</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                  <div className="font-bold text-base text-rose-600">{dbEvents.length}</div>
                  <div className="text-[10px] text-neutral-500">Active Events</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                  <div className="font-bold text-base text-indigo-600">{Math.max(dbUsers.length, 1)}</div>
                  <div className="text-[10px] text-neutral-500">Registered Members</div>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:self-start">
          
          {/* Community Stats */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-bold text-neutral-900 mb-4">Community Stats</h3>
            <div className="space-y-4">
              {[
                { icon: Users, val: String(Math.max(dbUsers.length, 1)), label: "Registered Members", color: "text-purple-600", bg: "bg-purple-50" },
                { icon: Grid, val: String(dbGroups.length), label: "Community Groups", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Calendar, val: String(dbEvents.length), label: "Events Organized", color: "text-rose-600", bg: "bg-rose-50" },
                { icon: MapPin, val: String(dbTemples.length), label: "Monasteries & Temples", color: "text-amber-600", bg: "bg-amber-50" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-900">{stat.val}</div>
                    <div className="text-xs text-neutral-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">Upcoming Events</h3>
              <Link to="/events" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            <div className="space-y-3">
              {dbEvents.length === 0 ? (
                <div className="text-center py-6 px-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <Calendar className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                  <p className="text-xs text-neutral-600 font-medium">No upcoming events scheduled yet</p>
                  <Link to="/events" className="inline-block mt-2 text-[11px] font-bold text-orange-600 hover:underline">
                    Organize or explore events →
                  </Link>
                </div>
              ) : (
                dbEvents.slice(0, 4).map((ev) => {
                  const dateObj = new Date(ev.date || Date.now());
                  const mon = isNaN(dateObj.getTime()) ? "EVT" : dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
                  const day = isNaN(dateObj.getTime()) ? "•" : dateObj.getDate();
                  return (
                    <div 
                      key={ev.id} 
                      onClick={() => setSelectedEventModal({
                        id: ev.id,
                        title: ev.title,
                        date: ev.date,
                        time: ev.time || "Evening",
                        location: ev.location,
                        category: ev.category || "Community Event",
                        description: ev.description,
                        isAttending: rsvpdEvents[ev.id] || false,
                        organizer: ev.organizer || "Community Organizer"
                      })}
                      className="flex gap-3 group cursor-pointer p-2.5 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-200 transition-all"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[40px] bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-100 group-hover:scale-105 transition-transform shrink-0">
                        <span className="text-[10px] font-bold text-rose-600">{mon}</span>
                        <span className="text-base font-bold text-neutral-900 leading-none">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-1">{ev.title}</h4>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" /> {ev.location}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-neutral-400">{ev.time || "All Day"}</span>
                          <span className="text-orange-600 font-semibold group-hover:underline">View Map & RSVP →</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Community Board Preview */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="font-bold text-neutral-900 mb-4">Community Board</h3>
            <div className="space-y-4">
              {[
                { icon: User, title: "Introductions", desc: "New here? Say hello!", stats: "1.2K topics • 3.4K replies", color: "text-emerald-500" },
                { icon: MessageSquare, title: "Dhamma Discussions", desc: "Discuss teachings & share thoughts", stats: "2.1K topics • 6.8K replies", color: "text-blue-500" },
                { icon: Smile, title: "Community Help", desc: "Ask for help or offer support", stats: "890 topics • 2.1K replies", color: "text-orange-500" },
                { icon: Plane, title: "Travel & Lifestyle", desc: "Share experiences & travel tips", stats: "1.7K topics • 4.3K replies", color: "text-purple-500" },
                { icon: Calendar, title: "Events & Activities", desc: "Plan and promote events", stats: "1.1K topics • 2.9K replies", color: "text-blue-400" },
              ].map((cat, i) => (
                <div 
                  key={i} 
                  onClick={() => setView("board", { category: cat.title })} 
                  className="flex gap-3 group cursor-pointer hover:bg-orange-50/60 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className={`mt-0.5 ${cat.color}`}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">{cat.title}</h4>
                    <p className="text-xs text-neutral-500 mb-0.5">{cat.desc}</p>
                    <p className="text-[10px] text-neutral-400">{cat.stats}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setView("board")} className="w-full mt-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
              Go to Community Board
            </button>
          </div>

          {/* Advertisements */}
          <div className="space-y-4">
            {adConfig.isCustomAdActive && (
              <a href={adConfig.linkUrl} target="_blank" rel="noreferrer" className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
                <img referrerPolicy="no-referrer" src={adConfig.imageUrl} alt={adConfig.title} className="w-full h-40 object-cover mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Sponsored</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 leading-tight">{adConfig.title}</h4>
                    <p className="text-sm text-indigo-100 mb-3 line-clamp-2">{adConfig.description}</p>
                    <span className="inline-flex items-center text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                      {adConfig.linkText}
                    </span>
                  </div>
                </div>
              </a>
            )}
            
            {adConfig.isGoogleAdActive && (
              <GoogleAdSense 
                client={adConfig.googleAdClient} 
                slot={adConfig.googleAdSlot} 
                format={adConfig.googleAdFormat} 
              />
            )}
          </div>

        </div>
      </div>

      {/* Popular Discussions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-neutral-900">Popular Discussions in Community Board</h3>
          <button onClick={() => setView('board')} className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: "top-1", title: "What is the best Buddhist book for beginners?", author: "Vimukthi Perera", time: "2 hours ago", replies: 24, img: "https://i.pravatar.cc/150?u=vimukthi" },
            { id: "top-2", title: "How to stay mindful in a busy corporate environment?", author: "Kavindu Silva", time: "4 hours ago", replies: 18, img: "https://i.pravatar.cc/150?u=kavindu" },
            { id: "top-3", title: "Best cultural and temple circuits to visit in Sri Lanka", author: "Rashmi De Silva", time: "6 hours ago", replies: 32, img: "https://i.pravatar.cc/150?u=rashmi" },
            { id: "top-4", title: "Looking for travel buddies to Japan in November", author: "Sahan Jayasekara", time: "8 hours ago", replies: 15, img: "https://i.pravatar.cc/150?u=sahan" },
          ].map((topic, i) => (
            <div key={i} onClick={() => setView('board', { topicId: topic.id })} className="flex flex-col p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-orange-200 transition-colors cursor-pointer group">
              <h4 className="text-sm font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-orange-700">{topic.title}</h4>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <img referrerPolicy="no-referrer" src={topic.img} alt={topic.author} className="w-6 h-6 rounded-full" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{topic.author}</div>
                    <div className="text-[10px] text-neutral-500">{topic.time}</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {topic.replies}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Guidelines Notice */}
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-orange-900">This is our community. Let's keep it kind, respectful and Dhamma-focused.</h3>
            <p className="text-sm text-orange-800 mt-1">Report inappropriate content and help us maintain a positive environment for everyone.</p>
          </div>
        </div>
        <button onClick={() => showToast("Guidelines: Be respectful, focus on Dhamma, and support the community.")} className="bg-white border border-orange-300 text-orange-700 px-6 py-2 rounded-lg font-medium text-sm hover:bg-orange-100 transition-colors whitespace-nowrap">
          Community Guidelines
        </button>
      </div>

      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Create New Group</h2>
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupForm.title}
                  onChange={(e) => setNewGroupForm({...newGroupForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Los Angeles Dhamma Friends"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea 
                  value={newGroupForm.desc}
                  onChange={(e) => setNewGroupForm({...newGroupForm, desc: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  placeholder="What is this group about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Privacy</label>
                <select 
                  value={newGroupForm.type}
                  onChange={(e) => setNewGroupForm({...newGroupForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="Public Group">Public (Anyone can join and view posts)</option>
                  <option value="Private Group">Private (Only members can view posts)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newGroupForm.title) return;
                  const newGroup = {
                    ...newGroupForm,
                    members: "1",
                    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600",
                    coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200",
                    quote: "A journey of a thousand miles\nbegins with a single step.",
                    quoteAuthor: "Lao Tzu"
                  };
                  GROUPS.unshift(newGroup);
                  addGroupToDb(newGroup).catch(console.error);
                  setIsCreateGroupModalOpen(false);
                  navigate('/groups/' + encodeURIComponent(newGroupForm.title.toLowerCase().replace(/\s+/g, '-')), { state: { group: newGroup } });
                }}
                disabled={!newGroupForm.title}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal with Interactive Google Map */}
      <EventDetailModal
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        event={selectedEventModal}
        onToggleRsvp={(id) => toggleRSVP(id)}
      />

      {/* Digital Business Cards Manager Modal */}
      <DigitalCardsManagerModal
        isOpen={isDigitalCardsOpen}
        onClose={() => setIsDigitalCardsOpen(false)}
      />

      {/* Ceremony & Public Figure Invitations Manager Modal */}
      <InvitationsManagerModal
        isOpen={isInvitationsOpen}
        onClose={() => setIsInvitationsOpen(false)}
      />
    </div>
  );
}

