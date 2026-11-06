const fs = require('fs');
let code = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// Add activeTab state
code = code.replace(
  'const [selectedPostType, setSelectedPostType] = useState("All");',
  `const [selectedPostType, setSelectedPostType] = useState("All");\n  const [activeTab, setActiveTab] = useState('All Updates');`
);

// Fix Feed Tabs
code = code.replace(
  `{['All Updates', 'Connections', 'Groups', 'Events', 'Photos', 'Videos'].map((tab, i) => (
            <button key={tab} className={\`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors \${i === 0 ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-t-lg'}\`}>
              {tab}
            </button>
          ))}`,
  `{['All Updates', 'Connections', 'Groups', 'Events', 'Photos', 'Videos'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={\`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors \${activeTab === tab ? 'border-orange-600 text-orange-700' : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-t-lg'}\`}
            >
              {tab}
            </button>
          ))}`
);

// Update Filtering Logic to use activeTab
code = code.replace(
  `let matchesType = true;
            if (selectedPostType === "With Images") matchesType = post.hasImages;
            else if (selectedPostType === "Polls") matchesType = !!post.poll;
            else if (selectedPostType === "Events") matchesType = !!post.event;
            
            return matchesSearch && matchesCountry && matchesType;`,
  `let matchesType = true;
            if (selectedPostType === "With Images") matchesType = post.hasImages;
            else if (selectedPostType === "Polls") matchesType = !!post.poll;
            else if (selectedPostType === "Events") matchesType = !!post.event;
            
            let matchesTab = true;
            if (activeTab === "Photos") matchesTab = post.hasImages;
            else if (activeTab === "Videos") matchesTab = post.hasVideo;
            else if (activeTab === "Events") matchesTab = !!post.event;
            else if (activeTab === "Groups") matchesTab = !!post.group;

            return matchesSearch && matchesCountry && matchesType && matchesTab;`
);

fs.writeFileSync('src/components/directory/FeedView.tsx', code);
