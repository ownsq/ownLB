const fs = require('fs');
let content = fs.readFileSync('src/components/directory/TravelView.tsx', 'utf8');
content = content.replace(
  '<Link to="?view=messages"',
  '<Link to="/directory?view=messages"'
);
fs.writeFileSync('src/components/directory/TravelView.tsx', content);
