const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('<Route path="groups/:id"')) {
  appContent = appContent.replace(
    '<Route path="monks" element={<PageTransition><Monks /></PageTransition>} />',
    '<Route path="groups/:id" element={<PageTransition><PlaceholderPage title="Group Details" /></PageTransition>} />\n          <Route path="monks" element={<PageTransition><Monks /></PageTransition>} />'
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

const components = ['src/components/directory/GroupsView.tsx', 'src/components/directory/FeedView.tsx'];
for (const file of components) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useNavigate')) {
    content = content.replace(
      'import { useState } from',
      'import { useState } from \'react\';\nimport { useNavigate } from \'react-router-dom\';\n// '
    );
  }
  
  content = content.replace(
    /export function \w+\(\) \{/,
    `$& \n  const navigate = useNavigate();`
  );
  
  content = content.replace(
    /onClick=\{\(\) => showToast\('Opening ' \+ group\.title( \+ '\.\.\.')?\)\}/g,
    `onClick={() => navigate('/groups/1')}`
  );
  
  fs.writeFileSync(file, content);
}
