import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Bell, MessageSquare, Home, Users, ShoppingBag, 
  Calendar, Building2, Utensils, User, Star, BookOpen, Video, ChevronDown, MapPin, Heart, UserPlus, Settings, LogOut, Check, X, ShieldAlert, Sparkles, HelpCircle,
  Clock, Volume2, VolumeX, Play, AlertCircle, Plane
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { Logo } from "../Logo";
import { EventReminderBanner } from "../events/EventReminderBanner";
import { 
  checkUpcomingFavoriteEvents, 
  getTriggeredAlerts, 
  getUnreadAlertCount, 
  clearUnreadAlertCount, 
  triggerOneHourAlert, 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestBrowserPushPermission, 
  getPushPermissionStatus, 
  getEventTimeRemaining,
  TriggeredAlert,
  NotificationSettings
} from "../../utils/eventNotificationSystem";
import { getAllCommunityEvents, getFavoriteEventIds } from "../../utils/userEventsStorage";
import { EventItem } from "../../data/eventsData";
import { 
  subscribeNotifications, 
  subscribeEvents, 
  markNotificationAsReadInDb, 
  markAllNotificationsAsReadInDb, 
  AppNotification 
} from "../../lib/firestoreService";
import { useAd } from "../../contexts/AdContext";
import { GoogleAdSense } from "../ads/GoogleAdSense";
import { useSectionConfig, SectionKey } from "../../contexts/SectionContext";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  sectionKey?: SectionKey;
}

const MAIN_NAV: NavItem[] = [
  { name: "Home", path: "/", icon: Home },
  { name: "Directory", path: "/directory", icon: Users, sectionKey: "directory" },
  { name: "Classifieds & Auction", path: "/classifieds", icon: ShoppingBag, sectionKey: "classifieds" },
  { name: "Events", path: "/events", icon: Calendar, sectionKey: "events" },
  { name: "Temples", path: "/temples", icon: Building2, sectionKey: "temples" },
  { name: "Restaurants", path: "/restaurants", icon: Utensils, sectionKey: "restaurants" },
  { name: "Monks", path: "/monks", icon: User, sectionKey: "monks" },
  { name: "Famous People", path: "/famous", icon: Star, sectionKey: "famous" },
  { name: "Learn Buddhism", path: "/learn", icon: BookOpen, sectionKey: "learn" },
  { name: "Videos", path: "/videos", icon: Video, sectionKey: "videos" },
];

const AVAILABLE_LOCATIONS = [
  { city: "Los Angeles", country: "USA", label: "Los Angeles, USA" },
  { city: "Colombo", country: "Sri Lanka", label: "Colombo, Sri Lanka" },
  { city: "Kandy", country: "Sri Lanka", label: "Kandy, Sri Lanka" },
  { city: "Melbourne", country: "Australia", label: "Melbourne, Australia" },
  { city: "Sydney", country: "Australia", label: "Sydney, Australia" },
  { city: "London", country: "United Kingdom", label: "London, UK" },
  { city: "Toronto", country: "Canada", label: "Toronto, Canada" },
  { city: "New York", country: "USA", label: "New York, USA" },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const { adConfig } = useAd();
  const { isSectionEnabled } = useSectionConfig();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("lanka_selected_location") || "Los Angeles, USA";
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [notifTab, setNotifTab] = useState<'events' | 'community'>('events');
  const [favoritedEvents, setFavoritedEvents] = useState<EventItem[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [dbNotifications, setDbNotifications] = useState<AppNotification[]>([]);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [pushStatus, setPushStatus] = useState<NotificationPermission | 'unsupported'>('default');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const locationPickerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const currentUserId = user?.uid || 'guest';
  const unreadCommunityCount = dbNotifications.filter(n => !n.readBy || !n.readBy.includes(currentUserId)).length;
  const totalUnreadCount = unreadAlertsCount + unreadCommunityCount;

  const refreshNotificationData = () => {
    try {
      const favIds = getFavoriteEventIds();
      const allEvents = getAllCommunityEvents();
      setFavoritedEvents(allEvents.filter(e => favIds.includes(e.id)));
      setTriggeredAlerts(getTriggeredAlerts());
      setUnreadAlertsCount(getUnreadAlertCount());
      setNotifSettings(getNotificationSettings());
      setPushStatus(getPushPermissionStatus());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshNotificationData();
    // Run an initial check for 1-hour events
    checkUpcomingFavoriteEvents();

    // Subscribe to real-time notifications in Firebase Firestore
    const unsubNotifs = subscribeNotifications((list) => {
      setDbNotifications(list);
    }, user?.uid);

    // Subscribe to live events in Firebase Firestore
    const unsubEvents = subscribeEvents((list) => {
      const favIds = getFavoriteEventIds();
      setFavoritedEvents(list.filter(e => favIds.includes(e.id)));
    });

    // Background interval checking every 30 seconds
    const interval = setInterval(() => {
      checkUpcomingFavoriteEvents();
      refreshNotificationData();
    }, 30000);

    const handleFavUpdated = () => refreshNotificationData();
    const handleAlertsUpdated = () => refreshNotificationData();
    const handleSettingsUpdated = () => refreshNotificationData();
    const handleAlertRead = () => setUnreadAlertsCount(0);

    window.addEventListener('lanka_favorites_updated', handleFavUpdated);
    window.addEventListener('lanka_triggered_alerts_updated', handleAlertsUpdated);
    window.addEventListener('lanka_notification_settings_updated', handleSettingsUpdated);
    window.addEventListener('lanka_alerts_read', handleAlertRead);

    return () => {
      clearInterval(interval);
      unsubNotifs();
      unsubEvents();
      window.removeEventListener('lanka_favorites_updated', handleFavUpdated);
      window.removeEventListener('lanka_triggered_alerts_updated', handleAlertsUpdated);
      window.removeEventListener('lanka_notification_settings_updated', handleSettingsUpdated);
      window.removeEventListener('lanka_alerts_read', handleAlertRead);
    };
  }, [user]);

  const getNotifIcon = (section?: string) => {
    switch (section) {
      case 'events':
        return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Events' };
      case 'temples':
        return { icon: Building2, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Temples' };
      case 'videos':
        return { icon: Video, color: 'text-red-600', bg: 'bg-red-100', label: 'Videos' };
      case 'travel':
        return { icon: Plane, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Travel' };
      case 'classifieds':
        return { icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Marketplace' };
      case 'learn':
        return { icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Learn' };
      default:
        return { icon: Bell, color: 'text-neutral-600', bg: 'bg-neutral-100', label: 'Community' };
    }
  };

  const formatNotifTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return "Recently";
    }
  };

  const handleSimulateAlert = (event: EventItem) => {
    triggerOneHourAlert(event, true);
    showToast(`1-Hour Alert triggered for "${event.title}"!`);
  };

  const handleTogglePushPermission = async () => {
    if (pushStatus === 'granted') {
      const updated = saveNotificationSettings({ browserPushEnabled: !notifSettings.browserPushEnabled });
      setNotifSettings(updated);
      showToast(`Push notifications ${updated.browserPushEnabled ? 'enabled' : 'disabled'}`);
    } else {
      const granted = await requestBrowserPushPermission();
      setPushStatus(getPushPermissionStatus());
      if (granted) {
        showToast("Browser push notification permissions granted!");
      } else {
        showToast("Browser push permissions was not granted.");
      }
    }
  };

  const handleToggleSound = () => {
    const updated = saveNotificationSettings({ soundEnabled: !notifSettings.soundEnabled });
    setNotifSettings(updated);
    showToast(`Temple bell chime sound ${updated.soundEnabled ? 'turned ON' : 'turned OFF'}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (locationPickerRef.current && !locationPickerRef.current.contains(target)) {
        setShowLocationPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLocationSelect = (locLabel: string) => {
    setSelectedLocation(locLabel);
    localStorage.setItem("lanka_selected_location", locLabel);
    setShowLocationPicker(false);
    showToast(`Location switched to ${locLabel}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please enter a valid email address");
      return;
    }
    showToast("Thank you for subscribing to LankaBuddhist newsletters!");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1-Hour Event Reminder Banner */}
      <EventReminderBanner />

      {/* Community Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-neutral-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900">Community Guidelines</h3>
              </div>
              <button onClick={() => setShowGuidelines(false)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-neutral-700">
              <p className="font-medium text-neutral-900">
                Welcome to LankaBuddhist.com. We are dedicated to creating a serene, respectful, and enriching environment rooted in the Buddha Dhamma.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Right Speech & Kindness</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Communicate with compassion, courtesy, and respect. Disagreements must be handled constructively without hostility or harassment.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Dhamma Integrity</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Ensure Buddhist articles, sermons, and references are accurate and cited correctly from venerable Theros or canonical texts.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Authentic Listings & Respect</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Temple information, monk invites, marketplace items, and community events must be honest and verified.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Zero Tolerance for Exploitation</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Commercial spam, inappropriate content, and deceptive solicitations will result in immediate suspension.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setShowGuidelines(false)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
              >
                Understood & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Announcement Banner */}
      {adConfig.siteAnnouncement?.enabled && adConfig.siteAnnouncement?.text && (
        <div className={cn(
          "w-full text-xs font-medium py-2 px-4 transition-colors z-40 border-b",
          adConfig.siteAnnouncement.type === 'alert' && "bg-rose-600 text-white border-rose-700",
          adConfig.siteAnnouncement.type === 'warning' && "bg-amber-500 text-neutral-900 border-amber-600",
          adConfig.siteAnnouncement.type === 'success' && "bg-emerald-600 text-white border-emerald-700",
          (!adConfig.siteAnnouncement.type || adConfig.siteAnnouncement.type === 'info') && "bg-neutral-900 text-neutral-200 border-neutral-800"
        )}>
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                Announcement
              </span>
              <span className="truncate">{adConfig.siteAnnouncement.text}</span>
            </div>
            {adConfig.siteAnnouncement.linkText && adConfig.siteAnnouncement.linkUrl && (
              <Link 
                to={adConfig.siteAnnouncement.linkUrl} 
                className="underline font-bold whitespace-nowrap text-xs hover:opacity-80 shrink-0 ml-2"
              >
                {adConfig.siteAnnouncement.linkText} →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Super Admin Header Banner Ad */}
      {adConfig.placements?.headerBanner && adConfig.isGoogleAdActive && (
        <div className="bg-neutral-100 border-b border-neutral-200 py-1.5 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <GoogleAdSense placement="headerBanner" format="horizontal" />
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo & Search */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Logo className="w-8 h-8" textClassName="text-xl" showTagline={false} />
            </Link>
            
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community, monks, places..." 
                className="w-64 lg:w-80 pl-9 pr-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </form>

            {/* Location Selector */}
            <div className="relative" ref={locationPickerRef}>
              <button 
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="hidden xl:flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors"
                title="Change active location"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{selectedLocation}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {showLocationPicker && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-neutral-100 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Select Community Region
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {AVAILABLE_LOCATIONS.map((loc) => (
                      <button
                        key={loc.label}
                        onClick={() => handleLocationSelect(loc.label)}
                        className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{loc.label}</span>
                        </div>
                        {selectedLocation === loc.label && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/directory?view=messages" 
              className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            
            {/* Notifications Menu */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  const nextState = !showNotifications;
                  setShowNotifications(nextState);
                  if (nextState && unreadAlertsCount > 0) {
                    clearUnreadAlertCount();
                    setUnreadAlertsCount(0);
                  }
                }}
                className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                title="Notifications & Gathering Reminders"
              >
                <Bell className="w-5 h-5" />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white flex items-center justify-center min-w-[18px]">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-50 animate-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 leading-none">Notifications & Alerts</h3>
                        <p className="text-[10px] text-neutral-500 mt-0.5">1-Hour Reminders & Cross-Section Alerts</p>
                      </div>
                    </div>

                    {/* Quick Sound Toggle */}
                    <button
                      onClick={handleToggleSound}
                      className={cn(
                        "p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors",
                        notifSettings.soundEnabled 
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                          : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
                      )}
                      title={notifSettings.soundEnabled ? "Temple bell chime is ON" : "Temple bell chime is OFF"}
                    >
                      {notifSettings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                      <span className="text-[10px] font-bold hidden sm:inline">{notifSettings.soundEnabled ? "Chime On" : "Muted"}</span>
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-neutral-100 bg-neutral-50/40 text-xs font-bold">
                    <button
                      onClick={() => setNotifTab('events')}
                      className={cn(
                        "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all",
                        notifTab === 'events'
                          ? "border-amber-600 text-amber-700 bg-white"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      )}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Event Reminders</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold ml-1">
                        {favoritedEvents.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setNotifTab('community')}
                      className={cn(
                        "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all",
                        notifTab === 'community'
                          ? "border-amber-600 text-amber-700 bg-white"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      )}
                    >
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>All Sections</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                        {unreadCommunityCount > 0 ? unreadCommunityCount : dbNotifications.length}
                      </span>
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifTab === 'events' ? (
                      <div className="p-3 space-y-3">
                        {/* Browser Push Banner */}
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                            <div className="text-[11px] leading-tight">
                              <p className="font-bold text-neutral-900">1-Hour Web Push Alerts</p>
                              <p className="text-neutral-600 text-[10px]">
                                {pushStatus === 'granted' 
                                  ? (notifSettings.browserPushEnabled ? "Desktop notifications are enabled" : "Desktop push is currently muted")
                                  : "Enable desktop push notifications"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleTogglePushPermission}
                            className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors shadow-xs",
                              pushStatus === 'granted' && notifSettings.browserPushEnabled
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-amber-600 hover:bg-amber-700 text-white"
                            )}
                          >
                            {pushStatus === 'granted'
                              ? (notifSettings.browserPushEnabled ? "Active" : "Enable")
                              : "Request"}
                          </button>
                        </div>

                        {/* List of Favorited Events */}
                        {favoritedEvents.length === 0 ? (
                          <div className="text-center py-6 px-3 space-y-2">
                            <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
                            <p className="text-xs font-bold text-neutral-700">No favorited events yet</p>
                            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                              Click the Heart icon on any event to receive automatic 1-hour push and toast alerts before it starts.
                            </p>
                            <Link
                              to="/events"
                              onClick={() => setShowNotifications(false)}
                              className="inline-block mt-2 text-xs font-bold text-amber-600 hover:underline"
                            >
                              Browse Community Events →
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                              <span>Bookmarked Gatherings</span>
                              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                1h Auto-Alert Armed
                              </span>
                            </div>

                            {favoritedEvents.map((evt) => {
                              const remaining = getEventTimeRemaining(evt);
                              return (
                                <div
                                  key={evt.id}
                                  className="border border-neutral-100 hover:border-amber-200 rounded-xl p-2.5 bg-neutral-50/60 hover:bg-white transition-all space-y-2 group shadow-2xs"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <img
                                      src={evt.img}
                                      alt={evt.title}
                                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-200"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-xs text-neutral-900 line-clamp-1 group-hover:text-amber-700">
                                        {evt.title}
                                      </h4>
                                      <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                                        <span>{remaining.formattedCountdown}</span>
                                      </p>
                                      <p className="text-[10px] text-neutral-400 flex items-center gap-1 truncate mt-0.5">
                                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                        <span>{evt.loc}</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Quick Action row for testing and viewing */}
                                  <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 gap-1.5">
                                    <button
                                      onClick={() => handleSimulateAlert(evt)}
                                      className="flex-1 py-1 px-2 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-800 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                                      title="Test 1-Hour Alert (Plays bell chime + displays toast + web push)"
                                    >
                                      <Play className="w-3 h-3 fill-amber-700 text-amber-700" />
                                      <span>Test 1-Hr Alert</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setShowNotifications(false);
                                        navigate(`/events?selected=${evt.id}`);
                                      }}
                                      className="py-1 px-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-medium transition-colors"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Recent Triggered Alerts History */}
                        {triggeredAlerts.length > 0 && (
                          <div className="pt-2 border-t border-neutral-100 space-y-2">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
                              Recently Triggered Alerts
                            </span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {triggeredAlerts.slice(0, 4).map((alert) => (
                                <div
                                  key={alert.id}
                                  className="text-xs p-2 rounded-lg bg-white border border-neutral-100 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold text-neutral-800 text-[11px] truncate">
                                      {alert.eventTitle}
                                    </p>
                                    <p className="text-[10px] text-amber-600 font-medium">
                                      {alert.timeUntilLabel}
                                    </p>
                                  </div>
                                  <span className="text-[9px] text-neutral-400 shrink-0">
                                    {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {dbNotifications.length > 0 && (
                          <div className="flex items-center justify-between px-2 py-1 text-xs">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Cross-Section Alerts
                            </span>
                            {unreadCommunityCount > 0 && (
                              <button
                                onClick={async () => {
                                  await markAllNotificationsAsReadInDb(dbNotifications, currentUserId);
                                }}
                                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        )}

                        {dbNotifications.length === 0 ? (
                          <div className="text-center py-8 px-4 space-y-2">
                            <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                              <Bell className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold text-neutral-700">All caught up!</p>
                            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                              No active notifications. Live updates from events, temples, videos, and community discussions will appear here in real-time.
                            </p>
                            <Link
                              to="/directory?view=notifications"
                              onClick={() => setShowNotifications(false)}
                              className="inline-block mt-2 text-xs font-bold text-amber-600 hover:underline"
                            >
                              Open Notification Center →
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {dbNotifications.slice(0, 5).map((notif) => {
                              const isItemRead = notif.readBy && notif.readBy.includes(currentUserId);
                              const secIcon = getNotifIcon(notif.section);
                              const IconComponent = secIcon.icon;

                              return (
                                <div
                                  key={notif.id}
                                  onClick={async () => {
                                    if (!isItemRead) {
                                      await markNotificationAsReadInDb(notif.id, currentUserId, notif.readBy).catch(() => {});
                                    }
                                    setShowNotifications(false);
                                    navigate(notif.link || "/directory?view=notifications");
                                  }}
                                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer ${
                                    isItemRead
                                      ? "bg-white border-neutral-100 hover:bg-neutral-50/70"
                                      : "bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/80"
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${secIcon.bg} ${secIcon.color}`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${secIcon.bg} ${secIcon.color}`}>
                                        {secIcon.label}
                                      </span>
                                      <span className="text-[10px] text-neutral-400">
                                        {formatNotifTime(notif.createdAt)}
                                      </span>
                                    </div>
                                    <p className={`text-xs mt-1 leading-snug truncate ${isItemRead ? 'text-neutral-700 font-medium' : 'text-neutral-900 font-bold'}`}>
                                      {notif.title}
                                    </p>
                                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                                      {notif.message}
                                    </p>
                                  </div>
                                  {!isItemRead && (
                                    <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0 self-center" />
                                  )}
                                </div>
                              );
                            })}

                            <div className="pt-2 border-t border-neutral-100 text-center">
                              <Link 
                                to="/directory?view=notifications" 
                                onClick={() => setShowNotifications(false)}
                                className="text-xs font-semibold text-amber-700 hover:text-amber-800 block py-1"
                              >
                                See all section notifications & alerts ({dbNotifications.length}) →
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu or Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-neutral-100 p-1 pr-2 rounded-full border border-neutral-200 transition-all"
                >
                  <img 
                    referrerPolicy="no-referrer" 
                    src={user.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border border-neutral-200 object-cover" 
                  />
                  <div className="hidden lg:block text-left text-xs leading-none">
                    <p className="font-bold text-neutral-800">{user.name?.split(' ')[0] || "User"}</p>
                    <p className="text-[10px] text-amber-600 font-semibold">{user.role || user.plan || "Member"}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-semibold text-emerald-700">
                          {user.role === 'Super Admin' ? 'Super Admin' : 'Active Member'}
                        </span>
                        {user.provider === 'google' && (
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold border border-blue-200">
                            Google Account
                          </span>
                        )}
                        {user.provider === 'quick' && (
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <User className="w-4 h-4 text-neutral-500" />
                        Profile & Settings
                      </Link>
                      {(user.role === 'Super Admin' || user.email?.toLowerCase() === 'damika1316@gmail.com') && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          <Settings className="w-4 h-4 text-neutral-500" />
                          Super Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowGuidelines(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 text-left"
                      >
                        <HelpCircle className="w-4 h-4 text-neutral-500" />
                        Community Guidelines
                      </button>
                    </div>
                    <div className="border-t border-neutral-100 pt-1">
                      <button 
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center overflow-x-auto no-scrollbar border-t border-neutral-100">
          <nav className="flex items-center gap-1 min-w-max">
            {MAIN_NAV.filter((item) => !item.sectionKey || isSectionEnabled(item.sectionKey)).map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive 
                      ? "text-amber-700 bg-amber-50 font-bold" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 text-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
              <Logo className="w-8 h-8" textClassName="text-xl" showTagline={false} light={true} />
            </Link>
            <p className="mb-4 text-neutral-500 max-w-sm">Connecting Sri Lankans and spreading the Dhamma around the world. Join our community to learn, share, and grow.</p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active region: {selectedLocation}</span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              {isSectionEnabled("directory") && <li><Link to="/directory" className="hover:text-white transition-colors">Directory</Link></li>}
              {isSectionEnabled("classifieds") && <li><Link to="/classifieds" className="hover:text-white transition-colors">Classifieds & Auction</Link></li>}
              {isSectionEnabled("events") && <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>}
              {isSectionEnabled("temples") && <li><Link to="/temples" className="hover:text-white transition-colors">Temples</Link></li>}
              {isSectionEnabled("restaurants") && <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {isSectionEnabled("learn") && <li><Link to="/learn" className="hover:text-white transition-colors">Learn Buddhism</Link></li>}
              {isSectionEnabled("monks") && <li><Link to="/monks" className="hover:text-white transition-colors">Monks Register</Link></li>}
              {isSectionEnabled("videos") && <li><Link to="/videos" className="hover:text-white transition-colors">YouTube Videos</Link></li>}
              {isSectionEnabled("famous") && <li><Link to="/famous" className="hover:text-white transition-colors">Famous Personalities</Link></li>}
              <li>
                <button onClick={() => setShowGuidelines(true)} className="hover:text-white transition-colors text-left">
                  Community Guidelines
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Connected</h3>
            <p className="mb-3 text-neutral-500">Subscribe to our newsletter for community updates.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email" 
                className="bg-neutral-800 text-white px-3 py-2 rounded-l-md outline-none focus:ring-1 focus:ring-amber-500 w-full text-sm" 
              />
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-r-md hover:bg-amber-700 transition-colors font-medium text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-neutral-800 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <p>&copy; {new Date().getFullYear()} LankaBuddhist.com. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => setShowGuidelines(true)} className="hover:underline">Privacy & Terms</button>
            <Link to="/directory?view=messages" className="hover:underline">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
