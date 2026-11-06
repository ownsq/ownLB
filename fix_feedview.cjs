const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

if (!content.includes('import { GROUPS }')) {
  content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { GROUPS } from './GroupsView';");
}

const replacement = `GROUPS.map((group, i) => (`;

content = content.replace(
  /\{\[\s*\{ title: "Buddhist Dhamma Network"[\s\S]*?\}\s*\]\.map\(\(group, i\) => \(/,
  replacement
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
