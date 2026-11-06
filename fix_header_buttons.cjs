const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

content = content.replace(
  /<button className="bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">\s*<Plus className="w-4 h-4" \/> Create Group\s*<\/button>/,
  `<button onClick={() => showToast('Group creation coming soon!')} className="bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Group
          </button>`
);

content = content.replace(
  /<button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">\s*<Calendar className="w-4 h-4" \/> Organize Event\s*<\/button>/,
  `<Link to="/events" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4" /> Organize Event
          </Link>`
);

fs.writeFileSync('src/pages/Directory.tsx', content);
