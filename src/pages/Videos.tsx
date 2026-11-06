import React, { useState, useMemo, useEffect } from "react";
import { 
  PlaySquare, Radio, Compass, ListVideo, Users, Clock, 
  ThumbsUp, History, Upload, UserCheck, ChevronRight, Play, 
  MoreVertical, ShieldAlert, Flag, Info, AlertTriangle, 
  UploadCloud, Youtube, Filter, Search, Grid, List, X, Sparkles, Share2, Check, Bookmark,
  Edit3, ExternalLink, Plus
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  VideoItem, 
  UserChannel, 
  getAllVideos, 
  uploadUserVideo, 
  getUserChannel, 
  getUserUploadedVideos 
} from "../utils/userVideosStorage";
import { subscribeVideos } from "../lib/firestoreService";

const CATEGORY_NAMES = [
  "All",
  "Dharma Deshana",
  "Meditation",
  "Pirith & Chanting",
  "Buddhist Teachings",
  "Dhamma for Kids",
  "History & Culture",
];

export function Videos() {
  const [toastMessage, setToastMessage] = useState("");
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "channel" ? "My Channel" : "Overview";
  const [videos, setVideos] = useState<VideoItem[]>(getAllVideos);
  const [channel, setChannel] = useState<UserChannel>(getUserChannel);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [watchLater, setWatchLater] = useState<string[]>([]);

  // Dynamic categories with live counts from database
  const categories = useMemo(() => {
    return CATEGORY_NAMES.map(name => {
      const count = name === "All" 
        ? videos.length 
        : videos.filter(v => v.category === name).length;
      return {
        name,
        count: `${count} ${count === 1 ? 'video' : 'videos'}`
      };
    });
  }, [videos]);

  // Synchronize with storage & Firestore updates
  useEffect(() => {
    const unsub = subscribeVideos((liveVideos) => {
      setVideos(liveVideos || []);
    });

    const handleVideos = () => {
      setVideos(getAllVideos());
      setChannel(getUserChannel());
    };
    const handleChannel = () => {
      setChannel(getUserChannel());
    };
    window.addEventListener('lanka_videos_updated', handleVideos);
    window.addEventListener('lanka_channel_updated', handleChannel);
    return () => {
      unsub();
      window.removeEventListener('lanka_videos_updated', handleVideos);
      window.removeEventListener('lanka_channel_updated', handleChannel);
    };
  }, []);

  // Modals
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", url: "", author: "", category: "Dharma Deshana" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedVideos.includes(id)) {
      setLikedVideos(likedVideos.filter(v => v !== id));
      showToast("Removed from liked videos");
    } else {
      setLikedVideos([...likedVideos, id]);
      showToast("Added to liked videos!");
    }
  };

  const toggleWatchLater = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (watchLater.includes(id)) {
      setWatchLater(watchLater.filter(v => v !== id));
      showToast("Removed from Watch Later");
    } else {
      setWatchLater([...watchLater, id]);
      showToast("Saved to Watch Later playlist!");
    }
  };

  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.url) {
      showToast("Please provide video title and YouTube link");
      return;
    }
    const uploaded = uploadUserVideo({
      title: submitForm.title,
      category: submitForm.category,
      desc: "Community submitted Dhamma sermon from YouTube.",
      videoUrl: submitForm.url,
      speaker: submitForm.author || "Community Contributor"
    });
    setVideos(getAllVideos());
    showToast(`Video "${uploaded.title}" uploaded to your channel & community feed!`);
    setShowSubmitModal(false);
    setSubmitForm({ title: "", url: "", author: "", category: "Dharma Deshana" });
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchCat = activeCategory === "All" || v.category === activeCategory;
      const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchTab = true;
      if (activeTab === "Live Stream") matchTab = !!v.isLive;
      if (activeTab === "Liked Videos") matchTab = likedVideos.includes(v.id);
      if (activeTab === "Watch Later") matchTab = watchLater.includes(v.id);
      if (activeTab === "My Channel") matchTab = !!(v.isUserUploaded || v.authorId === "damika-user" || v.author.toLowerCase().includes("damika"));

      return matchCat && matchSearch && matchTab;
    });
  }, [videos, activeCategory, searchQuery, activeTab, likedVideos, watchLater]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto pb-12">
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

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveVideoModal(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {activeVideoModal.category}
                </span>
                <h3 className="font-bold text-xl text-neutral-900 mt-1">{activeVideoModal.title}</h3>
                <p className="text-xs text-neutral-500">{activeVideoModal.author} • {activeVideoModal.views}</p>
              </div>
              <button onClick={() => setActiveVideoModal(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Simulated Embedded Player */}
              <div className="relative aspect-video bg-neutral-950 rounded-xl overflow-hidden flex items-center justify-center group shadow-inner">
                <img src={activeVideoModal.img} alt={activeVideoModal.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                  <span className="text-white font-bold text-xs mt-3 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    {activeVideoModal.isLive ? "LIVE STREAM BROADCAST" : `Playing Video (${activeVideoModal.duration || "28:45"})`}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
                <h4 className="font-bold text-neutral-900 mb-1">Discourse Description</h4>
                <p>{activeVideoModal.desc || "A sacred Dhamma discourse shared for the benefit and spiritual upliftment of the community."}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleLike(activeVideoModal.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      likedVideos.includes(activeVideoModal.id)
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedVideos.includes(activeVideoModal.id) ? 'fill-rose-500' : ''}`} />
                    {likedVideos.includes(activeVideoModal.id) ? "Liked" : "Like"}
                  </button>

                  <button 
                    onClick={() => toggleWatchLater(activeVideoModal.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      watchLater.includes(activeVideoModal.id)
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${watchLater.includes(activeVideoModal.id) ? 'fill-amber-500' : ''}`} />
                    {watchLater.includes(activeVideoModal.id) ? "Saved" : "Watch Later"}
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                    showToast("Video link copied to clipboard!");
                  }}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-medium flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit YouTube Link Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">Submit Dhamma Video</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitVideo} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">YouTube URL</label>
                <input 
                  type="url" 
                  value={submitForm.url} 
                  onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Video Title</label>
                <input 
                  type="text" 
                  value={submitForm.title} 
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                  placeholder="e.g. Sutta Chanting & Dhamma Sermon" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Venerable Speaker</label>
                  <input 
                    type="text" 
                    value={submitForm.author} 
                    onChange={(e) => setSubmitForm({ ...submitForm, author: e.target.value })} 
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                    placeholder="e.g. Ven. Rathana Thero" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                  <select 
                    value={submitForm.category} 
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })} 
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    {categories.filter(c => c.name !== "All").map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 text-xs text-neutral-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm">
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Left Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-sm space-y-1">
          {[
            { name: "Overview", icon: PlaySquare },
            { 
              name: "My Channel", 
              icon: UserCheck, 
              badge: `${videos.filter(v => v.isUserUploaded || v.authorId === 'damika-user' || v.author.toLowerCase().includes('damika')).length}` 
            },
            { name: "Live Stream", icon: Radio, badge: "LIVE" },
            { name: "Watch Later", icon: Clock },
            { name: "Liked Videos", icon: ThumbsUp },
          ].map((item) => (
            <button 
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                showToast(`Viewing: ${item.name}`);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === item.name 
                  ? 'bg-red-50 text-red-600 font-bold border border-red-200' 
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-neutral-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.name === "My Channel" ? "bg-amber-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Share Video CTA */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5 space-y-3">
          <h4 className="font-bold text-sm text-red-950">Share Dhamma Videos</h4>
          <p className="text-xs text-red-700 leading-relaxed">Submit YouTube links to help other devotees listen and practice the teachings.</p>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Submit YouTube Link
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Channel Management Header when in My Channel tab */}
        {activeTab === "My Channel" && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="h-28 sm:h-36 relative overflow-hidden bg-neutral-900">
              <img src={channel.banner} alt={channel.channelName} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-10 sm:-mt-12 relative">
              <div className="flex items-center gap-3">
                <img src={channel.avatar} alt={channel.channelName} className="w-16 h-16 rounded-2xl border-2 border-white shadow-md object-cover bg-white shrink-0" />
                <div className="pt-2 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-neutral-900">{channel.channelName}</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Verified Channel</span>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">{channel.handle} • {channel.subscribersCount} subscribers • {channel.totalViews} views</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 sm:pt-4">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>
                <Link
                  to="/profile?tab=channel"
                  className="px-3.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Channel Studio in Profile</span>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Search & Categories Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sermons, speaker or topics..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.name 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.name ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-200/70 text-neutral-500'}`}>
                  {cat.count.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900">
              {activeTab === "Live Stream" ? "Live Broadcasts" : "Recommended Dhamma Videos"} ({filteredVideos.length})
            </h3>
            <span className="text-xs text-neutral-400">Click any video to play</span>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <PlaySquare className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">No Dhamma videos found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {searchQuery 
                  ? `No videos match your search "${searchQuery}". Try different keywords or browse all categories.`
                  : `No videos have been uploaded to this category yet. Submit a YouTube link to share Dhamma teachings with the community.`
                }
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Submit YouTube Video
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => setActiveVideoModal(video)}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-red-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.img} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                        <Play className="w-4 h-4 fill-red-600 text-red-600 ml-0.5" />
                      </div>
                    </div>
                    {video.isLive ? (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight mb-1">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate">{video.author}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{video.views}</span>
                      <span>{video.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Videos;
