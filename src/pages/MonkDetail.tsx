import React, { useState } from "react";
import { 
  User, MapPin, Building2, Video, Calendar, Search, 
  MessageSquare, Heart, CheckCircle2, ChevronRight, 
  Globe, Phone, Mail, Link as LinkIcon, Share2, Users, 
  Star, BookOpen, PlayCircle, ShieldCheck, X, Sparkles,
  Send, ExternalLink, Clock, ThumbsUp, Award, HelpCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MONKS_DATA, Monk, MonkReview } from "../data/monksData";
import { InviteMonkModal } from "../components/monks/InviteMonkModal";
import { MonkProgramsModal } from "../components/monks/MonkProgramsModal";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, MAP_ATTRIBUTION_IDS, getCoordinatesForLocation } from "../utils/googleMapsConfig";

import { getMonkFromDb } from "../lib/firestoreService";

export function MonkDetail() {
  const { id } = useParams();
  const [monk, setMonk] = useState<Monk | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProgramsModalOpen, setIsProgramsModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [galleryLightboxImg, setGalleryLightboxImg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsList, setReviewsList] = useState<MonkReview[]>([]);

  React.useEffect(() => {
    if (!id) return;
    getMonkFromDb(id).then((found) => {
      if (found) {
        setMonk(found);
        setReviewsList(found.reviews || []);
      }
      setLoading(false);
    });
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleFollow = () => {
    if (!monk) return;
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      showToast(`You have unfollowed ${monk.name}.`);
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      showToast(`You are now following ${monk.name}. Blessings!`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Monk profile URL copied to clipboard!");
    } else {
      showToast("Profile link ready to share.");
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev: MonkReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim() || "Devotee",
      rating: reviewRating,
      date: "Just now",
      comment: reviewComment.trim(),
      location: reviewLocation.trim() || "Community Member"
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewComment("");
    setReviewAuthor("");
    setReviewLocation("");
    showToast("Sadhu! Your gratitude note and feedback have been posted.");
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-600 font-medium">Loading venerable monk profile...</p>
      </div>
    );
  }

  if (!monk) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <User className="w-14 h-14 text-neutral-300 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Monk Profile Not Found</h2>
        <p className="text-sm text-neutral-500">
          The requested monk profile could not be found or may have been updated.
        </p>
        <Link
          to="/monks"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          &larr; Return to Monks Directory
        </Link>
      </div>
    );
  }

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

      {/* Invite Modal */}
      <InviteMonkModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        selectedMonk={monk}
        onSuccess={(details) => {
          showToast(`Invitation sent for ${details.monkName}!`);
        }}
      />

      {/* Video Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-orange-500" /> Dhamma Video Player
              </span>
              <button onClick={() => setActiveVideoModal(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-6 text-white space-y-3">
                <div className="w-16 h-16 rounded-full bg-orange-600/90 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base">{activeVideoModal}</h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Dhamma discourse stream by {monk.name}. Recorded with binaural audio for meditation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      showToast("Playing sermon audio stream...");
                      setActiveVideoModal(null);
                    }}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Listen to Dhamma Stream
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox */}
      {galleryLightboxImg && (
        <div 
          onClick={() => setGalleryLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={galleryLightboxImg} alt="Enlarged" className="w-full h-full object-contain max-h-[80vh]" />
            <button 
              onClick={() => setGalleryLightboxImg(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/monks" className="hover:text-orange-600 transition-colors">Monks Register</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold">{monk.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-200 shadow-xs shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{monk.name}</h1>
            <p className="text-sm text-neutral-500">
              {monk.monasticTitle || "Senior Buddhist Monk"} • {monk.temple}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="p-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl transition-colors shadow-xs"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm"
          >
            <Calendar className="w-4 h-4" />
            Invite for Bana Program
          </button>
        </div>
      </div>

      {/* Top Nav Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-white p-3.5 rounded-xl border border-neutral-200 flex items-center gap-3 hover:border-orange-500 hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900">Invite Monk</div>
            <div className="text-[10px] text-neutral-500 font-normal">Invite to your event</div>
          </div>
        </button>

        <Link 
          to="/monks"
          className="bg-white p-3.5 rounded-xl border border-neutral-200 flex items-center gap-3 hover:border-orange-500 hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900">Find Monks</div>
            <div className="text-[10px] text-neutral-500 font-normal">Search by country</div>
          </div>
        </Link>

        <button 
          onClick={() => setActiveTab("Bana Programs")}
          className={`p-3.5 rounded-xl border flex items-center gap-3 hover:shadow-xs transition-all text-left ${
            activeTab === "Bana Programs" ? "bg-orange-50 border-orange-400" : "bg-white border-neutral-200"
          }`}
        >
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900">Bana Program</div>
            <div className="text-[10px] text-neutral-500 font-normal">View sermons schedule</div>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab("Dhamma School")}
          className={`p-3.5 rounded-xl border flex items-center gap-3 hover:shadow-xs transition-all text-left ${
            activeTab === "Dhamma School" ? "bg-orange-50 border-orange-400" : "bg-white border-neutral-200"
          }`}
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900">Dhamma School</div>
            <div className="text-[10px] text-neutral-500 font-normal">Sunday school lessons</div>
          </div>
        </button>

        <Link 
          to="/monks"
          className="bg-white p-3.5 rounded-xl border border-neutral-200 flex items-center gap-3 hover:border-orange-500 hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900">Monk Directory</div>
            <div className="text-[10px] text-neutral-500 font-normal">View all 2,458 monks</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col items-center text-center shadow-xs">
            <div className="relative mb-4">
              <img 
                referrerPolicy="no-referrer" 
                src={monk.img} 
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg bg-orange-50" 
                alt={monk.name} 
              />
              {monk.verified && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Monk
                </div>
              )}
            </div>
            
            <h2 className="font-bold text-xl text-neutral-900 mb-0.5">{monk.name}</h2>
            <p className="text-xs text-neutral-600 mb-2">{monk.temple}</p>
            
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-50 px-3 py-1 rounded-full mb-5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> {monk.loc}
            </div>
            
            <button 
              onClick={handleToggleFollow}
              className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs ${
                isFollowing 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <User className="w-4 h-4" /> {isFollowing ? "Following Spiritual Guide" : "Follow Guide"}
            </button>
            
            <div className="flex items-center justify-between w-full pt-5 border-t border-neutral-100 px-2 mt-5">
              <div className="text-center">
                <div className="font-bold text-base text-neutral-900">{followerCount}</div>
                <div className="text-[10px] text-neutral-500">Followers</div>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              <div className="text-center">
                <div className="font-bold text-base text-neutral-900">{monk.rating} ★</div>
                <div className="text-[10px] text-neutral-500">{monk.reviewsCount || 84} Reviews</div>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              <div className="text-center">
                <div className="font-bold text-base text-neutral-900">{monk.programs || 45}</div>
                <div className="text-[10px] text-neutral-500">Bana Programs</div>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Tabs */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <nav className="flex flex-col">
              {[
                { name: "Overview", icon: User },
                { name: "About Me", icon: BookOpen },
                { name: "Bana Programs", icon: Heart },
                { name: "Monastery & Map", icon: MapPin },
                { name: "YouTube Videos", icon: Video },
                { name: "Dhamma School", icon: Building2 },
                { name: "Events & Invitations", icon: Calendar },
                { name: "Gallery", icon: Share2 },
                { name: "Reviews & Feedback", icon: MessageSquare },
              ].map((tab) => {

                const Icon = tab.icon;
                const isSelected = activeTab === tab.name;
                return (
                  <button 
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)} 
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
                      isSelected 
                        ? 'text-orange-700 bg-orange-50 border-orange-600' 
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-orange-600" : "text-neutral-400"}`} /> 
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Invite Block */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-center shadow-xs">
            <h3 className="font-bold text-amber-950 mb-1">Invite for a Bana Program</h3>
            <p className="text-xs text-amber-800 mb-4 opacity-90">
              Invite {monk.name} for your temple, family occasion, or online gathering.
            </p>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all text-xs shadow-xs"
            >
              Send Official Invitation
            </button>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3.5">
            <h3 className="font-bold text-neutral-900 text-sm">Contact Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Temple Phone</div>
                  <div className="font-medium text-neutral-800">{monk.phone}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Mobile</div>
                  <div className="font-medium text-neutral-800">{monk.mobile}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Email</div>
                  <a href={`mailto:${monk.email}`} className="text-orange-600 hover:underline">
                    {monk.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Website</div>
                  <a href={monk.website} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline flex items-center gap-1">
                    {monk.website.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-100">
                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1.5">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {monk.languages.map((lang) => (
                    <span key={lang} className="text-[10px] bg-neutral-100 font-semibold text-neutral-700 px-2 py-0.5 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Main Content Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Banner Image */}
          <div className="relative rounded-2xl overflow-hidden h-60 md:h-72 bg-neutral-900 group shadow-md">
            <img 
              referrerPolicy="no-referrer" 
              src={monk.coverImg || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200"} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              alt="Cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10 max-w-lg">
              <span className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                Noble Disciples of the Buddha
              </span>
              <h2 className="text-xl md:text-2xl font-serif italic text-white leading-relaxed mb-3">
                &ldquo;Peace comes from within. Do not seek it without.&rdquo;
              </h2>
              <p className="text-neutral-300 text-xs font-medium tracking-wide">
                — Venerable Monastic Guide
              </p>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3">
                  Spiritual Summary
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {monk.bio}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Tradition</span>
                    <p className="font-bold text-xs text-neutral-900 mt-0.5">{monk.tradition}</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Ordination</span>
                    <p className="font-bold text-xs text-neutral-900 mt-0.5">{monk.ordinationYear} (Upasampada)</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Location</span>
                    <p className="font-bold text-xs text-neutral-900 mt-0.5">{monk.loc}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Programs Highlight */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-bold text-base text-neutral-900">Upcoming Bana Programs</h3>
                  <button 
                    onClick={() => setActiveTab("Bana Programs")}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    View All Programs
                  </button>
                </div>
                <div className="space-y-3">
                  {monk.banaPrograms && monk.banaPrograms.length > 0 ? (
                    monk.banaPrograms.slice(0, 2).map((prog) => (
                      <div key={prog.id} className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-sm text-neutral-900">{prog.title}</h4>
                          <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full shrink-0">
                            {prog.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                          <span className="flex items-center gap-1 font-medium text-orange-900">
                            <Calendar className="w-3.5 h-3.5 text-orange-600" /> {prog.date}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-500">
                            <Clock className="w-3.5 h-3.5" /> {prog.time}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-500">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {prog.location}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500">No public upcoming programs scheduled currently.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: About Me */}
          {activeTab === "About Me" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
                Monastic Journey & Background
              </h3>
              <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
                {monk.aboutMe && monk.aboutMe.length > 0 ? (
                  monk.aboutMe.map((paragraph, idx) => (
                    <p key={idx} className="flex gap-2.5">
                      <span className="text-orange-500 font-bold shrink-0">•</span>
                      <span>{paragraph}</span>
                    </p>
                  ))
                ) : (
                  <p>{monk.bio}</p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-bold text-sm text-neutral-900 mb-3">Monastic Lineage & Qualifications</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-50 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">Higher Ordination (Upasampada)</span>
                    <span className="text-neutral-500">{monk.ordinationYear}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">Fraternity / Nikaya</span>
                    <span className="text-neutral-500">{monk.tradition}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">Primary Monastic Temple</span>
                    <span className="text-neutral-500">{monk.temple}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Bana Programs */}
          {activeTab === "Bana Programs" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Bana Sermons & Discourses</h3>
                  <p className="text-xs text-neutral-500">Dhamma talks delivered by {monk.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsProgramsModalOpen(true)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    Open Schedule & Map
                  </button>
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Request a Sermon
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(monk.banaPrograms || []).map((prog) => (
                  <div key={prog.id} className="p-5 border border-neutral-200 rounded-xl hover:border-orange-300 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          {prog.type}
                        </span>
                        <h4 className="font-bold text-base text-neutral-900 mt-1">{prog.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsProgramsModalOpen(true)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-600" /> Map & Details
                        </button>
                        <button 
                          onClick={() => showToast(`RSVP recorded for "${prog.title}"!`)}
                          className="px-3.5 py-1.5 bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 text-neutral-700 rounded-lg text-xs font-bold transition-colors shrink-0"
                        >
                          RSVP / Attend
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{prog.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                      <span className="flex items-center gap-1 font-semibold text-neutral-800">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" /> {prog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {prog.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {prog.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Monastery & Map */}
          {activeTab === "Monastery & Map" && (() => {
            const monkCoords = getCoordinatesForLocation(monk.loc || monk.temple);
            return (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">Monastery Location & Directions</h3>
                    <p className="text-xs text-neutral-500">Resident Temple: {monk.temple}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${monkCoords.lat},${monkCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Get Directions
                  </a>
                </div>

                {/* Map Display */}
                <div className="h-[380px] w-full rounded-xl overflow-hidden border border-neutral-200 relative shadow-inner">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      mapId="DEMO_MAP_ID"
                      defaultCenter={monkCoords}
                      defaultZoom={14}
                      gestureHandling="greedy"
                      disableDefaultUI={false}
                      internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
                      className="w-full h-full"
                    >
                      <AdvancedMarker position={monkCoords}>
                        <Pin background="#ea580c" glyphColor="#ffffff" borderColor="#c2410c" />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-md border border-neutral-200 text-xs">
                    <p className="font-bold text-neutral-900">{monk.temple}</p>
                    <p className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-600" /> {monk.loc}
                    </p>
                  </div>
                </div>

                {/* Monastery Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-orange-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-600" /> Temple Address & Visiting
                    </h4>
                    <p className="text-xs text-neutral-700 font-medium">{monk.temple}</p>
                    <p className="text-xs text-neutral-600">{monk.loc}</p>
                    <p className="text-[11px] text-neutral-500 pt-1">
                      Visiting hours: 6:00 AM – 7:30 PM daily. Please observe temple attire when visiting.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-600" /> Monastic Office Contact
                    </h4>
                    <p className="text-xs text-neutral-700">Telephone: <span className="font-medium text-neutral-900">{monk.phone}</span></p>
                    <p className="text-xs text-neutral-700">Mobile: <span className="font-medium text-neutral-900">{monk.mobile}</span></p>
                    <p className="text-xs text-neutral-700">Email: <span className="font-medium text-orange-600">{monk.email}</span></p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tab 4: YouTube Videos */}
          {activeTab === "YouTube Videos" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Recorded Teachings & Videos</h3>
                  <p className="text-xs text-neutral-500">Click to listen or play sermon recording</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(monk.videoList && monk.videoList.length > 0 ? monk.videoList : [
                  {
                    id: "fv-1",
                    title: "Cultivating Inner Peace | Dhamma Talk",
                    duration: "45:10",
                    views: "12.4K",
                    thumbnail: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=400",
                    youtubeId: "dQw4w9WgXcQ",
                    date: "1 week ago"
                  },
                  {
                    id: "fv-2",
                    title: "The Four Noble Truths for Daily Life",
                    duration: "52:40",
                    views: "19.8K",
                    thumbnail: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400",
                    youtubeId: "dQw4w9WgXcQ",
                    date: "3 weeks ago"
                  }
                ]).map((vid) => (
                  <div 
                    key={vid.id}
                    onClick={() => setActiveVideoModal(vid.title)}
                    className="border border-neutral-200 rounded-xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-6 h-6" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {vid.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2">
                        <span>{vid.views} views</span>
                        <span>{vid.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Dhamma School */}
          {activeTab === "Dhamma School" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Dhamma School Teachings</h3>
                  <p className="text-xs text-neutral-500">Classes for children and youth</p>
                </div>
                <button 
                  onClick={() => showToast("Registration portal open for 2025 Dhamma School!")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Enroll Student
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-amber-950">Primary Level: Life of the Buddha & Jataka Tales</h4>
                  <p className="text-xs text-amber-800">
                    Ages 6-11 • Every Sunday 9:00 AM - 10:30 AM. Moral values, gratitude towards parents, and basic chanting.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-neutral-900">Junior & Youth: Introduction to Abhidhamma & Ethics</h4>
                  <p className="text-xs text-neutral-600">
                    Ages 12-18 • Every Sunday 11:00 AM - 12:30 PM. Buddhist logic, dealing with academic stress, and mindful speech.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Events & Invitations */}
          {activeTab === "Events & Invitations" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-lg text-neutral-900">Events & Pastoral Visits</h3>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs"
                >
                  Send Invitation
                </button>
              </div>
              <p className="text-xs text-neutral-600">
                {monk.name} accepts invitations for temple ceremonies, Katina Pinkama, Vas seasons, and Pirith blessings.
              </p>
              <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Currently accepting bookings for upcoming Poya full moon days and weekend retreats.</span>
              </div>
            </div>
          )}

          {/* Tab 7: Gallery */}
          {activeTab === "Gallery" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
                Temple & Ceremony Photo Gallery
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1519782506847-15fffa480d12?auto=format&fit=crop&q=80&w=600",
                  "https://images.unsplash.com/photo-1589304037599-23c2140be043?auto=format&fit=crop&q=80&w=600",
                ].map((imgUrl, i) => (
                  <div 
                    key={i} 
                    onClick={() => setGalleryLightboxImg(imgUrl)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-xs"
                  >
                    <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 8: Reviews & Feedback */}
          {activeTab === "Reviews & Feedback" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Devotee Reviews & Gratitude</h3>
                  <p className="text-xs text-neutral-500">Reflections from lay followers and participants</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500" /> {monk.rating} ({reviewsList.length} reviews)
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Leave a Gratitude Note or Review</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Your City / Country"
                    value={reviewLocation}
                    onChange={(e) => setReviewLocation(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-600 font-medium">Rating:</span>
                  <div className="flex gap-1 text-amber-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        onClick={() => setReviewRating(star)} 
                        className={`w-4 h-4 ${star <= reviewRating ? "fill-amber-500" : "text-neutral-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Share how Venerable Thero's Dhamma sermons or guidance supported your practice..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Gratitude Note
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 border border-neutral-100 rounded-xl space-y-1.5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">{rev.author}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400">{rev.location} • {rev.date}</div>
                    <p className="text-xs text-neutral-700 leading-relaxed italic pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Programs & Events Modal */}
      <MonkProgramsModal 
        isOpen={isProgramsModalOpen} 
        onClose={() => setIsProgramsModalOpen(false)} 
        monk={monk} 
      />
    </div>
  );
}
