const fs = require('fs');
let content = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Search, Filter, MapPin, UserPlus, Star, MessageSquare } from 'lucide-react';",
  "import { Search, Filter, MapPin, UserPlus, Star, MessageSquare, X } from 'lucide-react';\nimport { useState } from 'react';"
);

// Add toast state to PeopleView
content = content.replace(
  "export function PeopleView() {",
  `export function PeopleView() {
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };`
);

// Add toast UI and replace Connect button
content = content.replace(
  '    <div className="space-y-6">',
  `    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}`
);

content = content.replace(
  /<button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1\.5 transition-colors">\s*<UserPlus className="w-4 h-4" \/> Connect\s*<\/button>/g,
  `<button onClick={() => showToast('Connection request sent to ' + person.name)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                <UserPlus className="w-4 h-4" /> Connect
              </button>`
);

fs.writeFileSync('src/components/directory/PeopleView.tsx', content);
