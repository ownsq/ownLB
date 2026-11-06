const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  "onChange={(e) => setPostContent(e.target.value)}",
  "onChange={(e) => setPostContent(e.target.value)}\n              onKeyDown={(e) => e.key === 'Enter' && handlePost()}"
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
