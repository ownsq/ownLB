const fs = require('fs');

let videos = fs.readFileSync('src/pages/Videos.tsx', 'utf8');
videos = videos.replace(/<button onClick=\{\(\) => showToast\("Feature coming soon!"\)\} className="flex items-center justify-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 text-left w-full">\s*Guidelines for Submission <Info className="w-3\.5 h-3\.5" \/>\s*<\/a>/g, '<button onClick={() => showToast("Feature coming soon!")} className="flex items-center justify-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 text-left w-full">\n              Guidelines for Submission <Info className="w-3.5 h-3.5" />\n           </button>');
fs.writeFileSync('src/pages/Videos.tsx', videos);

let monk = fs.readFileSync('src/pages/MonkDetail.tsx', 'utf8');
// restore </Link> for valid Links
monk = monk.replace(/<Link to="\/monks"(.*?)>([\s\S]*?)<\/button>/g, '<Link to="/monks"$1>$2</Link>');
monk = monk.replace(/<Link to="\/"(.*?)>([\s\S]*?)<\/button>/g, '<Link to="/"$1>$2</Link>');

// Let's just grep and replace appropriately.
fs.writeFileSync('src/pages/MonkDetail.tsx', monk);
