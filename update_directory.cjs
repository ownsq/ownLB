const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

// 1. Add useState, useNavigate
content = content.replace(
  'import { Link } from "react-router-dom";',
  'import { Link, useNavigate } from "react-router-dom";\nimport { useState } from "react";\nimport { FeedView } from "../components/directory/FeedView";\nimport { PeopleView } from "../components/directory/PeopleView";\nimport { GroupsView } from "../components/directory/GroupsView";\nimport { TravelView } from "../components/directory/TravelView";\nimport { BoardView } from "../components/directory/BoardView";'
);

// 2. Add state inside Directory component
content = content.replace(
  'const { user } = useAuth();',
  'const { user } = useAuth();\n  const [view, setView] = useState("feed");\n  const navigate = useNavigate();'
);

// 3. Update Quick Links
const quickLinksReplacement = `      {/* Quick Links Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: "people", icon: Users, title: "Find People", desc: "Connect worldwide", color: "text-blue-600", bg: "bg-blue-50" },
          { id: "groups", icon: Grid, title: "Discover Groups", desc: "Join communities", color: "text-emerald-600", bg: "bg-emerald-50" },
          { id: "travel", icon: Plane, title: "Travel Buddies", desc: "Find companions", color: "text-purple-600", bg: "bg-purple-50" },
          { id: "board", icon: MessageSquare, title: "Community Board", desc: "Discuss & share", color: "text-orange-600", bg: "bg-orange-50" },
          { id: "events", icon: Calendar, title: "Events", desc: "Join events", color: "text-rose-600", bg: "bg-rose-50", link: "/events" },
        ].map((item, i) => {
          if (item.link) {
            return (
              <Link to={item.link} key={i} className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2">
                <div className={\`w-10 h-10 \${item.bg} \${item.color} rounded-lg flex items-center justify-center\`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{item.title}</h3>
                  <p className="text-[11px] leading-tight text-neutral-500 mt-1">{item.desc}</p>
                </div>
              </Link>
            );
          }
          return (
            <div 
              key={i} 
              onClick={() => setView(item.id)}
              className={\`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 \${view === item.id ? 'bg-orange-50 border-orange-400 shadow-sm ring-1 ring-orange-400' : 'bg-white border-neutral-200 hover:border-orange-300 hover:shadow-sm'}\`}
            >
              <div className={\`w-10 h-10 \${item.bg} \${item.color} rounded-lg flex items-center justify-center\`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">{item.title}</h3>
                <p className="text-[11px] leading-tight text-neutral-500 mt-1">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>`;

content = content.replace(
  /\{\/\* Quick Links Row \*\/\}[\s\S]*?(?=\{\/\* Left Sidebar \*\/)/m,
  quickLinksReplacement + '\n\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">\n        \n        '
);


// 4. Update Sidebar My Feed to clear view
content = content.replace(
  /\{ icon: Rss, label: "My Feed", active: true \}/g,
  '{ icon: Rss, label: "My Feed", active: view === "feed", id: "feed" }'
);
content = content.replace(
  /\{ icon: Users, label: "My Connections" \}/g,
  '{ icon: Users, label: "My Connections", id: "people" }'
);
content = content.replace(
  /\{ icon: Grid, label: "My Groups" \}/g,
  '{ icon: Grid, label: "My Groups", id: "groups" }'
);

// We need to update the onClick for sidebar links
content = content.replace(
  /<button key=\{i\} className=\{`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors \$\{item.active \? 'bg-amber-100 text-amber-900 font-bold' : 'text-neutral-600 hover:bg-neutral-200'\}`\}>/g,
  `<button key={i} onClick={() => item.id && setView(item.id)} className={\`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors \${view === item.id || item.active ? 'bg-amber-100 text-amber-900 font-bold' : 'text-neutral-600 hover:bg-neutral-200'}\`}>`
);

content = content.replace(
  /<button className="w-full mt-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">(\s*)Go to Community Board(\s*)<\/button>/g,
  '<button onClick={() => setView("board")} className="w-full mt-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">$1Go to Community Board$2</button>'
);

// 5. Replace Middle Content
const middleContentReplacement = `        {/* Middle Content */}
        <div className="lg:col-span-6 space-y-6">
          {view === 'feed' && <FeedView />}
          {view === 'people' && <PeopleView />}
          {view === 'groups' && <GroupsView />}
          {view === 'travel' && <TravelView />}
          {view === 'board' && <BoardView />}
        </div>`;

content = content.replace(
  /\{\/\* Middle Content \*\/\}[\s\S]*?(?=\{\/\* Right Sidebar \*\/)/m,
  middleContentReplacement + '\n\n        '
);

fs.writeFileSync('src/pages/Directory.tsx', content);
