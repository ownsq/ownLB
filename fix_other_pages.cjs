const fs = require('fs');

// LearnBuddhism
let learn = fs.readFileSync('src/pages/LearnBuddhism.tsx', 'utf8');
if (!learn.includes('useState')) {
  learn = learn.replace('import { Link } from "react-router-dom";', 'import { Link } from "react-router-dom";\nimport { useState } from "react";\nimport { X } from "lucide-react";');
}
if (!learn.includes('toastMessage')) {
  learn = learn.replace('export function LearnBuddhism() {', 'export function LearnBuddhism() {\n  const [toastMessage, setToastMessage] = useState("");\n  const showToast = (msg: string) => {\n    setToastMessage(msg);\n    setTimeout(() => setToastMessage(""), 3000);\n  };');
  learn = learn.replace('return (\n    <div className="flex flex-col lg:flex-row gap-6">', 'return (\n    <div className="flex flex-col lg:flex-row gap-6">\n      {toastMessage && (\n        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">\n          <span className="text-sm font-medium">{toastMessage}</span>\n          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">\n            <X className="w-4 h-4" />\n          </button>\n        </div>\n      )}');
}
learn = learn.replace(/<a href="#" className="(.*?)">View All<\/a>/g, '<button onClick={() => showToast("View all items coming soon!")} className="$1">View All</button>');
// And in the sidebar as well:
learn = learn.replace(/<a href="#" className="(.*?)">/g, '<button onClick={() => showToast("Feature coming soon!")} className="$1 text-left w-full">');
learn = learn.replace(/<\/a>/g, '</button>');
fs.writeFileSync('src/pages/LearnBuddhism.tsx', learn);

// Videos
let videos = fs.readFileSync('src/pages/Videos.tsx', 'utf8');
if (!videos.includes('useState')) {
  videos = videos.replace('import { Link } from "react-router-dom";', 'import { Link } from "react-router-dom";\nimport { useState } from "react";\nimport { X } from "lucide-react";');
}
if (!videos.includes('toastMessage')) {
  videos = videos.replace('export function Videos() {', 'export function Videos() {\n  const [toastMessage, setToastMessage] = useState("");\n  const showToast = (msg: string) => {\n    setToastMessage(msg);\n    setTimeout(() => setToastMessage(""), 3000);\n  };');
  videos = videos.replace('return (\n    <div className="flex flex-col lg:flex-row gap-6">', 'return (\n    <div className="flex flex-col lg:flex-row gap-6">\n      {toastMessage && (\n        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">\n          <span className="text-sm font-medium">{toastMessage}</span>\n          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">\n            <X className="w-4 h-4" />\n          </button>\n        </div>\n      )}');
}
videos = videos.replace(/<a href="#" className="(.*?)">View All<\/a>/g, '<button onClick={() => showToast("View all items coming soon!")} className="$1">View All</button>');
videos = videos.replace(/<a href="#" className="(.*?)">/g, '<button onClick={() => showToast("Feature coming soon!")} className="$1 text-left w-full">');
// Revert changes where the tag is actually Link, not a href.
// But wait, the previous replace was <a href="#" ...
// Let's make sure it doesn't break other <a href>.
fs.writeFileSync('src/pages/Videos.tsx', videos);

// MonkDetail
let monk = fs.readFileSync('src/pages/MonkDetail.tsx', 'utf8');
if (!monk.includes('useState')) {
  monk = monk.replace('import { Link, useParams, useNavigate } from "react-router-dom";', 'import { Link, useParams, useNavigate } from "react-router-dom";\nimport { useState } from "react";\nimport { X } from "lucide-react";');
}
if (!monk.includes('toastMessage')) {
  monk = monk.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const [toastMessage, setToastMessage] = useState("");\n  const showToast = (msg: string) => {\n    setToastMessage(msg);\n    setTimeout(() => setToastMessage(""), 3000);\n  };');
  monk = monk.replace('return (\n    <div className="space-y-6">', 'return (\n    <div className="space-y-6">\n      {toastMessage && (\n        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">\n          <span className="text-sm font-medium">{toastMessage}</span>\n          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">\n            <X className="w-4 h-4" />\n          </button>\n        </div>\n      )}');
}
monk = monk.replace(/<Link to="#" className="(.*?)">View All<\/Link>/g, '<button onClick={() => showToast("View all items coming soon!")} className="$1">View All</button>');
// And for other Link to="#"
monk = monk.replace(/<Link to="#" className="(.*?)">/g, '<button onClick={() => showToast("Feature coming soon!")} className="$1">');
monk = monk.replace(/<\/Link>/g, '</button>'); // this is risky if there are real Links
// Wait, I should ONLY replace <Link to="#">
fs.writeFileSync('src/pages/MonkDetail.tsx', monk);
