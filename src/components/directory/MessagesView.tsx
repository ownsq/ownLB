import { Search, Edit, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';

const MESSAGES = [
  { name: "Sahan Jayasekara", time: "10:42 AM", msg: "Are we still on for the trip?", unread: true, img: "https://i.pravatar.cc/150?u=sahan" },
  { name: "Vimukthi Perera", time: "Yesterday", msg: "Thanks for sharing that book recommendation!", unread: true, img: "https://i.pravatar.cc/150?u=vimukthi" },
  { name: "Nadeesha Perera", time: "Tuesday", msg: "Can you send me the details of the Dana?", unread: false, img: "https://i.pravatar.cc/150?u=nadeesha" },
  { name: "Buddhist Dhamma Network", time: "Monday", msg: "Welcome to the group!", unread: false, img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=150" }
];

export function MessagesView() {
  const [inputValue, setInputValue] = useState("");
  const [activeChat, setActiveChat] = useState(0);
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
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatHistory(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), {
      id: Date.now(),
      sender: "me",
      text: inputValue.trim(),
      time: timeString
      }]
    }));
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-[600px] flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900">Messages</h3>
          <button className="text-neutral-500 hover:text-orange-600 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MESSAGES.map((msg, i) => (
            <div key={i} onClick={() => setActiveChat(i)} className={`p-4 border-b border-neutral-100 flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors ${activeChat === i ? 'bg-orange-100' : msg.unread ? 'bg-orange-50/50' : ''}`}>
              <img referrerPolicy="no-referrer" src={msg.img} alt={msg.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm truncate pr-2 ${msg.unread ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'}`}>{msg.name}</h4>
                  <span className={`text-[10px] whitespace-nowrap ${msg.unread ? 'font-bold text-orange-600' : 'text-neutral-500'}`}>{msg.time}</span>
                </div>
                <p className={`text-xs truncate ${msg.unread ? 'font-medium text-neutral-800' : 'text-neutral-500'}`}>{msg.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img referrerPolicy="no-referrer" src={MESSAGES[activeChat].img} alt={MESSAGES[activeChat].name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h4 className="font-bold text-sm text-neutral-900">{MESSAGES[activeChat].name}</h4>
              <p className="text-[10px] text-emerald-600 font-medium">Online</p>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-700">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
                <div className="flex-1 p-4 overflow-y-auto bg-neutral-50/50 flex flex-col justify-end space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {(chatHistory[activeChat] || []).map(msg => (
              msg.sender === "me" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-orange-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[70%] shadow-sm">
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-[10px] text-orange-200 block mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-start gap-2">
                  <img referrerPolicy="no-referrer" src={MESSAGES[activeChat].img} alt={MESSAGES[activeChat].name} className="w-8 h-8 rounded-full self-end" />
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
        </div>
      </div>
    </div>
  );
}
