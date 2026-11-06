const fs = require('fs');
let content = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Search, Filter, Users, ShieldCheck, Lock, Globe } from 'lucide-react';",
  "import { Search, Filter, Users, ShieldCheck, Lock, Globe, X } from 'lucide-react';\nimport { useState } from 'react';"
);

// Add toast state to GroupsView
content = content.replace(
  "export function GroupsView() {",
  `export function GroupsView() {
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };`
);

// Add toast UI and replace Join button
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
  /<button className="w-full sm:w-auto py-1\.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">\s*<Users className="w-4 h-4" \/> Join Group\s*<\/button>/g,
  `<button onClick={() => showToast('Request sent to join ' + group.title)} className="w-full sm:w-auto py-1.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Join Group
              </button>`
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', content);
