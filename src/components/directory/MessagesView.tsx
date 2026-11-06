import { Search, Edit, MoreVertical, MessageSquare, Send, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { subscribeUsers } from '../../lib/firestoreService';
import { useAuth } from '../../contexts/AuthContext';

export function MessagesView() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);
  const [activeUserIndex, setActiveUserIndex] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const unsub = subscribeUsers((list) => {
      const others = list.filter((u: any) => u.uid !== user?.uid && u.email !== user?.email);
      setNetworkUsers(others);
    });
    return () => unsub();
  }, [user]);

  const activeContact = networkUsers[activeUserIndex] || null;
  const activeChatKey = activeContact?.uid || activeContact?.id || "default";

  const handleSend = () => {
    if (!inputValue.trim() || !activeContact) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatHistory(prev => ({
      ...prev,
      [activeChatKey]: [...(prev[activeChatKey] || []), {
        id: Date.now(),
        sender: "me",
        text: inputValue.trim(),
        time: timeString
      }]
    }));
    setInputValue("");
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex h-[600px]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-600" />
            <h3 className="font-bold text-neutral-900 text-sm">Direct Messages</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {networkUsers.length === 0 ? (
            <div className="p-6 text-center text-neutral-400 text-xs">
              <User className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              No network members yet. Invite friends or connect with members from the directory.
            </div>
          ) : (
            networkUsers.map((u, i) => {
              const name = u.displayName || u.name || "Community Member";
              const img = u.photoURL || u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`;
              const isSelected = activeUserIndex === i;
              const history = chatHistory[u.uid || u.id] || [];
              const lastMsg = history.length > 0 ? history[history.length - 1].text : (u.location || u.country || "Active community member");

              return (
                <div 
                  key={u.uid || u.id || i} 
                  onClick={() => setActiveUserIndex(i)} 
                  className={`p-3.5 border-b border-neutral-100 flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-orange-50/80 border-l-4 border-l-orange-600' : ''}`}
                >
                  <img referrerPolicy="no-referrer" src={img} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-neutral-900 truncate pr-1">{name}</h4>
                    </div>
                    <p className="text-[11px] truncate text-neutral-500">{lastMsg}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeContact ? (
          <>
            <div className="p-3.5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  referrerPolicy="no-referrer" 
                  src={activeContact.photoURL || activeContact.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                  alt={activeContact.displayName || activeContact.name || "Member"} 
                  className="w-9 h-9 rounded-full object-cover" 
                />
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">
                    {activeContact.displayName || activeContact.name || "Community Member"}
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Active Member</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-neutral-50/50 flex flex-col justify-end space-y-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {(chatHistory[activeChatKey] || []).length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    No messages yet. Say Ayubowan and start the conversation!
                  </div>
                ) : (
                  (chatHistory[activeChatKey] || []).map(msg => (
                    msg.sender === "me" ? (
                      <div key={msg.id} className="flex justify-end">
                        <div className="bg-orange-600 text-white p-2.5 rounded-xl rounded-tr-xs max-w-[70%] shadow-2xs">
                          <p className="text-xs">{msg.text}</p>
                          <span className="text-[9px] text-orange-200 block mt-0.5 text-right">{msg.time}</span>
                        </div>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex justify-start">
                        <div className="bg-white border border-neutral-200 text-neutral-800 p-2.5 rounded-xl rounded-tl-xs max-w-[70%] shadow-2xs">
                          <p className="text-xs">{msg.text}</p>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">{msg.time}</span>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-2xs flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <MessageSquare className="w-12 h-12 text-neutral-300 mb-2" />
            <h4 className="font-bold text-neutral-700 text-sm mb-1">Direct Messaging</h4>
            <p className="text-xs max-w-xs">Select any network member from the list to start a real-time conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
