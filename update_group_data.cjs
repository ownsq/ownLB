const fs = require('fs');

// 1. Update GroupsView.tsx
let groupsView = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

const groupDataReplacement = `const GROUPS = [
  { title: "Buddhist Dhamma Network", type: "Public Group", members: "3.2K", desc: "Discuss Dhamma, share knowledge and inspire each other on the path.", img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200", quote: "The Sangha is the field\\nof merit for the world.", quoteAuthor: "Buddha" },
  { title: "Travel Sri Lanka", type: "Public Group", members: "2.7K", desc: "Find travel buddies, share experiences and explore the world together.", img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1586861541460-630b91d2c206?auto=format&fit=crop&q=80&w=1200", quote: "Life is either a daring\\nadventure or nothing.", quoteAuthor: "Helen Keller" },
  { title: "Sri Lankan Volunteers", type: "Public Group", members: "1.8K", desc: "Join hands for charity, community service and social impact.", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=1200", quote: "The best way to find yourself is to lose yourself\\nin the service of others.", quoteAuthor: "Mahatma Gandhi" },
  { title: "Sri Lankan Foodies", type: "Public Group", members: "2.1K", desc: "Share recipes, restaurants and everything about Sri Lankan food.", img: "https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200", quote: "People who love to eat are always\\nthe best people.", quoteAuthor: "Julia Child" },
  { title: "Sri Lankan IT Professionals", type: "Private Group", members: "4.5K", desc: "Networking and knowledge sharing for Sri Lankan tech professionals.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200", quote: "Technology is best when it brings\\npeople together.", quoteAuthor: "Matt Mullenweg" },
  { title: "Sri Lankan Students in Australia", type: "Private Group", members: "1.1K", desc: "Help and support for students studying in Australia.", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600", coverImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", quote: "Education is the most powerful weapon which you can use\\nto change the world.", quoteAuthor: "Nelson Mandela" },
];`;

groupsView = groupsView.replace(/const GROUPS = \[\s*\{.*?\},\s*\];/s, groupDataReplacement);
fs.writeFileSync('src/components/directory/GroupsView.tsx', groupsView);

// 2. Update FeedView.tsx
let feedView = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

const feedGroupDataReplacement = `{[
            { title: "Buddhist Dhamma Network", type: "Public Group", members: "3.2K", desc: "Discuss Dhamma, share knowledge and inspire each other on the path.", img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=300", coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200", quote: "The Sangha is the field\\nof merit for the world.", quoteAuthor: "Buddha" },
            { title: "Travel Sri Lanka", type: "Public Group", members: "2.7K", desc: "Find travel buddies, share experiences and explore the world together.", img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=300", coverImg: "https://images.unsplash.com/photo-1586861541460-630b91d2c206?auto=format&fit=crop&q=80&w=1200", quote: "Life is either a daring\\nadventure or nothing.", quoteAuthor: "Helen Keller" },
            { title: "Sri Lankan Volunteers", type: "Public Group", members: "1.8K", desc: "Join hands for charity, community service and social impact.", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=300", coverImg: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=1200", quote: "The best way to find yourself is to lose yourself\\nin the service of others.", quoteAuthor: "Mahatma Gandhi" },
            { title: "Sri Lankan Foodies", type: "Public Group", members: "2.1K", desc: "Share recipes, restaurants and everything about Sri Lankan food.", img: "https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=300", coverImg: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200", quote: "People who love to eat are always\\nthe best people.", quoteAuthor: "Julia Child" },
          ].map`;

feedView = feedView.replace(/\{\[\s*\{.*?\},\s*\].map/s, feedGroupDataReplacement);
fs.writeFileSync('src/components/directory/FeedView.tsx', feedView);

// 3. Update GroupDetail.tsx
let groupDetail = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

const defaultGroupReplaceStr = `  const defaultGroup = {
    title: id ? decodeURIComponent(id).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Dhamma Friends Los Angeles",
    type: "Public Group",
    members: "1.2K",
    desc: "A community of Dhamma friends living in Los Angeles and surrounding areas practicing, learning and sharing the Buddha's teachings.",
    img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=300",
    coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200",
    quote: "The Sangha is the field\\nof merit for the world.",
    quoteAuthor: "Buddha"
  };`;

groupDetail = groupDetail.replace(/  const defaultGroup = \{.*?  \};/s, defaultGroupReplaceStr);

groupDetail = groupDetail.replace(
  /<img \s*src=\{group\.img\}\s*alt="Cover"/m,
  '<img src={group.coverImg || "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200"} alt="Cover"'
);

groupDetail = groupDetail.replace(
  /"The Sangha is the field<br\/>of merit for the world\."/,
  '{group.quote ? group.quote.split("\\n").map((line: string, i: number) => <span key={i}>{line}<br/></span>) : "The Sangha is the field of merit for the world."}'
);

groupDetail = groupDetail.replace(
  /<p className="text-white\/80 text-lg md:text-xl">- Buddha<\/p>/,
  '<p className="text-white/80 text-lg md:text-xl">- {group.quoteAuthor || "Buddha"}</p>'
);

fs.writeFileSync('src/pages/GroupDetail.tsx', groupDetail);
