const fs = require('fs');
let code = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// Add states
code = code.replace(
  'const [joinedGroups, setJoinedGroups] = useState<string[]>([]);',
  `const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberType, setSelectedMemberType] = useState("All Members");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState("All");`
);

// Connect member type select
code = code.replace(
  '<select className="bg-transparent pl-3 pr-8 py-2 text-sm font-medium border-r border-neutral-200 outline-none text-neutral-700">',
  `<select 
            value={selectedMemberType}
            onChange={(e) => setSelectedMemberType(e.target.value)}
            className="bg-transparent pl-3 pr-8 py-2 text-sm font-medium border-r border-neutral-200 outline-none text-neutral-700"
          >`
);

// Connect search input
code = code.replace(
  '<input \n              type="text" \n              onKeyDown={(e) => { if (e.key === \'Enter\') { setSearchParams({ view: \'people\' }); window.scrollTo({ top: 0, behavior: \'smooth\' }); } }}\n              placeholder="Search by name, interest, country..." \n              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"\n            />',
  `<input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { /* Optional: search action */ } }}
              placeholder="Search by name, interest, country..." 
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"
            />`
);

// Connect country select
code = code.replace(
  '<select className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]">',
  `<select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >`
);

// Connect Filters button
code = code.replace(
  '<button onClick={() => showToast(\'Advanced filters coming soon!\')} className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">',
  '<button onClick={() => setShowFilters(!showFilters)} className={`bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? \'border-blue-500 text-blue-600 bg-blue-50\' : \'border-neutral-200 text-neutral-700 hover:bg-neutral-50\'}`}>'
);

// Add filter panel below search bar
code = code.replace(
  '{/* Hero Banner */}',
  `{showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h4 className="text-sm font-bold text-neutral-900">Post Type:</h4>
            <div className="flex flex-wrap gap-2">
              {['All', 'With Images', 'Polls', 'Events'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedPostType(type)}
                  className={\`px-3 py-1.5 text-xs font-medium rounded-full transition-colors \${selectedPostType === type ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}\`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}`
);

// Filter posts mapping
code = code.replace(
  '{posts.map((post) => (',
  `{posts.filter(post => {
            const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  post.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (post.loc && post.loc.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCountry = selectedCountry === "All Countries" || (post.loc && post.loc.includes(selectedCountry));
            
            let matchesType = true;
            if (selectedPostType === "With Images") matchesType = post.hasImages;
            else if (selectedPostType === "Polls") matchesType = !!post.poll;
            else if (selectedPostType === "Events") matchesType = !!post.event;
            
            return matchesSearch && matchesCountry && matchesType;
          }).map((post) => (`
);

fs.writeFileSync('src/components/directory/FeedView.tsx', code);
