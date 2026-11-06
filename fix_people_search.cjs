const fs = require('fs');
let code = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

// Add state variables
code = code.replace(
  'const [requestedConnections, setRequestedConnections] = useState<string[]>([]);',
  `const [requestedConnections, setRequestedConnections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState("All");`
);

// Connect search input
code = code.replace(
  '<input \n              type="text" \n              placeholder="Search people by name, profession, or location..." \n              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"\n            />',
  `<input 
              type="text" 
              placeholder="Search people by name, profession, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          >
            <option>All Countries</option>
            <option>Japan</option>
            <option>UK</option>
            <option>Australia</option>
            <option>USA</option>
            <option>Canada</option>
          </select>`
);

code = code.replace(
  /<option>USA<\/option>[\s\S]*?<\/select>/,
  `</select>`
);

// Connect Filters button
code = code.replace(
  '<button className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">',
  '<button onClick={() => setShowFilters(!showFilters)} className={`bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? \'border-blue-500 text-blue-600 bg-blue-50\' : \'border-neutral-200 text-neutral-700 hover:bg-neutral-50\'}`}>'
);

// Add filter panel below search bar
code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">',
  `{showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h4 className="text-sm font-bold text-neutral-900">Role:</h4>
            <div className="flex flex-wrap gap-2">
              {['All', 'Software Engineer', 'Student', 'Designer', 'Chef', 'Photographer', 'Entrepreneur', 'Researcher', 'Engineer'].map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={\`px-3 py-1.5 text-xs font-medium rounded-full transition-colors \${selectedRole === role ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}\`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">`
);

// Update filtering logic
code = code.replace(
  '{PEOPLE.map((person, i) => (',
  `{PEOPLE.filter(person => {
          const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                person.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                person.loc.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCountry = selectedCountry === "All Countries" || person.loc.includes(selectedCountry);
          const matchesRole = selectedRole === "All" || person.role === selectedRole;
          return matchesSearch && matchesCountry && matchesRole;
        }).map((person, i) => (`
);

fs.writeFileSync('src/components/directory/PeopleView.tsx', code);
