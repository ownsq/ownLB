const fs = require('fs');
let content = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

const oldCard = /<div key=\{i\} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col sm:flex-row">/g;
const newCard = `<div key={i} onClick={() => showToast('Opening ' + group.title + '...')} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:border-orange-300 transition-colors group-card">`;

content = content.replace(oldCard, newCard);

content = content.replace(
  /<button onClick=\{\(\) => \{/g,
  `<button onClick={(e) => {\n                  e.stopPropagation();`
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', content);
