const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { AdminPanel } from './pages/AdminPanel';",
  "import { AdminPanel } from './pages/AdminPanel';\nimport { Restaurants } from './pages/Restaurants';\nimport { FamousPeople } from './pages/FamousPeople';"
);

code = code.replace(
  "<Route path=\"restaurants\" element={<PageTransition><PlaceholderPage title=\"Restaurants Worldwide\" /></PageTransition>} />",
  "<Route path=\"restaurants\" element={<PageTransition><Restaurants /></PageTransition>} />"
);

code = code.replace(
  "<Route path=\"famous\" element={<PageTransition><PlaceholderPage title=\"Famous People Directory\" /></PageTransition>} />",
  "<Route path=\"famous\" element={<PageTransition><FamousPeople /></PageTransition>} />"
);

fs.writeFileSync('src/App.tsx', code);
