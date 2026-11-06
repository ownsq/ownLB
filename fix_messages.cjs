const fs = require('fs');
let content = fs.readFileSync('src/components/directory/MessagesView.tsx', 'utf8');

const newInitialState = `  const [activeChat, setActiveChat] = useState(0);
  const [chatHistory, setChatHistory] = useState<Record<number, any[]>>({
    0: [
      { id: 1, sender: "me", text: "Hey Sahan, are you still looking for a travel buddy?", time: "10:35 AM" },
      { id: 2, sender: "other", text: MESSAGES[0].msg, time: "10:42 AM" }
    ],
    1: [
      { id: 1, sender: "other", text: MESSAGES[1].msg, time: MESSAGES[1].time }
    ],
    2: [
      { id: 1, sender: "other", text: MESSAGES[2].msg, time: MESSAGES[2].time }
    ],
    3: [
      { id: 1, sender: "other", text: MESSAGES[3].msg, time: MESSAGES[3].time }
    ]
  });`;

content = content.replace(
  /  const \[chatMessages, setChatMessages\] = useState\(\[\s*\{ id: 1, sender: "me", text: "Hey Sahan, are you still looking for a travel buddy\?", time: "10:35 AM" \},\s*\{ id: 2, sender: "other", text: MESSAGES\[0\]\.msg, time: "10:42 AM" \}\s*\]\);/m,
  newInitialState
);

content = content.replace(
  /setChatMessages\(\[\.\.\.chatMessages, \{/,
  `setChatHistory(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), {`
);

content = content.replace(
  /time: timeString\n    \}\]\);/m,
  `time: timeString\n      }]\n    }));`
);

content = content.replace(
  /<div key=\{i\} className=\{\`p-4 border-b border-neutral-100 flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors \$\{msg.unread \? 'bg-orange-50\/50' : ''\}\`\}>/m,
  `<div key={i} onClick={() => setActiveChat(i)} className={\`p-4 border-b border-neutral-100 flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors \${activeChat === i ? 'bg-orange-100' : msg.unread ? 'bg-orange-50/50' : ''}\`}>`
);

content = content.replace(
  /<img referrerPolicy="no-referrer" src=\{MESSAGES\[0\]\.img\} alt=\{MESSAGES\[0\]\.name\} className="w-10 h-10 rounded-full object-cover" \/>/g,
  `<img referrerPolicy="no-referrer" src={MESSAGES[activeChat].img} alt={MESSAGES[activeChat].name} className="w-10 h-10 rounded-full object-cover" />`
);

content = content.replace(
  /<h4 className="font-bold text-sm text-neutral-900">\{MESSAGES\[0\]\.name\}<\/h4>/g,
  `<h4 className="font-bold text-sm text-neutral-900">{MESSAGES[activeChat].name}</h4>`
);

content = content.replace(
  /\{chatMessages\.map\(msg => \(/g,
  `{(chatHistory[activeChat] || []).map(msg => (`
);

content = content.replace(
  /<img referrerPolicy="no-referrer" src=\{MESSAGES\[0\]\.img\} alt=\{MESSAGES\[0\]\.name\} className="w-8 h-8 rounded-full self-end" \/>/g,
  `<img referrerPolicy="no-referrer" src={MESSAGES[activeChat].img} alt={MESSAGES[activeChat].name} className="w-8 h-8 rounded-full self-end" />`
);

fs.writeFileSync('src/components/directory/MessagesView.tsx', content);
