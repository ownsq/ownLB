const fs = require('fs');
let code = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

// Add state variables
code = code.replace(
  'const [selectedCategory, setSelectedCategory] = useState("All Categories");',
  `const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState("All");`
);

// Connect Filters button
code = code.replace(
  '<button onClick={() => showToast(\'Advanced filters coming soon!\')} className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">',
  '<button onClick={() => setShowFilters(!showFilters)} className={`bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? \'border-blue-500 text-blue-600 bg-blue-50\' : \'border-neutral-200 text-neutral-700 hover:bg-neutral-50\'}`}>'
);

// Add filter panel below search bar
code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  `{showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h4 className="text-sm font-bold text-neutral-900">Privacy:</h4>
            <div className="flex gap-2">
              {['All', 'Public', 'Private'].map(privacy => (
                <button
                  key={privacy}
                  onClick={() => setSelectedPrivacy(privacy)}
                  className={\`px-3 py-1.5 text-xs font-medium rounded-full transition-colors \${selectedPrivacy === privacy ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}\`}
                >
                  {privacy} {privacy !== 'All' && 'Groups'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`
);

// Update filtering logic
code = code.replace(
  'return matchesSearch && matchesCategory;',
  `const matchesPrivacy = selectedPrivacy === "All" || group.type.includes(selectedPrivacy);
          return matchesSearch && matchesCategory && matchesPrivacy;`
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', code);
