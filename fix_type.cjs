const fs = require('fs');
let content = fs.readFileSync('src/components/directory/MessagesView.tsx', 'utf8');
content = content.replace(
  "const handleKeyDown = (e) => {",
  "const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {"
);
fs.writeFileSync('src/components/directory/MessagesView.tsx', content);
