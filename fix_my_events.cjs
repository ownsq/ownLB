const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

content = content.replace(
  '{ icon: Calendar, label: "My Events" }',
  '{ icon: Calendar, label: "My Events", path: "/events" }'
);

fs.writeFileSync('src/pages/Directory.tsx', content);
