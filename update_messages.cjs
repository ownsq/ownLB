const fs = require('fs');
let content = fs.readFileSync('src/components/directory/MessagesView.tsx', 'utf8');

content = content.replace(
  "import { Search, Edit, MoreVertical } from 'lucide-react';",
  "import { Search, Edit, MoreVertical } from 'lucide-react';\nimport { useState } from 'react';"
);

content = content.replace(
  "export function MessagesView() {",
  `export function MessagesView() {
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "me", text: "Hey Sahan, are you still looking for a travel buddy?", time: "10:35 AM" },
    { id: 2, sender: "other", text: MESSAGES[0].msg, time: "10:42 AM" }
  ]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: "me",
      text: inputValue.trim(),
      time: timeString
    }]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };`
);

const chatAreaHtml = `        <div className="flex-1 p-4 overflow-y-auto bg-neutral-50/50 flex flex-col justify-end space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatMessages.map(msg => (
              msg.sender === "me" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-orange-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[70%] shadow-sm">
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-[10px] text-orange-200 block mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-start gap-2">
                  <img referrerPolicy="no-referrer" src={MESSAGES[0].img} alt={MESSAGES[0].name} className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-white border border-neutral-200 text-neutral-800 p-3 rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm">
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-[10px] text-neutral-400 block mt-1">{msg.time}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-neutral-200 bg-white">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all border border-transparent focus:border-orange-300"
            />
            <button onClick={handleSend} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors shadow-sm">
              Send
            </button>
          </div>
        </div>`;

content = content.replace(
  /<div className="flex-1 p-4 overflow-y-auto bg-neutral-50\/50 flex flex-col justify-end space-y-4">[\s\S]*<\/div>\s*<\/div>\s*<\/div>/m,
  chatAreaHtml + "\n      </div>\n    </div>"
);

fs.writeFileSync('src/components/directory/MessagesView.tsx', content);
