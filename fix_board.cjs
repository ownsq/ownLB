const fs = require('fs');

let board = fs.readFileSync('src/components/directory/BoardView.tsx', 'utf8');

// Replace TOPICS const with defaultTopics
board = board.replace(/const TOPICS = \[([\s\S]*?)\];/m, 'const defaultTopics = [$1];');

// Add state for topics, modal, and form
board = board.replace('export function BoardView() {', `export function BoardView() {
  const [topics, setTopics] = useState(defaultTopics);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState({ title: '', category: 'Dhamma Discussions', content: '' });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicForm.title.trim() || !newTopicForm.content.trim()) return;
    
    const newTopic = {
      title: newTopicForm.title,
      author: "Current User", // Mock user
      time: "Just now",
      replies: 0,
      img: "https://i.pravatar.cc/150?u=current",
      category: newTopicForm.category
    };
    
    setTopics([newTopic, ...topics]);
    setIsNewTopicModalOpen(false);
    setNewTopicForm({ title: '', category: 'Dhamma Discussions', content: '' });
    showToast("Topic created successfully!");
  };`);

// Replace TOPICS.map with topics.map
board = board.replace('TOPICS.filter', 'topics.filter');

// Update the New Topic button
board = board.replace(/<button onClick=\{\(\) => showToast\('New topic creation coming soon!'\)\} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">/, '<button onClick={() => setIsNewTopicModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">');

// Add the modal at the end before the last </div>
const modalCode = `
      {/* New Topic Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Create New Topic</h3>
              <button onClick={() => setIsNewTopicModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTopicForm.title}
                  onChange={e => setNewTopicForm({...newTopicForm, title: e.target.value})}
                  placeholder="What do you want to discuss?"
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  value={newTopicForm.category}
                  onChange={e => setNewTopicForm({...newTopicForm, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
                >
                  {['Dhamma Discussions', 'Community Help', 'Travel & Lifestyle', 'Events & Activities'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Content</label>
                <textarea 
                  value={newTopicForm.content}
                  onChange={e => setNewTopicForm({...newTopicForm, content: e.target.value})}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none h-32"
                  required
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

board = board.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/, modalCode);

fs.writeFileSync('src/components/directory/BoardView.tsx', board);
