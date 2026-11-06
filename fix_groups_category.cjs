const fs = require('fs');
let code = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

// Replace the groups array with one containing categories
const newGroups = `export let GROUPS = [
  { title: "Buddhist Dhamma Network", type: "Public Group", members: "3.2K", desc: "Discuss Dhamma, share knowledge and inspire each other on the path.", img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200", quote: "The Sangha is the field\\nof merit for the world.", quoteAuthor: "Buddha", category: "Religion" },
  { title: "Travel Sri Lanka", type: "Public Group", members: "2.7K", desc: "Find travel buddies, share experiences and explore the world together.", img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1586861541460-630b91d2c206?auto=format&fit=crop&q=80&w=1200", quote: "Life is either a daring\\nadventure or nothing.", quoteAuthor: "Helen Keller", category: "Travel" },
  { title: "Sri Lankan Volunteers", type: "Public Group", members: "1.8K", desc: "Join hands for charity, community service and social impact.", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=1200", quote: "The best way to find yourself is to lose yourself\\nin the service of others.", quoteAuthor: "Mahatma Gandhi", category: "Community" },
  { title: "Sri Lankan Foodies", type: "Public Group", members: "2.1K", desc: "Share recipes, restaurants and everything about Sri Lankan food.", img: "https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200", quote: "People who love to eat are always\\nthe best people.", quoteAuthor: "Julia Child", category: "Food" },
  { title: "Sri Lankan IT Professionals", type: "Private Group", members: "4.5K", desc: "Networking and knowledge sharing for Sri Lankan tech professionals.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200", quote: "Technology is best when it brings\\npeople together.", quoteAuthor: "Matt Mullenweg", category: "Technology" },
  { title: "Sri Lankan Students in Australia", type: "Private Group", members: "1.1K", desc: "Help and support for students studying in Australia.", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", quote: "Education is the most powerful weapon which you can use\\nto change the world.", quoteAuthor: "Nelson Mandela", category: "Education" },
];`;

code = code.replace(/export let GROUPS = \[[\s\S]*?\];/, newGroups);

// Update category matching logic
code = code.replace(
  'const matchesCategory = selectedCategory === "All Categories" || group.type.includes(selectedCategory) || group.title.includes(selectedCategory);',
  'const matchesCategory = selectedCategory === "All Categories" || group.category === selectedCategory;'
);

// Update select options to include Community and Education
code = code.replace(
  /<select[\s\S]*?<\/select>/,
  `<select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >
            <option>All Categories</option>
            <option>Technology</option>
            <option>Travel</option>
            <option>Religion</option>
            <option>Food</option>
            <option>Community</option>
            <option>Education</option>
          </select>`
);

fs.writeFileSync('src/components/directory/GroupsView.tsx', code);
