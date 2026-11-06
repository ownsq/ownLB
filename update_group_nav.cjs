const fs = require('fs');

// 1. Update GroupsView.tsx
let groupsView = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');
groupsView = groupsView.replace(
  /onClick=\{\(\) => navigate\('\/groups\/1'\)\}/g,
  "onClick={() => navigate('/groups/' + encodeURIComponent(group.title.toLowerCase().replace(/\\s+/g, '-')), { state: { group } })}"
);
fs.writeFileSync('src/components/directory/GroupsView.tsx', groupsView);

// 2. Update FeedView.tsx
let feedView = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');
feedView = feedView.replace(
  /onClick=\{\(\) => navigate\('\/groups\/1'\)\}/g,
  "onClick={() => navigate('/groups/' + encodeURIComponent(group.title.toLowerCase().replace(/\\s+/g, '-')), { state: { group } })}"
);
fs.writeFileSync('src/components/directory/FeedView.tsx', feedView);

// 3. Update GroupDetail.tsx
let groupDetail = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

if (!groupDetail.includes('useLocation')) {
  groupDetail = groupDetail.replace(
    /import \{ useParams, Link \} from 'react-router-dom';/,
    "import { useParams, Link, useLocation } from 'react-router-dom';"
  );
}

const replaceStr = `  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  const defaultGroup = {
    title: id ? decodeURIComponent(id).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Dhamma Friends Los Angeles",
    type: "Public Group",
    members: "1.2K",
    desc: "A community of Dhamma friends living in Los Angeles and surrounding areas practicing, learning and sharing the Buddha's teachings.",
    img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=300"
  };
  
  const group = location.state?.group || defaultGroup;`;

groupDetail = groupDetail.replace(
  /  const \{ id \} = useParams\(\);\n  const \{ user \} = useAuth\(\);/,
  replaceStr
);

// Replace hardcoded values with dynamic group data
groupDetail = groupDetail.replace(
  /<h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Dhamma Friends Los Angeles<\/h1>/,
  '<h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{group.title}</h1>'
);

groupDetail = groupDetail.replace(
  /<span className="font-medium text-neutral-900">1\.2K Members<\/span>/,
  '<span className="font-medium text-neutral-900">{group.members} Members</span>'
);

groupDetail = groupDetail.replace(
  /<span className="flex items-center gap-1"><Globe className="w-4 h-4" \/> Public Group<\/span>/,
  '<span className="flex items-center gap-1">{group.type.includes("Private") ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />} {group.type}</span>'
);
if (!groupDetail.includes('<Lock')) {
  groupDetail = groupDetail.replace('import { \n  Edit2', 'import { \n  Edit2, Lock');
}

groupDetail = groupDetail.replace(
  /<p className="text-neutral-700 mb-4 max-w-2xl">\s*A community of Dhamma friends living in Los Angeles and surrounding areas practicing, learning and sharing the Buddha's teachings\.\s*<\/p>/,
  '<p className="text-neutral-700 mb-4 max-w-2xl">{group.desc}</p>'
);

groupDetail = groupDetail.replace(
  /<img \s*src="https:\/\/images\.unsplash\.com\/photo-1518002171953-a080ee817e1f\?auto=format&fit=crop&q=80&w=300" \s*alt="Group" \s*className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-amber-50"\s*\/>/m,
  '<img referrerPolicy="no-referrer" src={group.img} alt="Group" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-amber-50" />'
);

fs.writeFileSync('src/pages/GroupDetail.tsx', groupDetail);
