import { Heart, MessageSquare, UserPlus, Calendar, Star } from 'lucide-react';
import { useState } from 'react';

const NOTIFICATIONS = [
  { icon: Heart, color: "text-red-500", bg: "bg-red-50", text: "Chamika Jayawardena liked your post.", time: "10 mins ago", read: false },
  { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50", text: "Rashmi De Silva commented on your travel plan.", time: "1 hour ago", read: false },
  { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50", text: "Vimukthi Perera sent you a connection request.", time: "2 hours ago", read: false },
  { icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", text: "Upcoming Event: Vesak Celebration starts tomorrow.", time: "1 day ago", read: true },
  { icon: Star, color: "text-amber-500", bg: "bg-amber-50", text: "Your post 'Best places to visit in Sri Lanka' is trending!", time: "2 days ago", read: true },
  { icon: Heart, color: "text-red-500", bg: "bg-red-50", text: "Sahan Jayasekara liked your comment.", time: "3 days ago", read: true },
  { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50", text: "Kavindu Silva accepted your connection request.", time: "4 days ago", read: true },
];

export function NotificationsView() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="font-bold text-neutral-900 text-lg">Notifications</h3>
        <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-sm font-medium text-orange-600 hover:text-orange-700">
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-neutral-100">
        {notifications.map((notif, i) => (
          <div key={i} className={`p-4 flex gap-4 hover:bg-neutral-50 transition-colors cursor-pointer ${notif.read ? '' : 'bg-orange-50/30'}`}
            onClick={() => {
              const newNotifs = [...notifications];
              newNotifs[i].read = true;
              setNotifications(newNotifs);
            }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
              <notif.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${notif.read ? 'text-neutral-600' : 'text-neutral-900 font-medium'}`}>
                {notif.text}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{notif.time}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-orange-600 self-center"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
