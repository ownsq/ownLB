const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  '  const [posts, setPosts] = useState<any[]>([',
  '  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);\n  const [posts, setPosts] = useState<any[]>(['
);

const joinBtnRegex = /<button onClick=\{\(e\) => \{ e\.stopPropagation\(\); showToast\('Request sent to join ' \+ group\.title\); \}\} className="w-full py-1\.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">\s*Join Group\s*<\/button>/;

const newJoinBtn = `{joinedGroups.includes(group.title) ? (
                  <button onClick={(e) => { e.stopPropagation(); setJoinedGroups(joinedGroups.filter(g => g !== group.title)); }} className="w-full py-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                    Joined
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setJoinedGroups([...joinedGroups, group.title]); showToast('Request sent to join ' + group.title); }} className="w-full py-1.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                    Join Group
                  </button>
                )}`;

content = content.replace(joinBtnRegex, newJoinBtn);
fs.writeFileSync('src/components/directory/FeedView.tsx', content);
