import React, { useState, useEffect } from "react";
import { 
  CheckCircle, MapPin, Building2, Phone, Mail, Globe, 
  Clock, Heart, Share2, Navigation, MessageSquare, 
  ChevronRight, Star, Calendar, ArrowRight,
  BookOpen, ShieldCheck, X, Sparkles, Send, Check
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Temple } from "../data/templesData";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, MAP_ATTRIBUTION_IDS, getCoordinatesForLocation } from "../utils/googleMapsConfig";
import { getTempleFromDb, subscribeTemples } from "../lib/firestoreService";

export function TempleDetail() {
  const { id } = useParams<{ id: string }>();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [otherTemples, setOtherTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getTempleFromDb(id).then((found) => {
      setTemple(found);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const unsub = subscribeTemples((list) => {
      setOtherTemples(list);
    });
    return () => unsub();
  }, []);

  const [toastMessage, setToastMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [donationAmount, setDonationAmount] = useState("50");
  const [donationCause, setDonationCause] = useState("Temple Maintenance & Alms");
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Temple profile link copied to clipboard!");
    } else {
      showToast("Link ready to share!");
    }
  };

  const toggleFavorite = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? `Added ${temple.name} to your saved temples!` : `Removed ${temple.name} from saved temples`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      showToast("Please fill in your name and inquiry message");
      return;
    }
    showToast(`Inquiry sent to ${temple.name} administration!`);
    setShowContactModal(false);
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Thank you! Your donation of $${donationAmount} for "${donationCause}" was recorded.`);
    setShowDonationModal(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!temple) return;
    if (!newReview.name || !newReview.comment) {
      showToast("Please add your name and review remarks.");
      return;
    }
    const list = temple.reviewList || [];
    list.unshift({
      author: newReview.name,
      rating: newReview.rating,
      date: "Just now",
      comment: newReview.comment
    });
    temple.reviewList = list;
    temple.reviews = (temple.reviews || 0) + 1;
    showToast("Your review was posted successfully!");
    setShowReviewModal(false);
    setNewReview({ name: "", rating: 5, comment: "" });
  };

  const openGoogleMaps = () => {
    if (!temple) return;
    const encodedAddress = encodeURIComponent(`${temple.name}, ${temple.address || temple.loc || temple.city}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mapUrl);
      showToast("Google Maps location link copied to clipboard!");
    } else {
      showToast("Map coordinates ready.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-600 font-medium">Loading temple details from database...</p>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <Building2 className="w-14 h-14 text-neutral-300 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Temple Profile Not Found</h2>
        <p className="text-sm text-neutral-500">
          The requested temple profile could not be found or has not yet been registered in the database.
        </p>
        <Link to="/temples" className="inline-block px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
          &larr; Back to Temples Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 border border-neutral-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo Lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActivePhoto(null)}>
          <div className="relative max-w-4xl max-h-[85vh]">
            <img src={activePhoto} alt="Temple full view" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button 
              onClick={() => setActivePhoto(null)} 
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Contact Inquiry Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">Contact {temple.name}</h3>
                <p className="text-xs text-neutral-500">Inquire about ceremonies, alms giving, or blessing visits</p>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={contactForm.name} 
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="e.g. Priyantha Silva" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email / Phone</label>
                <input 
                  type="text" 
                  value={contactForm.email} 
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="name@example.com or mobile number" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Message or Booking Request</label>
                <textarea 
                  rows={4} 
                  value={contactForm.message} 
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="Describe your event date, Dana offering, or request..." 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm flex items-center gap-1.5 shadow-sm">
                  <Send className="w-4 h-4" /> Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">Merit & Donation</h3>
                <p className="text-xs text-neutral-500">Contribute to {temple.name}</p>
              </div>
              <button onClick={() => setShowDonationModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDonationSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Select Donation Purpose</label>
                <select 
                  value={donationCause} 
                  onChange={(e) => setDonationCause(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option>Temple Maintenance & Alms</option>
                  <option>Dhamma School & Student Books</option>
                  <option>Sangha Healthcare & Medicines</option>
                  <option>Building Renovation & Solar Power</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Select Amount (USD)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {["25", "50", "100", "250"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                        donationAmount === amt ? 'bg-amber-600 text-white border-amber-600' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={donationAmount} 
                  onChange={(e) => setDonationAmount(e.target.value)} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none" 
                  placeholder="Or enter custom amount"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm">
                  <Heart className="w-4 h-4 fill-white" /> Complete Offering of ${donationAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={newReview.name} 
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Rating</label>
                <div className="flex gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Review</label>
                <textarea 
                  rows={4} 
                  value={newReview.comment} 
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} 
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" 
                  placeholder="Share your spiritual experience, chanting serenity, or Dhamma school feedback..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-sm text-neutral-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm">Post Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Temple Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">Claim Temple Listing</h3>
              <button onClick={() => setShowClaimModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-4 text-sm text-neutral-700">
              <p>Are you an authorized trustee, chief incumbent monk, or committee member of <strong>{temple.name}</strong>?</p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
                Claiming unlocks event publishing, live streams, resident monk directory management, and verified badge.
              </div>
              <input type="text" placeholder="Your Official Role (e.g. Dayaka Sabha President)" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              <input type="tel" placeholder="Verification Contact Number" className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 text-sm text-neutral-600">Cancel</button>
              <button 
                onClick={() => {
                  showToast("Verification request submitted! Our community stewards will contact you.");
                  setShowClaimModal(false);
                }} 
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/temples" className="hover:text-neutral-900">Temples</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-neutral-900">{temple.country}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-semibold">{temple.name}</span>
      </div>

      {/* Cover Image & Basic Info Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden relative shadow-sm">
        <div className="h-64 md:h-80 w-full relative">
          <img 
            referrerPolicy="no-referrer" 
            src={temple.coverImg} 
            className="w-full h-full object-cover" 
            alt={temple.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        <div className="relative px-6 md:px-8 pb-8 pt-0 -mt-20 flex flex-col md:flex-row gap-6 md:items-end">
          <img 
            referrerPolicy="no-referrer" 
            src={temple.img} 
            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md bg-white z-10 shrink-0" 
            alt={temple.name} 
          />
          
          <div className="flex-1 z-10 pt-4 md:pt-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 md:text-white leading-tight">{temple.name}</h1>
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-white bg-white rounded-full shrink-0" />
            </div>
            <p className="text-sm md:text-neutral-200 text-neutral-600 mb-3">{temple.description}</p>
            
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold md:text-white text-neutral-900">{temple.rating}</span>
                <div className="flex -space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(temple.rating) ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'}`} />
                  ))}
                </div>
              </div>
              <button onClick={() => setShowReviewModal(true)} className="text-xs md:text-neutral-300 text-neutral-500 underline hover:text-white">
                ({temple.reviews} reviews) • Write a Review
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {temple.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2.5 py-1 bg-white md:bg-white/20 md:text-white text-neutral-700 md:backdrop-blur-sm border md:border-white/30 border-neutral-200 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 z-10">
            <button 
              onClick={toggleFavorite}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                isSaved ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
              title={isSaved ? "Saved" : "Save Temple"}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors flex items-center justify-center"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Message
            </button>
            <button 
              onClick={openGoogleMaps}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Navigation className="w-4 h-4" /> Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About Section */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">About {temple.name}</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">{temple.history}</p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Resident Monks & Spiritual Leadership: <strong>{temple.chiefMonk}</strong> coordinates the daily Buddha Pooja, morning chanting, meditation courses, and community outreach.
            </p>
          </div>

          {/* Key Features & Amenities */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-bold text-neutral-900 text-sm mb-4">Temple Features & Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {temple.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-neutral-50 text-neutral-800 text-xs font-medium border border-neutral-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 text-sm">Temple Photos ({temple.photos.length})</h3>
              <span className="text-xs text-neutral-400">Click to enlarge</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {temple.photos.map((src, i) => (
                <div 
                  key={i} 
                  onClick={() => setActivePhoto(src)}
                  className="aspect-square rounded-lg overflow-hidden border border-neutral-200 cursor-pointer group hover:opacity-90 relative"
                >
                  <img referrerPolicy="no-referrer" src={src} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events at this Temple */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 text-sm">Upcoming Temple Programs</h3>
              <Link to="/events" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All Events</Link>
            </div>
            <div className="space-y-3">
              {temple.upcomingEvents.map((evt, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{evt.title}</h4>
                      <p className="text-xs text-neutral-500">{evt.date} • {evt.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      showToast(`RSVP confirmed for "${evt.title}"!`);
                    }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-amber-50 hover:text-amber-700 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    RSVP
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Community Reviews</h3>
                <p className="text-xs text-neutral-500">Shared by devotees and visitors</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                + Add Review
              </button>
            </div>
            <div className="space-y-4">
              {temple.reviewList.map((rev, i) => (
                <div key={i} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-neutral-900">{rev.author}</span>
                    <span className="text-[10px] text-neutral-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-500 mb-2">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < rev.rating ? 'fill-amber-500' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Location & Map Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Location & Directions</h3>
              <button 
                onClick={openGoogleMaps}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>Open in Google Maps</span>
              </button>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-neutral-600">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{temple.address}</span>
            </div>

            <div className="relative h-56 rounded-xl overflow-hidden border border-neutral-200 shadow-inner">
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'geometry']}>
                <Map
                  defaultCenter={getCoordinatesForLocation(temple.address || temple.loc)}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="w-full h-full"
                >
                  <AdvancedMarker
                    position={getCoordinatesForLocation(temple.address || temple.loc)}
                    title={temple.name}
                  >
                    <Pin background="#ea580c" glyphColor="#ffffff" borderColor="#c2410c" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3 text-sm">
            <h3 className="font-bold text-neutral-900 text-sm mb-3">Direct Contact</h3>
            <div className="flex items-center gap-3 text-neutral-700">
              <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
              <a href={`tel:${temple.phone}`} className="text-amber-700 hover:underline">{temple.phone}</a>
            </div>
            <div className="flex items-center gap-3 text-neutral-700">
              <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
              <a href={`mailto:${temple.email}`} className="text-blue-600 hover:underline truncate">{temple.email}</a>
            </div>
            <div className="flex items-center gap-3 text-neutral-700">
              <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
              <a href={temple.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{temple.website}</a>
            </div>
          </div>

          {/* Temple Operating Hours */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-neutral-900 text-sm">Visiting Hours</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Open Now</span>
            </div>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between py-1 border-b border-neutral-50">
                <span>Daily Chanting & Darshan</span>
                <span className="font-semibold text-neutral-900">{temple.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-50">
                <span>Poya Day Observance</span>
                <span className="font-semibold text-neutral-900">5:00 AM - 9:30 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sunday Dhamma School</span>
                <span className="font-semibold text-neutral-900">9:00 AM - 1:00 PM</span>
              </div>
            </div>
          </div>

          {/* Donation Support */}
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-white text-orange-600 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Heart className="w-5 h-5 fill-orange-500" />
            </div>
            <h4 className="font-bold text-orange-900 text-sm mb-1">Support This Temple</h4>
            <p className="text-xs text-orange-800 mb-3">Contribute to the resident monks, Dhamma classes, and temple upkeep.</p>
            <button 
              onClick={() => setShowDonationModal(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              Make an Offering / Donation
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-2">
            <h3 className="font-bold text-neutral-900 text-sm mb-3">Manage & Contribute</h3>
            <button 
              onClick={() => setShowClaimModal(true)}
              className="w-full flex items-center gap-2.5 text-xs font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50 text-left transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Claim this Temple Listing
            </button>
            <button 
              onClick={() => showToast("Suggestion recorded! Our team will review the proposed edits.")}
              className="w-full flex items-center gap-2.5 text-xs font-medium text-neutral-700 p-2 rounded-lg hover:bg-neutral-50 text-left transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              Suggest an Information Update
            </button>
          </div>

          {/* Other Temples */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-neutral-900 text-sm">Other Temples</h3>
              <Link to="/temples" className="text-xs text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {otherTemples.filter(t => t.id !== temple.id).slice(0, 3).map((other) => (
                <Link key={other.id} to={`/temples/${other.id}`} className="flex gap-3 group">
                  <img src={other.image || other.imageUrl || (other as any).img || "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=200"} alt={other.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-neutral-900 group-hover:text-amber-700 transition-colors truncate">{other.name}</h5>
                    <p className="text-[10px] text-neutral-500 truncate">{other.location || other.address || (other as any).loc || other.city}</p>
                    <span className="text-[10px] text-amber-600 font-bold">★ {other.rating || "4.9"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
