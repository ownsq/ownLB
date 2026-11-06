const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  "import { useAuth } from \"../../contexts/AuthContext\";",
  "import { useAuth } from \"../../contexts/AuthContext\";\nimport { useState } from \"react\";"
);

content = content.replace(
  "  const { user } = useAuth();\n    return (",
  "  return ("
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
