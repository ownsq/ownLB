const fs = require('fs');
let content = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

// replace the empty buttons with links
content = content.replace(
  /<button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">(\s*)<MessageSquare className="w-5 h-5" \/>(\s*)<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"><\/span>(\s*)<\/button>/m,
  '<Link to="/directory?view=messages" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">\n              <MessageSquare className="w-5 h-5" />\n              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>\n            </Link>'
);

content = content.replace(
  /<button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">(\s*)<Bell className="w-5 h-5" \/>(\s*)<span className="absolute top-0 right-0 bg-red-500 text-white text-\[10px\] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">(\s*)3(\s*)<\/span>(\s*)<\/button>/m,
  '<Link to="/directory?view=notifications" className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">\n              <Bell className="w-5 h-5" />\n              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">\n                3\n              </span>\n            </Link>'
);

fs.writeFileSync('src/components/layout/MainLayout.tsx', content);
