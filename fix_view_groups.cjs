const fs = require('fs');

let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// Update import
content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';");

// Add useSearchParams hook
content = content.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const [searchParams, setSearchParams] = useSearchParams();");

// Replace the button's onClick handler
content = content.replace("<button onClick={() => showToast('View all groups coming soon')} className=\"text-sm font-medium text-blue-600 hover:text-blue-700\">View All Groups</button>", "<button onClick={() => { setSearchParams({ view: 'groups' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className=\"text-sm font-medium text-blue-600 hover:text-blue-700\">View All Groups</button>");

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
