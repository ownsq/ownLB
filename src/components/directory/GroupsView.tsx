import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, ShieldCheck, Lock, Globe, X } from 'lucide-react';
import { subscribeGroups, addGroupToDb } from '../../lib/firestoreService';

export let GROUPS: any[] = [];

export function GroupsView() { 
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState("All");

  useEffect(() => {
    const unsub = subscribeGroups((dbGroups) => {
      GROUPS = dbGroups;
      setGroups(dbGroups);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-lg flex items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >
            <option>All Categories</option>
            <option>Technology</option>
            <option>Travel</option>
            <option>Religion</option>
            <option>Food</option>
            <option>Community</option>
            <option>Education</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h4 className="text-sm font-bold text-neutral-900">Privacy:</h4>
            <div className="flex gap-2">
              {['All', 'Public', 'Private'].map(privacy => (
                <button
                  key={privacy}
                  onClick={() => setSelectedPrivacy(privacy)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedPrivacy === privacy ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                >
                  {privacy} {privacy !== 'All' && 'Groups'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-neutral-500 bg-white rounded-xl border border-neutral-200">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Connecting to community groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-neutral-200">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No community groups yet</h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto mb-4">
            Create the first Dhamma discussion circle, regional association, or interest group to connect with fellow Sri Lankans.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.filter(group => {
            const matchesSearch = (group.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (group.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All Categories" || group.category === selectedCategory;
            const matchesPrivacy = selectedPrivacy === "All" || (group.type || '').includes(selectedPrivacy);
            return matchesSearch && matchesCategory && matchesPrivacy;
          }).map((group, i) => (
            <div key={group.id || i} onClick={() => navigate('/groups/' + encodeURIComponent((group.title || '').toLowerCase().replace(/\s+/g, '-')), { state: { group } })} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:border-orange-300 transition-colors group-card">
              <img referrerPolicy="no-referrer" src={group.img || "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600"} alt={group.title} className="w-full sm:w-32 h-32 object-cover" />
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-sm text-neutral-900 truncate">{group.title}</h4>
                <p className="text-[10px] text-neutral-500 flex items-center gap-1 mb-2">
                  {(group.type || '').includes('Private') ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {group.type || 'Public Group'} • {group.members || '1'} Members
                </p>
                <p className="text-xs text-neutral-600 line-clamp-2 mb-4 flex-1">{group.desc}</p>
                {joinedGroups.includes(group.title) ? (
                  <button onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setJoinedGroups(joinedGroups.filter(g => g !== group.title));
                  }} className="w-full sm:w-auto py-1.5 px-4 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> {(group.type || '').includes('Private') ? 'Requested' : 'Joined'}
                  </button>
                ) : (
                  <button onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setJoinedGroups([...joinedGroups, group.title]);
                    showToast((group.type || '').includes('Private') ? 'Request sent to join ' + group.title : 'Joined ' + group.title);
                  }} className="w-full sm:w-auto py-1.5 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Join Group
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
