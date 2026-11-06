const fs = require('fs');
let content = fs.readFileSync('src/components/directory/TravelView.tsx', 'utf8');

// Update imports
content = content.replace(
  "import { Search, Filter, Plane, Calendar, MapPin, MessageSquare } from 'lucide-react';",
  "import { Search, Filter, Plane, Calendar, MapPin, MessageSquare, X } from 'lucide-react';\nimport { useState } from 'react';"
);

// Add toast state to TravelView
content = content.replace(
  "export function TravelView() {",
  `export function TravelView() {
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };`
);

// Add toast UI and replace Post a Trip button
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
  /<button className="bg-purple-600 text-white border border-purple-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-purple-700 transition-colors">\s*<Plane className="w-4 h-4" \/> Post a Trip\s*<\/button>/,
  `<button onClick={() => showToast('Posting a trip feature coming soon!')} className="bg-purple-600 text-white border border-purple-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-purple-700 transition-colors">
            <Plane className="w-4 h-4" /> Post a Trip
          </button>`
);

content = content.replace(
  /<button className="flex-1 py-1\.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">Connect<\/button>/g,
  `<button onClick={() => showToast('Connection request sent to ' + traveler.name)} className="flex-1 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">Connect</button>`
);

fs.writeFileSync('src/components/directory/TravelView.tsx', content);
