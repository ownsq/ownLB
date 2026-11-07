import { Search, Filter, Share2, MapPin, Image as ImageIcon, Video, BarChart2, Calendar, Smile, ThumbsUp, MessageSquare, X, Sparkles } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscribePosts, addPostToDb, subscribeGroups } from '../../lib/firestoreService';

export function FeedView() { 
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [feeling, setFeeling] = useState("Happy");
  const [toastMessage, setToastMessage] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberType, setSelectedMemberType] = useState("All Members");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState("All");
  const [activeTab, setActiveTab] = useState('All Updates');
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPosts = subscribePosts((livePosts) => {
      setPosts(livePosts);
      setLoading(false);
    });
    const unsubGroups = subscribeGroups((liveGroups) => {
      setGroups(liveGroups);
    });
    return () => {
      unsubPosts();
      unsubGroups();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleVote = (postId: number, optionIndex: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId && p.poll && p.poll.votedIndex === null) {
        const newOptions = [...p.poll.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], votes: newOptions[optionIndex].votes + 1 };
        return {
          ...p,
          poll: {
            ...p.poll,
            options: newOptions,
            totalVotes: p.poll.totalVotes + 1,
            votedIndex: optionIndex
          }
        };
      }
      return p;
    }));
  };

  const handlePost = async () => {
    if (!postContent.trim() && !attachment) return;
    const newPost = {
      id: `post-${Date.now()}`,
      author: user?.name || "Community Member",
      authorImg: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      group: "",
      time: "Just now",
      loc: user?.country || "Global Community",
      content: postContent,
      hasImages: attachment === "Photo",
      hasVideo: attachment === "Video",
      poll: attachment === "Poll" ? { options: pollOptions.filter(o => o.trim()).map(opt => ({ text: opt, votes: 0 })), totalVotes: 0, votedIndex: null } : null,
      event: attachment === "Event" ? { date: eventDate, location: eventLocation } : null,
      feeling: attachment === "Feeling" ? feeling : null,
      createdAt: new Date().toISOString()
    };
    try {
      await addPostToDb(newPost);
      showToast("Post shared with the community!");
    } catch (err) {
      console.error("Error saving post to Firestore:", err);
      // Fallback local update
      setPosts([newPost, ...posts]);
    }
    setPostContent("");
    setAttachment(null);
    setPollOptions(["", ""]);
    setEventDate("");
    setEventLocation("");
    setFeeling("Happy");
  };

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
      {/* Search/Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-lg flex items-center">
          <select 
            value={selectedMemberType}
            onChange={(e) => setSelectedMemberType(e.target.value)}
            className="bg-transparent pl-3 pr-8 py-2 text-sm font-medium border-r border-neutral-200 outline-none text-neutral-700"
          >
            <option>All Members</option>
            <option>Verified Only</option>
            <option>Monks</option>
          </select>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { /* Optional: search action */ } }}
              placeholder="Search by name, interest, country..." 
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >
            <option>All Countries</option>
            <option>USA</option>
            <option>Australia</option>
            <option>UK</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h4 className="text-sm font-bold text-neutral-900">Post Type:</h4>
            <div className="flex flex-wrap gap-2">
              {['All', 'With Images', 'Polls', 'Events'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedPostType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedPostType === type ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 min-h-[220px] flex items-center">
        {/* Dark map background placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-80"></div>
        <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200" alt="World Map" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />
        
        <div className="relative z-10 p-8 w-full">
          <h2 className="text-3xl font-bold text-white mb-2">A Global Sri Lankan<br/>Community</h2>
          <p className="text-slate-300 text-sm max-w-sm mb-6">Join a community of 25,000+ members in 120+ countries around the world.</p>
          <button className="bg-white text-slate-900 px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Invite Friends
          </button>
        </div>

        {/* Decorative Community Highlights */}
        <div className="hidden md:flex absolute right-8 top-0 bottom-0 w-1/2 items-center justify-end pr-4">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-xs space-y-1.5 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Global Community Feed
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Connect with Buddhist devotees, community organizations, and diaspora members in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-neutral-900">Featured Groups</h3>
          <button onClick={() => { setSearchParams({ view: 'groups' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Groups</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {groups.length === 0 ? (
            <div className="w-full py-6 text-center text-xs text-neutral-500 bg-white border border-dashed border-neutral-200 rounded-xl">
              No groups created yet. Explore and create interest groups in the Groups tab.
            </div>
          ) : (
            groups.map((group, i) => (
              <div key={group.id || i} onClick={() => navigate('/groups/' + encodeURIComponent((group.title || '').toLowerCase().replace(/\s+/g, '-')), { state: { group } })} className="bg-white rounded-xl border border-neutral-200 min-w-[220px] w-[220px] flex flex-col overflow-hidden flex-shrink-0 cursor-pointer hover:border-orange-300 transition-colors">
                <img referrerPolicy="no-referrer" src={group.img || "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600"} alt={group.title} className="w-full h-24 object-cover" />
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-sm text-neutral-900 truncate">{group.title}</h4>
                  <p className="text-[10px] text-neutral-500 mb-2">{group.type || 'Public Group'} • {group.members || '1'} Members</p>
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-4 flex-1">{group.desc}</p>
                  {joinedGroups.includes(group.title) ? (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setJoinedGroups(joinedGroups.filter(g => g !== group.title)); }} className="w-full py-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      Joined
                    </button>
                  ) : (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setJoinedGroups([...joinedGroups, group.title]); showToast('Request sent to join ' + group.title); }} className="w-full py-1.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feed Section */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Feed Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-neutral-100 px-2 pt-2">
          {['All Updates', 'Connections', 'Groups', 'Events', 'Photos', 'Videos'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-t-lg'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create Post */}
        <div className="p-4 border-b border-neutral-100">
          <div className="flex gap-3">
            <img referrerPolicy="no-referrer" src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
            <input 
              type="text"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || "friend"}?`}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-purple-300 transition-colors"
            />
          </div>
          {attachment === 'Photo' && (
            <div className="mt-3 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
              <ImageIcon className="w-5 h-5 mr-2 text-neutral-400" /> Click to upload a photo (simulation)
            </div>
          )}
          {attachment === 'Video' && (
            <div className="mt-3 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
              <Video className="w-5 h-5 mr-2 text-neutral-400" /> Click to upload a video (simulation)
            </div>
          )}
          {attachment === 'Poll' && (
            <div className="mt-3 space-y-2">
              {pollOptions.map((opt, idx) => (
                <input 
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-blue-300"
                />
              ))}
              <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-sm text-blue-600 font-medium hover:underline">
                + Add Option
              </button>
            </div>
          )}
          {attachment === 'Event' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input 
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-orange-300"
              />
              <input 
                type="text"
                placeholder="Location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-orange-300"
              />
            </div>
          )}
          {attachment === 'Feeling' && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-neutral-600">Feeling:</span>
              <select value={feeling} onChange={(e) => setFeeling(e.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-amber-300">
                <option value="Happy">😊 Happy</option>
                <option value="Excited">🤩 Excited</option>
                <option value="Blessed">😇 Blessed</option>
                <option value="Loved">🥰 Loved</option>
                <option value="Sad">😢 Sad</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4">
              <button onClick={() => setAttachment(attachment === 'Photo' ? null : 'Photo')} className={`flex items-center gap-2 text-xs font-medium transition-colors ${attachment === 'Photo' ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}`}>
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Photo
              </button>
              <button onClick={() => setAttachment(attachment === 'Video' ? null : 'Video')} className={`flex items-center gap-2 text-xs font-medium transition-colors ${attachment === 'Video' ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}`}>
                <Video className="w-4 h-4 text-rose-500" /> Video
              </button>
              <button onClick={() => setAttachment(attachment === 'Poll' ? null : 'Poll')} className={`flex items-center gap-2 text-xs font-medium transition-colors ${attachment === 'Poll' ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}`}>
                <BarChart2 className="w-4 h-4 text-blue-500" /> Poll
              </button>
              <button onClick={() => setAttachment(attachment === 'Event' ? null : 'Event')} className={`flex items-center gap-2 text-xs font-medium transition-colors ${attachment === 'Event' ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}`}>
                <Calendar className="w-4 h-4 text-orange-500" /> Event
              </button>
              <button onClick={() => setAttachment(attachment === 'Feeling' ? null : 'Feeling')} className={`flex items-center gap-2 text-xs font-medium transition-colors ${attachment === 'Feeling' ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}`}>
                <Smile className="w-4 h-4 text-amber-500" /> Feeling
              </button>
            </div>
            <button onClick={handlePost} className="bg-purple-600 text-white px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Post
            </button>
          </div>
        </div>

        {/* Post Feed */}
        <div className="p-4 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-neutral-500">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Connecting to community feed...</p>
            </div>
          ) : (() => {
            const filteredPosts = posts.filter(post => {
              const matchesSearch = (post.content || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (post.author || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (post.loc && post.loc.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesCountry = selectedCountry === "All Countries" || (post.loc && post.loc.includes(selectedCountry));
              
              let matchesType = true;
              if (selectedPostType === "With Images") matchesType = post.hasImages;
              else if (selectedPostType === "Polls") matchesType = !!post.poll;
              else if (selectedPostType === "Events") matchesType = !!post.event;
              
              let matchesTab = true;
              if (activeTab === "Photos") matchesTab = post.hasImages;
              else if (activeTab === "Videos") matchesTab = post.hasVideo;
              else if (activeTab === "Events") matchesTab = !!post.event;
              else if (activeTab === "Groups") matchesTab = !!post.group;

              return matchesSearch && matchesCountry && matchesType && matchesTab;
            });

            if (filteredPosts.length === 0) {
              return (
                <div className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <h4 className="font-bold text-neutral-800 text-base">No community posts yet</h4>
                  <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                    Share the first post, Dhamma reflection, celebration, or question with the global community above!
                  </p>
                </div>
              );
            }

            return (
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="space-y-3 pb-6 border-b border-neutral-100 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img referrerPolicy="no-referrer" src={post.authorImg} alt={post.author} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                      {post.author} 
                      {post.feeling && <span className="text-neutral-500 font-normal">is feeling {post.feeling}</span>}
                      {post.group && (
                        <>
                          <span className="text-neutral-400 font-normal">▶</span> 
                          {post.group}
                        </>
                      )}
                    </h4>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                      {post.time} • <MapPin className="w-3 h-3" /> {post.loc}
                    </p>
                  </div>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600">
                  <span className="text-xl leading-none">⋯</span>
                </button>
              </div>
              
              <p className="text-sm text-neutral-800">
                {post.content}
              </p>
              
              {post.hasImages && (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                  <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600" className="w-full h-48 object-cover row-span-2" alt="Vesak 1" />
                  <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=300" className="w-full h-[94px] object-cover" alt="Vesak 2" />
                  <div className="grid grid-cols-2 gap-1">
                    <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=150" className="w-full h-[94px] object-cover" alt="Vesak 3" />
                    <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=150" className="w-full h-[94px] object-cover" alt="Vesak 4" />
                  </div>
                </div>
              )}
              {post.hasVideo && (
                <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center h-48">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xl">▶</span>
                  </div>
                </div>
              )}
                            {post.poll && post.poll.options && (
                <div className="space-y-2 mt-2">
                  {post.poll.options.map((opt: any, i: number) => {
                    const isVoted = post.poll.votedIndex !== null;
                    const isSelected = post.poll.votedIndex === i;
                    const percentage = post.poll.totalVotes > 0 ? Math.round((opt.votes / post.poll.totalVotes) * 100) : 0;
                    return (
                      <div 
                        key={i} 
                        className={`relative flex items-center gap-3 p-2 rounded-lg transition-colors overflow-hidden ${isVoted ? '' : 'hover:bg-neutral-50 bg-neutral-100 cursor-pointer'}`}
                        onClick={() => !isVoted && handleVote(post.id, i)}
                      >
                        {isVoted && (
                          <div 
                            className={`absolute inset-y-0 left-0 opacity-20 ${isSelected ? 'bg-blue-600' : 'bg-neutral-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex-1 flex items-center justify-between text-sm text-neutral-800 z-10 px-1">
                          <div className="flex items-center gap-2">
                            {!isVoted && (
                              <input 
                                type="radio" 
                                name={`poll-${post.id}`} 
                                className="w-4 h-4 text-blue-600 pointer-events-none"
                                checked={false}
                                readOnly
                              />
                            )}
                            <span className={isSelected ? 'font-medium' : ''}>{opt.text}</span>
                            {isSelected && <span className="text-blue-600 text-xs font-bold">✓</span>}
                          </div>
                          {isVoted && (
                            <span className="text-neutral-600 font-medium">{percentage}%</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-neutral-500 mt-1">{post.poll.totalVotes} vote{post.poll.totalVotes !== 1 ? 's' : ''}</p>
                </div>
              )}
              {post.event && post.event.date && (
                <div className="mt-2 border border-neutral-200 rounded-xl p-3 flex items-center gap-4 bg-orange-50">
                  <div className="bg-white text-orange-600 rounded-lg p-2 text-center w-14 shadow-sm">
                    <div className="text-xs font-bold uppercase">{new Date(post.event.date).toLocaleString('default', { month: 'short' })}</div>
                    <div className="text-lg font-bold leading-none">{new Date(post.event.date).getDate()}</div>
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-sm">Community Event</h5>
                    <p className="text-xs text-neutral-600">{post.event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white text-[8px] text-white">👍</div>
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white text-[8px] text-white">❤️</div>
                  </div>
                  <span className="ml-1">{post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-b border-neutral-100 py-1 px-4 mt-2">
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Like
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Comment
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </motion.div>
                ))}
              </AnimatePresence>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
