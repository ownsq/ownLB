import React, { useState, useMemo, useEffect } from 'react';
import { 
  DigitalCard, 
  getUserCards, 
  saveDigitalCard, 
  toggleCardActiveStatus, 
  deleteDigitalCard, 
  downloadVCard 
} from '../../utils/digitalBusinessCardStorage';
import { 
  X, Plus, Edit3, Trash2, QrCode, Download, Share2, 
  ExternalLink, Check, Copy, User, Building2, MapPin, 
  Phone, Mail, Globe, Shield, Sparkles, Eye, Power
} from 'lucide-react';

interface DigitalCardsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  onShowToast?: (msg: string) => void;
}

export function DigitalCardsManagerModal({
  isOpen,
  onClose,
  currentUserEmail = "damika1316@gmail.com",
  onShowToast = (msg: string) => console.log(msg)
}: DigitalCardsManagerModalProps) {
  const [cardsVersion, setCardsVersion] = useState(0);
  const [editingCard, setEditingCard] = useState<DigitalCard | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedCardForQr, setSelectedCardForQr] = useState<DigitalCard | null>(null);

  const cards = useMemo(() => {
    void cardsVersion;
    return getUserCards(currentUserEmail);
  }, [currentUserEmail, cardsVersion]);

  // Form state for creating or editing
  const [formData, setFormData] = useState<Partial<DigitalCard>>({
    type: "professional",
    name: "Saminda Fernando",
    title: "Senior Solutions Architect",
    company: "Lanka Global Innovations Inc.",
    bio: "Practicing Theravada Buddhist, bridging global technology with community seva.",
    phone: "+1 (310) 555-0198",
    email: "saminda.fernando@lankaglobal.com",
    whatsapp: "+13105550198",
    website: "https://lankaglobal.com",
    location: "Los Angeles, CA, USA",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300",
    themeColor: "orange",
    socialLinks: {
      linkedin: "https://linkedin.com/in/saminda-fernando",
      twitter: "",
      github: "https://github.com/saminda-f"
    },
    isActive: true
  });

  const handleOpenEdit = (card: DigitalCard) => {
    setEditingCard(card);
    setFormData({ ...card });
    setIsCreatingNew(true);
  };

  const handleOpenCreate = (type: "personal" | "professional") => {
    setEditingCard(null);
    setFormData({
      type,
      name: "Saminda Fernando",
      title: type === "professional" ? "Professional Consultant" : "Community Volunteer",
      company: type === "professional" ? "Global Enterprise" : "Buddhist Community Network",
      bio: "Connecting and serving the Sri Lankan diaspora worldwide.",
      phone: "+1 (310) 555-0198",
      email: currentUserEmail,
      whatsapp: "+13105550198",
      website: "https://lankabuddhist.com",
      location: "Los Angeles, CA, USA",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300",
      themeColor: type === "professional" ? "orange" : "emerald",
      socialLinks: {
        linkedin: "",
        twitter: "",
        instagram: ""
      },
      isActive: true
    });
    setIsCreatingNew(true);
  };

  const handleSaveCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title || !formData.email) {
      onShowToast("Please fill in required fields (Name, Title, Email)");
      return;
    }

    const cardPayload: DigitalCard = {
      id: editingCard ? editingCard.id : `card-${Date.now()}`,
      userId: currentUserEmail,
      type: formData.type || "professional",
      name: formData.name.trim(),
      title: formData.title.trim(),
      company: formData.company?.trim(),
      bio: formData.bio?.trim(),
      phone: formData.phone || "",
      email: formData.email.trim(),
      whatsapp: formData.whatsapp,
      website: formData.website,
      location: formData.location || "Global",
      avatar: formData.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300",
      themeColor: formData.themeColor || "orange",
      socialLinks: formData.socialLinks || {},
      isActive: formData.isActive ?? true,
      createdAt: editingCard ? editingCard.createdAt : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    saveDigitalCard(cardPayload);
    setCardsVersion(v => v + 1);
    setIsCreatingNew(false);
    setEditingCard(null);
    onShowToast(`Digital card "${cardPayload.name} (${cardPayload.type})" saved successfully!`);
  };

  const handleToggleActive = (cardId: string) => {
    const next = toggleCardActiveStatus(cardId);
    setCardsVersion(v => v + 1);
    onShowToast(next ? "Card activated! QR code and link are live." : "Card deactivated. Public access paused.");
  };

  const handleDelete = (cardId: string, name: string) => {
    if (confirm(`Delete card "${name}"? This action cannot be undone.`)) {
      deleteDigitalCard(cardId);
      setCardsVersion(v => v + 1);
      onShowToast("Digital card deleted.");
    }
  };

  const handleCopyLink = (cardId: string) => {
    const url = `${window.location.origin}/card/${cardId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      onShowToast("Shareable card link copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                Personalized Digital Cards
              </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 mt-1">
              Personal & Professional Digital Business Cards
            </h2>
            <p className="text-xs text-neutral-500">
              Generate mobile-ready vCards with permanent QR codes that open without requiring visitors to log in.
            </p>
          </div>

          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {isCreatingNew ? (
            /* Card Creation / Editing Form */
            <form onSubmit={handleSaveCardSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="font-bold text-sm text-neutral-900">
                  {editingCard ? "Edit Digital Card Details" : "Create New Digital Card"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
                >
                  Back to Cards List
                </button>
              </div>

              {/* Type Switcher: Professional vs Personal */}
              <div className="grid grid-cols-2 gap-3 p-2 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "professional" })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    formData.type === "professional"
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Professional Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "personal" })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    formData.type === "personal"
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Personal Community Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Profession / Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Solutions Architect or Dhamma Volunteer"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company || ""}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Lanka Global Innovations Inc."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">General Location</label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Los Angeles, CA, USA"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (310) 555-0198"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ""}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+13105550198"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://lankaglobal.com"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Brief Bio / Introduction</label>
                <textarea
                  rows={3}
                  value={formData.bio || ""}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize your expertise, services, or community engagement..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                />
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.linkedin || ""}
                    onChange={e => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.twitter || ""}
                    onChange={e => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/username"
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">GitHub / Instagram</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.github || formData.socialLinks?.instagram || ""}
                    onChange={e => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  Save Digital Card
                </button>
              </div>
            </form>
          ) : (
            /* Cards Showcase Grid */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Your Active Digital Cards</h3>
                  <p className="text-xs text-neutral-500">
                    Update card information anytime without invalidating your printed or shared QR code
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenCreate("professional")}
                    className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Professional Card</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreate("personal")}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Personal Card</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(card => {
                  const isProf = card.type === "professional";

                  return (
                    <div 
                      key={card.id}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        card.isActive 
                          ? 'bg-white border-neutral-200 shadow-sm hover:border-orange-300' 
                          : 'bg-neutral-50 border-neutral-200 opacity-60'
                      }`}
                    >
                      {/* Top Banner */}
                      <div className={`p-4 text-white relative ${
                        isProf 
                          ? 'bg-gradient-to-r from-orange-600 to-amber-700' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded backdrop-blur-xs">
                            {card.type} Card
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            card.isActive ? 'bg-emerald-400 text-emerald-950' : 'bg-neutral-800 text-white'
                          }`}>
                            {card.isActive ? "Active" : "Deactivated"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <img
                            src={card.avatar}
                            alt={card.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white/60 shadow-xs bg-white"
                          />
                          <div>
                            <h4 className="font-bold text-base text-white leading-tight">{card.name}</h4>
                            <p className="text-xs text-white/90 font-medium">{card.title}</p>
                            {card.company && (
                              <p className="text-[11px] text-white/70">{card.company}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-2 text-xs flex-1">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{card.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{card.email}</span>
                        </div>
                        {card.phone && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{card.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedCardForQr(card)}
                            className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg"
                            title="View QR Code"
                          >
                            <QrCode className="w-4 h-4 text-orange-600" />
                          </button>

                          <button
                            onClick={() => handleCopyLink(card.id)}
                            className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg"
                            title="Copy Share Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => downloadVCard(card)}
                            className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg"
                            title="Download .vcf Contact File"
                          >
                            <Download className="w-4 h-4 text-neutral-600" />
                          </button>

                          <a
                            href={`/card/${card.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg"
                            title="Open Public Card Link"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleActive(card.id)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                              card.isActive
                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {card.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="p-1.5 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Edit Card"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(card.id, card.name)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </div>

      {/* QR Code Presentation Modal */}
      {selectedCardForQr && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <h4 className="font-bold text-base text-neutral-900">
              {selectedCardForQr.name} ({selectedCardForQr.type})
            </h4>
            <p className="text-xs text-neutral-500">
              Scan with any mobile camera to view your public card and save contact details immediately.
            </p>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block shadow-inner">
              <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-xs border border-neutral-200 flex flex-col items-center justify-center mx-auto">
                <QrCode className="w-40 h-40 text-neutral-900" />
              </div>
              <p className="text-[10px] text-neutral-500 font-mono mt-2 truncate max-w-[200px] mx-auto">
                {window.location.origin}/card/{selectedCardForQr.id}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyLink(selectedCardForQr.id)}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-2xs"
              >
                Copy Link
              </button>
              <button
                onClick={() => downloadVCard(selectedCardForQr)}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold"
              >
                Save .vcf
              </button>
              <button
                onClick={() => setSelectedCardForQr(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
