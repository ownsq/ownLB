const fs = require('fs');
let content = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

content = content.replace(
  'import { Link, Outlet, useLocation } from "react-router-dom";',
  'import { Link, Outlet, useLocation } from "react-router-dom";\nimport { useState, useRef, useEffect } from "react";'
);

// Add state to MainLayout
content = content.replace(
  'const { user, logout } = useAuth();',
  `const { user, logout } = useAuth();\n  const [showNotifications, setShowNotifications] = useState(false);\n  const notificationsRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {\n        setShowNotifications(false);\n      }\n    };\n    document.addEventListener("mousedown", handleClickOutside);\n    return () => document.removeEventListener("mousedown", handleClickOutside);\n  }, []);`
);

// Add missing icon imports if needed
if (!content.includes('Heart')) {
  content = content.replace(
    'ChevronDown, MapPin',
    'ChevronDown, MapPin, Heart, UserPlus'
  );
}

// Replace the bell icon with a button and dropdown
const bellHtml = `
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  3
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { icon: Heart, color: "text-red-500", bg: "bg-red-50", text: "Chamika Jayawardena liked your post.", time: "10 mins ago" },
                      { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50", text: "Rashmi De Silva commented on your travel plan.", time: "1 hour ago" },
                      { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50", text: "Vimukthi Perera sent you a connection request.", time: "2 hours ago" },
                    ].map((notif, i) => (
                      <div key={i} className="p-3 border-b border-neutral-50 flex gap-3 hover:bg-neutral-50 transition-colors cursor-pointer">
                        <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${notif.bg} \${notif.color}\`}>
                          <notif.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-900 font-medium leading-snug">{notif.text}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-neutral-100 text-center bg-neutral-50">
                    <Link 
                      to="/directory?view=notifications" 
                      onClick={() => setShowNotifications(false)}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      See all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
`;

content = content.replace(
  /<Link to="\/directory\?view=notifications" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">[\s\S]*?<\/Link>/m,
  bellHtml
);

fs.writeFileSync('src/components/layout/MainLayout.tsx', content);
