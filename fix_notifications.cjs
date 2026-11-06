const fs = require('fs');
let content = fs.readFileSync('src/components/directory/NotificationsView.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Heart, MessageSquare, UserPlus, Calendar, Star } from 'lucide-react';",
  "import { Heart, MessageSquare, UserPlus, Calendar, Star } from 'lucide-react';\nimport { useState } from 'react';"
);

// Convert NOTIFICATIONS to state
content = content.replace(
  "export function NotificationsView() {",
  "export function NotificationsView() {\n  const [notifications, setNotifications] = useState(NOTIFICATIONS);"
);

// Mark all as read
content = content.replace(
  /<button className="text-sm font-medium text-orange-600 hover:text-orange-700">\s*Mark all as read\s*<\/button>/,
  `<button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-sm font-medium text-orange-600 hover:text-orange-700">
          Mark all as read
        </button>`
);

// Map notifications
content = content.replace(
  /\{NOTIFICATIONS\.map\(\(notif, i\) => \(/,
  `{notifications.map((notif, i) => (`
);

// Click notification to mark as read
content = content.replace(
  /className=\{\`p-4 flex gap-4 hover:bg-neutral-50 transition-colors cursor-pointer \$\{notif\.read \? '' : 'bg-orange-50\/30'\}\`\}/,
  `className={\`p-4 flex gap-4 hover:bg-neutral-50 transition-colors cursor-pointer \${notif.read ? '' : 'bg-orange-50/30'}\`}
            onClick={() => {
              const newNotifs = [...notifications];
              newNotifs[i].read = true;
              setNotifications(newNotifs);
            }}`
);

fs.writeFileSync('src/components/directory/NotificationsView.tsx', content);
