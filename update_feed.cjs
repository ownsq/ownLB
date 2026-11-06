const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

content = content.replace(
  "import { Users, Filter, Plus, Search, MessageSquare, MapPin, Calendar, ImageIcon, Video, BarChart2, Smile, ThumbsUp, Share2 } from 'lucide-react';",
  "import { Users, Filter, Plus, Search, MessageSquare, MapPin, Calendar, ImageIcon, Video, BarChart2, Smile, ThumbsUp, Share2 } from 'lucide-react';\nimport { useState } from 'react';"
);

content = content.replace(
  "export function FeedView() {",
  `export function FeedView() {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Nadeesha Perera",
      authorImg: "https://i.pravatar.cc/150?u=nadeesha",
      group: "Buddhist Dhamma Network",
      time: "2 hours ago",
      loc: "Melbourne, Australia",
      content: "Beautiful Vesak celebration in Melbourne, Australia. Grateful to be part of this amazing community. 🙏🌸",
      hasImages: true
    }
  ]);

  const handlePost = () => {
    if (!postContent.trim()) return;
    const newPost = {
      id: Date.now(),
      author: user?.name || "Saminda Fernando",
      authorImg: user?.avatar || "https://i.pravatar.cc/150?u=saminda",
      group: "",
      time: "Just now",
      loc: "Los Angeles, USA",
      content: postContent,
      hasImages: false
    };
    setPosts([newPost, ...posts]);
    setPostContent("");
  };`
);

content = content.replace(
  /<div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-500 flex items-center cursor-text">[\s\S]*?<\/div>/m,
  `<input 
              type="text"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={\`What's on your mind, \${user?.name?.split(' ')[0] || "Saminda"}?\`}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-purple-300 transition-colors"
            />`
);

content = content.replace(
  /<button className="bg-purple-600 text-white px-6 py-1\.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">/m,
  `<button onClick={handlePost} className="bg-purple-600 text-white px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">`
);

const newPostsHtml = `        <div className="p-4 space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img referrerPolicy="no-referrer" src={post.authorImg} alt={post.author} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                      {post.author} 
                      {post.group && (
                        <>
                          <span className="text-neutral-400 font-normal">▶</span> 
                          {post.group}
                        </>
                      )}
                    </h4>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                      {post.time} • <MapPin className="w-3 h-3" /> {post.loc}
                    </p>
                  </div>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600">
                  <span className="text-xl leading-none">⋯</span>
                </button>
              </div>
              
              <p className="text-sm text-neutral-800">
                {post.content}
              </p>
              
              {post.hasImages && (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                  <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=600" className="w-full h-48 object-cover row-span-2" alt="Vesak 1" />
                  <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=300" className="w-full h-[94px] object-cover" alt="Vesak 2" />
                  <div className="grid grid-cols-2 gap-1">
                    <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=150" className="w-full h-[94px] object-cover" alt="Vesak 3" />
                    <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1513331085175-58e100346a06?auto=format&fit=crop&q=80&w=150" className="w-full h-[94px] object-cover" alt="Vesak 4" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white text-[8px] text-white">👍</div>
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white text-[8px] text-white">❤️</div>
                  </div>
                  <span className="ml-1">You, Chamika and 128 others</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>24 Comments</span>
                  <span>15 Shares</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-b border-neutral-100 py-1 px-4 mt-2">
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Like
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Comment
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>`;

content = content.replace(
  /<div className="p-4">\s*\{\/\* Sample Post \*\/\}\s*<div className="space-y-3">[\s\S]*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\;/m,
  newPostsHtml + "\n      </div>\n    </div>\n  );"
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
