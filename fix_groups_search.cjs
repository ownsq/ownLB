const fs = require('fs');
let code = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

// Add state variables
code = code.replace(
  'const [joinedGroups, setJoinedGroups] = useState<string[]>([]);',
  `const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");`
);

// Connect search input
code = code.replace(
  '<input \n              type="text" \n              placeholder="Search groups..." \n              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"\n            />',
  `<input 
              type="text" 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"
            />`
);

// Connect category select
code = code.replace(
  '<select className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]">',
  `<select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >`
);

// Add filtering logic
code = code.replace(
  '{GROUPS.map((group, i) => (',
  `{GROUPS.filter(group => {
          const matchesSearch = group.title.toLowerCase().includes(searchQuery.toLowerCase()) || group.desc.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = selectedCategory === "All Categories" || group.type.includes(selectedCategory) || group.title.includes(selectedCategory);
          return matchesSearch && matchesCategory;
        }).map((group, i) => (`
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', code);
