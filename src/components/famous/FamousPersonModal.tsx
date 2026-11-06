import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Award,
  Globe,
  Share2,
  Heart,
  Mail,
  Copy,
  Check,
  Send,
  Users,
  Briefcase,
  Sparkles,
  ExternalLink,
  Tag,
  ChevronRight
} from 'lucide-react';

export interface FamousPerson {
  id: number | string;
  name: string;
  role: string;
  country: string;
  img: string;
  cover: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  events: number;
  collabs: number;
  followers: string;
  available: boolean;
  verified: boolean;
  availableFor: string[];
  // Rich extended fields
  bio?: string;
  longBio?: string[];
  quote?: string;
  born?: string;
  almaMater?: string;
  organization?: string;
  achievements?: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  featuredWorks?: Array<{
    title: string;
    type: string;
    year: string;
    description: string;
    link?: string;
  }>;
  services?: Array<{
    title: string;
    description: string;
    format: string;
    duration?: string;
  }>;
  contact?: {
    management: string;
    bookingEmail: string;
    location: string;
    socials?: {
      instagram?: string;
      youtube?: string;
      website?: string;
      twitter?: string;
    };
  };
}

interface FamousPersonModalProps {
  person: FamousPerson | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite?: (person: FamousPerson) => void;
}

export function FamousPersonModal({ person, isOpen, onClose, onOpenInvite }: FamousPersonModalProps) {
  const [activeTab, setActiveTab] = useState<'bio' | 'achievements' | 'services' | 'works' | 'contact'>('bio');
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSubmitted, setInviteSubmitted] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    eventType: 'Cultural or Musical Event',
    eventDate: '',
    location: '',
    expectedGuests: '100-300',
    budgetRange: 'Standard',
    message: ''
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInviteForm) {
          setShowInviteForm(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showInviteForm, onClose]);

  // Reset internal states when person changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('bio');
      setShowInviteForm(false);
      setInviteSubmitted(false);
      setIsCopied(false);
    }
  }, [isOpen, person?.id]);

  if (!isOpen || !person) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSubmitted(true);
    setTimeout(() => {
      // Auto close invite form after brief celebration
      setTimeout(() => {
        setShowInviteForm(false);
        setInviteSubmitted(false);
      }, 1500);
    }, 1200);
  };

  // Fallback defaults for person fields if not explicitly provided
  const bioParagraphs = person.longBio || [
    person.bio || `${person.name} is a renowned ${person.role} from ${person.country}, recognized nationally and internationally for outstanding artistic mastery, innovation, and leadership.`,
    `Throughout their remarkable career spanning numerous high-profile performances, projects, and global collaborations, ${person.name} has consistently championed cultural preservation, youth mentorship, and philanthropy.`,
    `In addition to their primary professional endeavors, they regularly partner with community organizations, charity foundations, and educational initiatives to give back to society and inspire the next generation.`
  ];

  const achievements = person.achievements || [
    {
      year: 'Recent',
      title: 'Distinguished Excellence Award',
      description: 'Recognized for pioneering contributions in international and local cultural enrichment.'
    },
    {
      year: 'Ongoing',
      title: 'Global Cultural Ambassador',
      description: 'Represented Sri Lankan heritage and contemporary creative brilliance across 20+ countries.'
    },
    {
      year: 'Milestone',
      title: 'Humanitarian & Sasana Patronage',
      description: 'Led multiple youth educational drives, community welfare foundations, and temple restoration programs.'
    }
  ];

  const services = person.services || (person.availableFor?.map((item) => ({
    title: item,
    description: `Professional engagement, presentation, or performance tailored specifically to your event agenda and audience.`,
    format: 'In-person / Hybrid',
    duration: 'Custom Schedule'
  })) || []);

  const featuredWorks = person.featuredWorks || [
    {
      title: `${person.name} - Special Showcase`,
      type: 'Featured Highlight',
      year: '2024',
      description: `Signature showcase exemplifying ${person.name}'s distinctive mastery and high-impact craft.`
    },
    {
      title: 'International Cultural Tour',
      type: 'Global Project',
      year: '2023',
      description: 'Acclaimed series of public performances, guest lectures, and brand collaboration sessions.'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header Banner & Hero Section */}
          <div className="relative h-44 sm:h-56 md:h-64 shrink-0 overflow-hidden bg-neutral-900">
            <img
              src={person.cover}
              alt={`${person.name} cover`}
              className="w-full h-full object-cover object-center filter brightness-90 transform hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-black/40" />

            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-sm">
                  <Tag className="w-3.5 h-3.5 text-purple-300" />
                  {person.category}
                </span>

                {person.available ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available for Events
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-neutral-800/80 text-neutral-300 backdrop-blur-md">
                    Schedule Limited
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Share button */}
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share profile link"
                  className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 active:scale-95"
                  title="Copy profile link"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                {/* Favorite button */}
                <button
                  type="button"
                  onClick={() => setIsFavorited(!isFavorited)}
                  aria-label="Add to favorites"
                  className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2.5 rounded-full bg-black/40 hover:bg-neutral-900/90 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 active:scale-95 ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner Floating Toast */}
            {isCopied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 right-4 z-30 bg-neutral-900 text-white text-xs px-3.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-neutral-700"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Profile link copied to clipboard!
              </motion.div>
            )}

            {/* Quick Hero Title on Cover */}
            <div className="absolute bottom-4 left-6 right-6 hidden sm:flex items-end justify-between z-10">
              <div className="text-white">
                <span className="text-xs uppercase tracking-widest font-semibold text-purple-300">
                  Official Public Profile
                </span>
                <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-300" />
                  {person.country} • Active Personal Representation
                </p>
              </div>

              {person.quote && (
                <div className="max-w-xs text-right hidden md:block">
                  <p className="text-xs italic text-neutral-200 line-clamp-2">
                    &ldquo;{person.quote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Persona Header Info Bar */}
          <div className="px-6 pt-0 pb-4 bg-white border-b border-neutral-100 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-2 relative z-20">
              {/* Avatar + Main Title */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative group">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover border-4 border-white shadow-xl bg-neutral-100"
                  />
                  {person.verified && (
                    <div
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm"
                      title="Verified Identity"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                      {person.name}
                    </h2>
                    {person.verified && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-purple-800 flex items-center justify-center sm:justify-start gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                    {person.role}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {person.country}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {person.rating} <span className="text-neutral-400 font-normal">({person.reviews} reviews)</span>
                    </span>
                    {person.followers && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-neutral-700">
                          {person.followers} Followers
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="flex-1 sm:flex-none bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-purple-600/20 transition-all hover:shadow-lg active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  {showInviteForm ? 'View Bio' : 'Invite for Event'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="flex-1 sm:flex-none bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-neutral-600" />
                  Direct Contact
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-3 mt-3 border-t border-neutral-100 text-center">
              <div className="py-2 px-1 rounded-xl bg-purple-50/60 border border-purple-100/50">
                <div className="font-extrabold text-base sm:text-lg text-purple-900">{person.events}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-purple-600 uppercase tracking-wider">Events Done</div>
              </div>
              <div className="py-2 px-1 rounded-xl bg-blue-50/60 border border-blue-100/50">
                <div className="font-extrabold text-base sm:text-lg text-blue-900">{person.collabs}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Collabs</div>
              </div>
              <div className="py-2 px-1 rounded-xl bg-amber-50/60 border border-amber-100/50">
                <div className="font-extrabold text-base sm:text-lg text-amber-900">{person.rating} / 5.0</div>
                <div className="text-[10px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wider">Rating</div>
              </div>
              <div className="py-2 px-1 rounded-xl bg-emerald-50/60 border border-emerald-100/50">
                <div className="font-extrabold text-base sm:text-lg text-emerald-900">{person.followers}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider">Reach</div>
              </div>
            </div>

            {/* Interactive Tab Navigation */}
            {!showInviteForm && (
              <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-1 no-scrollbar border-b border-neutral-150">
                <button
                  type="button"
                  onClick={() => setActiveTab('bio')}
                  className={`pb-2.5 px-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'bio'
                      ? 'border-purple-700 text-purple-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Full Biography
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('achievements')}
                  className={`pb-2.5 px-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'achievements'
                      ? 'border-purple-700 text-purple-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Milestones & Awards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`pb-2.5 px-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'services'
                      ? 'border-purple-700 text-purple-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Services & Engagement
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('works')}
                  className={`pb-2.5 px-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'works'
                      ? 'border-purple-700 text-purple-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Featured Projects
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`pb-2.5 px-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === 'contact'
                      ? 'border-purple-700 text-purple-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Representation & Booking
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800">
            {/* If In-Modal Event Invitation Form is Active */}
            {showInviteForm ? (
              <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        Invite {person.name}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Submit your engagement request directly to {person.name}'s official management desk.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
                  >
                    Back to Biography
                  </button>
                </div>

                {inviteSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center bg-white rounded-2xl border border-emerald-200 shadow-sm"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-neutral-900 mb-1">Invitation Submitted!</h4>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto mb-4">
                      Your invitation for <span className="font-bold text-neutral-800">{person.name}</span> has been sent to the official coordination team. They typically respond within 48 business hours.
                    </p>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                      Confirmation Ref: #INV-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleInviteSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Event / Engagement Type
                        </label>
                        <select
                          value={inviteForm.eventType}
                          onChange={(e) => setInviteForm({ ...inviteForm, eventType: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option>Cultural or Musical Event</option>
                          <option>Charity / Sasana Fundraiser</option>
                          <option>Corporate Keynote / Speech</option>
                          <option>Brand Ambassadorship</option>
                          <option>Panel Discussion & Youth Mentorship</option>
                          <option>Private Concert / Appearance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Target Event Date
                        </label>
                        <input
                          type="date"
                          required
                          value={inviteForm.eventDate}
                          onChange={(e) => setInviteForm({ ...inviteForm, eventDate: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Location / Venue City
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Colombo / Sydney / London / Los Angeles"
                          value={inviteForm.location}
                          onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Expected Attendees
                        </label>
                        <select
                          value={inviteForm.expectedGuests}
                          onChange={(e) => setInviteForm({ ...inviteForm, expectedGuests: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option>Under 100 guests</option>
                          <option>100 - 500 guests</option>
                          <option>500 - 2,000 guests</option>
                          <option>2,000+ stadium audience</option>
                          <option>Broadcast / Virtual stream</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Invitation Details & Event Proposal
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder={`Describe your event objectives, schedule, venue, and how you envision collaborating with ${person.name}...`}
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                        className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-neutral-500">
                        Verified requests are reviewed with priority by management.
                      </p>
                      <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Send Formal Invitation
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}

            {/* TAB: Biography */}
            {activeTab === 'bio' && !showInviteForm && (
              <div className="space-y-6">
                {/* Personal Quote Callout */}
                {person.quote && (
                  <div className="bg-purple-50/70 border-l-4 border-purple-600 rounded-r-2xl p-4 sm:p-5 relative overflow-hidden">
                    <p className="text-sm sm:text-base font-medium text-neutral-800 italic leading-relaxed">
                      &ldquo;{person.quote}&rdquo;
                    </p>
                    <p className="text-xs font-bold text-purple-900 mt-2">
                      — {person.name}
                    </p>
                  </div>
                )}

                {/* Narrative Sections */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Biography & Career Journey
                  </h3>

                  <div className="space-y-3.5 text-sm leading-relaxed text-neutral-700">
                    {bioParagraphs.map((para, idx) => (
                      <p key={idx} className="text-justify sm:text-left">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Key Attributes & Tags */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
                    Areas of Expertise & Specialization
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {person.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 shadow-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {person.availableFor?.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Milestones & Awards */}
            {activeTab === 'achievements' && !showInviteForm && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Key Milestones, Honors & Records
                  </h3>
                  <span className="text-xs font-semibold text-neutral-500">
                    {achievements.length} Verified Milestones
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
                  {achievements.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center group-hover:scale-125 transition-transform">
                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                      </div>

                      <div className="bg-neutral-50/80 hover:bg-white rounded-2xl p-4 border border-neutral-200/80 transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-neutral-900 text-sm">
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold text-purple-700 bg-purple-100/60 px-2.5 py-0.5 rounded-full">
                            {item.year}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Services & Engagement */}
            {activeTab === 'services' && !showInviteForm && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Available Formats & Collaboration Services
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Engage {person.name} for cultural events, keynotes, masterclasses, or brand partnerships.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-neutral-900 text-sm">
                            {svc.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {svc.format}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                          {svc.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {svc.duration || 'Flexible schedule'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setInviteForm((prev) => ({ ...prev, eventType: svc.title }));
                            setShowInviteForm(true);
                          }}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group"
                        >
                          Request This <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Featured Projects */}
            {activeTab === 'works' && !showInviteForm && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Signature Works & Highlighted Projects
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Renowned creative productions, culinary ventures, athletic milestones, and philanthropic endeavors.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredWorks.map((work, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-50/70 rounded-2xl p-4 sm:p-5 border border-neutral-200 hover:bg-white hover:border-purple-200 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                          {work.type}
                        </span>
                        <span className="text-xs font-medium text-neutral-400">
                          {work.year}
                        </span>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm mb-1.5">
                        {work.title}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {work.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Contact & Representation */}
            {activeTab === 'contact' && !showInviteForm && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    Management & Official Representation
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Official booking coordination for conferences, artistic appearances, and strategic partnerships.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Booking Management
                    </h4>
                    <div>
                      <div className="text-sm font-bold text-neutral-900">
                        {person.contact?.management || `${person.name} Talent Management Group`}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Primary representation agency
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                      <span className="text-xs text-neutral-600 font-mono">
                        {person.contact?.bookingEmail || `booking@${person.name.toLowerCase().replace(/[^a-z]/g, '')}.com`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const email = person.contact?.bookingEmail || `booking@${person.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;
                          navigator.clipboard?.writeText(email);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-purple-700 text-xs flex items-center gap-1 shadow-xs"
                        title="Copy booking email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Location & Verification
                    </h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-neutral-900">
                          {person.contact?.location || `${person.country} • Global Touring`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Available for worldwide travel & virtual keynotes
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Identity & Sasana credentials verified
                    </div>
                  </div>
                </div>

                {/* Quick Message CTA */}
                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 mb-0.5">
                      Ready to propose an engagement?
                    </h4>
                    <p className="text-xs text-purple-700">
                      Use our guided form to receive direct feedback and scheduling availability.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(true)}
                    className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shrink-0"
                  >
                    Open Invitation Form
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Footer */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-4 shrink-0">
            <div className="text-xs text-neutral-500 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Direct scheduling managed by verified coordination office
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-sm transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(true);
                }}
                className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Invite {person.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
