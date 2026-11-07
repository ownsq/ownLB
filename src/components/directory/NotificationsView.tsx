import React, { useState, useEffect } from 'react';
import { 
  Bell, Heart, MessageSquare, Calendar, Building2, Video, Plane, 
  ShoppingBag, BookOpen, Check, Trash2, ExternalLink, Plus, Filter, Sparkles, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeNotifications, 
  addNotificationToDb, 
  markNotificationAsReadInDb, 
  markAllNotificationsAsReadInDb, 
  deleteNotificationFromDb,
  AppNotification 
} from '../../lib/firestoreService';

export function NotificationsView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Create alert form state
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newSection, setNewSection] = useState<AppNotification['section']>('events');
  const [newLink, setNewLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    const unsub = subscribeNotifications((list) => {
      setNotifications(list);
    }, user?.uid);

    return () => unsub();
  }, [user]);

  const currentUserId = user?.uid || 'guest';

  const isRead = (notif: AppNotification) => {
    return notif.readBy && notif.readBy.includes(currentUserId);
  };

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (isRead(notif)) return;
    try {
      await markNotificationAsReadInDb(notif.id, currentUserId, notif.readBy);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadInDb(notifications, currentUserId);
      showToast("All notifications marked as read");
    } catch (err) {
      console.error(err);
      showToast("Failed to mark all as read");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotificationFromDb(id);
      showToast("Notification deleted");
    } catch (err) {
      console.error(err);
      showToast("Could not delete notification");
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await addNotificationToDb({
        title: newTitle.trim(),
        message: newMessage.trim(),
        section: newSection,
        link: newLink.trim() || undefined,
        authorName: user?.displayName || user?.name || "Community Member",
        authorAvatar: user?.photoURL || user?.avatar || undefined,
        userId: 'all',
        type: 'announcement',
        createdAt: new Date().toISOString()
      });
      setNewTitle("");
      setNewMessage("");
      setNewLink("");
      setShowCreateModal(false);
      showToast("Community alert published to Firebase!");
    } catch (err) {
      console.error(err);
      showToast("Failed to create alert in Firebase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionIcon = (section?: string) => {
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

  const formatRelativeTime = (isoString?: string) => {
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

  // Filter list
  const filteredList = notifications.filter(n => {
    if (selectedSection !== 'all' && n.section !== selectedSection) {
      return false;
    }
    if (filterRead === 'unread' && isRead(n)) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !isRead(n)).length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 z-50 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 text-lg">Notifications & Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time updates across Temples, Events, Dhamma Videos, Marketplace & Community
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead} 
              className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}

          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Section Filters & Read/Unread Toggle */}
      <div className="p-3 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'all', label: 'All Sections' },
            { id: 'events', label: 'Events' },
            { id: 'temples', label: 'Temples' },
            { id: 'videos', label: 'Videos' },
            { id: 'travel', label: 'Travel Buddies' },
            { id: 'classifieds', label: 'Marketplace' },
            { id: 'learn', label: 'Dhamma' },
            { id: 'community', label: 'Community' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedSection === sec.id
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setFilterRead('all')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              filterRead === 'all' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              filterRead === 'unread' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-100">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">You're all caught up!</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                {selectedSection !== 'all' 
                  ? `No active notifications in the ${selectedSection} section.` 
                  : "No new notifications or alerts in the community database. Live updates will appear here."}
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Community Announcement</span>
              </button>
            )}
          </div>
        ) : (
          filteredList.map((notif) => {
            const secInfo = getSectionIcon(notif.section);
            const SecIcon = secInfo.icon;
            const read = isRead(notif);

            return (
              <div 
                key={notif.id} 
                onClick={() => {
                  handleMarkAsRead(notif);
                  if (notif.link) {
                    navigate(notif.link);
                  }
                }}
                className={`p-4 sm:p-5 flex items-start gap-3.5 hover:bg-neutral-50/80 transition-colors cursor-pointer group ${
                  read ? 'bg-white' : 'bg-amber-50/25'
                }`}
              >
                {/* Section Icon Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${secInfo.bg} ${secInfo.color}`}>
                  <SecIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${secInfo.bg} ${secInfo.color}`}>
                      {secInfo.label}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500 font-medium">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                    {notif.authorName && (
                      <>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs text-neutral-600 truncate">
                          By {notif.authorName}
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className={`text-sm mt-1 leading-snug group-hover:text-amber-700 transition-colors ${
                    read ? 'text-neutral-800 font-medium' : 'text-neutral-900 font-bold'
                  }`}>
                    {notif.title}
                  </h4>

                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800">
                      <span>View details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Actions & Unread Indicator */}
                <div className="flex items-center gap-2 shrink-0 self-center">
                  {!read && (
                    <div 
                      className="w-2.5 h-2.5 rounded-full bg-amber-600" 
                      title="Unread notification"
                    />
                  )}
                  {user && (
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-neutral-900 text-base">Broadcast Community Alert</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Target Section</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="events">Events & Gatherings</option>
                  <option value="temples">Temples & Monasteries</option>
                  <option value="videos">Dhamma Videos</option>
                  <option value="travel">Travel Buddies</option>
                  <option value="classifieds">Marketplace & Auctions</option>
                  <option value="learn">Dhamma Learning</option>
                  <option value="community">General Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Vesak Meditation Retreat Scheduled"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Message Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the update, timing, or important instructions..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /events, /temples, or /videos"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Broadcasting..." : "Publish to Firebase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
