const fs = require('fs');
let content = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');
content = content.replace(
  "import { Search, Filter, MapPin, UserPlus, Star } from 'lucide-react';",
  "import { Search, Filter, MapPin, UserPlus, Star, MessageSquare } from 'lucide-react';\nimport { useSearchParams } from 'react-router-dom';"
);
content = content.replace(
  'export function PeopleView() {',
  'export function PeopleView() {\n  const [, setSearchParams] = useSearchParams();\n  const handleMessage = () => setSearchParams({ view: "messages" });'
);
content = content.replace(
  /<button className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">[\s\S]*?<\/button>/m,
  `<div className="flex w-full gap-2 mt-auto">
              <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                <UserPlus className="w-4 h-4" /> Connect
              </button>
              <button onClick={handleMessage} className="flex-1 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            </div>`
);
fs.writeFileSync('src/components/directory/PeopleView.tsx', content);
