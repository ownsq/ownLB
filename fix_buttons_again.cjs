const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  /<button onClick=\{\(\) => showToast\("Photo upload coming soon"\)\} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">\s*<ImageIcon className="w-4 h-4 text-emerald-500" \/> Photo\s*<\/button>/,
  `<button onClick={() => setAttachment(attachment === 'Photo' ? null : 'Photo')} className={\`flex items-center gap-2 text-xs font-medium transition-colors \${attachment === 'Photo' ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}\`}>
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Photo
              </button>`
);

content = content.replace(
  /<button onClick=\{\(\) => showToast\("Video upload coming soon"\)\} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">\s*<Video className="w-4 h-4 text-rose-500" \/> Video\s*<\/button>/,
  `<button onClick={() => setAttachment(attachment === 'Video' ? null : 'Video')} className={\`flex items-center gap-2 text-xs font-medium transition-colors \${attachment === 'Video' ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}\`}>
                <Video className="w-4 h-4 text-rose-500" /> Video
              </button>`
);

content = content.replace(
  /<button onClick=\{\(\) => showToast\("Poll creation coming soon"\)\} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">\s*<BarChart2 className="w-4 h-4 text-blue-500" \/> Poll\s*<\/button>/,
  `<button onClick={() => setAttachment(attachment === 'Poll' ? null : 'Poll')} className={\`flex items-center gap-2 text-xs font-medium transition-colors \${attachment === 'Poll' ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}\`}>
                <BarChart2 className="w-4 h-4 text-blue-500" /> Poll
              </button>`
);

content = content.replace(
  /<button onClick=\{\(\) => showToast\("Event creation coming soon"\)\} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">\s*<Calendar className="w-4 h-4 text-orange-500" \/> Event\s*<\/button>/,
  `<button onClick={() => setAttachment(attachment === 'Event' ? null : 'Event')} className={\`flex items-center gap-2 text-xs font-medium transition-colors \${attachment === 'Event' ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}\`}>
                <Calendar className="w-4 h-4 text-orange-500" /> Event
              </button>`
);

content = content.replace(
  /<button onClick=\{\(\) => showToast\("Feeling selection coming soon"\)\} className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">\s*<Smile className="w-4 h-4 text-amber-500" \/> Feeling\s*<\/button>/,
  `<button onClick={() => setAttachment(attachment === 'Feeling' ? null : 'Feeling')} className={\`flex items-center gap-2 text-xs font-medium transition-colors \${attachment === 'Feeling' ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded-md' : 'text-neutral-600 hover:text-neutral-900'}\`}>
                <Smile className="w-4 h-4 text-amber-500" /> Feeling
              </button>`
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
