const fs = require('fs');
const files = ['src/components/directory/GroupsView.tsx', 'src/components/directory/FeedView.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/\/  'react';/g, '');
  content = content.replace(/import \{ useState \} from 'react';\nimport \{ useNavigate \} from 'react-router-dom';/g, "import { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';");
  fs.writeFileSync(file, content);
}
