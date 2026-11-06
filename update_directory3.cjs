const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

// replace useState import with useSearchParams
content = content.replace(
  'import { useState } from "react";',
  'import { useSearchParams } from "react-router-dom";'
);

// update useState("feed") to useSearchParams
content = content.replace(
  'const [view, setView] = useState("feed");',
  'const [searchParams, setSearchParams] = useSearchParams();\n  const view = searchParams.get("view") || "feed";\n  const setView = (v) => setSearchParams({ view: v });'
);

fs.writeFileSync('src/pages/Directory.tsx', content);
