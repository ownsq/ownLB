const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("AdProvider")) {
  code = code.replace(
    "import { AuthProvider, useAuth } from './contexts/AuthContext';",
    "import { AuthProvider, useAuth } from './contexts/AuthContext';\nimport { AdProvider } from './contexts/AdContext';"
  );

  code = code.replace(
    "<AuthProvider>",
    "<AuthProvider>\n      <AdProvider>"
  );

  code = code.replace(
    "</AuthProvider>",
    "      </AdProvider>\n    </AuthProvider>"
  );
  
  code = code.replace(
    "import { GroupDetail } from './pages/GroupDetail';",
    "import { GroupDetail } from './pages/GroupDetail';\nimport { AdminPanel } from './pages/AdminPanel';"
  );

  code = code.replace(
    "<Route path=\"profile\" element={<PageTransition><Profile /></PageTransition>} />",
    "<Route path=\"profile\" element={<PageTransition><Profile /></PageTransition>} />\n          <Route path=\"admin\" element={<PageTransition><AdminPanel /></PageTransition>} />"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
