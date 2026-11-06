import React, { useState, useMemo } from 'react';
import { 
  MatrimonialProfile, 
  MatrimonialInterest, 
  getMatrimonialProfiles, 
  saveMatrimonialProfile, 
  toggleMatrimonialStatus, 
  getAllMatrimonialInterests, 
  sendMatrimonialInterest, 
  updateInterestStatus 
} from '../../utils/matrimonialStorage';
import { 
  Heart, Shield, Lock, Eye, EyeOff, Search, Plus, 
  Filter, CheckCircle2, X, Sparkles, MapPin, Briefcase, 
  GraduationCap, Calendar, UserCheck, AlertTriangle, 
  Phone, Mail, MessageSquare, Send, Check, Users
} from 'lucide-react';

interface MatrimonialSectionProps {
  currentUserEmail?: string;
  currentUserName?: string;
  onShowToast?: (msg: string) => void;
}

export function MatrimonialSection({
  currentUserEmail = "damika1316@gmail.com",
  currentUserName = "Saminda Fernando",
  onShowToast = (msg: string) => console.log(msg)
}: MatrimonialSectionProps) {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "my_ad" | "proposals">("browse");
  const [profilesVersion, setProfilesVersion] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [managedByFilter, setManagedByFilter] = useState("all");

  // Sub-modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProfileForInterest, setSelectedProfileForInterest] = useState<MatrimonialProfile | null>(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<MatrimonialProfile | null>(null);
  const [proposalMessage, setProposalMessage] = useState("");

  const profiles = useMemo(() => {
    void profilesVersion;
    return getMatrimonialProfiles();
  }, [profilesVersion]);

  const interests = useMemo(() => {
    void profilesVersion;
    return getAllMatrimonialInterests();
  }, [profilesVersion]);

  // My active matrimonial profile (if any)
  const myProfile = useMemo(() => {
    return profiles.find(p => p.userId === currentUserEmail);
  }, [profiles, currentUserEmail]);

  // Filtered public profiles (only active ones)
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (p.status !== "active") return false;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.title.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.education.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q);

      const matchGender = genderFilter === "all" || p.gender === genderFilter;
      const matchLoc = locationFilter === "all" || p.locationCountry.toLowerCase().includes(locationFilter.toLowerCase());
      const matchManaged = managedByFilter === "all" || p.managedBy === managedByFilter;

      return matchSearch && matchGender && matchLoc && matchManaged;
    });
  }, [profiles, searchQuery, genderFilter, locationFilter, managedByFilter]);

  // New Profile Form
  const [newAdForm, setNewAdForm] = useState<Partial<MatrimonialProfile>>({
    title: "",
    fullName: "",
    age: 28,
    dob: "1997-05-15",
    gender: "female",
    religion: "Sinhala Buddhist",
    horoscopeStatus: "Horoscope Available",
    education: "Bachelor's Degree",
    profession: "",
    height: "5' 6\"",
    locationCity: "",
    locationCountry: "Sri Lanka",
    citizenship: "Sri Lankan",
    bio: "",
    partnerPreferences: {
      ageRange: "28 - 33",
      education: "Graduate Professional",
      location: "Any / Flexible",
      values: "Buddhist principles, kind-hearted, respectful"
    },
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    photoPrivacy: "public",
    contactPrivacy: "request_only",
    contactEmail: currentUserEmail,
    contactPhone: "+1 (310) 555-0198",
    managedBy: "self",
    consentConfirmed: true
  });

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.title || !newAdForm.fullName || !newAdForm.bio) {
      onShowToast("Please fill in required fields.");
      return;
    }

    if (!newAdForm.consentConfirmed) {
      onShowToast("Consent of the individual represented is required to proceed.");
      return;
    }

    const created: MatrimonialProfile = {
      id: `mat-${Date.now()}`,
      userId: currentUserEmail,
      title: newAdForm.title.trim(),
      fullName: newAdForm.fullName.trim(),
      age: Number(newAdForm.age) || 28,
      dob: newAdForm.dob || "1997-01-01",
      gender: newAdForm.gender || "female",
      religion: newAdForm.religion || "Sinhala Buddhist",
      horoscopeStatus: newAdForm.horoscopeStatus || "Horoscope Available",
      education: newAdForm.education || "University Graduate",
      profession: newAdForm.profession || "Professional",
      height: newAdForm.height || "5' 6\"",
      locationCity: newAdForm.locationCity || "Colombo",
      locationCountry: newAdForm.locationCountry || "Sri Lanka",
      citizenship: newAdForm.citizenship || "Sri Lankan",
      bio: newAdForm.bio.trim(),
      partnerPreferences: newAdForm.partnerPreferences || {
        ageRange: "27 - 33",
        education: "Graduate",
        location: "Flexible",
        values: "Buddhist moral grounding"
      },
      photoUrl: newAdForm.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      photoPrivacy: newAdForm.photoPrivacy || "public",
      contactPrivacy: newAdForm.contactPrivacy || "request_only",
      contactEmail: newAdForm.contactEmail || currentUserEmail,
      contactPhone: newAdForm.contactPhone || "",
      managedBy: newAdForm.managedBy || "self",
      managerName: newAdForm.managedBy !== "self" ? newAdForm.managerName : undefined,
      managerContact: newAdForm.managedBy !== "self" ? newAdForm.managerContact : undefined,
      consentConfirmed: true,
      status: "active",
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      viewsCount: 1
    };

    saveMatrimonialProfile(created);
    setProfilesVersion(v => v + 1);
    setShowCreateModal(false);
    setActiveTab("my_ad");
    onShowToast("Matrimonial advertisement published securely!");
  };

  const handleSendInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileForInterest || !proposalMessage.trim()) return;

    sendMatrimonialInterest({
      profileId: selectedProfileForInterest.id,
      profileTitle: selectedProfileForInterest.title,
      senderId: currentUserEmail,
      senderName: currentUserName,
      senderAge: 32,
      senderProfession: "Solutions Architect / Consultant",
      senderLocation: "Los Angeles, CA, USA",
      senderEmail: currentUserEmail,
      senderPhone: "+1 (310) 555-0198",
      message: proposalMessage.trim()
    });

    setSelectedProfileForInterest(null);
    setProposalMessage("");
    setProfilesVersion(v => v + 1);
    onShowToast("Expression of interest sent to candidate's representation!");
  };

  const handleToggleAdStatus = (status: "active" | "paused" | "removed") => {
    if (!myProfile) return;
    toggleMatrimonialStatus(myProfile.id, status);
    setProfilesVersion(v => v + 1);
    onShowToast(`Matrimonial advertisement status set to: ${status.toUpperCase()}`);
  };

  // 18+ Age Gateway Gatekeeper
  if (!isAgeVerified) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-rose-100">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            Adult Section • 18+ Only
          </span>
          <h3 className="text-xl font-black text-neutral-900 mt-2">
            Sri Lankan Community Matrimonial Directory
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
            A respectful, privacy-focused space connecting marriage candidates and families grounded in Theravada Buddhist ethics and Sri Lankan cultural values.
          </p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs text-neutral-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-neutral-800">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict Privacy & Excluded from Search Indexing</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            All profiles in this section are protected from public search engines (<code className="bg-neutral-200 px-1 rounded">noindex</code>), require individual consent, and allow full control over who views photographs and contact numbers.
          </p>
        </div>

        <button
          onClick={() => setIsAgeVerified(true)}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Confirm I Am 18+ Years Old — Enter Section</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Section Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
              Matrimonial Directory (18+)
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-neutral-400" /> Excluded from Search Engines
            </span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 mt-1">
            Community Matrimonial Proposals & Alliances
          </h2>
          <p className="text-xs text-neutral-500">
            Find compatible life companions with family verification, horoscope details, and private contact exchange.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Proposal Ad</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Browse, My Ad, Received Interests */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 rounded-xl border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "browse" 
                ? 'border-rose-600 text-rose-700' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Browse Advertisements ({filteredProfiles.length})
          </button>

          <button
            onClick={() => setActiveTab("my_ad")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "my_ad" 
                ? 'border-rose-600 text-rose-700' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            My Advertisement {myProfile && `(${myProfile.status.toUpperCase()})`}
          </button>

          <button
            onClick={() => setActiveTab("proposals")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "proposals" 
                ? 'border-rose-600 text-rose-700' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Received Interests</span>
            {interests.filter(i => i.status === "pending").length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {interests.filter(i => i.status === "pending").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Browse Advertisements */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search profession, degree, location, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium"
              >
                <option value="all">All Genders (Bride / Groom)</option>
                <option value="female">Seeking Groom (Brides)</option>
                <option value="male">Seeking Bride (Grooms)</option>
              </select>
            </div>

            <div>
              <select
                value={managedByFilter}
                onChange={e => setManagedByFilter(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium"
              >
                <option value="all">Managed By (All)</option>
                <option value="parents">Managed by Parents</option>
                <option value="self">Managed by Self</option>
                <option value="sibling">Managed by Sibling</option>
              </select>
            </div>
          </div>

          {/* Advertisements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProfiles.map(p => {
              const isBlurred = p.photoPrivacy === "blurred" || p.photoPrivacy === "request_only";

              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Photo with Privacy Control */}
                    <div className="relative h-48 bg-neutral-100 overflow-hidden">
                      <img
                        src={p.photoUrl}
                        alt=""
                        className={`w-full h-full object-cover ${isBlurred ? 'filter blur-md scale-105' : ''}`}
                      />
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                          Age {p.age} • {p.gender === 'female' ? 'Bride' : 'Groom'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                          {p.religion}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        <span>Managed by {p.managedBy.toUpperCase()}</span>
                        {p.horoscopeStatus && <span>{p.horoscopeStatus}</span>}
                      </div>

                      {isBlurred && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/30 text-white">
                          <EyeOff className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">Photo Access on Request</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-snug">
                        {p.title}
                      </h3>

                      <div className="space-y-1 text-xs text-neutral-600">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{p.profession}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{p.education}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{p.locationCity}, {p.locationCountry}</span>
                        </p>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-3 mt-2 pt-2 border-t border-neutral-100 leading-relaxed">
                        {p.bio}
                      </p>

                      <div className="pt-2 text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                        <strong className="text-neutral-800">Preferences:</strong> {p.partnerPreferences.values} • Age {p.partnerPreferences.ageRange}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProfileDetail(p)}
                      className="flex-1 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Full Details
                    </button>
                    <button
                      onClick={() => setSelectedProfileForInterest(p)}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Express Interest</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Advertisement */}
      {activeTab === "my_ad" && (
        <div className="space-y-4">
          {myProfile ? (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 max-w-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    myProfile.status === "active" ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {myProfile.status.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-lg text-neutral-900 mt-1">{myProfile.title}</h3>
                  <p className="text-xs text-neutral-500">Candidate: {myProfile.fullName} • Age {myProfile.age}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleAdStatus(myProfile.status === "active" ? "paused" : "active")}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold hover:bg-neutral-50"
                  >
                    {myProfile.status === "active" ? "Pause Ad" : "Activate Ad"}
                  </button>
                  <button
                    onClick={() => handleToggleAdStatus("removed")}
                    className="px-3 py-1.5 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                <p><strong>Profession:</strong> {myProfile.profession}</p>
                <p><strong>Education:</strong> {myProfile.education}</p>
                <p><strong>Location:</strong> {myProfile.locationCity}, {myProfile.locationCountry}</p>
                <p><strong>Management:</strong> Managed by {myProfile.managedBy} {myProfile.managerName ? `(${myProfile.managerName})` : ''}</p>
                <p><strong>Privacy:</strong> Photo: {myProfile.photoPrivacy} • Contact: {myProfile.contactPrivacy}</p>
                <p><strong>Views Count:</strong> {myProfile.viewsCount} visits</p>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-neutral-900">No Matrimonial Advertisement Published</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                You have not published an advertisement yet. You can create a proposal for yourself or as a family member with candidate consent.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs"
              >
                + Create Matrimonial Advertisement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Received Interests */}
      {activeTab === "proposals" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-base text-neutral-900">Received Expressions of Interest</h3>
          <p className="text-xs text-neutral-500">
            Review introductory proposals from interested members or their family representatives
          </p>

          {interests.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-6 text-center">No proposals received yet.</p>
          ) : (
            <div className="space-y-3">
              {interests.map(int => (
                <div key={int.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{int.senderName}</span>
                        <span className="text-xs text-neutral-500">Age {int.senderAge} • {int.senderProfession}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{int.senderLocation} • {int.createdAt}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      int.status === "accepted" ? 'bg-emerald-100 text-emerald-800' :
                      int.status === "declined" ? 'bg-neutral-200 text-neutral-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {int.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 p-3 bg-white rounded-lg border border-neutral-100 leading-relaxed">
                    "{int.message}"
                  </p>

                  {int.status === "accepted" ? (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span>Contact Unlocked: <strong>{int.senderEmail}</strong> {int.senderPhone ? `• ${int.senderPhone}` : ''}</span>
                      <a href={`mailto:${int.senderEmail}`} className="font-bold underline">Send Email</a>
                    </div>
                  ) : int.status === "pending" ? (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          updateInterestStatus(int.id, "declined");
                          setProfilesVersion(v => v + 1);
                          onShowToast("Proposal declined politely.");
                        }}
                        className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-lg"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          updateInterestStatus(int.id, "accepted");
                          setProfilesVersion(v => v + 1);
                          onShowToast("Interest accepted! Contact details exchanged.");
                        }}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                      >
                        Accept & Exchange Contact
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Express Interest */}
      {selectedProfileForInterest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-neutral-900">Express Interest / Proposal</h3>
              </div>
              <button onClick={() => setSelectedProfileForInterest(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInterestSubmit} className="space-y-3">
              <p className="text-xs text-neutral-500">
                Sending introductory proposal to: <strong>{selectedProfileForInterest.title}</strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Introductory Message *</label>
                <textarea
                  rows={4}
                  required
                  value={proposalMessage}
                  onChange={e => setProposalMessage(e.target.value)}
                  placeholder="Introduce yourself or your family, education, and interest in pursuing mutual compatibility..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfileForInterest(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publish Matrimonial Advertisement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <h3 className="font-bold text-base text-neutral-900">Publish Matrimonial Advertisement (18+)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Advertisement Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Educated Sinhala Buddhist Doctor (29, Los Angeles) seeking groom"
                  value={newAdForm.title}
                  onChange={e => setNewAdForm({ ...newAdForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdForm.fullName}
                    onChange={e => setNewAdForm({ ...newAdForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min={18}
                    max={85}
                    required
                    value={newAdForm.age}
                    onChange={e => setNewAdForm({ ...newAdForm, age: parseInt(e.target.value) || 28 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Gender</label>
                  <select
                    value={newAdForm.gender}
                    onChange={e => setNewAdForm({ ...newAdForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="female">Female (Seeking Groom)</option>
                    <option value="male">Male (Seeking Bride)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Horoscope Status</label>
                  <select
                    value={newAdForm.horoscopeStatus}
                    onChange={e => setNewAdForm({ ...newAdForm, horoscopeStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="Horoscope Available">Horoscope Available</option>
                    <option value="Will Share on Request">Will Share on Request</option>
                    <option value="Non-Horoscope">Non-Horoscope</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Education / Degree *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M.Sc. Data Science or MBBS"
                    value={newAdForm.education}
                    onChange={e => setNewAdForm({ ...newAdForm, education: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Occupation / Profession *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={newAdForm.profession}
                    onChange={e => setNewAdForm({ ...newAdForm, profession: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City & Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Los Angeles, USA"
                    value={`${newAdForm.locationCity || ''}, ${newAdForm.locationCountry || ''}`}
                    onChange={e => {
                      const parts = e.target.value.split(',');
                      setNewAdForm({
                        ...newAdForm,
                        locationCity: parts[0]?.trim() || '',
                        locationCountry: parts[1]?.trim() || 'USA'
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Managed By *</label>
                  <select
                    value={newAdForm.managedBy}
                    onChange={e => setNewAdForm({ ...newAdForm, managedBy: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  >
                    <option value="self">Self</option>
                    <option value="parents">Parents</option>
                    <option value="sibling">Sibling (Brother / Sister)</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Introduction & Family Background *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline values, character, interests, and family background..."
                  value={newAdForm.bio}
                  onChange={e => setNewAdForm({ ...newAdForm, bio: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                />
              </div>

              {/* Privacy and Consent */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    required
                    checked={newAdForm.consentConfirmed}
                    onChange={e => setNewAdForm({ ...newAdForm, consentConfirmed: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="consentCheck" className="text-[11px] text-neutral-700 font-semibold">
                    I confirm the individual represented is 18+ years of age and has given explicit consent for this advertisement.
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
                >
                  Publish Advertisement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Profile Details */}
      {selectedProfileDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {selectedProfileDetail.gender === 'female' ? 'Bride Proposal' : 'Groom Proposal'}
                </span>
                <h3 className="font-bold text-base text-neutral-900 mt-1">{selectedProfileDetail.title}</h3>
              </div>
              <button onClick={() => setSelectedProfileDetail(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700">
              <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5">
                <p><strong>Candidate:</strong> {selectedProfileDetail.fullName} (Age {selectedProfileDetail.age})</p>
                <p><strong>Profession:</strong> {selectedProfileDetail.profession}</p>
                <p><strong>Education:</strong> {selectedProfileDetail.education}</p>
                <p><strong>Location:</strong> {selectedProfileDetail.locationCity}, {selectedProfileDetail.locationCountry}</p>
                <p><strong>Citizenship:</strong> {selectedProfileDetail.citizenship}</p>
                <p><strong>Horoscope:</strong> {selectedProfileDetail.horoscopeStatus}</p>
                <p><strong>Managed By:</strong> {selectedProfileDetail.managedBy.toUpperCase()} {selectedProfileDetail.managerName ? `(${selectedProfileDetail.managerName})` : ''}</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 mb-1">About & Values</h4>
                <p className="leading-relaxed bg-white border border-neutral-100 p-3 rounded-xl">{selectedProfileDetail.bio}</p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 mb-1">Partner Preferences</h4>
                <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                  <p><strong>Age Range:</strong> {selectedProfileDetail.partnerPreferences.ageRange}</p>
                  <p><strong>Education:</strong> {selectedProfileDetail.partnerPreferences.education}</p>
                  <p><strong>Location:</strong> {selectedProfileDetail.partnerPreferences.location}</p>
                  <p><strong>Ethical Values:</strong> {selectedProfileDetail.partnerPreferences.values}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setSelectedProfileDetail(null)}
                className="px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProfileForInterest(selectedProfileDetail);
                  setSelectedProfileDetail(null);
                }}
                className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-xs shadow-2xs"
              >
                Express Interest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
