const fs = require('fs');

let content = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

if (!content.includes("Search className=")) {
  content = content.replace("import { \n  Edit2,", "import { \n  Search, Edit2,");
}

const additionalTabsContent = `            </>
          )}

          {activeTab === 'About' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">About This Group</h2>
              <p className="text-neutral-700 leading-relaxed mb-6">{group.desc}</p>
              
              <h3 className="font-bold text-neutral-900 mb-4">Group Rules</h3>
              <ol className="list-decimal pl-5 space-y-3 text-neutral-700">
                <li>Be kind and courteous to all members.</li>
                <li>No hate speech or bullying.</li>
                <li>Respect everyone's privacy.</li>
                <li>Keep discussions related to the group's topic.</li>
              </ol>
            </div>
          )}

          {activeTab === 'Members' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Members <span className="text-neutral-500 font-normal text-lg">({group.members})</span></h2>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" placeholder="Find a member..." className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors">
                    <img src={\`https://i.pravatar.cc/150?img=\${i+10}\`} alt="Member" className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-neutral-900">Member {i}</h4>
                      <p className="text-xs text-neutral-500">Joined 2023</p>
                    </div>
                    <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Events' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Events</h2>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Create Event
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { date: "MAY 25", title: "Vesak Festival Celebration", time: "May 25, 2025 • 6:00 PM", loc: "Sri Lanka Buddhist Temple" },
                  { date: "JUN 08", title: "Dhamma Talk by Ven. Rathana Thero", time: "Jun 8, 2025 • 6:30 PM", loc: "Temple Community Hall" },
                  { date: "JUN 15", title: "Meditation Workshop", time: "Jun 15, 2025 • 9:00 AM", loc: "Meditation Center, Los Angeles" },
                ].map((evt, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-neutral-200 rounded-xl hover:border-amber-300 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-700 rounded-lg w-16 h-16 flex-shrink-0 border border-rose-100">
                      <span className="text-xs font-bold uppercase">{evt.date.split(' ')[0]}</span>
                      <span className="text-xl font-bold leading-none">{evt.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 mb-1">{evt.title}</h4>
                      <p className="text-sm text-neutral-500 mb-1">{evt.time}</p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {evt.loc}</p>
                    </div>
                    <button className="self-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                      Going
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Media' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Recent Media</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1621532414162-8f15d7870eb0?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400",
                  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=400"
                ].map((img, i) => (
                  <img key={i} src={img} alt="Media" className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Files' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Files</h2>
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Upload File
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Group Guidelines.pdf", size: "245 KB", type: "PDF" },
                  { name: "Event Schedule 2024.xlsx", size: "1.2 MB", type: "Excel" },
                  { name: "Meeting Minutes - May.docx", size: "560 KB", type: "Word" },
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-neutral-900">{file.name}</h4>
                        <p className="text-xs text-neutral-500">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Albums' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Albums</h2>
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2">
                  <ImageIcon2 className="w-4 h-4" /> Create Album
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "Vesak 2024", count: 45, img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=400" },
                  { name: "Temple Visit", count: 12, img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=400" },
                  { name: "Dhamma School", count: 28, img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" },
                ].map((album, i) => (
                  <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden group cursor-pointer">
                    <div className="relative h-40">
                      <img src={album.img} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <div className="p-4 bg-white">
                      <h4 className="font-bold text-sm text-neutral-900">{album.name}</h4>
                      <p className="text-xs text-neutral-500">{album.count} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Settings</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
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

content = content.replace("            </>\n          )}", additionalTabsContent);

fs.writeFileSync('src/pages/GroupDetail.tsx', content);

