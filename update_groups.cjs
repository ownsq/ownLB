const fs = require('fs');

let content = fs.readFileSync('src/components/directory/GroupsView.tsx', 'utf8');
content = content.replace('const GROUPS = [', 'export let GROUPS = [');

fs.writeFileSync('src/components/directory/GroupsView.tsx', content);

let directoryContent = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

if (!directoryContent.includes('import { GROUPS }')) {
  directoryContent = directoryContent.replace(
    'import { GroupsView } from "../components/directory/GroupsView";',
    'import { GroupsView, GROUPS } from "../components/directory/GroupsView";'
  );
}

directoryContent = directoryContent.replace(
  /const newGroup = \{[\s\S]*?quoteAuthor: "Lao Tzu"\s*\};/,
  `const newGroup = {
                    ...newGroupForm,
                    members: "1",
                    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600",
                    coverImg: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200",
                    quote: "A journey of a thousand miles\\nbegins with a single step.",
                    quoteAuthor: "Lao Tzu"
                  };
                  GROUPS.unshift(newGroup);`
);

fs.writeFileSync('src/pages/Directory.tsx', directoryContent);
