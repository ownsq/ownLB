const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

// Add imports
content = content.replace(
  'import { BoardView } from "../components/directory/BoardView";',
  'import { BoardView } from "../components/directory/BoardView";\nimport { MessagesView } from "../components/directory/MessagesView";\nimport { NotificationsView } from "../components/directory/NotificationsView";'
);

// Add missing ids to left sidebar
content = content.replace(
  '{ icon: MessageSquare, label: "Messages", badge: "3" },',
  '{ icon: MessageSquare, label: "Messages", badge: "3", id: "messages" },'
);
content = content.replace(
  '{ icon: Bell, label: "Notifications", badge: "8" },',
  '{ icon: Bell, label: "Notifications", badge: "8", id: "notifications" },'
);

// Make sure view matching works correctly
const newMiddleContent = `{view === 'feed' && <FeedView />}
          {view === 'people' && <PeopleView />}
          {view === 'groups' && <GroupsView />}
          {view === 'travel' && <TravelView />}
          {view === 'board' && <BoardView />}
          {view === 'messages' && <MessagesView />}
          {view === 'notifications' && <NotificationsView />}`;
          
content = content.replace(
  /\{view === 'feed' && <FeedView \/>\}[\s\S]*?\{view === 'board' && <BoardView \/>\}/m,
  newMiddleContent
);

fs.writeFileSync('src/pages/Directory.tsx', content);
