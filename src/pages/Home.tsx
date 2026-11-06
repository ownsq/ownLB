import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Building2, User, Calendar, BookOpen, ShoppingBag, 
  MapPin, ChevronRight, PlayCircle, ThumbsUp, MessageSquare, Utensils,
  ShieldCheck, Globe, Heart, ChevronDown, ArrowRight, Check, CheckCircle2, Sparkles, X
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DiscoverNearYouWidget } from "../components/maps/DiscoverNearYouWidget";
import { GoogleAdSense } from "../components/ads/GoogleAdSense";
import { useSectionConfig } from "../contexts/SectionContext";
import { 
  subscribeEvents, 
  subscribePosts, 
  subscribeUsers, 
  subscribeTemples, 
  subscribeRestaurants,
  subscribeVideos,
  subscribeCourses
} from "../lib/firestoreService";

export function Home() {
  const { user } = useAuth();
  const { isSectionEnabled } = useSectionConfig();
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");
  const [locationSharing, setLocationSharing] = useState(false);
  const [postLikes, setPostLikes] = useState(0);
  const [hasLikedPost, setHasLikedPost] = useState(false);
  const [connectedPeople, setConnectedPeople] = useState<string[]>([]);
  const [showEventModal, setShowEventModal] = useState<any>(null);

  // Live Firestore Data States
  const [events, setEvents] = useState<any[]>([]);
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [featuredTemples, setFeaturedTemples] = useState<any[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);

  useEffect(() => {
    const unsubEvents = subscribeEvents((list) => setEvents(list.slice(0, 3)));
    const unsubPosts = subscribePosts((list) => setFeaturedPost(list.length > 0 ? list[0] : null));
    const unsubUsers = subscribeUsers((list) => {
      const others = list.filter((u: any) => u.uid !== user?.uid && u.email !== user?.email);
      setMembers(others.slice(0, 4));
    });
    const unsubTemples = subscribeTemples((list) => setFeaturedTemples(list.slice(0, 2)));
    const unsubRestaurants = subscribeRestaurants((list) => setFeaturedRestaurants(list.slice(0, 2)));
    const unsubVideos = subscribeVideos((list) => setFeaturedVideos(list.slice(0, 2)));
    const unsubCourses = subscribeCourses((list) => setFeaturedCourses(list.slice(0, 2)));

    return () => {
      unsubEvents();
      unsubPosts();
      unsubUsers();
      unsubTemples();
      unsubRestaurants();
      unsubVideos();
      unsubCourses();
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleLikePost = () => {
    if (hasLikedPost) {
      setPostLikes(prev => prev - 1);
      setHasLikedPost(false);
      showToast("Post like removed");
    } else {
      setPostLikes(prev => prev + 1);
      setHasLikedPost(true);
      showToast("You liked the Vesak Lantern Making Workshop post!");
    }
  };

  const toggleLocationSharing = () => {
    const newState = !locationSharing;
    setLocationSharing(newState);
    showToast(newState ? "Location sharing enabled! Showing nearby temples and restaurants." : "Location sharing disabled.");
  };

  const handleAddPerson = (name: string) => {
    if (connectedPeople.includes(name)) {
      setConnectedPeople(prev => prev.filter(p => p !== name));
      showToast(`Connection request cancelled for ${name}`);
    } else {
      setConnectedPeople(prev => [...prev, name]);
      showToast(`Connection request sent to ${name}!`);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 border-b border-neutral-200 overflow-x-auto no-scrollbar pt-2 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { name: "Community", icon: Users, path: "/", active: true },
          { name: "Temples", icon: Building2, path: "/temples", key: "temples" },
          { name: "Monks", icon: User, path: "/monks", key: "monks" },
          { name: "Famous People", icon: Sparkles, path: "/famous", key: "famous" },
          { name: "Restaurants", icon: Utensils, path: "/restaurants", key: "restaurants" },
          { name: "Videos", icon: PlayCircle, path: "/videos", key: "videos" },
          { name: "Events", icon: Calendar, path: "/events", key: "events" },
          { name: "Learn", icon: BookOpen, path: "/learn", key: "learn" },
          { name: "Marketplace", icon: ShoppingBag, path: "/classifieds", key: "classifieds" },
          { name: "Directory", icon: MapPin, path: "/directory", key: "directory" },
        ].filter(tab => !tab.key || isSectionEnabled(tab.key as any)).map((tab, i) => (
          <Link 
            key={i} 
            to={tab.path}
            className={`flex items-center gap-2 pb-4 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-[1px] ${
              tab.active 
                ? 'border-amber-600 text-amber-700 font-bold' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${tab.active ? 'text-amber-600' : 'text-neutral-400'}`} />
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-amber-900 text-white min-h-[360px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B4513]/90 via-[#8B4513]/70 to-transparent z-10"></div>
        <img 
          referrerPolicy="no-referrer" 
          src="https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&q=80&w=2000" 
          alt="Temple" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 mix-blend-overlay"
        />
        
        <div className="relative z-20 p-8 md:p-12 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            One community.<br/>Wherever life takes you.
          </h2>
          <p className="text-lg text-neutral-100 mb-8 max-w-lg">
            Connect with Sri Lankans around the world, discover places, attend events and grow together in Dhamma.
          </p>
          <div className="flex flex-wrap gap-4">
            {isSectionEnabled("directory") && (
              <Link 
                to="/directory" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <Users className="w-5 h-5" />
                Explore Community
              </Link>
            )}
            {isSectionEnabled("temples") && (
              <Link 
                to="/temples" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Find Nearby Temples
              </Link>
            )}
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-neutral-200 font-medium">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Safe</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Respectful</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Dhamma-focused</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: Building2, label: "Temples", sub: "Locate & visit", path: "/temples", color: "text-amber-600", bg: "bg-amber-50", hover: "group-hover:bg-amber-100", key: "temples" },
          { icon: User, label: "Monks", sub: "Spiritual guides", path: "/monks", color: "text-orange-600", bg: "bg-orange-50", hover: "group-hover:bg-orange-100", key: "monks" },
          { icon: Sparkles, label: "Famous People", sub: "National icons", path: "/famous", color: "text-purple-600", bg: "bg-purple-50", hover: "group-hover:bg-purple-100", key: "famous" },
          { icon: Utensils, label: "Restaurants", sub: "Authentic food", path: "/restaurants", color: "text-rose-600", bg: "bg-rose-50", hover: "group-hover:bg-rose-100", key: "restaurants" },
          { icon: PlayCircle, label: "Videos", sub: "Dhamma sermons", path: "/videos", color: "text-red-600", bg: "bg-red-50", hover: "group-hover:bg-red-100", key: "videos" },
          { icon: Calendar, label: "Events", sub: "Join gatherings", path: "/events", color: "text-amber-700", bg: "bg-amber-50", hover: "group-hover:bg-amber-100", key: "events" },
          { icon: BookOpen, label: "Learn Dhamma", sub: "Courses & guides", path: "/learn", color: "text-emerald-700", bg: "bg-emerald-50", hover: "group-hover:bg-emerald-100", key: "learn" },
          { icon: ShoppingBag, label: "Marketplace", sub: "Community trade", path: "/classifieds", color: "text-blue-600", bg: "bg-blue-50", hover: "group-hover:bg-blue-100", key: "classifieds" },
        ].filter(item => !item.key || isSectionEnabled(item.key as any)).map((item, i) => (
          <Link key={i} to={item.path} className="bg-white p-3.5 rounded-2xl border border-neutral-200 hover:border-amber-300 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2 group">
            <div className={`p-2.5 rounded-xl ${item.bg} ${item.hover} transition-colors ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-xs group-hover:text-amber-700 transition-colors">{item.label}</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Discover Near You Interactive Map */}
          <DiscoverNearYouWidget />

          {/* Featured Community Post */}
          {featuredPost ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  referrerPolicy="no-referrer" 
                  src={featuredPost.authorImg || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=150"} 
                  alt={featuredPost.author || "Community Member"} 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">{featuredPost.author}</h4>
                  <p className="text-[10px] text-neutral-500">{featuredPost.time || "Recently"}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-700 mb-3 leading-relaxed">
                {featuredPost.content}
              </p>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-3 mt-1">
                <button 
                  onClick={handleLikePost}
                  className={`flex items-center gap-1.5 transition-colors ${hasLikedPost ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
                >
                  <span className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]">👍</span>
                  <span>{postLikes}</span>
                </button>
                <Link to="/directory?view=feed" className="hover:text-neutral-900 transition-colors font-medium text-amber-700">
                  View feed &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
              <MessageSquare className="w-7 h-7 text-amber-600 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-neutral-900 mb-1">Community Feed</h4>
              <p className="text-xs text-neutral-500 mb-3">Share your reflections, blessings, or local events with the global community.</p>
              <Link to="/directory?view=feed" className="text-xs font-bold text-amber-700 hover:underline">
                Share an update &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Upcoming this week */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Upcoming this week</h3>
              <Link to="/events" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="p-0">
              {events.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">No upcoming gatherings scheduled yet</p>
                  <p className="text-xs text-neutral-400 mt-1 mb-3">Be the first to host or publish a meditation, chanting, or cultural gathering.</p>
                  <Link to="/events" className="inline-block px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors">
                    Host an Event
                  </Link>
                </div>
              ) : (
                events.map((event) => {
                  const d = new Date(event.date || Date.now());
                  const day = isNaN(d.getDate()) ? "—" : d.getDate();
                  const month = isNaN(d.getMonth()) ? "EVT" : d.toLocaleString("default", { month: "short" }).toUpperCase();
                  return (
                    <div 
                      key={event.id} 
                      onClick={() => navigate('/events')}
                      className="flex gap-4 p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer group items-center"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="text-xs font-bold text-red-600">{month}</span>
                        <span className="text-xl font-bold text-neutral-900 leading-none mt-0.5">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-neutral-900 truncate group-hover:text-amber-700 transition-colors">{event.title}</h4>
                        <p className="text-xs text-neutral-500 truncate mt-1">{event.location || event.city || "Online"}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{event.time || event.date}</p>
                      </div>
                      <img referrerPolicy="no-referrer" src={event.image || event.img || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200"} alt={event.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
            <Link 
              to="/events" 
              className="w-full py-3 text-xs text-blue-600 font-medium border-t border-neutral-100 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1 block text-center"
            >
              View all events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Featured Places */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Featured places</h3>
              <Link to="/directory" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="p-4 relative">
              {featuredTemples.length === 0 && featuredRestaurants.length === 0 ? (
                <div className="p-6 text-center">
                  <Building2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">No places listed yet</p>
                  <p className="text-xs text-neutral-400 mt-1 mb-3">Add temples, meditation centers, and Sri Lankan restaurants worldwide.</p>
                  <Link to="/temples" className="inline-block px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors">
                    Explore Directory
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredTemples.map((temple) => (
                    <Link 
                      key={temple.id}
                      to="/temples" 
                      className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm group cursor-pointer block hover:border-amber-300 transition-all"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img referrerPolicy="no-referrer" src={temple.imageUrl || temple.image || "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=300"} alt={temple.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3 bg-white">
                        <h4 className="font-bold text-sm text-neutral-900 truncate mb-0.5 group-hover:text-amber-700 transition-colors">{temple.name}</h4>
                        <p className="text-xs text-neutral-500 truncate mb-2">{temple.location || temple.address}</p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">★ 4.9</span>
                          <span className="text-neutral-300">•</span>
                          <span className="text-neutral-500">{temple.sect || "Theravada"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {featuredRestaurants.map((rest) => (
                    <Link 
                      key={rest.id}
                      to="/restaurants" 
                      className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm group cursor-pointer block hover:border-amber-300 transition-all"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img referrerPolicy="no-referrer" src={rest.image || "https://images.unsplash.com/photo-1583391733958-d15a08365853?auto=format&fit=crop&q=80&w=300"} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3 bg-white">
                        <h4 className="font-bold text-sm text-neutral-900 truncate mb-0.5 group-hover:text-amber-700 transition-colors">{rest.name}</h4>
                        <p className="text-xs text-neutral-500 truncate mb-2">{rest.city || rest.address || "Worldwide"}</p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">★ {rest.rating || "4.8"}</span>
                          <span className="text-neutral-300">•</span>
                          <span className="text-neutral-500">{rest.cuisine || "Sri Lankan"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Continue Learning */}
          {isSectionEnabled("learn") && (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {featuredCourses.length > 0 ? (
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 relative min-h-[160px] md:min-h-auto">
                    <img 
                      referrerPolicy="no-referrer" 
                      src={featuredCourses[0].image || featuredCourses[0].thumbnail || "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400"} 
                      alt={featuredCourses[0].title} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                      <BookOpen className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="p-6 w-full md:w-1/2 flex flex-col justify-center">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Featured Course</span>
                      <h4 className="font-bold text-base text-neutral-900 mt-1 line-clamp-1">{featuredCourses[0].title}</h4>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {featuredCourses[0].desc || featuredCourses[0].description || `Guided teachings by ${featuredCourses[0].instructor || "Venerable Sangha"}`}
                      </p>
                    </div>
                    <Link 
                      to="/learn" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      Explore Course <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Dhamma Studies</span>
                      <h4 className="font-bold text-sm text-neutral-900 mt-0.5">Explore Sutta Studies & Meditation</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">Learn foundational Pali canons, mindfulness, and daily reflections.</p>
                    </div>
                  </div>
                  <Link 
                    to="/learn" 
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                  >
                    Browse Lessons <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User Profile Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3 mb-5">
              <img 
                referrerPolicy="no-referrer" 
                src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} 
                alt={user?.name || "Damika"} 
                className="w-12 h-12 rounded-full object-cover border border-neutral-100" 
              />
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1">
                  Ayubowan! {user?.name?.split(' ')[0] || "Damika"} 👋
                </h3>
                <p className="text-[10px] text-neutral-500 mb-1">{user?.email || "damika1316@gmail.com"}</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Verified Member • {user?.plan || "Premium"}
                </div>
              </div>
            </div>
            <div className="w-full pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-900 mb-3">Community activity</h4>
              <div className="space-y-2.5">
                {isSectionEnabled("events") && (
                  <Link to="/events" className="flex items-center gap-3 text-xs hover:text-amber-600 transition-colors">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <div><span className="font-bold text-neutral-900">{events.length}</span> <span className="text-neutral-500">Upcoming gatherings</span></div>
                  </Link>
                )}
                {isSectionEnabled("directory") && (
                  <Link to="/directory?view=people" className="flex items-center gap-3 text-xs hover:text-amber-600 transition-colors">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <div><span className="font-bold text-neutral-900">{Math.max(members.length, 1)}</span> <span className="text-neutral-500">Active members</span></div>
                  </Link>
                )}
                {isSectionEnabled("learn") && (
                  <Link to="/learn" className="flex items-center gap-3 text-xs hover:text-amber-600 transition-colors">
                    <BookOpen className="w-4 h-4 text-neutral-400" />
                    <div><span className="font-bold text-neutral-900">{featuredCourses.length}</span> <span className="text-neutral-500">Dhamma courses</span></div>
                  </Link>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <Link to="/profile" className="text-xs text-amber-700 font-bold hover:underline block text-center">
                  Edit Profile & Preferences &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Google AdSense Advertisement */}
          <GoogleAdSense placement="home" />
          
          {/* Live Dhamma */}
          {isSectionEnabled("videos") && (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm">Dhamma Videos</h3>
                <Link to="/videos" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
              </div>
              <div className="p-4">
                {featuredVideos.length === 0 ? (
                  <div className="text-center py-6">
                    <PlayCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-600 font-medium">No videos uploaded yet</p>
                    <p className="text-[11px] text-neutral-400 mt-1 mb-3">Share your favorite Dhamma sermon YouTube link with the community.</p>
                    <Link to="/videos" className="inline-block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">
                      Share Video
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link to="/videos" className="block relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer mb-3">
                      <img 
                        referrerPolicy="no-referrer" 
                        src={featuredVideos[0].img || "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=400"} 
                        alt={featuredVideos[0].title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                          <PlayCircle className="w-5 h-5 text-neutral-900 fill-neutral-900" />
                        </div>
                      </div>
                      {featuredVideos[0].isLive && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">LIVE</div>
                      )}
                    </Link>
                    <Link to="/videos" className="block">
                      <h4 className="font-bold text-xs text-neutral-900 line-clamp-2 hover:text-amber-700 cursor-pointer transition-colors leading-tight mb-1">
                        {featuredVideos[0].title}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-neutral-500 mb-2">{featuredVideos[0].author || "Venerable Sangha"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1 text-neutral-600 font-medium">
                        <Users className="w-3 h-3 text-red-500" /> {featuredVideos[0].views || "Dhamma Sermon"}
                      </span>
                      <span>•</span>
                      <span>{featuredVideos[0].category || "Dharma Deshana"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* People you may know */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">People you may know</h3>
              <Link to="/directory?view=people" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="p-4 space-y-4">
              {members.length === 0 ? (
                <div className="py-4 text-center">
                  <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">No other members registered yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Invite your family and friends to connect!</p>
                </div>
              ) : (
                members.map((person, i) => {
                  const personName = person.displayName || person.name || "Community Member";
                  const personLoc = person.location || person.country || "Global";
                  const personImg = person.photoURL || person.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;
                  const isConnected = connectedPeople.includes(personName);
                  return (
                    <div key={person.uid || person.id || i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img referrerPolicy="no-referrer" src={personImg} alt={personName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-neutral-900">{personName}</h4>
                          <p className="text-[9px] text-neutral-500">{personLoc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddPerson(personName)}
                        className={`text-[10px] font-medium px-3 py-1 rounded-md transition-colors shadow-sm flex items-center gap-1 ${
                          isConnected 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'text-amber-700 bg-white border border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Requested
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Banner */}
      <div className="bg-[#FAF8F5] rounded-xl border border-neutral-200 p-6 flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left mt-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-amber-700 bg-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 mb-0.5">Safe & respectful community</h4>
            <p className="text-[10px] text-neutral-500">Report, block and privacy controls to keep you safe.</p>
          </div>
        </div>
        <div className="hidden md:block w-px h-8 bg-neutral-200" />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-amber-700 bg-white shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 mb-0.5">Dhamma-focused</h4>
            <p className="text-[10px] text-neutral-500">Inspiring content, meaningful connections.</p>
          </div>
        </div>
        <div className="hidden md:block w-px h-8 bg-neutral-200" />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-amber-700 bg-white shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-neutral-900 mb-0.5">Worldwide network</h4>
            <p className="text-[10px] text-neutral-500">Sri Lankans in 120+ countries.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
