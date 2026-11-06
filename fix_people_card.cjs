const fs = require('fs');
let content = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

const oldCard = /<div key=\{i\} className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col items-center text-center hover:border-blue-300 transition-colors">/g;
const newCard = `<div key={i} onClick={() => showToast('Opening ' + person.name + '\\'s profile...')} className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col items-center text-center hover:border-blue-300 transition-colors cursor-pointer group-card">`;

content = content.replace(oldCard, newCard);

content = content.replace(
  /<button onClick=\{\(\) => setRequestedConnections/g,
  `<button onClick={(e) => {\n                  e.stopPropagation();\n                  setRequestedConnections`
);

content = content.replace(
  /<button onClick=\{\(\) => \{\n                  setRequestedConnections/g,
  `<button onClick={(e) => {\n                  e.stopPropagation();\n                  setRequestedConnections`
);

content = content.replace(
  /<Link to="\/directory\?view=messages"/g,
  `<Link to="/directory?view=messages" onClick={(e) => e.stopPropagation()}`
);


fs.writeFileSync('src/components/directory/PeopleView.tsx', content);
