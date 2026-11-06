const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// replace the placeholder route with the actual GroupDetail component
appContent = appContent.replace(
  '<Route path="groups/:id" element={<PageTransition><PlaceholderPage title="Group Details" /></PageTransition>} />',
  '<Route path="groups/:id" element={<PageTransition><GroupDetail /></PageTransition>} />'
);

// add the import if it's not there
if (!appContent.includes('import { GroupDetail }')) {
  appContent = appContent.replace(
    'import { Profile } from "./pages/Profile";',
    'import { Profile } from "./pages/Profile";\nimport { GroupDetail } from "./pages/GroupDetail";'
  );
}

fs.writeFileSync('src/App.tsx', appContent);
