import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getDigitalCardById, 
  downloadVCard, 
  getAllDigitalCards 
} from '../utils/digitalBusinessCardStorage';
import { 
  Phone, Mail, Globe, MapPin, Download, Share2, 
  Check, ExternalLink, QrCode, User, Building2, 
  AlertCircle, ShieldCheck, Sparkles, MessageCircle
} from 'lucide-react';

export function PublicDigitalCardView() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Retrieve card or fallback to first card for preview
  const card = useMemo(() => {
    if (id) {
      return getDigitalCardById(id);
    }
    const all = getAllDigitalCards();
    return all[0];
  }, [id]);

  if (!card) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-xl border border-neutral-200 space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Card Not Found</h2>
          <p className="text-xs text-neutral-500">
            This digital business card is either inactive, removed, or the link has changed.
          </p>
          <Link
            to="/directory"
            className="inline-block px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-2xs"
          >
            Explore Community Directory
          </Link>
        </div>
      </div>
    );
  }

  // Deactivated state
  if (!card.isActive) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-xl border border-neutral-200 space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Card Temporarily Inactive</h2>
          <p className="text-xs text-neutral-500">
            {card.name} has temporarily deactivated this digital card. Please reach out via community direct messaging.
          </p>
          <Link
            to="/directory"
            className="inline-block px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            Visit Community Directory
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isProfessional = card.type === "professional";

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 flex flex-col items-center justify-center">
      {/* Mobile-First Card Container */}
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden relative">
        
        {/* Card Header Banner */}
        <div className={`h-36 relative ${
          isProfessional 
            ? 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800' 
            : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800'
        }`}>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs rounded-full transition-colors"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs rounded-full transition-colors"
              title="Share Card Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/20">
              {isProfessional ? "Professional Card" : "Personal Community Card"}
            </span>
          </div>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative">
              <img
                src={card.avatar}
                alt={card.name}
                className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Verified Member" />
            </div>

            <button
              onClick={() => downloadVCard(card)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Save to Contacts</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-neutral-900">{card.name}</h1>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>

            <p className="text-xs font-semibold text-neutral-700 mt-0.5">
              {card.title}
            </p>

            {card.company && (
              <p className="text-xs text-orange-700 font-bold flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{card.company}</span>
              </p>
            )}

            <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>{card.location}</span>
            </p>

            {card.bio && (
              <p className="text-xs text-neutral-600 mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 leading-relaxed">
                {card.bio}
              </p>
            )}
          </div>

          {/* Quick Contact Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {card.phone && (
              <a
                href={`tel:${card.phone.replace(/[^0-9+]/g, '')}`}
                className="p-3 bg-neutral-50 hover:bg-orange-50 hover:text-orange-700 rounded-xl border border-neutral-200 text-center flex flex-col items-center gap-1.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700 group-hover:text-orange-600">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 group-hover:text-orange-700">Call</span>
              </a>
            )}

            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="p-3 bg-neutral-50 hover:bg-orange-50 hover:text-orange-700 rounded-xl border border-neutral-200 text-center flex flex-col items-center gap-1.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700 group-hover:text-orange-600">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 group-hover:text-orange-700">Email</span>
              </a>
            )}

            {card.whatsapp ? (
              <a
                href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-neutral-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl border border-neutral-200 text-center flex flex-col items-center gap-1.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-emerald-600">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 group-hover:text-emerald-700">WhatsApp</span>
              </a>
            ) : card.website ? (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-neutral-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl border border-neutral-200 text-center flex flex-col items-center gap-1.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-800 group-hover:text-blue-700">Website</span>
              </a>
            ) : null}
          </div>

          {/* Social Links List */}
          {card.socialLinks && Object.values(card.socialLinks).some(Boolean) && (
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Connect Online
              </h4>
              <div className="flex flex-wrap gap-2">
                {card.socialLinks.linkedin && (
                  <a
                    href={card.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-blue-50 text-blue-700 border border-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
                {card.socialLinks.twitter && (
                  <a
                    href={card.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-sky-50 text-sky-600 border border-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>X / Twitter</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
                {card.socialLinks.github && (
                  <a
                    href={card.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
                {card.socialLinks.instagram && (
                  <a
                    href={card.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-rose-50 text-rose-600 border border-neutral-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Lanka Buddhist Community Profile Link */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <Link
              to="/directory"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center justify-center gap-1"
            >
              <span>View full profile on LankaBuddhist.com →</span>
            </Link>
            <p className="text-[10px] text-neutral-400 mt-1">
              Verified Member • Sri Lankan Global Diaspora Network
            </p>
          </div>

        </div>
      </div>

      {/* QR Code Modal for Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-neutral-900">Scan to Save Digital Card</h3>
            <p className="text-xs text-neutral-500">
              Point any mobile camera at this QR code to view {card.name}'s card and download contact details instantly.
            </p>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block shadow-inner">
              <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-xs border border-neutral-200 flex flex-col items-center justify-center mx-auto">
                <QrCode className="w-40 h-40 text-neutral-900" />
              </div>
              <p className="text-[10px] text-neutral-500 font-mono mt-2">
                Card ID: {card.id}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadVCard(card)}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .VCF File</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicDigitalCardView;
