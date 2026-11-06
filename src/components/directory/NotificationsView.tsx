import { Heart, MessageSquare, UserPlus, Calendar, Star } from 'lucide-react';
import { useState } from 'react';

export function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="font-bold text-neutral-900 text-lg">Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Mark all as read
          </button>
        )}
      </div>
      <div className="divide-y divide-neutral-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            You're all caught up! No new notifications.
          </div>
        ) : (
          notifications.map((notif, i) => (
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
          ))
        )}
      </div>
    </div>
  );
}
