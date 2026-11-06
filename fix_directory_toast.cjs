const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

content = content.replace(
  'import { NotificationsView } from "../components/directory/NotificationsView";',
  'import { NotificationsView } from "../components/directory/NotificationsView";\nimport { useState } from "react";'
);

content = content.replace(
  'export function Directory() {',
  `export function Directory() {
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };`
);

content = content.replace(
  '<div className="space-y-6">',
  `<div className="space-y-6">
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

// Add X import if missing
if (!content.includes(' X,')) {
  content = content.replace(
    'import { ',
    'import { X, '
  );
}

content = content.replace(
  /alert\("Guidelines: Be respectful, focus on Dhamma, and support the community."\)/,
  `showToast("Guidelines: Be respectful, focus on Dhamma, and support the community.")`
);

fs.writeFileSync('src/pages/Directory.tsx', content);
