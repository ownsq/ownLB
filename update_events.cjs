const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf8');

// Replace EVENT_LIST array
const eventListReplacement = `const EVENT_LIST = [
  { id: "e1", isPast: false, mon: "MAY", day: "25", title: "Vesak Festival Celebration", loc: "Buddhist Vihara, Los Angeles, USA", date: "May 25, 2025 • 10:00 AM", tags: ["Free Event", "Public"], interested: 256, img: "https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&q=80&w=400" },
  { id: "e2", isPast: false, mon: "JUN", day: "08", title: "Dhamma Talk by Ven. Rathana Thero", loc: "Sri Sithiwansa Buddhist Temple, New York, USA", date: "Jun 8, 2025 • 6:30 PM", tags: ["Free Event", "Public"], interested: 125, img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=400" },
  { id: "e3", isPast: false, mon: "JUN", day: "15", title: "Poson Poya Day Program", loc: "Buddhist Cultural Center, Toronto, Canada", date: "Jun 15, 2025 • 9:00 AM", tags: ["Free Event", "Public"], interested: 198, img: "https://images.unsplash.com/photo-1519408469771-25860931e5f1?auto=format&fit=crop&q=80&w=400" },
  { id: "e4", isPast: true, mon: "APR", day: "21", title: "Meditation Retreat - One Day Program", loc: "Dhamma Retreat Center, Kandy, Sri Lanka", date: "Apr 21, 2025 • 8:00 AM", tags: ["Paid Event", "Registration Required"], interested: 90, img: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=400" },
  { id: "e5", isPast: false, mon: "JUN", day: "29", title: "Dana & Community Lunch", loc: "Lanka Buddhist Temple, Sydney, Australia", date: "Jun 29, 2025 • 12:00 PM", tags: ["Free Event", "Public"], interested: 75, img: "https://images.unsplash.com/photo-1604928123285-b98a0c20165c?auto=format&fit=crop&q=80&w=400" },
  { id: "e6", isPast: false, mon: "JUL", day: "05", title: "Mindfulness Meditation Session", loc: "Online Event", date: "Jul 5, 2025 • 7:00 PM", tags: ["Free Event", "Online Event"], interested: 120, img: "https://images.unsplash.com/photo-1591522271810-9195b4cb8ecb?auto=format&fit=crop&q=80&w=400" },
];`;

content = content.replace(/const EVENT_LIST = \[[\s\S]*?\];/m, eventListReplacement);

// Add rsvps state and activeTab state
content = content.replace(
  'const [toastMessage, setToastMessage] = useState("");',
  'const [toastMessage, setToastMessage] = useState("");\n  const [rsvps, setRsvps] = useState<string[]>(["e4"]);\n  const [activeTab, setActiveTab] = useState("all");'
);

// Add toggleRsvp function
content = content.replace(
  'const handleAction = (msg: string) => {',
  'const toggleRsvp = (id: string) => {\n    if (rsvps.includes(id)) {\n      setRsvps(rsvps.filter(r => r !== id));\n      handleAction("RSVP Cancelled");\n    } else {\n      setRsvps([...rsvps, id]);\n      handleAction("RSVP Successful! You are attending.");\n    }\n  };\n\n  const handleAction = (msg: string) => {'
);

// Update Tabs
content = content.replace(
  /<div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">[\s\S]*?<\/div>/m,
  `<div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    <button onClick={() => setActiveTab('all')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'all' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>All Events</button>
                    <button onClick={() => setActiveTab('my')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'my' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>My Events</button>
                    <button onClick={() => setActiveTab('saved')} className={\`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'saved' ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}\`}>Saved Events</button>
                 </div>`
);

// Filter EVENT_LIST
content = content.replace(
  '{EVENT_LIST.map((event, i) => (',
  `{EVENT_LIST.filter(e => activeTab === 'all' || (activeTab === 'my' && rsvps.includes(e.id))).map((event, i) => (`
);

// Replace RSVP / Interested UI
content = content.replace(
  /<div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 min-w-\[120px\] border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m,
  `<div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 min-w-[120px] border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                      <div className="text-center w-full">
                        <div className="font-bold text-neutral-900">{event.interested + (rsvps.includes(event.id) ? 1 : 0)}</div>
                        <div className="text-[10px] text-neutral-500">Attending</div>
                      </div>
                      <div className="flex flex-col gap-2 w-full justify-center">
                        <button onClick={(e) => { e.stopPropagation(); toggleRsvp(event.id); }} className={\`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors w-full text-center whitespace-nowrap \${rsvps.includes(event.id) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}\`}>
                          {rsvps.includes(event.id) ? "Attending" : "RSVP Now"}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleAction("Viewing event details..."); }} className="text-[11px] font-medium text-neutral-700 border border-neutral-200 px-3 py-1.5 rounded-md hover:bg-neutral-50 transition-colors flex-1 text-center whitespace-nowrap">Details</button>
                          <button onClick={(e) => { e.stopPropagation(); handleAction("Event bookmarked"); }} className="text-amber-500 border border-amber-200 bg-amber-50 hover:bg-amber-100 p-1.5 rounded-md transition-colors"><Bookmark className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>`
);

fs.writeFileSync('src/pages/Events.tsx', content);
