import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, MapPin, UserPlus, Star, MessageSquare, 
  X, Check, Building2, Briefcase, GraduationCap, Globe, 
  Mail, Phone, Send, CheckCircle2, Sparkles, UserCheck, Users 
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { subscribeUsers } from "../../lib/firestoreService";

interface Person {
  name: string;
  loc: string;
  country: string;
  img: string;
  role: string;
  company?: string;
  verified: boolean;
  bio?: string;
  skills?: string[];
  connections?: number;
  hometown?: string;
}

export function PeopleView() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [requestedConnections, setRequestedConnections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState("All");

  React.useEffect(() => {
    const unsub = subscribeUsers((firestoreUsers) => {
      const mapped: Person[] = firestoreUsers.map((u: any) => ({
        name: u.displayName || u.name || "Community Member",
        loc: u.location || u.loc || (u.country ? `${u.country}` : "Global Community"),
        country: u.country || "Global",
        img: u.photoURL || u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
        role: u.role || u.profession || "Community Member",
        company: u.company || "",
        verified: !!u.verified,
        bio: u.bio || "Active member of the Lanka Buddhist Community.",
        skills: Array.isArray(u.skills) ? u.skills : ["Dhamma Study", "Mindfulness"],
        connections: u.connections || 1,
        hometown: u.hometown || ""
      }));
      setPeople(mapped);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Selected Person Modal
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [messageText, setMessageText] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleConnect = (personName: string) => {
    if (requestedConnections.includes(personName)) {
      setRequestedConnections(requestedConnections.filter(n => n !== personName));
      showToast(`Cancelled connection request to ${personName}.`);
    } else {
      setRequestedConnections([...requestedConnections, personName]);
      showToast(`Connection request sent to ${personName}!`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPerson) return;
    showToast(`Message dispatched to ${selectedPerson.name}!`);
    setMessageText("");
    setSelectedPerson(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Person Profile Modal */}
      {selectedPerson && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPerson(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner */}
            <div className="relative h-28 bg-gradient-to-r from-blue-600 to-indigo-600">
              <button 
                onClick={() => setSelectedPerson(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-0 relative -mt-12">
              <div className="flex items-end justify-between mb-3">
                <div className="relative">
                  <img 
                    src={selectedPerson.img} 
                    alt={selectedPerson.name} 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                  />
                  {selectedPerson.verified && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pb-1">
                  <button
                    onClick={() => handleToggleConnect(selectedPerson.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      requestedConnections.includes(selectedPerson.name)
                        ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {requestedConnections.includes(selectedPerson.name) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Requested
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Connect
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xl text-neutral-900">{selectedPerson.name}</h3>
                <p className="text-xs font-medium text-neutral-600">{selectedPerson.role} {selectedPerson.company ? `at ${selectedPerson.company}` : ""}</p>
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedPerson.loc}
                  {selectedPerson.hometown && (
                    <span>• Originally from {selectedPerson.hometown}</span>
                  )}
                </p>
              </div>

              {selectedPerson.bio && (
                <p className="text-xs text-neutral-700 leading-relaxed mt-4 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                  {selectedPerson.bio}
                </p>
              )}

              {selectedPerson.skills && selectedPerson.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Skills & Community Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPerson.skills.map((skill, i) => (
                      <span key={i} className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Message Input */}
              <form onSubmit={handleSendMessage} className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
                <label className="block text-xs font-bold text-neutral-700">Send Direct Message to {selectedPerson.name}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Write a greeting or message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search/Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 bg-white border border-neutral-200 rounded-xl flex items-center shadow-2xs">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search people by name, profession, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex gap-2.5">
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold outline-none text-neutral-700 min-w-[130px] cursor-pointer"
          >
            <option>All Countries</option>
            <option>Japan</option>
            <option>UK</option>
            <option>Australia</option>
            <option>USA</option>
            <option>Canada</option>
          </select>

          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`bg-white border rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
              showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Profession:</h4>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Software Engineer', 'Student', 'Designer', 'Chef', 'Photographer', 'Entrepreneur', 'Researcher', 'Engineer'].map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    selectedRole === role 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* People Grid */}
      {(() => {
        const filteredPeople = people.filter(person => {
          const q = searchQuery.toLowerCase().trim();
          const matchesSearch = 
            q === "" ||
            person.name.toLowerCase().includes(q) ||
            person.role.toLowerCase().includes(q) ||
            person.loc.toLowerCase().includes(q) ||
            (person.skills && person.skills.some(s => s.toLowerCase().includes(q)));

          const matchesCountry = selectedCountry === "All Countries" || person.country === selectedCountry || person.loc.includes(selectedCountry);
          const matchesRole = selectedRole === "All" || person.role.toLowerCase().includes(selectedRole.toLowerCase());
          return matchesSearch && matchesCountry && matchesRole;
        });

        if (loading) {
          return (
            <div className="p-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Connecting to community directory...</p>
            </div>
          );
        }

        if (filteredPeople.length === 0) {
          return (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800">No members found</h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
                No members found matching your current filter. As community members register and create profiles, they will automatically appear here.
              </p>
            </div>
          );
        }

        return (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPeople.map((person) => (
            <motion.div 
              layout 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ duration: 0.2 }} 
              key={person.name} 
              onClick={() => setSelectedPerson(person)} 
              className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col items-center text-center hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative mb-3">
                <img 
                  referrerPolicy="no-referrer" 
                  src={person.img} 
                  alt={person.name} 
                  className="w-20 h-20 rounded-full border-2 border-neutral-100 object-cover group-hover:scale-105 transition-transform" 
                />
                {person.verified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>

              <h3 className="font-bold text-neutral-900 text-base group-hover:text-blue-600 transition-colors">
                {person.name}
              </h3>
              <p className="text-xs text-neutral-600 font-medium mb-0.5">{person.role}</p>
              <p className="text-xs text-neutral-400 flex items-center gap-1 mb-4">
                <MapPin className="w-3 h-3 text-rose-500" /> {person.loc}
              </p>

              <div className="flex w-full gap-2 mt-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleConnect(person.name);
                  }} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    requestedConnections.includes(person.name)
                      ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> 
                  {requestedConnections.includes(person.name) ? "Requested" : "Connect"}
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPerson(person);
                  }} 
                  className="flex-1 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  })()}
</div>
);
}
