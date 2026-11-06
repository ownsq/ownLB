const fs = require('fs');
let content = fs.readFileSync('src/components/directory/TravelView.tsx', 'utf8');
content = content.replace(
  "import { Search, Filter, Plane, Calendar, MapPin, MessageSquare } from 'lucide-react';",
  "import { Search, Filter, Plane, Calendar, MapPin, MessageSquare } from 'lucide-react';\nimport { useSearchParams } from 'react-router-dom';"
);
content = content.replace(
  'export function TravelView() {',
  'export function TravelView() {\n  const [, setSearchParams] = useSearchParams();'
);
content = content.replace(
  /<button className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">/m,
  '<button onClick={() => setSearchParams({ view: "messages" })} className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">'
);
fs.writeFileSync('src/components/directory/TravelView.tsx', content);
