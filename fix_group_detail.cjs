const fs = require('fs');
let content = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

content = content.replace(
  /<h3 className="font-bold text-neutral-900">About This Group<\/h3>\s*<button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All<\/button>/g,
  `<h3 className="font-bold text-neutral-900">About This Group</h3>\n              <button onClick={() => setActiveTab('About')} className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>`
);

content = content.replace(
  /<h3 className="font-bold text-neutral-900">Group Members<\/h3>\s*<span className="text-sm font-medium text-neutral-500">1\.2K<\/span>\s*<\/div>\s*<button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All<\/button>/g,
  `<h3 className="font-bold text-neutral-900">Group Members</h3>\n                <span className="text-sm font-medium text-neutral-500">1.2K</span>\n              </div>\n              <button onClick={() => setActiveTab('Members')} className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>`
);

content = content.replace(
  /<h3 className="font-bold text-neutral-900">Upcoming Events<\/h3>\s*<button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All<\/button>/g,
  `<h3 className="font-bold text-neutral-900">Upcoming Events</h3>\n              <button onClick={() => setActiveTab('Events')} className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>`
);

content = content.replace(
  /<h3 className="font-bold text-neutral-900">Recent Media<\/h3>\s*<button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All<\/button>/g,
  `<h3 className="font-bold text-neutral-900">Recent Media</h3>\n              <button onClick={() => setActiveTab('Media')} className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>`
);

fs.writeFileSync('src/pages/GroupDetail.tsx', content);

let directoryContent = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

directoryContent = directoryContent.replace(
  /<button className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-700">View All<\/button>/g,
  `<button onClick={() => setView('people')} className="w-full mt-4 text-xs font-medium text-blue-600 hover:text-blue-700">View All</button>`
);

fs.writeFileSync('src/pages/Directory.tsx', directoryContent);
