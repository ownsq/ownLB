const fs = require('fs');
const files = ['src/components/directory/GroupsView.tsx', 'src/components/directory/FeedView.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/e\.stopPropagation\(\);/g, 'e.preventDefault(); e.stopPropagation();');
  fs.writeFileSync(file, content);
}
