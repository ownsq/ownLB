const fs = require('fs');
let code = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

code = code.replace(
  '<button className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">',
  '<button onClick={() => showToast(\'Advanced filters coming soon!\')} className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">'
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', code);
