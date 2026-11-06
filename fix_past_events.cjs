const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf8');

// Filter EVENT_LIST
content = content.replace(
  `{EVENT_LIST.filter(e => activeTab === 'all' || (activeTab === 'my' && rsvps.includes(e.id))).map((event, i) => (`,
  `{EVENT_LIST.filter(e => 
                    activeTab === 'all' 
                    || (activeTab === 'my' && rsvps.includes(e.id))
                    || (activeTab === 'past' && e.isPast)
                    || (activeTab === 'saved') // Mocking saved events as empty or all
                  ).map((event, i) => (`
);

content = content.replace(
  `<button onClick={() => setActiveTab('saved')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'saved' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>Saved Events</button>
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 whitespace-nowrap">Past Events</button>`,
  `<button onClick={() => setActiveTab('saved')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'saved' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>Saved Events</button>
                    <button onClick={() => setActiveTab('past')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'past' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>Past Events</button>`
);

fs.writeFileSync('src/pages/Events.tsx', content);
