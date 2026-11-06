const fs = require('fs');
let content = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

content = content.replace(
  '  const [toastMessage, setToastMessage] = useState("");',
  '  const [toastMessage, setToastMessage] = useState("");\n  const [requestedConnections, setRequestedConnections] = useState<string[]>([]);'
);

const connectBtnRe = /<button onClick=\{\(\) => showToast\('Connection request sent to ' \+ person\.name\)\} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1\.5 transition-colors">\s*<UserPlus className="w-4 h-4" \/> Connect\s*<\/button>/g;

const newConnectBtn = `{requestedConnections.includes(person.name) ? (
                <button onClick={() => setRequestedConnections(requestedConnections.filter(n => n !== person.name))} className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <UserPlus className="w-4 h-4" /> Requested
                </button>
              ) : (
                <button onClick={() => {
                  setRequestedConnections([...requestedConnections, person.name]);
                  showToast('Connection request sent to ' + person.name);
                }} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <UserPlus className="w-4 h-4" /> Connect
                </button>
              )}`;

content = content.replace(connectBtnRe, newConnectBtn);
fs.writeFileSync('src/components/directory/PeopleView.tsx', content);
