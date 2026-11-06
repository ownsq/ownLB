const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// replace View All Groups
content = content.replace(
  /<a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Groups<\/a>/,
  `<button onClick={() => showToast('View all groups coming soon')} className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Groups</button>`
);

content = content.replace(
  /class="w-full py-1\.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"/, // wait, className
  'className="w-full py-1.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"'
);

// replace Join Group
content = content.replace(
  /<button className="w-full py-1\.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">\s*Join Group\s*<\/button>/g,
  `<button onClick={() => showToast('Request sent to join ' + group.title)} className="w-full py-1.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                  Join Group
                </button>`
);

// add clickable cards for groups
content = content.replace(
  /<div key=\{i\} className="bg-white rounded-xl border border-neutral-200 min-w-\[220px\] w-\[220px\] flex flex-col overflow-hidden flex-shrink-0">/g,
  `<div key={i} onClick={() => showToast('Opening ' + group.title)} className="bg-white rounded-xl border border-neutral-200 min-w-[220px] w-[220px] flex flex-col overflow-hidden flex-shrink-0 cursor-pointer hover:border-orange-300 transition-colors">`
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
