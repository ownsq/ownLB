import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { 
  User, Settings, Bell, Lock, Shield, 
  MapPin, Globe, Camera, LogOut, Image,
  CheckCircle2, X, Sparkles, Key, AlertTriangle,
  Mail, Phone, Save, Eye, EyeOff,
  Heart, PlaySquare, Video, Upload, Trash2, Edit3,
  ExternalLink, Play, ThumbsUp, Clock, Users, ArrowRight, Share2, Plus, Calendar, Check,
  LayoutDashboard, CreditCard, Plane, Send, MessageSquare, Search, FileText, Sliders,
  UserX, Flag, ShieldCheck, CheckSquare, QrCode, Download, Copy, RefreshCw, ShoppingBag
} from "lucide-react";
import { 
  getFavoriteEvents, 
  getFavoriteEventIds, 
  toggleFavoriteEventId 
} from "../utils/userEventsStorage";
import { 
  getUserChannel, 
  updateUserChannel, 
  getUserUploadedVideos, 
  uploadUserVideo, 
  deleteUserVideo, 
  updateUserVideo, 
  VideoItem, 
  UserChannel 
} from "../utils/userVideosStorage";
import { 
  getStoredCards, 
  DigitalCard, 
  downloadVCard, 
  toggleCardActive, 
  deleteDigitalCard 
} from "../utils/digitalBusinessCardStorage";
import { 
  getStoredInvitations, 
  EventInvitation, 
  updateInvitationStatus, 
  deleteInvitation 
} from "../utils/invitationsStorage";
import { 
  getStoredMatrimonialProfiles, 
  getStoredInterests, 
  MatrimonialProfile, 
  MatrimonialInterest 
} from "../utils/matrimonialStorage";
import { DigitalCardsManagerModal } from "../components/cards/DigitalCardsManagerModal";
import { InvitationsManagerModal } from "../components/invitations/InvitationsManagerModal";
import { MatrimonialSection } from "../components/matrimonial/MatrimonialSection";
import { EventItem } from "../data/eventsData";
import { getCategoryBadgeStyle } from "./Events";

export function Profile() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState("");

  // Bookmarked Events & Videos Channel State
  const [bookmarkedEvents, setBookmarkedEvents] = useState<EventItem[]>(getFavoriteEvents);
  const [channel, setChannel] = useState<UserChannel>(getUserChannel);
  const [userVideos, setUserVideos] = useState<VideoItem[]>(getUserUploadedVideos);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);
  const [selectedVideoPreview, setSelectedVideoPreview] = useState<VideoItem | null>(null);
  const [showUploadVideoModal, setShowUploadVideoModal] = useState(false);
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<VideoItem | null>(null);

  // New Video Upload Form
  const [videoForm, setVideoForm] = useState({
    title: "",
    category: "Dharma Deshana",
    desc: "",
    videoUrl: "",
    duration: "18:30",
    speaker: "Damika",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600"
  });

  // Channel Edit Form
  const [channelForm, setChannelForm] = useState({
    channelName: channel.channelName,
    handle: channel.handle,
    description: channel.description,
    banner: channel.banner
  });

  // Keep synced with localStorage events & videos
  useEffect(() => {
    const handleFavs = () => {
      setBookmarkedEvents(getFavoriteEvents());
    };
    const handleVids = () => {
      setUserVideos(getUserUploadedVideos());
      setChannel(getUserChannel());
    };
    const handleChan = () => {
      setChannel(getUserChannel());
    };

    window.addEventListener('lanka_favorites_updated', handleFavs);
    window.addEventListener('lanka_videos_updated', handleVids);
    window.addEventListener('lanka_channel_updated', handleChan);
    return () => {
      window.removeEventListener('lanka_favorites_updated', handleFavs);
      window.removeEventListener('lanka_videos_updated', handleVids);
      window.removeEventListener('lanka_channel_updated', handleChan);
    };
  }, []);

  // Editable Profile fields
  const [name, setName] = useState(user?.name || "Damika");
  const [email, setEmail] = useState(user?.email || "damika1316@gmail.com");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState("Sri Lanka");
  const [city, setCity] = useState("Colombo");
  const [bio, setBio] = useState(user?.bio || "Devotee practicing Theravada mindfulness. Passionate about community service, Dhamma education, and cultural bridge-building.");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200");
  const [coverImg, setCoverImg] = useState("https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200");

  // Modals state
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification toggles
  const [notifPlatform, setNotifPlatform] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMonks, setNotifMonks] = useState(false);
  const [notifInvitations, setNotifInvitations] = useState(true);
  const [notifTravel, setNotifTravel] = useState(true);

  // Digital Cards & Invitations & Matrimonial
  const [digitalCards, setDigitalCards] = useState<DigitalCard[]>(getStoredCards);
  const [invitations, setInvitations] = useState<EventInvitation[]>(getStoredInvitations);
  const [isDigitalCardsModalOpen, setIsDigitalCardsModalOpen] = useState(false);
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Independent Section Visibility Controls
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [communityVisibility, setCommunityVisibility] = useState<"public" | "members" | "private">("public");
  const [professionalVisibility, setProfessionalVisibility] = useState<"public" | "members" | "hidden">("public");
  const [travelVisibility, setTravelVisibility] = useState<"public" | "members" | "closed">("public");
  const [matrimonialVisibility, setMatrimonialVisibility] = useState<"members" | "hidden">("members");
  const [excludeSearchEngines, setExcludeSearchEngines] = useState(false);
  const [showLocation, setShowLocation] = useState(true);

  // Blocked users & Safety reporting
  const [blockedUsers, setBlockedUsers] = useState<string[]>([
    "Spam Advertiser #18",
    "Suspicious Account (+1 555-0199)"
  ]);
  const [newBlockInput, setNewBlockInput] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState("");
  const [reportReason, setReportReason] = useState("Fraudulent or Abusive Activity");
  const [reportDetails, setReportDetails] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveChanges = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (login) {
      login(email, name);
    }
    showToast("Profile changes saved successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match. Please re-enter.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated securely!");
  };

  const handleRemoveBookmark = (eventId: string) => {
    toggleFavoriteEventId(eventId);
    setBookmarkedEvents(getFavoriteEvents());
    showToast("Event removed from your bookmarks.");
  };

  const handleUploadVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title) {
      showToast("Please provide a video title");
      return;
    }
    const uploaded = uploadUserVideo({
      title: videoForm.title,
      category: videoForm.category,
      desc: videoForm.desc,
      videoUrl: videoForm.videoUrl,
      duration: videoForm.duration,
      speaker: videoForm.speaker,
      img: videoForm.img
    });
    setUserVideos(getUserUploadedVideos());
    setShowUploadVideoModal(false);
    setVideoForm({
      title: "",
      category: "Dharma Deshana",
      desc: "",
      videoUrl: "",
      duration: "18:30",
      speaker: "Damika",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600"
    });
    showToast(`Video "${uploaded.title}" uploaded to your channel successfully!`);
  };

  const handleDeleteVideo = (videoId: string, title: string) => {
    deleteUserVideo(videoId);
    setUserVideos(getUserUploadedVideos());
    showToast(`Deleted "${title}" from your channel.`);
  };

  const handleUpdateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserChannel({
      channelName: channelForm.channelName,
      handle: channelForm.handle,
      description: channelForm.description,
      banner: channelForm.banner
    });
    setChannel(updated);
    setShowEditChannelModal(false);
    showToast("Channel details updated successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Public Profile Preview Modal */}
      {showPublicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-150">
            <div className="relative h-32 bg-amber-600">
              <img src={coverImg} alt="Cover" className="w-full h-full object-cover" />
              <button 
                onClick={() => setShowPublicModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-0 text-center relative -mt-12">
              <img 
                src={avatar} 
                alt={name} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover bg-white mb-3"
              />
              <h3 className="font-bold text-xl text-neutral-900">{name}</h3>
              <p className="text-xs text-neutral-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {city}, {country}
              </p>
              <div className="inline-block mt-2 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                Active Community Member
              </div>
              <p className="text-xs text-neutral-600 mt-4 leading-relaxed max-w-sm mx-auto">
                {bio}
              </p>
              <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-100 justify-center">
                <button 
                  onClick={() => setShowPublicModal(false)}
                  className="px-6 py-2 bg-neutral-900 text-white font-bold rounded-xl text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Change Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500">Choose a preset avatar or paste an image URL:</p>
            <div className="grid grid-cols-4 gap-3 py-2">
              {[
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
              ].map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => {
                    setAvatar(url);
                    setShowAvatarModal(false);
                    showToast("Avatar updated!");
                  }}
                  className={`w-16 h-16 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform border-2 ${
                    avatar === url ? "border-amber-600 ring-2 ring-amber-300" : "border-neutral-200"
                  }`}
                />
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
            <button
              onClick={() => {
                setShowAvatarModal(false);
                showToast("Avatar updated!");
              }}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
            >
              Apply Avatar
            </button>
          </div>
        </div>
      )}

      {/* Cover Image Picker Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Change Cover Photo</h3>
              <button onClick={() => setShowCoverModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: "Buddhist Architecture", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" },
                { title: "Lotus & Peaceful Waters", url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200" },
                { title: "Sacred Relic & Stupa", url: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200" },
              ].map((item, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setCoverImg(item.url);
                    setShowCoverModal(false);
                    showToast("Cover photo updated!");
                  }}
                  className="h-20 rounded-xl overflow-hidden relative cursor-pointer group border border-neutral-200"
                >
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900">
              {is2FAEnabled ? "Disable 2FA" : "Enable Two-Factor Authentication"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {is2FAEnabled 
                ? "Disabling two-factor authentication will reduce your account security."
                : "Scan this QR code with Google Authenticator or Authy to generate login codes."}
            </p>
            {!is2FAEnabled && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 inline-block">
                <div className="w-32 h-32 bg-neutral-900 flex items-center justify-center text-white text-xs font-mono p-2 rounded">
                  [QR CODE: LB-2FA-9921]
                </div>
                <span className="text-[10px] text-neutral-500 font-mono mt-2 block">Secret: LB94-KX82-99B1</span>
              </div>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  setShow2FAModal(false);
                  showToast(is2FAEnabled ? "2FA has been disabled." : "Two-factor authentication enabled successfully!");
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold ${
                  is2FAEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {is2FAEnabled ? "Confirm Disable" : "Activate 2FA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal with typed confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900">Confirm Account Deletion</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This action is permanent and irreversible. All your profile information, listings, digital cards, discussion posts, travel plans, and group memberships will be permanently deleted.
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left space-y-2">
              <label className="text-[11px] font-bold text-rose-900 block">
                To confirm, please type <span className="underline font-mono">DELETE MY ACCOUNT</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                disabled={deleteConfirmText !== "DELETE MY ACCOUNT"}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  showToast("Account deletion request submitted. Logging out...");
                  setTimeout(() => {
                    window.location.href = "/login";
                  }, 1200);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-neutral-900">Report Member or Advertisement</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowReportModal(false);
              setReportTarget("");
              setReportDetails("");
              showToast("Report submitted to moderation team. Thank you for keeping our community safe.");
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Account or Listing to Report</label>
                <input
                  type="text"
                  required
                  placeholder="Username, phone number, or listing title..."
                  value={reportTarget}
                  onChange={e => setReportTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
                >
                  <option>Fraudulent or Abusive Activity</option>
                  <option>Suspicious Auction Bidding or Shill Bidding</option>
                  <option>Non-contact / No Handover after Auction Win</option>
                  <option>Inappropriate or Unsolicited Contact</option>
                  <option>Impersonation or False Buddhist Monastic Credentials</option>
                  <option>Underage or Unauthorized Matrimonial Post</option>
                  <option>Other Terms Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Explanation & Evidence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the incident, messages received, or why this advertisement violates safety guidelines..."
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Business Cards Manager Modal */}
      <DigitalCardsManagerModal
        isOpen={isDigitalCardsModalOpen}
        onClose={() => {
          setIsDigitalCardsModalOpen(false);
          setDigitalCards(getStoredCards());
        }}
      />

      {/* Ceremony & Public Figure Invitations Manager Modal */}
      <InvitationsManagerModal
        isOpen={isInvitationsModalOpen}
        onClose={() => {
          setIsInvitationsModalOpen(false);
          setInvitations(getStoredInvitations());
        }}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden relative shadow-xs">
        <div className="h-48 relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-500">
          <img src={coverImg} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <button 
            onClick={() => setShowCoverModal(true)}
            className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors border border-white/20"
          >
            <Image className="w-4 h-4" /> Change Cover
          </button>
        </div>

        <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16">
          <div className="relative group">
            <img 
              referrerPolicy="no-referrer" 
              src={avatar} 
              alt={name} 
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
            />
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title="Change Profile Photo"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{name}</h1>
            <p className="text-neutral-500 text-sm flex items-center justify-center md:justify-start gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" /> {email}
            </p>
          </div>

          <div className="flex gap-2.5">
            <button 
              onClick={() => setShowPublicModal(true)}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View Public Profile
            </button>
            <button 
              onClick={() => handleSaveChanges()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden py-3 shadow-xs">
            <nav className="flex flex-col">
              {[
                { id: "dashboard", label: "Member Dashboard", icon: LayoutDashboard, badge: "Hub", badgeColor: "bg-indigo-100 text-indigo-700" },
                { id: "general", label: "General Profile", icon: User },
                { id: "cards", label: "Digital Business Cards", icon: CreditCard, count: digitalCards.length, badgeColor: "bg-orange-100 text-orange-700" },
                { id: "matrimonial", label: "Matrimonial (18+)", icon: Heart, badge: "18+", badgeColor: "bg-rose-100 text-rose-700" },
                { id: "invitations", label: "Ceremony Invitations", icon: Send, count: invitations.length, badgeColor: "bg-purple-100 text-purple-700" },
                { id: "bookmarks", label: "My Bookmarked Events", icon: Calendar, count: bookmarkedEvents.length, badgeColor: "bg-rose-100 text-rose-700" },
                { id: "channel", label: "My Videos & Channel", icon: PlaySquare, count: userVideos.length, badgeColor: "bg-red-100 text-red-700" },
                { id: "security", label: "Security & Login", icon: Lock },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "privacy", label: "Privacy & Section Controls", icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
                      isSelected 
                        ? 'bg-amber-50 text-amber-700 border-amber-600' 
                        : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-neutral-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-amber-600 text-white' 
                          : tab.badgeColor || 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-6">
          {/* 1. UNIFIED MEMBER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Welcome Header */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Unified Member Dashboard
                  </div>
                  <h2 className="text-xl md:text-2xl font-black">Welcome back, {name}</h2>
                  <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
                    Manage your diaspora presence, digital business cards, matrimonial advertisements, travel plans, ceremony invitations, and classified listings all from one unified hub.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsDigitalCardsModalOpen(true)}
                    className="bg-white text-neutral-900 hover:bg-neutral-100 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" /> New Digital Card
                  </button>
                  <button
                    onClick={() => setIsInvitationsModalOpen(true)}
                    className="bg-neutral-900/40 hover:bg-neutral-900/60 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Invite Monk / Figure
                  </button>
                </div>
              </div>

              {/* Quick Hub Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div 
                  onClick={() => setActiveTab('cards')}
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">{digitalCards.length}</div>
                  <div className="text-xs font-bold text-neutral-800">Digital Cards</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Shareable QR & vCard</div>
                </div>

                <div 
                  onClick={() => setActiveTab('matrimonial')}
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">1</div>
                  <div className="text-xs font-bold text-neutral-800">Matrimonial Ad</div>
                  <div className="text-[10px] text-rose-600 font-semibold mt-0.5">2 Inquiries Received</div>
                </div>

                <div 
                  onClick={() => setActiveTab('invitations')}
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">{invitations.length}</div>
                  <div className="text-xs font-bold text-neutral-800">Invitations</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">1 Confirmed</div>
                </div>

                <Link 
                  to="/directory?view=travel"
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group block"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">1</div>
                  <div className="text-xs font-bold text-neutral-800">Travel Plans</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">1 Companion Joined</div>
                </Link>

                <Link 
                  to="/classifieds"
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group block"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">3</div>
                  <div className="text-xs font-bold text-neutral-800">Classifieds/Bids</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Direct phone handover</div>
                </Link>

                <div 
                  onClick={() => setActiveTab('bookmarks')}
                  className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-neutral-900">{bookmarkedEvents.length}</div>
                  <div className="text-xs font-bold text-neutral-800">Bookmarked</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Vesak & Meditation</div>
                </div>
              </div>

              {/* Action Panels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Digital Business Cards Spotlight */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                      <h3 className="font-bold text-sm text-neutral-900">My Digital Business Cards</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('cards')}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                      View All ({digitalCards.length}) &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {digitalCards.slice(0, 2).map((card) => (
                      <div key={card.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={card.avatar} alt={card.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 truncate">{card.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${card.type === 'professional' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {card.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500 truncate block">{card.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/card/${card.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              showToast(`Shareable link for ${card.name} copied!`);
                            }}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg"
                            title="Copy Share Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => downloadVCard(card)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg"
                            title="Download .vcf"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/card/${card.id}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-2xs"
                          >
                            Public View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsDigitalCardsModalOpen(true)}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold border border-orange-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Personal or Professional Card
                  </button>
                </div>

                {/* Ceremony & Public Figure Invitations */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-purple-600" />
                      <h3 className="font-bold text-sm text-neutral-900">Ceremony & Event Invitations</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('invitations')}
                      className="text-xs font-bold text-purple-700 hover:text-purple-800"
                    >
                      Manage &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {invitations.slice(0, 2).map((inv) => (
                      <div key={inv.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={inv.targetAvatar} alt={inv.targetName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 truncate block">{inv.targetName}</span>
                            <span className="text-[11px] text-neutral-500 truncate block">{inv.eventTitle}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          inv.status === 'changes_suggested' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {inv.status === 'accepted' ? 'Confirmed' : inv.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsInvitationsModalOpen(true)}
                    className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Invite Monk (Dana/Bana) or Public Figure
                  </button>
                </div>
              </div>

              {/* Matrimonial & Travel Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Matrimonial 18+ Section Shortcut */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <h3 className="font-bold text-sm text-neutral-900">Matrimonial Section (18+)</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Excluded from Search Engines
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Adults aged 18+ can publish advertisements with photographs, education, occupation, partner preferences, and family consent. Manage photo privacy and respond to genuine expressions of interest.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => setActiveTab('matrimonial')}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Heart className="w-3.5 h-3.5" /> Manage Matrimonial Ad & Proposals
                    </button>
                    <Link
                      to="/directory?view=matrimonial"
                      className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold"
                    >
                      Browse
                    </Link>
                  </div>
                </div>

                {/* Travel Buddies Section Shortcut */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-purple-600" />
                      <h3 className="font-bold text-sm text-neutral-900">Travel Buddies & Pilgrimages</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      1 Active Trip Notice
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Coordinate travel plans with destinations, dates, budgets, and interests. Review companion join requests, approve participants, and coordinate cab/transport details privately.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <Link
                      to="/directory?view=travel"
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plane className="w-3.5 h-3.5" /> Open Travel Buddies & Coordination
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DIGITAL BUSINESS CARDS MANAGEMENT TAB */}
          {activeTab === 'cards' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">Personal & Professional Digital Cards</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Share your contacts, company info, and social links instantly. Anyone scanning your QR code can view your card and download your contact (.vcf) without needing to log in.
                  </p>
                </div>
                <button
                  onClick={() => setIsDigitalCardsModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Digital Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {digitalCards.map((card) => (
                  <div key={card.id} className="border border-neutral-200 rounded-2xl p-5 bg-white shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={card.avatar} alt={card.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-neutral-100" />
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${card.type === 'professional' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                              {card.type} Card
                            </span>
                            <h3 className="font-bold text-neutral-900 text-base mt-1">{card.name}</h3>
                            <p className="text-xs text-neutral-500">{card.title}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const nextActive = toggleCardActive(card.id);
                            setDigitalCards(getStoredCards());
                            showToast(`Card ${nextActive ? 'activated' : 'deactivated'}.`);
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                            card.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}
                        >
                          {card.isActive ? '● Active' : '○ Inactive'}
                        </button>
                      </div>

                      {card.company && (
                        <p className="text-xs font-semibold text-neutral-700">🏢 {card.company}</p>
                      )}

                      <div className="text-xs text-neutral-600 space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <p>📞 {card.phone}</p>
                        <p>✉️ {card.email}</p>
                        <p>📍 {card.location}</p>
                        {card.website && <p>🌐 {card.website}</p>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/card/${card.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            showToast("Shareable link copied to clipboard!");
                          }}
                          className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-500" /> Copy Link
                        </button>
                        <button
                          onClick={() => downloadVCard(card)}
                          className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-500" /> Save Contact (.vcf)
                        </button>
                      </div>

                      <Link
                        to={`/card/${card.id}`}
                        target="_blank"
                        className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" /> Open Card
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MATRIMONIAL (18+) TAB */}
          {activeTab === 'matrimonial' && (
            <div className="space-y-4">
              <MatrimonialSection />
            </div>
          )}

          {/* 4. CEREMONY & EVENT INVITATIONS TAB */}
          {activeTab === 'invitations' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                      <Send className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">Ceremony & Public Figure Invitations</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage invitations sent to Venerable Monks for Pujas, Pirith, Dhamma sermons, and Sanghika Dana, and proposals submitted to Public Figures.
                  </p>
                </div>
                <button
                  onClick={() => setIsInvitationsModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Send New Invitation
                </button>
              </div>

              <div className="space-y-4">
                {invitations.map((inv) => (
                  <div key={inv.id} className="border border-neutral-200 rounded-2xl p-5 bg-white shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={inv.targetAvatar} alt={inv.targetName} className="w-12 h-12 rounded-2xl object-cover border-2 border-neutral-100" />
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${inv.targetType === 'monk' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'}`}>
                            {inv.targetType === 'monk' ? 'Buddhist Monk' : 'Public Figure'}
                          </span>
                          <h3 className="font-bold text-neutral-900 text-base mt-0.5">{inv.targetName}</h3>
                          <p className="text-xs text-neutral-500 font-semibold">{inv.eventType} • {inv.eventTitle}</p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center ${
                        inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        inv.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        inv.status === 'changes_suggested' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        Status: {inv.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
                      <p>📅 <strong>Date & Time:</strong> {inv.date} at {inv.time}</p>
                      <p>📍 <strong>Location:</strong> {inv.location}</p>
                      <p>👥 <strong>Expected Audience:</strong> {inv.expectedAudience}</p>
                      {inv.transportDetails && (
                        <p>🚗 <strong>Transport:</strong> {inv.transportDetails}</p>
                      )}
                      <p className="pt-1 italic text-neutral-600">&ldquo;{inv.participationArrangements}&rdquo;</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-400 text-[11px]">Submitted on {inv.createdAt}</span>
                      <button
                        onClick={() => setIsInvitationsModalOpen(true)}
                        className="text-purple-700 hover:text-purple-900 font-bold"
                      >
                        Manage in Invitations Dashboard &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <form onSubmit={handleSaveChanges} className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-1">General Information</h2>
                <p className="text-xs text-neutral-500 mb-6">Update your basic information and community presence.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">City / Region</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Bio / Dhamma Interests</label>
                    <textarea 
                      rows={3} 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button 
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              {user?.provider !== 'password' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900">Protected by Google Identity</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Verified Google Account
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        Your account is linked to your personal Google Account (<strong className="text-neutral-900">{user?.email}</strong>). 
                        Company credentials and passwords are not stored or required, ensuring state-of-the-art protection managed directly by Google.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Google Single Sign-On Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">Password & Authentication</h2>
                  <p className="text-xs text-neutral-500 mb-4">Ensure your account uses a strong, unique password.</p>
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              )}

              <div className="h-px bg-neutral-100"></div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Two-Factor Authentication (2FA)</h2>
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Authenticator App</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                        Use an app like Google Authenticator to generate verification codes for highest security.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShow2FAModal(true)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                      is2FAEnabled 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {is2FAEnabled ? "Enabled (Manage)" : "Enable 2FA"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Email Notifications</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Platform Updates</h4>
                      <p className="text-xs text-neutral-500">Receive announcements about new community features.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifPlatform}
                      onChange={(e) => {
                        setNotifPlatform(e.target.checked);
                        showToast("Notification preference updated.");
                      }}
                      className="w-4 h-4 text-amber-600 rounded" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Event Reminders</h4>
                      <p className="text-xs text-neutral-500">Get notified about upcoming Dhamma school sessions and Poya bana programs.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifEvents}
                      onChange={(e) => {
                        setNotifEvents(e.target.checked);
                        showToast("Notification preference updated.");
                      }}
                      className="w-4 h-4 text-amber-600 rounded" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">Direct Messages</h4>
                      <p className="text-xs text-neutral-500">Email notification when a member sends you a direct message.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifMessages}
                      onChange={(e) => {
                        setNotifMessages(e.target.checked);
                        showToast("Notification preference updated.");
                      }}
                      className="w-4 h-4 text-amber-600 rounded" 
                    />
                  </label>
                </div>
              </div>

              <div className="h-px bg-neutral-100"></div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Push Notifications</h2>
                <label className="flex items-center justify-between p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">New Monks Registered</h4>
                    <p className="text-xs text-neutral-500">Notify when new monks register in your region or country.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifMonks}
                    onChange={(e) => {
                      setNotifMonks(e.target.checked);
                      showToast("Notification preference updated.");
                    }}
                    className="w-4 h-4 text-amber-600 rounded" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Independent Section Visibility</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Control who can see your information across each individual section of the platform independently.
                </p>

                <div className="space-y-4">
                  {/* Community Visibility */}
                  <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" /> Community Directory & Feed
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                        {communityVisibility}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      {[
                        { val: "public", label: "Public (All)" },
                        { val: "members", label: "Members Only" },
                        { val: "private", label: "Private" }
                      ].map(opt => (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setCommunityVisibility(opt.val as any);
                            showToast(`Community section visibility set to ${opt.label}.`);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border text-center transition-all ${
                            communityVisibility === opt.val 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Professional & Digital Cards Visibility */}
                  <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-600" /> Professional & Digital Cards
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                        {professionalVisibility}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      {[
                        { val: "public", label: "Public (QR & Link)" },
                        { val: "members", label: "Members Only" },
                        { val: "hidden", label: "Hidden" }
                      ].map(opt => (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setProfessionalVisibility(opt.val as any);
                            showToast(`Professional & Digital Cards set to ${opt.label}.`);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border text-center transition-all ${
                            professionalVisibility === opt.val 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel Plans Visibility */}
                  <div className="p-4 border border-neutral-200 rounded-xl space-y-2 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                        <Plane className="w-4 h-4 text-purple-600" /> Travel Buddies Plans
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                        {travelVisibility}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      {[
                        { val: "public", label: "Public" },
                        { val: "members", label: "Members Only" },
                        { val: "closed", label: "Closed" }
                      ].map(opt => (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setTravelVisibility(opt.val as any);
                            showToast(`Travel plans visibility set to ${opt.label}.`);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border text-center transition-all ${
                            travelVisibility === opt.val 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' 
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Matrimonial Visibility */}
                  <div className="p-4 border border-rose-200 rounded-xl space-y-2 bg-rose-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-600" /> Matrimonial Profile (18+)
                        </h4>
                        <p className="text-[10px] text-neutral-500">Excluded from search engine indexing by default</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                        {matrimonialVisibility}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      {[
                        { val: "members", label: "Visible to Verified Adults (18+)" },
                        { val: "hidden", label: "Hidden / Paused" }
                      ].map(opt => (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setMatrimonialVisibility(opt.val as any);
                            showToast(`Matrimonial visibility set to ${opt.label}.`);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border text-center transition-all ${
                            matrimonialVisibility === opt.val 
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' 
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Engine Exclusion Toggle */}
                  <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-600" /> Search Engine Privacy (noindex)
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Instruct search engines (Google, Bing) not to index your profile, matrimonial ad, or contact listings.
                      </p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={excludeSearchEngines}
                      onChange={(e) => {
                        setExcludeSearchEngines(e.target.checked);
                        showToast(`Search engine indexing ${e.target.checked ? 'blocked (noindex active)' : 'allowed'}.`);
                      }}
                      className="w-4 h-4 text-amber-600 rounded" 
                    />
                  </label>
                </div>
              </div>

              <div className="h-px bg-neutral-100"></div>

              {/* Blocked Users & Safety Controls */}
              <div>
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Safety & Blocked Accounts</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Manage accounts you have blocked from contacting you, viewing your phone number, or commenting.
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter username, email, or phone number to block..."
                      value={newBlockInput}
                      onChange={e => setNewBlockInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBlockInput.trim()) return;
                        setBlockedUsers([...blockedUsers, newBlockInput.trim()]);
                        setNewBlockInput("");
                        showToast("User added to blocked list.");
                      }}
                      className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                    >
                      <UserX className="w-3.5 h-3.5" /> Block
                    </button>
                  </div>

                  <div className="space-y-2">
                    {blockedUsers.map((bu, idx) => (
                      <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                          <UserX className="w-3.5 h-3.5 text-rose-500" /> {bu}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setBlockedUsers(blockedUsers.filter((_, i) => i !== idx));
                            showToast(`Unblocked ${bu}.`);
                          }}
                          className="text-xs font-bold text-neutral-500 hover:text-neutral-800 hover:underline"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Flag className="w-3.5 h-3.5" /> Report Abusive or Fraudulent User
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-neutral-100"></div>

              {/* Danger Zone: Account Deletion */}
              <div>
                <h2 className="text-lg font-bold text-rose-600 mb-1">Danger Zone</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Permanently delete your account, listings, digital cards, discussions, and event RSVPs.
                </p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors border border-rose-200 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" /> Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* MY BOOKMARKED EVENTS SECTION */}
          {activeTab === 'bookmarks' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">My Bookmarked Events</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Upcoming gatherings and retreats you have favorited for quick access and attendance.
                  </p>
                </div>

                <Link
                  to="/events"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Discover More Events</span>
                </Link>
              </div>

              {bookmarkedEvents.length === 0 ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-neutral-800 text-base">No bookmarked events yet</h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                    Browse our community calendar to favorite upcoming meditation sessions, Dhamma discourses, workshops, and Vesak gatherings.
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>Browse Events Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-neutral-200 rounded-2xl p-4.5 bg-white hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image & Category */}
                        <div className="h-36 rounded-xl overflow-hidden relative mb-3 bg-neutral-100">
                          <img
                            src={event.img}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs bg-white/95 backdrop-blur-xs ${getCategoryBadgeStyle(event.category)}`}>
                              {event.category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveBookmark(event.id)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-rose-600 shadow-sm transition-colors"
                            title="Remove from Bookmarked Events"
                          >
                            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                          </button>
                        </div>

                        {/* Date & Title */}
                        <div className="flex gap-3 mb-2">
                          <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-xl w-11 h-11 shrink-0">
                            <span className="text-[9px] font-bold uppercase">{event.mon}</span>
                            <span className="text-base font-black leading-none">{event.day}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 
                              onClick={() => setSelectedEventModal(event)}
                              className="font-bold text-neutral-900 text-sm hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer"
                            >
                              {event.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{event.date}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-500 flex items-center gap-1 mb-2 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{event.loc}</span>
                        </p>

                        <p className="text-xs text-neutral-600 line-clamp-2 mb-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                          {event.desc}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs gap-2">
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span><strong>{event.attendees}</strong> attending</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRemoveBookmark(event.id)}
                            className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors font-semibold"
                            title="Remove Bookmark"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setSelectedEventModal(event)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY CHANNEL & VIDEO MANAGEMENT SECTION */}
          {activeTab === 'channel' && (
            <div className="space-y-6">
              {/* Channel Profile Header */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                {/* Banner */}
                <div className="h-40 sm:h-48 relative overflow-hidden bg-neutral-900">
                  <img
                    src={channel.banner}
                    alt={channel.channelName}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <button
                    onClick={() => setShowEditChannelModal(true)}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-xs border border-white/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Channel</span>
                  </button>
                </div>

                {/* Info & Stats bar */}
                <div className="p-6 relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
                    <div className="flex items-end gap-4">
                      <img
                        src={channel.avatar}
                        alt={channel.channelName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white shrink-0"
                      />
                      <div className="pb-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-black text-neutral-900">{channel.channelName}</h2>
                          <span className="p-1 bg-blue-50 text-blue-600 rounded-full" title="Verified Creator">
                            <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-semibold">{channel.handle} • {channel.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowUploadVideoModal(true)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Video</span>
                      </button>
                      <Link
                        to="/videos"
                        className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Public Feed</span>
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 max-w-3xl leading-relaxed mb-6">
                    {channel.description}
                  </p>

                  {/* Channel Metrics Strip */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                    <div>
                      <span className="block text-xl sm:text-2xl font-black text-neutral-900">{userVideos.length}</span>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Videos Uploaded</span>
                    </div>
                    <div className="border-x border-neutral-200">
                      <span className="block text-xl sm:text-2xl font-black text-neutral-900">{channel.totalViews.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Channel Views</span>
                    </div>
                    <div>
                      <span className="block text-xl sm:text-2xl font-black text-neutral-900">{channel.subscribersCount.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Subscribers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Videos Management List */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                      <PlaySquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-neutral-900">Your Channel Videos</h3>
                      <p className="text-xs text-neutral-500">Manage all Dhamma talks, meditations, and chantings uploaded under your account.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUploadVideoModal(true)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Video</span>
                  </button>
                </div>

                {userVideos.length === 0 ? (
                  <div className="py-12 text-center space-y-3 border-2 border-dashed border-neutral-200 rounded-2xl">
                    <Video className="w-10 h-10 text-neutral-300 mx-auto" />
                    <h4 className="font-bold text-neutral-800 text-sm">No videos uploaded yet</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Share sermons, chants, or mindful reflections with our community by uploading your first video.
                    </p>
                    <button
                      onClick={() => setShowUploadVideoModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Upload First Video
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userVideos.map((video) => (
                      <div
                        key={video.id}
                        className="border border-neutral-200 rounded-xl p-4 bg-white hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Thumbnail with duration */}
                          <div 
                            onClick={() => setSelectedVideoPreview(video)}
                            className="aspect-video rounded-lg overflow-hidden relative mb-3 bg-neutral-900 cursor-pointer"
                          >
                            <img
                              src={video.img}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-10 h-10 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                              {video.duration || "15:00"}
                            </span>
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                              {video.category}
                            </span>
                          </div>

                          <h4 
                            onClick={() => setSelectedVideoPreview(video)}
                            className="font-bold text-neutral-900 text-sm hover:text-red-600 transition-colors line-clamp-1 cursor-pointer mb-1"
                          >
                            {video.title}
                          </h4>

                          <p className="text-xs text-neutral-500 flex items-center gap-2 mb-2">
                            <span>{video.views}</span>
                            <span>•</span>
                            <span>Uploaded {video.time || video.uploadedAt || "Recently"}</span>
                          </p>

                          <p className="text-xs text-neutral-600 line-clamp-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 mb-3">
                            {video.desc}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                          <button
                            onClick={() => setSelectedVideoPreview(video)}
                            className="text-neutral-700 hover:text-red-600 font-bold flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" /> Watch Preview
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteVideo(video.id, video.title)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bookmarked Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedEventModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-xl px-3 py-1.5 min-w-[50px]">
                  <span className="text-[10px] font-bold uppercase">{selectedEventModal.mon}</span>
                  <span className="text-xl font-black leading-none">{selectedEventModal.day}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 leading-tight">{selectedEventModal.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-neutral-500">{selectedEventModal.date}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(selectedEventModal.category)}`}>
                      {selectedEventModal.category}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEventModal(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="rounded-xl overflow-hidden aspect-video bg-neutral-100">
                <img src={selectedEventModal.img} alt={selectedEventModal.title} className="w-full h-full object-cover" />
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold truncate">{selectedEventModal.loc}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEventModal.loc)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-orange-600 hover:underline shrink-0 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Open Map</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{selectedEventModal.date}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Organized by {selectedEventModal.organizer} • {selectedEventModal.attendees} Attending</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-neutral-900 mb-1">About This Gathering</h4>
                <p className="text-xs text-neutral-700 leading-relaxed bg-white border border-neutral-100 p-3 rounded-lg">
                  {selectedEventModal.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    handleRemoveBookmark(selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-600" />
                  <span>Remove Bookmark</span>
                </button>
                <Link
                  to="/events"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  View in Events Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Upload to Channel</h3>
                  <p className="text-xs text-neutral-500">Add video to {channel.channelName}</p>
                </div>
              </div>
              <button onClick={() => setShowUploadVideoModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadVideoSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Video Title *</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Sutta Chanting & Evening Metta Meditation"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
                  <select
                    value={videoForm.category}
                    onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
                  >
                    {["Dharma Deshana", "Meditation", "Pirith & Chanting", "Buddhist Teachings", "Dhamma for Kids", "History & Culture"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Duration Display</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="e.g. 24:15"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Video Stream / YouTube Link</label>
                <input
                  type="url"
                  value={videoForm.videoUrl}
                  onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Supports YouTube embeds or direct streaming links.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Speaker / Teacher</label>
                <input
                  type="text"
                  value={videoForm.speaker}
                  onChange={e => setVideoForm({ ...videoForm, speaker: e.target.value })}
                  placeholder="e.g. Ven. Bhante Anandajothi or Damika"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Select Thumbnail Preset or Paste URL</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1616089308104-58276f5716bb?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600"
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Preset"
                      onClick={() => setVideoForm({ ...videoForm, img: url })}
                      className={`h-14 w-full object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        videoForm.img === url ? 'border-red-600 ring-2 ring-red-200 scale-95' : 'border-transparent hover:opacity-80'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  value={videoForm.img}
                  onChange={e => setVideoForm({ ...videoForm, img: e.target.value })}
                  placeholder="Custom Image URL..."
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description & Notes</label>
                <textarea
                  rows={3}
                  value={videoForm.desc}
                  onChange={e => setVideoForm({ ...videoForm, desc: e.target.value })}
                  placeholder="Summarize the core topics or sutta referenced in this discourse..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowUploadVideoModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish to Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {showEditChannelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Edit Channel Profile</h3>
              <button onClick={() => setShowEditChannelModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateChannelSubmit} className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={channelForm.channelName}
                  onChange={e => setChannelForm({ ...channelForm, channelName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Channel Handle</label>
                <input
                  type="text"
                  value={channelForm.handle}
                  onChange={e => setChannelForm({ ...channelForm, handle: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Channel Description</label>
                <textarea
                  rows={3}
                  value={channelForm.description}
                  onChange={e => setChannelForm({ ...channelForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={channelForm.banner}
                  onChange={e => setChannelForm({ ...channelForm, banner: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowEditChannelModal(false)}
                  className="px-4 py-2 text-xs text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideoPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedVideoPreview(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {selectedVideoPreview.category}
                </span>
                <h3 className="font-bold text-lg text-neutral-900 mt-1">{selectedVideoPreview.title}</h3>
                <p className="text-xs text-neutral-500">{channel.channelName} • {selectedVideoPreview.views}</p>
              </div>
              <button onClick={() => setSelectedVideoPreview(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="relative aspect-video bg-neutral-950 rounded-xl overflow-hidden flex items-center justify-center group shadow-inner">
                <img src={selectedVideoPreview.img} alt={selectedVideoPreview.title} className="w-full h-full object-cover opacity-65" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                  <span className="text-white font-bold text-xs mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Playing Video ({selectedVideoPreview.duration || "18:30"})
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
                <h4 className="font-bold text-neutral-900 mb-1">Discourse Description</h4>
                <p>{selectedVideoPreview.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium">Uploaded by {channel.channelName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                      showToast("Link copied to clipboard!");
                    }}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button
                    onClick={() => setSelectedVideoPreview(null)}
                    className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
