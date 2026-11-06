const fs = require('fs');
let content = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');

// Add joinedGroups state
content = content.replace(
  '  const [toastMessage, setToastMessage] = useState("");',
  '  const [toastMessage, setToastMessage] = useState("");\n  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);'
);

// Update Join Group button
const joinBtnRe = /<button onClick=\{\(\) => showToast\('Request sent to join ' \+ group\.title\)\} className="w-full sm:w-auto py-1\.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">\s*<Users className="w-4 h-4" \/> Join Group\s*<\/button>/g;

const newJoinBtn = `{joinedGroups.includes(group.title) ? (
                <button onClick={() => {
                  setJoinedGroups(joinedGroups.filter(g => g !== group.title));
                }} className="w-full sm:w-auto py-1.5 px-4 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {group.type.includes('Private') ? 'Requested' : 'Joined'}
                </button>
              ) : (
                <button onClick={() => {
                  setJoinedGroups([...joinedGroups, group.title]);
                  showToast(group.type.includes('Private') ? 'Request sent to join ' + group.title : 'Joined ' + group.title);
                }} className="w-full sm:w-auto py-1.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Join Group
                </button>
              )}`;

content = content.replace(joinBtnRe, newJoinBtn);

fs.writeFileSync('src/components/directory/GroupsView.tsx', content);
