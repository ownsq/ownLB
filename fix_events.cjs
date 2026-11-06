const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf8');

// 1. Add IDs to EVENT_LIST
content = content.replace(
  'const EVENT_LIST = [',
  'const EVENT_LIST = [\n  { id: "e1", isPast: false,'
).replace(
  '{ mon: "JUN", day: "08",',
  '{ id: "e2", isPast: false, mon: "JUN", day: "08",'
).replace(
  '{ mon: "JUN", day: "15",',
  '{ id: "e3", isPast: false, mon: "JUN", day: "15",'
).replace(
  '{ mon: "MAY", day: "21",',
  '{ id: "e4", isPast: true, mon: "MAY", day: "21",'
).replace(
  '{ mon: "JUN", day: "29",',
  '{ id: "e5", isPast: false, mon: "JUN", day: "29",'
).replace(
  '{ mon: "JUL", day: "05",',
  '{ id: "e6", isPast: false, mon: "JUL", day: "05",'
);

// We should fix the replacement since there are multiple EVENT_LIST items.
// Actually it's easier to just use a regular expression or replace EVENT_LIST entirely.
fs.writeFileSync('src/pages/Events.tsx', content);
