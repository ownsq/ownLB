import React, { useState, useEffect } from 'react';
import { useAd, AdConfig } from '../contexts/AdContext';
import { 
  Settings, Save, AlertCircle, Code, ShieldCheck, CheckCircle2, 
  Copy, Check, Eye, RefreshCw, Megaphone, Users, Gavel, 
  FileText, Ban, ExternalLink, Sparkles, AlertTriangle, 
  HelpCircle, Layers, Radio, Globe, Shield, Search,
  ArrowRight, UserPlus, Trash2, X, AlertOctagon, UserX,
  UserCheck, ShieldAlert, Clock, Phone, Mail, MapPin,
  Lock, RotateCcw, Sliders, ToggleLeft, ToggleRight, Power, LayoutGrid, CheckCircle, Database
} from 'lucide-react';
import { 
  getPlatformReports, 
  getAuditLogs, 
  PlatformReport, 
  AuditLogEntry, 
  addAuditLog 
} from '../utils/classifiedsAuctionStorage';
import { 
  ManagedUser,
  getManagedUsers,
  saveManagedUsers,
  addManagedUser,
  removeManagedUser,
  banManagedUser,
  unbanManagedUser,
  updateUserRole,
  toggleUserPhoneVerification
} from '../utils/userManagementStorage';
import { GoogleAdSense } from '../components/ads/GoogleAdSense';
import { 
  useSectionConfig, 
  SECTION_METADATA_LIST, 
  SectionKey, 
  SectionMetadata 
} from '../contexts/SectionContext';

export function AdminPanel() {
  const { adConfig, updateAdConfig, parseAndApplyScript, resetToDefaults } = useAd();
  const { 
    sectionConfig, 
    isSectionEnabled, 
    toggleSection, 
    enableAllSections, 
    disableNonCoreSections, 
    resetSectionsToDefault, 
    setDisabledNotice,
    enabledCount,
    disabledCount 
  } = useSectionConfig();
  
  const [activeTab, setActiveTab] = useState<'adsense' | 'sections' | 'users' | 'marketplace' | 'moderation' | 'announcements'>('adsense');
  const [formData, setFormData] = useState<AdConfig>(adConfig);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [detectedClientId, setDetectedClientId] = useState<string | null>(null);
  const [scriptParseNotice, setScriptParseNotice] = useState<string>("");

  // Section Configuration State
  const [sectionNoticeDraft, setSectionNoticeDraft] = useState(sectionConfig.disabledSectionNotice);
  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionCategoryFilter, setSectionCategoryFilter] = useState<'all' | 'primary' | 'subfeature'>('all');

  // Platform Moderation Data
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // User Management State
  const [usersList, setUsersList] = useState<ManagedUser[]>(getManagedUsers);
  const [userSearch, setUserSearch] = useState("");
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'active' | 'banned' | 'sellers' | 'staff'>('all');

  // Modals for User Management
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Member" as ManagedUser['role'],
    location: "Colombo, Sri Lanka",
    isPhoneVerified: true,
    isBanned: false,
    notes: ""
  });
  const [addUserError, setAddUserError] = useState("");

  // Ban Modal
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState<ManagedUser | null>(null);
  const [banForm, setBanForm] = useState({
    reasonCategory: "Suspected Shill Bidding / Auction Fraud",
    customReason: "",
    duration: "Indefinite" as 'Permanent' | '7 Days' | '30 Days' | 'Indefinite'
  });

  // Delete User Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);

  // View User Details Modal
  const [selectedUserDetails, setSelectedUserDetails] = useState<ManagedUser | null>(null);

  // Refresh reports and logs
  useEffect(() => {
    setReports(getPlatformReports());
    setAuditLogs(getAuditLogs());
    setUsersList(getManagedUsers());

    const handleUsersUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ManagedUser[]>;
      if (customEvent.detail) {
        setUsersList(customEvent.detail);
      } else {
        setUsersList(getManagedUsers());
      }
    };

    window.addEventListener("lanka_users_updated", handleUsersUpdated);
    return () => window.removeEventListener("lanka_users_updated", handleUsersUpdated);
  }, []);

  // Sync formData with context when adConfig changes externally
  useEffect(() => {
    setFormData(adConfig);
  }, [adConfig]);

  // Real-time detection of publisher ID when typing/pasting script
  useEffect(() => {
    if (formData.googleAdsenseScript) {
      const pubMatch = formData.googleAdsenseScript.match(/ca-pub-\d{10,20}/i);
      setDetectedClientId(pubMatch ? pubMatch[0] : null);
    } else {
      setDetectedClientId(null);
    }
  }, [formData.googleAdsenseScript]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox support
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlacementToggle = (placementKey: keyof AdConfig['placements']) => {
    setFormData(prev => ({
      ...prev,
      placements: {
        ...prev.placements,
        [placementKey]: !prev.placements[placementKey]
      }
    }));
  };

  const handleAuctionSettingChange = (field: keyof AdConfig['auctionSettings'], val: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      auctionSettings: {
        ...prev.auctionSettings,
        [field]: val
      }
    }));
  };

  const handleAnnouncementChange = (field: keyof AdConfig['siteAnnouncement'], val: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      siteAnnouncement: {
        ...prev.siteAnnouncement,
        [field]: val
      }
    }));
  };

  // Dedicated Auto-Extract action
  const handleAutoExtractScript = () => {
    if (!formData.googleAdsenseScript.trim()) {
      setScriptParseNotice("Please paste your Google AdSense code or script tag first.");
      return;
    }

    const { detectedClient, detectedSlots } = parseAndApplyScript(formData.googleAdsenseScript);
    
    if (detectedClient) {
      setFormData(prev => ({
        ...prev,
        googleAdClient: detectedClient,
        ...(detectedSlots.length > 0 ? { googleAdSlot: detectedSlots[0] } : {})
      }));
      setScriptParseNotice(`Successfully extracted Publisher ID: ${detectedClient}${detectedSlots.length > 0 ? ` and ${detectedSlots.length} slot(s)` : ''}!`);
      triggerToast(`AdSense Client ID (${detectedClient}) detected and applied!`);
    } else {
      setScriptParseNotice("No 'ca-pub-XXXXXXXX' found in the snippet. You can also type it directly in the Ad Client field below.");
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdConfig(formData);
    addAuditLog({
      action: "Admin Config Updated",
      targetTitle: "Google AdSense & Platform Settings",
      performedBy: "Damika (Super Admin)",
      details: `Updated AdSense Client: ${formData.googleAdClient}, Auto-Ads: ${formData.autoAdsEnabled ? 'Enabled' : 'Disabled'}`
    });
    triggerToast("Super Admin settings saved successfully! Active changes live site-wide.");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all advertising & platform settings to default?")) {
      resetToDefaults();
      triggerToast("Settings reset to default successfully.");
    }
  };

  // Moderation Handlers
  const handleResolveReport = (reportId: string, action: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, status: "resolved" as const, adminActionTaken: action };
      }
      return r;
    });
    setReports(updated);
    try {
      localStorage.setItem("lanka_platform_reports", JSON.stringify(updated));
    } catch {
      // ignore
    }
    addAuditLog({
      action: "Report Investigated",
      targetTitle: reportId,
      performedBy: "Damika (Super Admin)",
      details: `Action: ${action}`
    });
    triggerToast(`Report resolved: ${action}`);
  };

  const handleDismissReport = (reportId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, status: "dismissed" as const, adminActionTaken: "Dismissed by admin (No violation found)" };
      }
      return r;
    });
    setReports(updated);
    try {
      localStorage.setItem("lanka_platform_reports", JSON.stringify(updated));
    } catch {
      // ignore
    }
    triggerToast("Report dismissed.");
  };

  // ================= USER MANAGEMENT ACTIONS =================

  // 1. Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError("");

    if (!newUserForm.name.trim()) {
      setAddUserError("Please enter full name.");
      return;
    }
    if (!newUserForm.email.trim() || !newUserForm.email.includes("@")) {
      setAddUserError("Please enter a valid email address.");
      return;
    }
    if (!newUserForm.phone.trim()) {
      setAddUserError("Please enter a contact phone number.");
      return;
    }

    // Check duplicate
    const existing = usersList.find(u => u.email.toLowerCase() === newUserForm.email.toLowerCase().trim());
    if (existing) {
      setAddUserError(`A user with email ${newUserForm.email} already exists.`);
      return;
    }

    const created = addManagedUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      phone: newUserForm.phone.trim(),
      role: newUserForm.role,
      isPhoneVerified: newUserForm.isPhoneVerified,
      isBanned: newUserForm.isBanned,
      location: newUserForm.location.trim() || "Sri Lanka",
      notes: newUserForm.notes.trim() || undefined
    });

    addAuditLog({
      action: "User Account Created",
      targetTitle: `${created.name} (${created.email})`,
      performedBy: "Damika (Super Admin)",
      details: `Created new ${created.role} account with phone ${created.phone}.`
    });

    setUsersList(getManagedUsers());
    setShowAddUserModal(false);
    setNewUserForm({
      name: "",
      email: "",
      phone: "",
      role: "Member",
      location: "Colombo, Sri Lanka",
      isPhoneVerified: true,
      isBanned: false,
      notes: ""
    });
    triggerToast(`User "${created.name}" created successfully!`);
  };

  // 2. Remove / Delete User
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;

    if (userToDelete.email.toLowerCase().includes("damika1316@gmail.com")) {
      triggerToast("Cannot delete the primary Super Admin account.");
      setShowDeleteModal(false);
      setUserToDelete(null);
      return;
    }

    removeManagedUser(userToDelete.id);
    addAuditLog({
      action: "User Account Deleted",
      targetTitle: `${userToDelete.name} (${userToDelete.email})`,
      performedBy: "Damika (Super Admin)",
      details: `Permanently removed user ID ${userToDelete.id}.`
    });

    setUsersList(getManagedUsers());
    setShowDeleteModal(false);
    triggerToast(`User "${userToDelete.name}" has been permanently removed.`);
    setUserToDelete(null);
  };

  // 3. Ban User
  const handleOpenBanModal = (u: ManagedUser) => {
    setUserToBan(u);
    setBanForm({
      reasonCategory: "Suspected Shill Bidding / Auction Fraud",
      customReason: "",
      duration: "Indefinite"
    });
    setShowBanModal(true);
  };

  const handleConfirmBanUser = () => {
    if (!userToBan) return;

    if (userToBan.email.toLowerCase().includes("damika1316@gmail.com")) {
      triggerToast("Cannot ban the primary Super Admin account.");
      setShowBanModal(false);
      setUserToBan(null);
      return;
    }

    const finalReason = banForm.customReason.trim() 
      ? `${banForm.reasonCategory}: ${banForm.customReason.trim()}`
      : banForm.reasonCategory;

    banManagedUser(userToBan.id, finalReason, banForm.duration);

    addAuditLog({
      action: "User Account Banned",
      targetTitle: `${userToBan.name} (${userToBan.email})`,
      performedBy: "Damika (Super Admin)",
      details: `Enacted ${banForm.duration} ban. Reason: ${finalReason}`
    });

    setUsersList(getManagedUsers());
    setShowBanModal(false);
    triggerToast(`User "${userToBan.name}" has been banned/suspended.`);
    setUserToBan(null);
  };

  // 4. Unban / Reinstate User
  const handleUnbanUser = (u: ManagedUser) => {
    unbanManagedUser(u.id);
    addAuditLog({
      action: "User Account Reinstated",
      targetTitle: `${u.name} (${u.email})`,
      performedBy: "Damika (Super Admin)",
      details: `Reinstated active membership status for user ${u.id}.`
    });
    setUsersList(getManagedUsers());
    triggerToast(`User "${u.name}" unbanned and restored to active status.`);
  };

  // 5. Change Role
  const handleChangeUserRole = (userId: string, newRole: ManagedUser['role']) => {
    updateUserRole(userId, newRole);
    setUsersList(getManagedUsers());
    triggerToast(`User role changed to ${newRole}`);
  };

  // 6. Toggle Phone Verification
  const handleTogglePhoneVerification = (userId: string) => {
    toggleUserPhoneVerification(userId);
    setUsersList(getManagedUsers());
    triggerToast("Phone verification status updated.");
  };

  // Filter users based on search and tab
  const filteredUsers = usersList.filter(u => {
    // Search query
    const matchSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      (u.location && u.location.toLowerCase().includes(userSearch.toLowerCase()));

    if (!matchSearch) return false;

    // Filter tab
    if (userFilterTab === 'active') return !u.isBanned;
    if (userFilterTab === 'banned') return u.isBanned;
    if (userFilterTab === 'sellers') return u.role === 'Verified Seller';
    if (userFilterTab === 'staff') return u.role === 'Super Admin' || u.role === 'Moderator';
    return true;
  });

  // User Stats
  const totalCount = usersList.length;
  const activeCount = usersList.filter(u => !u.isBanned).length;
  const bannedCount = usersList.filter(u => u.isBanned).length;
  const verifiedPhoneCount = usersList.filter(u => u.isPhoneVerified).length;
  const sellersCount = usersList.filter(u => u.role === 'Verified Seller').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-sans">
      
      {/* Top Banner / System Status */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500 text-neutral-950 text-xs font-black tracking-wider uppercase rounded-md flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Super Admin Master Control
              </span>
              <span className="text-neutral-400 text-xs font-mono">v3.6.0</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration &amp; Member Security
            </h1>
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              Inject your Google AdSense code snippet, configure site-wide automated ads, control auction anti-sniping policies, manage community members, add/remove accounts, and enact user bans.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${formData.isGoogleAdActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`} />
              <div className="text-xs">
                <div className="font-bold text-white">Google AdSense Status</div>
                <div className="text-neutral-400 font-mono text-[11px]">
                  {formData.isGoogleAdActive ? (formData.googleAdClient || "Active (ca-pub detected)") : "Disabled / Paused"}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="text-xs">
                <div className="font-bold text-white">Platform Sections</div>
                <div className="text-neutral-400 text-[11px]">
                  <span className="text-emerald-400 font-semibold">{enabledCount} Live</span> • <span className="text-amber-400 font-semibold">{disabledCount} Disabled</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  Firebase Cloud Firestore
                </div>
                <div className="text-neutral-400 font-mono text-[11px]">
                  Connected • lankabuddhist
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div className="text-xs">
                <div className="font-bold text-white">Member Accounts</div>
                <div className="text-neutral-400 text-[11px]">
                  {totalCount} Total • <span className="text-emerald-400 font-semibold">{activeCount} Active</span> • <span className="text-rose-400 font-semibold">{bannedCount} Banned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'adsense', label: 'Google AdSense & Scripts', icon: Code, count: detectedClientId ? 'Ready' : 'Pending' },
            { id: 'sections', label: 'Sections & Features', icon: Sliders, count: `${enabledCount}/13 Live` },
            { id: 'users', label: 'User Accounts & Bans', icon: Users, count: `${totalCount} (${bannedCount} ban)` },
            { id: 'marketplace', label: 'Auctions & Anti-Sniping', icon: Gavel, count: `${formData.auctionSettings.antiSnipingSeconds}s` },
            { id: 'moderation', label: 'Reports & Audit Logs', icon: AlertTriangle, count: reports.filter(r => r.status === 'pending').length },
            { id: 'announcements', label: 'Global Notice & Alerts', icon: Megaphone, count: formData.siteAnnouncement.enabled ? 'ON' : 'OFF' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-neutral-950 shadow-md' 
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    isActive ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* ================= TAB 1: GOOGLE ADSENSE & SCRIPT INJECTION ================= */}
        {activeTab === 'adsense' && (
          <div className="space-y-6">
            
            {/* Primary Google AdSense Code Injector */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Google AdSense Script &amp; Code Injection</h2>
                    <p className="text-xs text-neutral-500">Paste your official Google AdSense script tag or verification snippet here</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isGoogleAdActive" 
                      checked={formData.isGoogleAdActive}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-800">Enable Google Ads Site-wide</span>
                  </label>

                  <label className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input 
                      type="checkbox" 
                      name="autoAdsEnabled" 
                      checked={formData.autoAdsEnabled}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-800">Auto-Ads (Page-level)</span>
                  </label>
                </div>
              </div>

              {/* Script Textarea */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Raw Google AdSense Script Tag / Code Snippet
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const template = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>`;
                        setFormData(prev => ({ ...prev, googleAdsenseScript: template }));
                        triggerToast("Standard AdSense script template loaded into input.");
                      }}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Insert Example Snippet
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoExtractScript}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Parse &amp; Apply Client ID
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    name="googleAdsenseScript"
                    value={formData.googleAdsenseScript}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder={`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>`}
                    className="w-full font-mono text-xs px-4 py-3 bg-neutral-900 text-amber-300 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-y shadow-inner leading-relaxed"
                  />
                </div>

                {/* Validation badge */}
                {detectedClientId ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Valid Google AdSense Tag Detected:</strong> Publisher ID is <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">{detectedClientId}</code>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      Ready for Live Traffic
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Paste your official AdSense code tag above. It automatically extracts your <code className="font-mono font-bold">ca-pub-XXXXX</code> client ID and injects it into the website&apos;s <code className="font-mono">&lt;head&gt;</code>.
                    </span>
                  </div>
                )}

                {scriptParseNotice && (
                  <p className="text-xs text-blue-600 font-medium">{scriptParseNotice}</p>
                )}
              </div>

              {/* Explicit Publisher Client & Slot Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-neutral-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Publisher Client ID (data-ad-client)
                  </label>
                  <input
                    type="text"
                    name="googleAdClient"
                    value={formData.googleAdClient}
                    onChange={handleFormChange}
                    placeholder="ca-pub-1234567890"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-400">Must start with <code className="font-mono">ca-pub-</code></p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Default Ad Slot ID (data-ad-slot)
                  </label>
                  <input
                    type="text"
                    name="googleAdSlot"
                    value={formData.googleAdSlot}
                    onChange={handleFormChange}
                    placeholder="0987654321"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-400">Default fallback slot for general containers</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Default Ad Format
                  </label>
                  <select
                    name="googleAdFormat"
                    value={formData.googleAdFormat}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="auto">Auto (Responsive)</option>
                    <option value="horizontal">Horizontal (Banner)</option>
                    <option value="rectangle">Rectangle (Sidebar Box)</option>
                    <option value="vertical">Vertical (Tower)</option>
                  </select>
                  <p className="text-[11px] text-neutral-400">Controls layout adaptation</p>
                </div>
              </div>

              {/* Per-Placement Slot Routing & Toggles */}
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Active Ad Placement Zones</h3>
                    <p className="text-xs text-neutral-500">Toggle where advertisements should render across the site and set dedicated slot IDs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Home Page */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.placements.home ? 'bg-amber-50/40 border-amber-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900">Home Page</span>
                      <input 
                        type="checkbox"
                        checked={formData.placements.home}
                        onChange={() => handlePlacementToggle('home')}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">Replaces daily wisdom in right column</p>
                    <input 
                      type="text"
                      value={formData.homeAdSlot}
                      onChange={(e) => setFormData(p => ({ ...p, homeAdSlot: e.target.value }))}
                      placeholder="Slot: 0987654321"
                      className="w-full px-2.5 py-1 text-[11px] font-mono border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>

                  {/* Directory */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.placements.directory ? 'bg-amber-50/40 border-amber-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900">Community Directory</span>
                      <input 
                        type="checkbox"
                        checked={formData.placements.directory}
                        onChange={() => handlePlacementToggle('directory')}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">Directory right sidebar</p>
                    <input 
                      type="text"
                      value={formData.directoryAdSlot}
                      onChange={(e) => setFormData(p => ({ ...p, directoryAdSlot: e.target.value }))}
                      placeholder="Slot: 1122334455"
                      className="w-full px-2.5 py-1 text-[11px] font-mono border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>

                  {/* Classifieds & Auctions */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.placements.classifieds ? 'bg-amber-50/40 border-amber-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900">Classifieds &amp; Auctions</span>
                      <input 
                        type="checkbox"
                        checked={formData.placements.classifieds}
                        onChange={() => handlePlacementToggle('classifieds')}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">Marketplace sidebar &amp; search</p>
                    <input 
                      type="text"
                      value={formData.classifiedsAdSlot}
                      onChange={(e) => setFormData(p => ({ ...p, classifiedsAdSlot: e.target.value }))}
                      placeholder="Slot: 5566778899"
                      className="w-full px-2.5 py-1 text-[11px] font-mono border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>

                  {/* Top Header Banner */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    formData.placements.headerBanner ? 'bg-amber-50/40 border-amber-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900">Header Leaderboard</span>
                      <input 
                        type="checkbox"
                        checked={formData.placements.headerBanner}
                        onChange={() => handlePlacementToggle('headerBanner')}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">Top site-wide 728x90 leaderboard</p>
                    <input 
                      type="text"
                      value={formData.eventsAdSlot}
                      onChange={(e) => setFormData(p => ({ ...p, eventsAdSlot: e.target.value }))}
                      placeholder="Slot: 9988776655"
                      className="w-full px-2.5 py-1 text-[11px] font-mono border border-neutral-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Head Tag / Site Verification Meta */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Custom &lt;head&gt; Verification Meta &amp; Analytics Script</h3>
                    <p className="text-xs text-neutral-500">Inject AdSense site ownership verification meta tags or Google Tag Manager into document head</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tag = `<meta name="google-adsense-account" content="${formData.googleAdClient || 'ca-pub-1234567890'}">`;
                      setFormData(p => ({ ...p, customHeadScript: tag }));
                      triggerToast("AdSense verification meta tag injected.");
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    Insert Verification Meta Tag
                  </button>
                </div>
                <textarea
                  name="customHeadScript"
                  value={formData.customHeadScript}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder={`<meta name="google-adsense-account" content="ca-pub-1234567890">`}
                  className="w-full font-mono text-xs px-3 py-2 bg-neutral-900 text-neutral-200 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Custom Ad Fallback Creative Manager */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Custom Sponsored Ad &amp; Fallback Display</h2>
                  <p className="text-xs text-neutral-500">Displayed when an ad blocker is present or before live ads load</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isCustomAdActive" 
                    checked={formData.isCustomAdActive}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-neutral-800">Show Custom Fallback Ad</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Headline Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    placeholder="Ad Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Button CTA Label</label>
                  <input
                    type="text"
                    name="linkText"
                    value={formData.linkText}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Learn More"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-neutral-700">Ad Copy / Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-neutral-700">Destination Link URL</label>
                  <input
                    type="text"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Simulator */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-neutral-900">Live AdSense Unit Simulator</h3>
                </div>
                <span className="text-xs text-neutral-500 font-mono">Real-time Container Preview</span>
              </div>
              <p className="text-xs text-neutral-500">
                This is the actual component rendered in the Home Page and Directory sidebar using your current publisher ID ({formData.googleAdClient}) and slot ({formData.googleAdSlot}):
              </p>
              <div className="max-w-md mx-auto">
                <GoogleAdSense 
                  client={formData.googleAdClient}
                  slot={formData.googleAdSlot}
                  format={formData.googleAdFormat}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SECTIONS & FEATURE VISIBILITY CONTROL ================= */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            
            {/* Control Header & Overview */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Platform Sections &amp; Feature Visibility</h2>
                    <p className="text-xs text-neutral-500">Enable or disable any platform directory, sub-feature, or route instantly.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      enableAllSections();
                      triggerToast("All 13 platform sections enabled.");
                    }}
                    className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Enable All Sections</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      disableNonCoreSections();
                      triggerToast("Switched to Maintenance Mode: Non-core sections disabled.");
                    }}
                    className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Disable Non-Core (Maintenance)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetSectionsToDefault();
                      triggerToast("Reset sections to default configuration.");
                    }}
                    className="px-3 py-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Status Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase">Live Sections</div>
                    <div className="text-xl font-extrabold text-emerald-700">
                      {enabledCount} / {SECTION_METADATA_LIST.length}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase">Disabled / Hidden</div>
                    <div className="text-xl font-extrabold text-amber-700">
                      {disabledCount}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    {disabledCount}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-neutral-500 uppercase">Route Guard Protection</div>
                    <div className="text-sm font-extrabold text-neutral-900 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Active (Graceful Notice)
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Protected
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder="Search section by name, path or keyword..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  {sectionSearch && (
                    <button
                      type="button"
                      onClick={() => setSectionSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-xs text-neutral-400 font-bold mr-1">Filter:</span>
                  {[
                    { id: 'all', label: 'All (13)' },
                    { id: 'primary', label: 'Primary Nav (9)' },
                    { id: 'subfeature', label: 'Sub-Features (4)' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSectionCategoryFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sectionCategoryFilter === filter.id
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTION_METADATA_LIST
                  .filter((sec) => {
                    if (sectionCategoryFilter === 'primary') return !sec.isSubFeature;
                    if (sectionCategoryFilter === 'subfeature') return Boolean(sec.isSubFeature);
                    return true;
                  })
                  .filter((sec) => {
                    if (!sectionSearch.trim()) return true;
                    const q = sectionSearch.toLowerCase();
                    return (
                      sec.name.toLowerCase().includes(q) ||
                      sec.description.toLowerCase().includes(q) ||
                      sec.path.toLowerCase().includes(q) ||
                      sec.key.toLowerCase().includes(q)
                    );
                  })
                  .map((sec) => {
                    const isEnabled = isSectionEnabled(sec.key);
                    return (
                      <div
                        key={sec.key}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                          isEnabled
                            ? 'bg-white border-neutral-200 shadow-xs hover:border-amber-300'
                            : 'bg-neutral-50/80 border-neutral-200/60 opacity-80'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                isEnabled ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-500'
                              }`}>
                                <LayoutGrid className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-neutral-900 leading-snug">{sec.name}</h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                                  <span>{sec.path}</span>
                                </div>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-600' : 'bg-neutral-400'}`}></span>
                              {isEnabled ? 'Live' : 'Disabled'}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                            {sec.description}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-600">
                              {sec.category}
                            </span>
                            {isEnabled && sec.path !== '#' && (
                              <a
                                href={sec.path}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-700 hover:text-amber-800 flex items-center gap-1 font-semibold"
                              >
                                Preview <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Toggle Action Button */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-neutral-500">
                            Visibility:
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              toggleSection(sec.key);
                              const newState = !isEnabled;
                              triggerToast(
                                newState 
                                  ? `"${sec.name}" is now Enabled and visible to users.` 
                                  : `"${sec.name}" is now Disabled and hidden from navigation.`
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              isEnabled
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Enabled</span>
                              </>
                            ) : (
                              <>
                                <Power className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Disabled</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Maintenance Notice Configuration */}
              <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-neutral-900">Custom Maintenance Message for Disabled Sections</h3>
                </div>
                <p className="text-xs text-neutral-500">
                  When a user directly visits a disabled section's URL (e.g. bookmarks or browser history), this notice will be displayed to guide them smoothly back to available areas.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={sectionNoticeDraft}
                    onChange={(e) => setSectionNoticeDraft(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter custom maintenance message..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDisabledNotice(sectionNoticeDraft);
                      triggerToast("Custom disabled section notice saved!");
                    }}
                    className="self-end sm:self-stretch px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notice</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 3: USER ACCOUNTS, ADD/REMOVE & BAN MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* User Overview & Management Bar */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Community User Accounts, Add/Remove &amp; Bans</h2>
                    <p className="text-xs text-neutral-500">Create new user profiles, permanently remove fraudulent accounts, and enforce bans with reason logs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsersList(getManagedUsers());
                      triggerToast("User roster refreshed.");
                    }}
                    className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition-colors cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New User</span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Total Members</span>
                  <span className="text-xl font-extrabold text-neutral-900">{totalCount}</span>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Active Accounts</span>
                  <span className="text-xl font-extrabold text-emerald-700">{activeCount}</span>
                </div>
                <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Suspended / Banned</span>
                  <span className="text-xl font-extrabold text-rose-700">{bannedCount}</span>
                </div>
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Phone Verified</span>
                  <span className="text-xl font-extrabold text-blue-700">{verifiedPhoneCount}</span>
                </div>
                <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Verified Sellers</span>
                  <span className="text-xl font-extrabold text-amber-800">{sellersCount}</span>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Users', count: totalCount },
                    { id: 'active', label: 'Active', count: activeCount },
                    { id: 'banned', label: 'Banned', count: bannedCount },
                    { id: 'sellers', label: 'Verified Sellers', count: sellersCount },
                    { id: 'staff', label: 'Admins & Staff', count: usersList.filter(u => u.role === 'Super Admin' || u.role === 'Moderator').length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setUserFilterTab(tab.id as typeof userFilterTab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        userFilterTab === tab.id
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                  {userSearch && (
                    <button 
                      type="button" 
                      onClick={() => setUserSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* User Roster Table */}
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/80 border-b border-neutral-200">
                    <tr className="text-neutral-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Member Profile</th>
                      <th className="py-3 px-3">Contact &amp; Verification</th>
                      <th className="py-3 px-3">Role &amp; Privileges</th>
                      <th className="py-3 px-3">Account Status</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                          <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                          <p className="font-semibold text-xs">No matching user accounts found</p>
                          <p className="text-[11px] text-neutral-400">Try adjusting your search criteria or filter tabs</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isPrimaryAdmin = u.email.toLowerCase().includes("damika1316@gmail.com");
                        return (
                          <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                            
                            {/* Member info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-neutral-900 flex items-center gap-1.5 truncate">
                                    <span>{u.name}</span>
                                    {isPrimaryAdmin && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                                        You (Owner)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                    <span>Joined {u.joinedDate}</span>
                                    {u.location && (
                                      <span className="flex items-center gap-0.5 text-neutral-500 truncate max-w-[140px]">
                                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                                        {u.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact & Verification */}
                            <td className="py-3 px-3">
                              <div className="text-neutral-800 font-medium">{u.email}</div>
                              <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{u.phone}</span>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePhoneVerification(u.id)}
                                  title={u.isPhoneVerified ? "Phone is verified (Click to toggle)" : "Phone unverified (Click to verify)"}
                                  className={`cursor-pointer inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    u.isPhoneVerified 
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                                  }`}
                                >
                                  {u.isPhoneVerified ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 text-emerald-700" />
                                      Verified
                                    </>
                                  ) : (
                                    "Unverified"
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Role selector */}
                            <td className="py-3 px-3">
                              <select
                                value={u.role}
                                disabled={isPrimaryAdmin}
                                onChange={(e) => handleChangeUserRole(u.id, e.target.value as ManagedUser['role'])}
                                className={`px-2 py-1 bg-white border rounded-lg font-bold text-xs ${
                                  isPrimaryAdmin 
                                    ? 'border-amber-300 text-amber-800 bg-amber-50 cursor-not-allowed' 
                                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 cursor-pointer'
                                }`}
                              >
                                <option value="Super Admin">Super Admin</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Verified Seller">Verified Seller</option>
                                <option value="Member">Member</option>
                              </select>
                            </td>

                            {/* Status & Ban details */}
                            <td className="py-3 px-3">
                              {u.isBanned ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                    <Ban className="w-3 h-3 text-rose-600" />
                                    Banned ({u.bannedDuration || 'Indefinite'})
                                  </span>
                                  {u.banReason && (
                                    <p className="text-[10px] text-rose-700 line-clamp-1 italic max-w-xs" title={u.banReason}>
                                      &quot;{u.banReason}&quot;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Active &amp; Good Standing
                                </span>
                              )}
                            </td>

                            {/* Actions (Ban/Unban, Delete, View) */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* View User Drawer */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserDetails(u)}
                                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                  title="View User Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Ban or Reinstate */}
                                {u.isBanned ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnbanUser(u)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Unban / Reinstate Account"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Unban</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isPrimaryAdmin}
                                    onClick={() => handleOpenBanModal(u)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                                      isPrimaryAdmin 
                                        ? 'opacity-30 cursor-not-allowed bg-neutral-100 text-neutral-400' 
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                                    }`}
                                    title="Ban user from auctions, posting, and login"
                                  >
                                    <Ban className="w-3 h-3" />
                                    <span>Ban</span>
                                  </button>
                                )}

                                {/* Delete User */}
                                <button
                                  type="button"
                                  disabled={isPrimaryAdmin}
                                  onClick={() => {
                                    setUserToDelete(u);
                                    setShowDeleteModal(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isPrimaryAdmin
                                      ? 'opacity-30 cursor-not-allowed text-neutral-300'
                                      : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                  }`}
                                  title={isPrimaryAdmin ? "Cannot delete primary administrator" : "Permanently remove user"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MARKETPLACE & TIMED AUCTIONS ================= */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Auction Engine &amp; Anti-Sniping Rules</h2>
                <p className="text-xs text-neutral-500">Configure reserve rules, soft closing timers, and mutual 48-hour contact enforcement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <label className="font-bold text-neutral-900 block text-sm">
                  Anti-Sniping Soft-Close Extension (Seconds)
                </label>
                <p className="text-neutral-500 text-xs">
                  If a bid is placed within the final 2 minutes, the auction automatically extends by this duration to give others fair time to respond.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="number" 
                    value={formData.auctionSettings.antiSnipingSeconds}
                    onChange={(e) => handleAuctionSettingChange('antiSnipingSeconds', parseInt(e.target.value) || 120)}
                    className="w-32 px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-900"
                    min={30}
                    max={600}
                  />
                  <span className="font-semibold text-neutral-600">seconds (Default: 120s / 2 mins)</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <label className="font-bold text-neutral-900 block text-sm">
                  Direct Settlement Mutual Contact Window
                </label>
                <p className="text-neutral-500 text-xs">
                  Hours allotted for winning bidder and seller to contact each other directly to agree on collection, shipping, or payment.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="number" 
                    value={formData.auctionSettings.settlementContactHours}
                    onChange={(e) => handleAuctionSettingChange('settlementContactHours', parseInt(e.target.value) || 48)}
                    className="w-32 px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-900"
                    min={12}
                    max={168}
                  />
                  <span className="font-semibold text-neutral-600">hours (Default: 48 hours)</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <label className="font-bold text-neutral-900 block text-sm">
                  Default Minimum Bid Increment ($)
                </label>
                <input 
                  type="number" 
                  value={formData.auctionSettings.defaultMinIncrement}
                  onChange={(e) => handleAuctionSettingChange('defaultMinIncrement', parseInt(e.target.value) || 5)}
                  className="w-32 px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-900"
                  min={1}
                />
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-neutral-900 block text-sm">
                    Mutual Contact Phone Privacy
                  </label>
                  <p className="text-neutral-500 text-xs mt-1">
                    Enforces that buyer&apos;s phone number is securely disclosed ONLY to the seller of the won auction, and seller&apos;s phone is disclosed ONLY to the winning bidder.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enforced by Auction Storage &amp; Detail Modal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: MODERATION & REPORTS ================= */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Member Platform Reports ({reports.length})</h2>
                    <p className="text-xs text-neutral-500">Investigate user reports, non-responsive buyers/sellers, and suspicious bidding</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReports(getPlatformReports());
                    setAuditLogs(getAuditLogs());
                    triggerToast("Reports queue refreshed.");
                  }}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Queue
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-800">No active reports</p>
                  <p className="text-xs text-neutral-500">The platform community is clean and in compliance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div 
                      key={report.id}
                      className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            report.status === 'pending' ? 'bg-rose-100 text-rose-800' :
                            report.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {report.status}
                          </span>
                          <span className="font-bold text-xs text-neutral-900">{report.reason}</span>
                          <span className="text-[11px] text-neutral-400">• on &quot;{report.targetTitle}&quot;</span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-700 bg-white p-2.5 rounded-lg border border-neutral-100">
                        &quot;{report.details}&quot;
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-neutral-100">
                        <div className="text-neutral-500">
                          Reported by: <span className="font-semibold text-neutral-800">{report.reporterName}</span> ({report.reporterPhone})
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleResolveReport(report.id, "Contacted seller and verified authentic details")}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveReport(report.id, "Suspended listing & warned user")}
                              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                            >
                              Suspend Listing
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissReport(report.id)}
                              className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-300 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}

                        {report.adminActionTaken && (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Action taken: {report.adminActionTaken}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <FileText className="w-5 h-5 text-neutral-600" />
                <h3 className="text-base font-bold text-neutral-900">Platform Audit Logs ({auditLogs.length})</h3>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {auditLogs.slice(0, 15).map((log) => (
                  <div key={log.id} className="text-xs p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800 mr-2">{log.action}</span>
                      <span className="text-neutral-500">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SITE ANNOUNCEMENTS ================= */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Global Site Announcement Banner</h2>
                  <p className="text-xs text-neutral-500">Broadcast important community notices, guidelines, or maintenance alerts at the very top of all pages</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.siteAnnouncement.enabled}
                  onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-800">Show Banner Active</span>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Announcement Message Text</label>
                <textarea
                  value={formData.siteAnnouncement.text}
                  onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Welcome to LankaBuddhist. Direct mutual contact within 48 hours for classified transactions."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Banner Alert Style</label>
                  <select
                    value={formData.siteAnnouncement.type}
                    onChange={(e) => handleAnnouncementChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="info">Info (Dark / Neutral)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="alert">Critical Alert (Red)</option>
                    <option value="success">Success (Emerald)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Action Button Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.siteAnnouncement.linkText || ""}
                    onChange={(e) => handleAnnouncementChange('linkText', e.target.value)}
                    placeholder="e.g. Read Guidelines"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Action Link Target (Optional)</label>
                  <input
                    type="text"
                    value={formData.siteAnnouncement.linkUrl || ""}
                    onChange={(e) => handleAnnouncementChange('linkUrl', e.target.value)}
                    placeholder="e.g. /classifieds or /learn"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Action Footer */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Config changes apply immediately and persist in browser local storage.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Super Admin Settings
            </button>
          </div>
        </div>
      </form>

      {/* ================= MODAL 1: ADD NEW USER ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Add New Community Member</h3>
                  <p className="text-xs text-neutral-500">Create a user record with verified privileges</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Full Name *</label>
                <input 
                  type="text" 
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Chaminda Wijesinghe"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Email Address *</label>
                  <input 
                    type="email" 
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="chaminda@example.com"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Phone Number *</label>
                  <input 
                    type="text" 
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Account Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(p => ({ ...p, role: e.target.value as ManagedUser['role'] }))}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Member">Member (Standard)</option>
                    <option value="Verified Seller">Verified Seller</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Location / Region</label>
                  <input 
                    type="text" 
                    value={newUserForm.location}
                    onChange={(e) => setNewUserForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Melbourne, Australia"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Internal Admin Notes (Optional)</label>
                <textarea 
                  value={newUserForm.notes}
                  onChange={(e) => setNewUserForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Verified by passport inspection at LA Buddhist Vihara"
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newUserForm.isPhoneVerified}
                    onChange={(e) => setNewUserForm(p => ({ ...p, isPhoneVerified: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-neutral-300"
                  />
                  <span className="font-semibold text-neutral-800">Phone Pre-Verified Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: BAN USER ================= */}
      {showBanModal && userToBan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Ban / Suspend Account</h3>
                  <p className="text-xs text-neutral-500">Revoke bidding and marketplace privileges</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowBanModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              <img 
                src={userToBan.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt={userToBan.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-200"
              />
              <div className="text-xs min-w-0">
                <p className="font-bold text-neutral-900 truncate">{userToBan.name}</p>
                <p className="text-neutral-500 truncate">{userToBan.email}</p>
                <p className="text-[11px] text-neutral-400 font-mono">{userToBan.phone}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Violation Category</label>
                <select
                  value={banForm.reasonCategory}
                  onChange={(e) => setBanForm(p => ({ ...p, reasonCategory: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Suspected Shill Bidding / Auction Fraud">Suspected Shill Bidding / Auction Fraud</option>
                  <option value="Non-responsive after winning auction (Violated 48h Mutual Contact Rule)">Non-responsive after winning auction (48h Rule)</option>
                  <option value="Prohibited or Counterfeit Item Listings">Prohibited or Counterfeit Item Listings</option>
                  <option value="Harassment or Abusive Behavior">Harassment or Abusive Behavior</option>
                  <option value="Payment or Shipping Fraud Attempt">Payment or Shipping Fraud Attempt</option>
                  <option value="Commercial Spam / Unsolicited Ads">Commercial Spam / Unsolicited Ads</option>
                  <option value="Custom Policy Violation">Other / Custom Policy Violation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Ban Duration</label>
                <select
                  value={banForm.duration}
                  onChange={(e) => setBanForm(p => ({ ...p, duration: e.target.value as typeof banForm.duration }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Indefinite">Indefinite (Until Administrative Review)</option>
                  <option value="Permanent">Permanent Ban</option>
                  <option value="30 Days">30-Day Temporary Suspension</option>
                  <option value="7 Days">7-Day Cooling Off Suspension</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700">Specific Violation Notes / Explanation</label>
                <textarea 
                  value={banForm.customReason}
                  onChange={(e) => setBanForm(p => ({ ...p, customReason: e.target.value }))}
                  placeholder="Provide context or evidence for the audit log..."
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBanUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Enact Ban</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DELETE USER CONFIRMATION ================= */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base text-neutral-900">Delete User Account?</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to permanently remove <strong className="text-neutral-800">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 font-medium">
                This action is irreversible. All associated listings and bids will remain archived for safety.
              </p>
            </div>

            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: VIEW USER DETAILS ================= */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <img 
                  src={selectedUserDetails.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                  alt={selectedUserDetails.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{selectedUserDetails.name}</h3>
                  <span className="text-xs text-amber-700 font-semibold">{selectedUserDetails.role}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Email</span>
                  <p className="font-semibold text-neutral-900 truncate">{selectedUserDetails.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Phone</span>
                  <p className="font-mono font-semibold text-neutral-900">{selectedUserDetails.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Joined</span>
                  <p className="font-semibold text-neutral-900">{selectedUserDetails.joinedDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Location</span>
                  <p className="font-semibold text-neutral-900 truncate">{selectedUserDetails.location || "N/A"}</p>
                </div>
              </div>

              {/* Status block */}
              <div className={`p-3 rounded-xl border ${
                selectedUserDetails.isBanned ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {selectedUserDetails.isBanned ? <Ban className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>{selectedUserDetails.isBanned ? `Banned (${selectedUserDetails.bannedDuration || 'Indefinite'})` : 'Account Active & Verified'}</span>
                </div>
                {selectedUserDetails.isBanned && selectedUserDetails.banReason && (
                  <p className="text-[11px] text-rose-700 mt-1">
                    <strong>Reason:</strong> {selectedUserDetails.banReason}
                  </p>
                )}
              </div>

              {selectedUserDetails.notes && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Admin Notes</span>
                  <p className="text-neutral-600 italic">{selectedUserDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-neutral-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-neutral-800 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold">{toastMessage || "Settings updated successfully!"}</span>
        </div>
      )}
    </div>
  );
}
