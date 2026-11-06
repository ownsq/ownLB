const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

// 1. Add BookmarksView import and component handling
content = content.replace(
  'import { NotificationsView } from "../components/directory/NotificationsView";',
  'import { NotificationsView } from "../components/directory/NotificationsView";\nimport { BookmarksView } from "../components/directory/BookmarksView";'
);

content = content.replace(
  '{view === \'notifications\' && <NotificationsView />}',
  '{view === \'notifications\' && <NotificationsView />}\n          {view === \'bookmarks\' && <BookmarksView />}'
);

// 2. Fix Left Sidebar Bookmarks link
content = content.replace(
  '{ icon: Bookmark, label: "My Bookmarks" },',
  '{ icon: Bookmark, label: "My Bookmarks", id: "bookmarks", active: view === "bookmarks" },'
);

// 3. Fix View All upcoming events
content = content.replace(
  /<a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All<\/a>/,
  `<Link to="/events" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>`
);

// 4. Fix View All popular discussions
content = content.replace(
  /<a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All<\/a>/,
  `<button onClick={() => setView('board')} className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>`
);

// 5. Fix Guidelines button
content = content.replace(
  /<button className="bg-white border border-orange-300 text-orange-700 px-6 py-2 rounded-lg font-medium text-sm hover:bg-orange-100 transition-colors whitespace-nowrap">\s*Community Guidelines\s*<\/button>/,
  `<button onClick={() => alert("Guidelines: Be respectful, focus on Dhamma, and support the community.")} className="bg-white border border-orange-300 text-orange-700 px-6 py-2 rounded-lg font-medium text-sm hover:bg-orange-100 transition-colors whitespace-nowrap">
          Community Guidelines
        </button>`
);

// 6. Fix popular discussion cards to link to board view
content = content.replace(
  /<div key=\{i\} className="flex flex-col p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-orange-200 transition-colors cursor-pointer group">/g,
  `<div key={i} onClick={() => setView('board')} className="flex flex-col p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-orange-200 transition-colors cursor-pointer group">`
);

fs.writeFileSync('src/pages/Directory.tsx', content);
