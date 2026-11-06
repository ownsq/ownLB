const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  "import { Search, Filter, Share2, MapPin, Image as ImageIcon, Video, BarChart2, Calendar, Smile, ThumbsUp, MessageSquare } from 'lucide-react';",
  "import { Search, Filter, Share2, MapPin, Image as ImageIcon, Video, BarChart2, Calendar, Smile, ThumbsUp, MessageSquare, X } from 'lucide-react';"
);

content = content.replace(
  '  const [attachment, setAttachment] = useState<string | null>(null);',
  '  const [attachment, setAttachment] = useState<string | null>(null);\n  const [toastMessage, setToastMessage] = useState("");'
);

const showToastFunc = `  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };`;

content = content.replace(
  '  const handlePost = () => {',
  showToastFunc + '\n\n  const handlePost = () => {'
);

const photoBtn = `<button onClick={() => showToast("Photo upload coming soon")} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Photo
              </button>`;

content = content.replace(
  /<button onClick=\{[^}]+\} className=\{\`flex items-center gap-2 text-xs font-medium transition-colors \$\{attachment === 'Photo'.*?\`\}>\s*<ImageIcon className="w-4 h-4 text-emerald-500" \/> Photo\s*<\/button>/,
  photoBtn
);

const videoBtn = `<button onClick={() => showToast("Video upload coming soon")} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                <Video className="w-4 h-4 text-rose-500" /> Video
              </button>`;
content = content.replace(
  /<button onClick=\{[^}]+\} className=\{\`flex items-center gap-2 text-xs font-medium transition-colors \$\{attachment === 'Video'.*?\`\}>\s*<Video className="w-4 h-4 text-rose-500" \/> Video\s*<\/button>/,
  videoBtn
);

const pollBtn = `<button onClick={() => showToast("Poll creation coming soon")} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                <BarChart2 className="w-4 h-4 text-blue-500" /> Poll
              </button>`;
content = content.replace(
  /<button onClick=\{[^}]+\} className=\{\`flex items-center gap-2 text-xs font-medium transition-colors \$\{attachment === 'Poll'.*?\`\}>\s*<BarChart2 className="w-4 h-4 text-blue-500" \/> Poll\s*<\/button>/,
  pollBtn
);

const eventBtn = `<button onClick={() => showToast("Event creation coming soon")} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                <Calendar className="w-4 h-4 text-orange-500" /> Event
              </button>`;
content = content.replace(
  /<button onClick=\{[^}]+\} className=\{\`flex items-center gap-2 text-xs font-medium transition-colors \$\{attachment === 'Event'.*?\`\}>\s*<Calendar className="w-4 h-4 text-orange-500" \/> Event\s*<\/button>/,
  eventBtn
);

const feelingBtn = `<button onClick={() => showToast("Feeling selection coming soon")} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                <Smile className="w-4 h-4 text-amber-500" /> Feeling
              </button>`;
content = content.replace(
  /<button onClick=\{[^}]+\} className=\{\`flex items-center gap-2 text-xs font-medium transition-colors \$\{attachment === 'Feeling'.*?\`\}>\s*<Smile className="w-4 h-4 text-amber-500" \/> Feeling\s*<\/button>/,
  feelingBtn
);

const toastJSX = `      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}`;

content = content.replace(
  '    <div className="space-y-6">',
  '    <div className="space-y-6">\n' + toastJSX
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
