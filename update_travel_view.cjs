const fs = require('fs');
let content = fs.readFileSync('src/components/directory/TravelView.tsx', 'utf8');

content = content.replace(
  "import { useSearchParams } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';"
);

content = content.replace(
  "const [, setSearchParams] = useSearchParams();",
  ""
);

content = content.replace(
  /<button onClick=\{\(\) => setSearchParams\(\{ view: "messages" \}\)\} className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">/m,
  '<Link to="?view=messages" className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">'
);

content = content.replace(
  /<\/button>\s*<\/div>\s*<\/div>\s*\)\)}/m,
  '</Link>\n            </div>\n          </div>\n        ))}'
);

fs.writeFileSync('src/components/directory/TravelView.tsx', content);
