import React, { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Edit2, CheckCircle2, Share2, ChevronDown, UserPlus, 
  Image as ImageIcon, BarChart2, Calendar, Smile, 
  MoreHorizontal, Pin, MessageSquare, ThumbsUp, 
  Lock, Globe, Eye, MapPin, Clock, Camera, Settings,
  FileText, Users, Image as ImageIcon2, X, Plus, Send,
  Sparkles, Check, UploadCloud, Map as MapIcon, List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { InteractiveEntityMap } from '../components/maps/InteractiveEntityMap';
import { getCoordinatesForLocation } from '../utils/googleMapsConfig';
import { subscribePosts, addPostToDb, subscribeEvents, subscribeUsers } from '../lib/firestoreService';

interface GroupPost {
  id: string;
  author: string;
  authorRole?: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  commentsCount: number;
  liked?: boolean;
}

export function GroupDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultGroup = {
    title: id ? decodeURIComponent(id).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Dhamma Friends Los Angeles",
    type: "Public Group",
    members: "1.2K",
    desc: "A community of Dhamma friends living in Los Angeles and surrounding areas practicing, learning and sharing the Buddha's teachings.",
    img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=300",
    coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200",
    quote: "The Sangha is the field\nof merit for the world.",
    quoteAuthor: "Buddha"
  };

  const [group, setGroup] = useState(location.state?.group || defaultGroup);
  const [activeTab, setActiveTab] = useState('Feed');
  const [isJoined, setIsJoined] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<any | null>(null);
  const [eventsViewMode, setEventsViewMode] = useState<'list' | 'map'>('list');

  // Edit form
  const [editForm, setEditForm] = useState({
    title: group.title,
    desc: group.desc,
    coverImg: group.coverImg || "",
    img: group.img || "",
    quote: group.quote || "",
    quoteAuthor: group.quoteAuthor || ""
  });

  // Feed posts state
  const [newPostText, setNewPostText] = useState('');
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  React.useEffect(() => {
    const unsubP = subscribePosts((posts) => setDbPosts(posts));
    const unsubU = subscribeUsers((users) => setDbUsers(users));
    const unsubE = subscribeEvents((events) => setDbEvents(events));
    return () => {
      unsubP();
      unsubU();
      unsubE();
    };
  }, []);

  const groupFeedPosts = dbPosts.filter(p => 
    (p.group && group.title && p.group.toLowerCase() === group.title.toLowerCase()) ||
    (p.group && id && p.group.toLowerCase().includes(id.toLowerCase()))
  );

  // Files list state
  const [filesList, setFilesList] = useState([
    { name: "Group Guidelines.pdf", size: "245 KB", type: "PDF" },
    { name: "Event Schedule.xlsx", size: "1.2 MB", type: "Excel" },
    { name: "Community Guidelines.docx", size: "560 KB", type: "Word" },
  ]);

  // Albums state
  const [albumsList, setAlbumsList] = useState([
    { name: "Vesak Puja", count: 45, img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=400" },
    { name: "Temple Dhamma Day", count: 12, img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400" },
    { name: "Dhamma School", count: 28, img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Group link copied to clipboard!");
    } else {
      showToast("Group link ready to share.");
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPostPayload = {
      author: user?.name || "Community Member",
      authorImg: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      time: "Just now",
      content: newPostText.trim(),
      group: group.title,
      loc: user?.country || "Sri Lanka",
      createdAt: new Date().toISOString()
    };
    try {
      await addPostToDb(newPostPayload);
      setNewPostText('');
      showToast("Post shared to group feed!");
    } catch (err) {
      console.error("Failed to post to group feed:", err);
      showToast("Unable to post to group feed.");
    }
  };

  const [rsvpdEventIds, setRsvpdEventIds] = useState<Record<string, boolean>>({});

  const groupEvents = dbEvents.map(e => ({
    id: e.id,
    date: e.date || "Upcoming",
    title: e.title,
    time: e.time ? `${e.date} • ${e.time}` : `${e.date || 'Upcoming'} • Evening`,
    loc: e.location || e.city || "Temple Community Hall",
    going: !!rsvpdEventIds[e.id]
  }));

  const togglePostLike = (_id: string) => {
    showToast("Liked post!");
  };

  const toggleEventGoing = (id: string) => {
    const nextState = !rsvpdEventIds[id];
    setRsvpdEventIds(prev => ({ ...prev, [id]: nextState }));
    const target = groupEvents.find(e => e.id === id);
    showToast(nextState ? `You are attending "${target?.title || 'Event'}"!` : `Cancelled RSVP for "${target?.title || 'Event'}".`);
  };

  const handleSaveGroupEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...group,
      title: editForm.title,
      desc: editForm.desc,
      coverImg: editForm.coverImg,
      img: editForm.img,
      quote: editForm.quote,
      quoteAuthor: editForm.quoteAuthor
    };
    setGroup(updated);
    setIsEditModalOpen(false);
    showToast("Group information updated successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Edit Group Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveGroupEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Group Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.desc}
                  onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editForm.coverImg}
                  onChange={(e) => setEditForm({ ...editForm, coverImg: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Quote</label>
                <input
                  type="text"
                  value={editForm.quote}
                  onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">Invite Members to Group</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500">Invite connections to {group.title}:</p>
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {dbUsers.filter(u => u.id !== user?.id && u.uid !== user?.id).length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  No other members found to invite yet. Share this group link with your community friends.
                </div>
              ) : (
                dbUsers
                  .filter(u => u.id !== user?.id && u.uid !== user?.id)
                  .slice(0, 6)
                  .map((person, i) => (
                    <div key={person.id || person.uid || i} className="flex items-center justify-between p-2.5 border border-neutral-100 rounded-xl hover:bg-neutral-50">
                      <div className="flex items-center gap-2.5">
                        <img src={person.avatar || person.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-neutral-900">{person.name || person.displayName || "Member"}</h4>
                          <p className="text-[10px] text-neutral-500">{person.role || "Member"} • {person.location || person.country || "Community"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Invitation sent to ${person.name || "member"}!`)}
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 cursor-pointer"
                      >
                        Invite
                      </button>
                    </div>
                  ))
              )}
            </div>
            <button
              onClick={() => {
                setIsInviteModalOpen(false);
                showToast("Invitations sent to selected members.");
              }}
              className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cover Section */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 lg:h-96 shadow-md">
        <img 
          src={group.coverImg || "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200"} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute top-8 left-8 md:top-12 md:left-12 max-w-lg">
          <p className="text-white text-2xl md:text-3xl font-medium italic leading-relaxed mb-4">
            {group.quote ? group.quote.split("\n").map((line: string, i: number) => <span key={i}>{line}<br/></span>) : "The Sangha is the field of merit for the world."}
          </p>
          <p className="text-white/80 text-lg md:text-xl">- {group.quoteAuthor || "Buddha"}</p>
        </div>

        <div className="absolute bottom-4 right-4">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-colors border border-white/20"
          >
            <Edit2 className="w-4 h-4" /> Edit Group
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 -mt-20 relative z-10 mx-4 md:mx-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="relative -mt-20 md:-mt-24 shrink-0">
            <img 
              referrerPolicy="no-referrer" 
              src={group.img} 
              alt="Group" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-amber-50" 
            />
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-2 right-2 bg-white text-neutral-700 p-2 rounded-full border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors"
              title="Change Group Icon"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{group.title}</h1>
            <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
              <span className="flex items-center gap-1 font-medium text-neutral-700">
                <Globe className="w-4 h-4 text-emerald-600" /> {group.type}
              </span>
              <span>•</span>
              <span className="font-medium text-neutral-900">{group.members} Members</span>
            </div>
            <p className="text-neutral-700 mb-4 max-w-2xl text-sm leading-relaxed">{group.desc}</p>
            <div className="flex flex-wrap gap-2">
              {['Dhamma Discussions', 'Meditation', 'Events', 'Dana & Seva', 'Community'].map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium border border-neutral-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2.5 pb-2">
            <button 
              onClick={handleShare}
              className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => {
                setIsJoined(!isJoined);
                showToast(isJoined ? "Left group." : "Joined group successfully!");
              }}
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs ${
                isJoined 
                  ? "bg-neutral-100 border-neutral-300 text-neutral-800" 
                  : "bg-emerald-50 border-emerald-300 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {isJoined ? 'Joined' : 'Join Group'}
            </button>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Invite Members
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto no-scrollbar shadow-xs">
            <div className="flex p-2">
              {[
                { name: 'Feed', icon: FileText },
                { name: 'About', icon: Globe },
                { name: 'Members', icon: Users },
                { name: 'Events', icon: Calendar },
                { name: 'Media', icon: ImageIcon2 },
                { name: 'Files', icon: FileText },
                { name: 'Albums', icon: ImageIcon2 },
                { name: 'Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab.name 
                      ? 'text-amber-700 bg-amber-50' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Tab */}
          {activeTab === 'Feed' && (
            <div className="space-y-5">
              {/* Create Post */}
              <form onSubmit={handlePostSubmit} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
                <div className="flex gap-3 mb-3">
                  <img src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  <textarea 
                    rows={2}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Write an announcement or reflection for the group..."
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-neutral-400 resize-none pt-1"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => showToast("Photo attachment dialog opened.")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Photo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => showToast("Poll creation dialog opened.")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> Poll
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("Events")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Event
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newPostText.trim()}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" /> Post
                  </button>
                </div>
              </form>

              {/* Feed Posts */}
              {groupFeedPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-8 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
                  <h4 className="font-bold text-sm text-neutral-800">No posts in this group yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Share an announcement, event update, or Dhamma reflection with the group members above.
                  </p>
                </div>
              ) : (
                groupFeedPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorImg || post.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-neutral-900">{post.author}</h4>
                            {post.authorRole && (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                                {post.authorRole}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400">{post.time || "Recently"}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-800 leading-relaxed">{post.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-semibold text-neutral-600">
                        <ThumbsUp className="w-3.5 h-3.5" /> {post.likesCount || 0} Likes
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5" /> {post.commentsCount || 0} Comments
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'About' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 text-xs text-neutral-700 leading-relaxed">
              <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3">About This Community</h3>
              <p>{group.desc}</p>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Group Mission</span>
                To unite Buddhists and friends of the Dhamma across the region through mindfulness practice, compassionate seva (alms-giving), and fostering fellowship among all generations.
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'Members' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-base text-neutral-900">Members ({group.members})</h3>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  Invite
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbUsers.length === 0 ? (
                  <div className="col-span-2 text-center py-6 text-neutral-400 text-xs">
                    No members registered in this chapter yet.
                  </div>
                ) : (
                  dbUsers.slice(0, 8).map((memberUser, idx) => (
                    <div key={memberUser.id || memberUser.uid || idx} className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={memberUser.avatar || memberUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-neutral-900 truncate">{memberUser.name || memberUser.displayName || "Member"}</h4>
                          <p className="text-[10px] text-neutral-400 truncate">{memberUser.location || memberUser.country || "Active Member"}</p>
                        </div>
                      </div>
                      <Link 
                        to="/directory?view=messages"
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[10px] font-bold shrink-0"
                      >
                        Message
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'Events' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Group Events & Gatherings</h3>
                  <p className="text-xs text-neutral-500">Upcoming community meetups, celebrations, and Dhamma discussions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
                    <button
                      onClick={() => setEventsViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        eventsViewMode === 'list' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" /> List
                    </button>
                    <button
                      onClick={() => setEventsViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        eventsViewMode === 'map' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5 text-amber-600" /> Interactive Map
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate('/events')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Event
                  </button>
                </div>
              </div>

              {groupEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-8 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-neutral-300 mx-auto" />
                  <h4 className="font-bold text-sm text-neutral-800">No events scheduled for this group yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Plan a gathering, Vesak festival, or Dhamma discussion for your group members.
                  </p>
                  <Link to="/events" className="inline-block mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                    Explore & Post Events
                  </Link>
                </div>
              ) : eventsViewMode === 'map' ? (
                <div className="h-[460px] w-full rounded-xl overflow-hidden border border-neutral-200">
                  <InteractiveEntityMap
                    items={groupEvents.map(e => {
                      const coords = getCoordinatesForLocation(e.loc);
                      return {
                        id: e.id,
                        name: e.title,
                        subtitle: `${e.time} • ${group.title}`,
                        address: e.loc,
                        lat: coords.lat,
                        lng: coords.lng,
                        category: "Group Event",
                        badge: e.going ? "Attending" : "Upcoming",
                        link: "#"
                      };
                    })}
                    height="100%"
                    defaultZoom={11}
                    onItemClick={(item) => {
                      const matched = groupEvents.find(e => String(e.id) === String(item.id));
                      if (matched) {
                        setSelectedEventForModal({
                          id: matched.id,
                          title: matched.title,
                          date: matched.date,
                          time: matched.time,
                          loc: matched.loc,
                          organizer: group.title,
                          isAttending: matched.going,
                          desc: `Organized by ${group.title}. Join fellow members and friends of the community for ${matched.title}.`
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {groupEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      onClick={() => setSelectedEventForModal({
                        id: evt.id,
                        title: evt.title,
                        date: evt.date,
                        time: evt.time,
                        loc: evt.loc,
                        organizer: group.title,
                        isAttending: evt.going,
                        desc: `Organized by ${group.title}. Join fellow members and friends of the community for ${evt.title}. Click below for GPS directions, map details, or to RSVP.`
                      })}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-amber-400 hover:shadow-xs gap-3 cursor-pointer transition-all bg-white group"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <span className="text-[10px] font-bold uppercase">{evt.date.split(' ')[0]}</span>
                          <span className="text-base font-bold leading-none">{evt.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 group-hover:text-amber-600 transition-colors">{evt.title}</h4>
                          <p className="text-[11px] text-neutral-500">{evt.time}</p>
                          <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {evt.loc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEventForModal({
                            id: evt.id,
                            title: evt.title,
                            date: evt.date,
                            time: evt.time,
                            loc: evt.loc,
                            organizer: group.title,
                            isAttending: evt.going,
                            desc: `Organized by ${group.title}. Join fellow members and friends of the community for ${evt.title}.`
                          })}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <MapIcon className="w-3.5 h-3.5 text-amber-600" /> View Map
                        </button>
                        <button 
                          onClick={() => toggleEventGoing(evt.id)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            evt.going ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          {evt.going ? "✓ Attending" : "RSVP"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media & Files & Albums */}
          {activeTab === 'Media' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3">Group Media</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[
                  "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1621532414162-8f15d7870eb0?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=400",
                ].map((img, i) => (
                  <img key={i} src={img} alt="Media" className="w-full aspect-square object-cover rounded-xl shadow-2xs hover:scale-105 transition-transform cursor-pointer" />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Files' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-base text-neutral-900">Shared Documents & Files</h3>
                <button 
                  onClick={() => showToast("File upload selector opened.")}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                >
                  Upload File
                </button>
              </div>
              <div className="space-y-2">
                {filesList.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">{file.name}</h4>
                        <p className="text-[10px] text-neutral-500">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast(`Downloading ${file.name}...`)}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Albums' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-base text-neutral-900">Photo Albums</h3>
                <button 
                  onClick={() => showToast("Album creator modal opened.")}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                >
                  Create Album
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {albumsList.map((album, i) => (
                  <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden hover:border-amber-400 transition-colors cursor-pointer">
                    <img src={album.img} alt={album.name} className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-neutral-900">{album.name}</h4>
                      <p className="text-[10px] text-neutral-500">{album.count} photos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-3">Group Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Group Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editForm.desc}
                    onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>
                <button
                  onClick={(e) => handleSaveGroupEdit(e)}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">Group Info</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Public Group (Anyone can join)</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Visible in Community Directory</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Los Angeles, Southern California</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Event Details Modal with Google Map */}
      <EventDetailModal
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        event={selectedEventForModal}
        onToggleRsvp={(eventId) => toggleEventGoing(String(eventId))}
      />
    </div>
  );
}
