const fs = require('fs');

let content = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

// Change const group to state
content = content.replace(
  /const group = location\.state\?\.group \|\| defaultGroup;/,
  'const [group, setGroup] = useState(location.state?.group || defaultGroup);\n  const [editForm, setEditForm] = useState({ coverImg: group.coverImg || "", quote: group.quote || "", quoteAuthor: group.quoteAuthor || "" });'
);

// Add custom settings form
const settingsReplacement = `{activeTab === 'Settings' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Settings</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-4">Group Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Cover Image URL</label>
                      <input 
                        type="text" 
                        value={editForm.coverImg}
                        onChange={(e) => setEditForm({...editForm, coverImg: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Cover Quote</label>
                      <textarea 
                        value={editForm.quote}
                        onChange={(e) => setEditForm({...editForm, quote: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                        placeholder="Quote text..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Quote Author</label>
                      <input 
                        type="text" 
                        value={editForm.quoteAuthor}
                        onChange={(e) => setEditForm({...editForm, quoteAuthor: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Buddha"
                      />
                    </div>
                    <button 
                      onClick={() => setGroup({...group, ...editForm})}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                  <h3 className="font-medium text-neutral-900 mb-2">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="notifs" className="w-4 h-4 text-amber-600 rounded-full border-neutral-300 focus:ring-amber-500" defaultChecked />
                      <span className="text-sm text-neutral-700">All posts (Receive notifications for every post)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="notifs" className="w-4 h-4 text-amber-600 rounded-full border-neutral-300 focus:ring-amber-500" />
                      <span className="text-sm text-neutral-700">Highlights (Receive notifications for popular posts)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="notifs" className="w-4 h-4 text-amber-600 rounded-full border-neutral-300 focus:ring-amber-500" />
                      <span className="text-sm text-neutral-700">Off (Turn off all notifications for this group)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                  <h3 className="font-medium text-rose-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-neutral-500 mb-4">Once you leave a group, you will not receive updates or see it in your groups list.</p>
                  <button className="px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
          )}`;

content = content.replace(
  /\{activeTab === 'Settings' && \([\s\S]*? Leave Group\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)}/,
  settingsReplacement
);

fs.writeFileSync('src/pages/GroupDetail.tsx', content);
