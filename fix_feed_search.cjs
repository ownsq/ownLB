const fs = require('fs');
let code = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

code = code.replace(
  '<input \n              type="text" \n              placeholder="Search by name, interest, country..." \n              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"\n            />',
  '<input \n              type="text" \n              onKeyDown={(e) => { if (e.key === \'Enter\') { setSearchParams({ view: \'people\' }); window.scrollTo({ top: 0, behavior: \'smooth\' }); } }}\n              placeholder="Search by name, interest, country..." \n              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"\n            />'
);

fs.writeFileSync('src/components/directory/FeedView.tsx', code);
