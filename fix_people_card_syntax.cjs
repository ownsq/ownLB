const fs = require('fs');
let content = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

content = content.replace(
  'setRequestedConnections(requestedConnections.filter(n => n !== person.name))} className="flex-1 py-2 bg-neutral-100',
  'setRequestedConnections(requestedConnections.filter(n => n !== person.name)); }} className="flex-1 py-2 bg-neutral-100'
);

fs.writeFileSync('src/components/directory/PeopleView.tsx', content);
