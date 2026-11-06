const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  /<button onClick=\{\(\) => showToast\('Request sent to join ' \+ group\.title\)\} className="w-full py-1\.5/g,
  `<button onClick={(e) => { e.stopPropagation(); showToast('Request sent to join ' + group.title); }} className="w-full py-1.5`
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
