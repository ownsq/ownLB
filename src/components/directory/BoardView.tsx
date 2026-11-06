import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MessageSquare, ThumbsUp, MapPin, X, Send, 
  Sparkles, CheckCircle2, Bookmark, Share2, Tag, Filter,
  MessageCircle, CornerDownRight, Heart, User, Check
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export interface TopicComment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  likes?: number;
  liked?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  author: string;
  time: string;
  replies: number;
  likes: number;
  liked?: boolean;
  bookmarked?: boolean;
  img: string;
  category: string;
  content: string;
  pinned?: boolean;
  tags?: string[];
  comments: TopicComment[];
}

const STORAGE_KEY = "sl_community_board_topics_v2";

const defaultTopics: Topic[] = [
  {
    id: "top-intro",
    title: "Ayubowan! Introducing myself from Los Angeles chapter",
    author: "Malith Weerasinghe",
    time: "30 mins ago",
    replies: 8,
    likes: 19,
    liked: false,
    bookmarked: false,
    pinned: true,
    tags: ["Welcome", "Los Angeles", "Community"],
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    category: "Introductions",
    content: "Ayubowan everyone! I recently relocated to Southern California from Kandy. Excited to connect with local Sri Lankan Dhamma friends, join weekend temple Dana sessions, and volunteer for community initiatives. Looking forward to meeting you all!",
    comments: [
      {
        id: "c-intro-1",
        author: "Ven. Thilakawansha Thero",
        avatar: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200",
        time: "20 mins ago",
        text: "Warm welcome to our community, Malith! You are warmly invited to our Sunday meditation and Dhamma discussions at the LA Buddhist Temple."
      },
      {
        id: "c-intro-2",
        author: "Chamika J.",
        avatar: "https://i.pravatar.cc/150?u=chamika",
        time: "10 mins ago",
        text: "Welcome Malith! There's an active cricket and weekend hiking group here too. Glad to have you with us!"
      }
    ]
  },
  { 
    id: "top-1",
    title: "What is the best Buddhist book for beginners?", 
    author: "Vimukthi Perera", 
    time: "2 hours ago", 
    replies: 24, 
    likes: 42,
    liked: true,
    bookmarked: true,
    tags: ["Dhamma", "Books", "Beginners"],
    img: "https://i.pravatar.cc/150?u=vimukthi", 
    category: "Dhamma Discussions",
    content: "I want to start studying Theravada Buddhism more deeply this year. Which introductory books would you recommend for grasping the core tenets clearly without feeling overwhelmed by technical Pali terms?",
    comments: [
      { 
        id: "c-1", 
        author: "Ven. Thilakawansha Thero", 
        avatar: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200", 
        time: "1 hour ago", 
        text: "'What the Buddha Taught' by Walpola Rahula Thero is the quintessential foundational reading. May your study bear fruit!" 
      },
      { 
        id: "c-2", 
        author: "Nirosha J.", 
        avatar: "https://i.pravatar.cc/150?u=nirosha", 
        time: "45 mins ago", 
        text: "Bhikkhu Bodhi's 'In the Buddha's Words' is also an exceptional canonical anthology arranged thematically." 
      }
    ]
  },
  { 
    id: "top-2",
    title: "How to stay mindful in a busy corporate environment?", 
    author: "Kavindu Silva", 
    time: "4 hours ago", 
    replies: 18, 
    likes: 31,
    liked: false,
    tags: ["Mindfulness", "Workplace", "Wellness"],
    img: "https://i.pravatar.cc/150?u=kavindu", 
    category: "Community Help",
    content: "Balancing deadlines, emails, and back-to-back meetings often leaves me mentally exhausted by 3 PM. How do other working professionals incorporate micro-meditations during workday breaks?",
    comments: [
      { 
        id: "c-3", 
        author: "Sahan J.", 
        avatar: "https://i.pravatar.cc/150?u=sahan", 
        time: "2 hours ago", 
        text: "I take a 3-minute conscious breathing break before entering any high-stakes meeting. It completely resets my autonomic nervous system." 
      }
    ]
  },
  { 
    id: "top-3",
    title: "Best cultural and temple circuits to visit in Sri Lanka", 
    author: "Rashmi De Silva", 
    time: "6 hours ago", 
    replies: 32, 
    likes: 56,
    liked: false,
    tags: ["Heritage", "Pilgrimage", "Travel"],
    img: "https://i.pravatar.cc/150?u=rashmi", 
    category: "Travel & Lifestyle",
    content: "Planning a 2-week heritage tour including Anuradhapura, Polonnaruwa, Dambulla, and Sigiriya. Any hidden gem monasteries or quiet meditation centers along the route?",
    comments: [
      { 
        id: "c-4", 
        author: "Chamika J.", 
        avatar: "https://i.pravatar.cc/150?u=chamika", 
        time: "5 hours ago", 
        text: "Do not miss Ritigala Strict Natural Reserve forest hermitage! It is ancient, peaceful, and untouched by heavy commercial tourism." 
      }
    ]
  },
  { 
    id: "top-4",
    title: "Looking for travel buddies to Japan in November", 
    author: "Sahan Jayasekara", 
    time: "8 hours ago", 
    replies: 15, 
    likes: 14,
    liked: false,
    tags: ["Japan", "Expats", "Travel Buddies"],
    img: "https://i.pravatar.cc/150?u=sahan", 
    category: "Travel & Lifestyle",
    content: "Visiting Kyoto temple gardens during autumn foliage season. Would love to link up with fellow Sri Lankan expats traveling in the Kansai area.",
    comments: []
  },
  { 
    id: "top-5",
    title: "Organizing a Vesak Dana in Melbourne - Volunteers needed", 
    author: "Nadeesha Perera", 
    time: "1 day ago", 
    replies: 45, 
    likes: 78,
    liked: false,
    tags: ["Melbourne", "Vesak", "Volunteering"],
    img: "https://i.pravatar.cc/150?u=nadeesha", 
    category: "Events & Activities",
    content: "We need 10 volunteers to help prep food stalls and tea distribution for the upcoming temple festival. Please comment if you can spare 2 hours on Saturday morning.",
    comments: []
  },
];

export function BoardView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load topics from localStorage or fallback
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse community board topics:", e);
    }
    return defaultTopics;
  });

  // Category and search state
  const initialCategoryParam = searchParams.get("category");
  const [activeTab, setActiveTab] = useState<string>(
    initialCategoryParam && ['Introductions', 'Dhamma Discussions', 'Community Help', 'Travel & Lifestyle', 'Events & Activities'].includes(initialCategoryParam)
      ? initialCategoryParam
      : 'All Topics'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [newTopicForm, setNewTopicForm] = useState({ 
    title: '', 
    category: 'Dhamma Discussions', 
    content: '',
    tags: ''
  });
  const [replyText, setReplyText] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
    } catch (e) {
      console.error("Failed to save topics to localStorage:", e);
    }
  }, [topics]);

  // Handle URL query parameters on mount or change
  useEffect(() => {
    const topicIdParam = searchParams.get("topicId");
    if (topicIdParam) {
      const match = topics.find(t => t.id === topicIdParam);
      if (match) {
        setSelectedTopic(match);
      }
    }

    const catParam = searchParams.get("category");
    if (catParam) {
      setActiveTab(catParam);
    }
  }, [searchParams, topics]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'All Topics') {
      newParams.delete('category');
    } else {
      newParams.set('category', tab);
    }
    setSearchParams(newParams);
  };

  const handleOpenTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('topicId', topic.id);
    setSearchParams(newParams);
  };

  const handleCloseTopic = () => {
    setSelectedTopic(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('topicId');
    setSearchParams(newParams);
  };

  const handleToggleLike = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const isLiked = !t.liked;
        const newLikes = isLiked ? t.likes + 1 : Math.max(0, t.likes - 1);
        const updated = { ...t, liked: isLiked, likes: newLikes };
        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  const handleToggleBookmark = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const isBookmarked = !t.bookmarked;
        const updated = { ...t, bookmarked: isBookmarked };
        if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic(updated);
        }
        showToast(isBookmarked ? "Discussion saved to your bookmarks!" : "Removed from bookmarks.");
        return updated;
      }
      return t;
    }));
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicForm.title.trim() || !newTopicForm.content.trim()) return;

    const parsedTags = newTopicForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      title: newTopicForm.title.trim(),
      author: user?.name || "Saminda Fernando",
      time: "Just now",
      replies: 0,
      likes: 1,
      liked: true,
      bookmarked: false,
      pinned: false,
      tags: parsedTags.length > 0 ? parsedTags : [newTopicForm.category],
      img: user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
      category: newTopicForm.category,
      content: newTopicForm.content.trim(),
      comments: []
    };

    const updated = [newTopic, ...topics];
    setTopics(updated);
    setIsNewTopicModalOpen(false);
    setNewTopicForm({ title: '', category: 'Dhamma Discussions', content: '', tags: '' });
    showToast("Discussion topic published to the community board!");
    handleOpenTopic(newTopic);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTopic) return;

    const newComment: TopicComment = {
      id: `com-${Date.now()}`,
      author: user?.name || "Saminda Fernando",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
      time: "Just now",
      text: replyText.trim()
    };

    const updatedTopic = {
      ...selectedTopic,
      replies: selectedTopic.replies + 1,
      comments: [...selectedTopic.comments, newComment]
    };

    setSelectedTopic(updatedTopic);
    setTopics(topics.map(t => t.id === updatedTopic.id ? updatedTopic : t));
    setReplyText("");
    showToast("Your reply was posted successfully!");
  };

  const handleShareTopic = (topic: Topic) => {
    const url = `${window.location.origin}/directory?view=board&topicId=${topic.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast("Discussion link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      showToast("Link: " + url);
    }
  };

  const categories = [
    'All Topics',
    'Introductions',
    'Dhamma Discussions',
    'Community Help',
    'Travel & Lifestyle',
    'Events & Activities'
  ];

  const filteredTopics = topics.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchesTab = activeTab === 'All Topics' || t.category === activeTab;
    const matchesQuery = !q || 
      t.title.toLowerCase().includes(q) || 
      t.content.toLowerCase().includes(q) || 
      t.author.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q)) ||
      t.comments.some(c => c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
    return matchesTab && matchesQuery;
  });

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

      {/* Topic Reader Modal */}
      {selectedTopic && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={handleCloseTopic}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100 shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-md">
                    {selectedTopic.category}
                  </span>
                  {selectedTopic.pinned && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      📌 Pinned
                    </span>
                  )}
                  {selectedTopic.tags?.map((tag, idx) => (
                    <span key={idx} className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg md:text-xl text-neutral-900 leading-snug">{selectedTopic.title}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 pt-0.5">
                  <img src={selectedTopic.img} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span>Posted by <strong className="text-neutral-800">{selectedTopic.author}</strong></span>
                  <span>•</span>
                  <span>{selectedTopic.time}</span>
                </div>
              </div>
              <button 
                onClick={handleCloseTopic} 
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Conversation */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Topic Post Content */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {selectedTopic.content}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between py-2 border-y border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleLike(selectedTopic.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                      selectedTopic.liked 
                        ? 'bg-orange-50 border-orange-300 text-orange-700' 
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${selectedTopic.liked ? 'fill-current text-orange-600' : ''}`} />
                    <span>{selectedTopic.likes} Likes</span>
                  </button>

                  <button 
                    onClick={() => handleToggleBookmark(selectedTopic.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                      selectedTopic.bookmarked 
                        ? 'bg-amber-50 border-amber-300 text-amber-700' 
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${selectedTopic.bookmarked ? 'fill-current text-amber-600' : ''}`} />
                    <span>{selectedTopic.bookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <button 
                    onClick={() => handleShareTopic(selectedTopic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 font-semibold text-neutral-700 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Share"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-neutral-500 font-medium">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{selectedTopic.replies} Replies</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-orange-600" />
                  Community Responses ({selectedTopic.comments.length})
                </h4>

                {selectedTopic.comments.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-50/80 rounded-xl border border-neutral-100">
                    <p className="text-xs text-neutral-500 italic">No responses yet. Be the first to share your Dhamma reflection or helpful tip!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedTopic.comments.map((c) => (
                      <div key={c.id} className="p-3.5 border border-neutral-100 rounded-xl space-y-1.5 bg-white shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={c.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-bold text-xs text-neutral-900">{c.author}</span>
                            <span className="text-[10px] text-neutral-400">• {c.time}</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-700 leading-relaxed pl-8">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleAddReply} className="pt-3 border-t border-neutral-100 flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="Share your perspective, experience, or advice..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" /> Post Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-xl flex items-center shadow-2xs">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search discussions by topic, question, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsNewTopicModalOpen(true)} 
            className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </button>
        </div>
      </div>

      {/* Category Tabs and Discussion List Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-neutral-100 px-3 pt-2">
          {categories.map((tab) => {
            const count = tab === 'All Topics' 
              ? topics.length 
              : topics.filter(t => t.category === tab).length;

            return (
              <button 
                key={tab} 
                onClick={() => handleSelectTab(tab)}
                className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab 
                    ? 'border-orange-600 text-orange-700' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeTab === tab ? 'bg-orange-100 text-orange-800' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Discussion Items */}
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">No discussions found</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery 
                ? `No topics matched your search for "${searchQuery}". Try different keywords or clear your query.` 
                : `There are no posts under "${activeTab}" yet. Be the first to start a conversation!`
              }
            </p>
            <div className="pt-2 flex justify-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 font-medium"
                >
                  Clear Search
                </button>
              )}
              <button 
                onClick={() => {
                  setNewTopicForm(prev => ({ ...prev, category: activeTab === 'All Topics' ? 'Dhamma Discussions' : activeTab }));
                  setIsNewTopicModalOpen(true);
                }}
                className="px-4 py-1.5 text-xs text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-bold"
              >
                Post New Topic
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredTopics.map((topic) => (
              <div 
                key={topic.id} 
                onClick={() => handleOpenTopic(topic)}
                className="p-5 hover:bg-orange-50/20 transition-colors cursor-pointer group"
              >
                <div className="flex gap-4">
                  <img 
                    referrerPolicy="no-referrer" 
                    src={topic.img} 
                    alt={topic.author} 
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-neutral-100 shadow-2xs" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-bold border border-orange-200">
                            {topic.category}
                          </span>
                          {topic.pinned && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Pinned
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-neutral-900 text-sm md:text-base group-hover:text-orange-600 transition-colors line-clamp-2">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-neutral-600 line-clamp-2 mt-1 mb-2 leading-relaxed">
                          {topic.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>By <strong className="text-neutral-700">{topic.author}</strong></span>
                          <span>•</span>
                          <span>{topic.time}</span>
                        </div>
                      </div>

                      {/* Stat Counters & Quick Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleToggleLike(topic.id, e)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              topic.liked 
                                ? 'bg-orange-50 border-orange-200 text-orange-600' 
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                            }`}
                            title="Upvote discussion"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${topic.liked ? 'fill-current' : ''}`} />
                            <span>{topic.likes}</span>
                          </button>

                          <div className="flex items-center gap-1 bg-neutral-100 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 border border-neutral-200">
                            <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{topic.replies}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-orange-600 group-hover:underline flex items-center gap-1">
                          Join Discussion →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Topic Creation Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Start a Community Discussion</h3>
                  <p className="text-xs text-neutral-500">Ask a question, share Dhamma insights, or offer support</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewTopicModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Discussion Title *</label>
                <input 
                  type="text" 
                  value={newTopicForm.title}
                  onChange={e => setNewTopicForm({...newTopicForm, title: e.target.value})}
                  placeholder="e.g. What is the best method to practice Vipassana at home?"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={newTopicForm.category}
                    onChange={e => setNewTopicForm({...newTopicForm, category: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {[
                      'Introductions',
                      'Dhamma Discussions', 
                      'Community Help', 
                      'Travel & Lifestyle', 
                      'Events & Activities'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newTopicForm.tags}
                    onChange={e => setNewTopicForm({...newTopicForm, tags: e.target.value})}
                    placeholder="e.g. Meditation, Sutta, Daily Life"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Elaboration / Context *</label>
                <textarea 
                  value={newTopicForm.content}
                  onChange={e => setNewTopicForm({...newTopicForm, content: e.target.value})}
                  placeholder="Elaborate on your question, reflection, or experience to invite helpful community replies..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-28"
                  required
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
                <button 
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTopicForm.title.trim() || !newTopicForm.content.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
