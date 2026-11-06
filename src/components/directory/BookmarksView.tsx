import { Bookmark, Clock, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

const MOCK_BOOKMARKS = [
  {
    id: 1,
    type: "event",
    title: "Vesak Celebration 2025",
    author: "Buddhist Dhamma Network",
    loc: "Los Angeles, USA",
    time: "Saved 2 days ago",
  },
  {
    id: 2,
    type: "post",
    title: "Beautiful Dhamma reflection on mindfulness",
    author: "Kavindu Silva",
    loc: "Colombo, Sri Lanka",
    time: "Saved 1 week ago",
  }
];

export function BookmarksView() {
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-lg flex items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search bookmarks..." 
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-neutral-900">My Bookmarks</h2>
        </div>
        
        {bookmarks.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No bookmarks yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium border border-neutral-200 mb-2 uppercase">
                    {bookmark.type}
                  </span>
                  <h4 className="font-bold text-neutral-900 text-sm hover:text-orange-600 transition-colors">{bookmark.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                    <span className="font-medium text-neutral-700">{bookmark.author}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" /> {bookmark.loc}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setBookmarks(bookmarks.filter(b => b.id !== bookmark.id));
                  }} className="text-amber-500 hover:text-neutral-400 transition-colors">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {bookmark.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
