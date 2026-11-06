import React, { useState } from "react";
import { X, Users, Sparkles, CheckCircle2, Image, Globe, Award, Star, ShieldCheck } from "lucide-react";
import { addFamousPersonToDb } from "../../lib/firestoreService";

interface AddFamousPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newId: string) => void;
}

export function AddFamousPersonModal({ isOpen, onClose, onSuccess }: AddFamousPersonModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("Musicians");
  const [country, setCountry] = useState("Sri Lanka");
  const [img, setImg] = useState("");
  const [cover, setCover] = useState("");
  const [bio, setBio] = useState("");
  const [quote, setQuote] = useState("");
  const [followers, setFollowers] = useState("500K");
  const [tagsInput, setTagsInput] = useState("Cultural Icon, Sri Lanka");
  const [availableForInput, setAvailableForInput] = useState("Musical Shows, Keynote Speeches, Charity Events");
  const [available, setAvailable] = useState(true);
  const [verified, setVerified] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError("Please provide at least a name and role/profession.");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const availableFor = availableForInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const defaultImg =
      img.trim() ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400";
    const defaultCover =
      cover.trim() ||
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200";

    const newPerson = {
      name: name.trim(),
      role: role.trim(),
      category,
      country: country.trim() || "Sri Lanka",
      img: defaultImg,
      cover: defaultCover,
      bio: bio.trim() || `${name.trim()} is an accomplished ${role.trim()} from ${country.trim() || "Sri Lanka"}.`,
      quote: quote.trim() || "Inspiring positive change and cultural pride through dedicated craft.",
      followers: followers.trim() || "100K",
      rating: 4.9,
      reviews: 1,
      events: 12,
      collabs: 8,
      available,
      verified,
      tags: tags.length > 0 ? tags : [category, "Sri Lanka"],
      availableFor: availableFor.length > 0 ? availableFor : ["Public Appearances", "Keynote Speeches"],
      longBio: [
        bio.trim() || `${name.trim()} is an acclaimed personality in the field of ${category.toLowerCase()}.`,
        `Recognized for contributions across Sri Lanka and the global community with enduring cultural relevance.`
      ]
    };

    try {
      const createdId = await addFamousPersonToDb(newPerson);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess(createdId);
    } catch (err: any) {
      console.error("Failed to add famous person:", err);
      setError(err?.message || "Failed to save to Firestore. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Register Notable Personality</h3>
              <p className="text-xs text-purple-100 mt-0.5">
                Add a recognized musician, scholar, artist, athlete, or community leader to Firestore
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bathiya Jayakody"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-neutral-900"
              >
                <option value="Musicians">Musicians</option>
                <option value="Actors">Actors</option>
                <option value="Athletes">Athletes</option>
                <option value="Business">Business</option>
                <option value="Chefs">Chefs</option>
                <option value="Scholars & Authors">Scholars & Authors</option>
                <option value="Other">Other Notable Personality</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Role / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Musician | Composer | Producer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Country / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Sri Lanka"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Profile Photo URL
              </label>
              <input
                type="url"
                placeholder="https://... (or leave empty for default)"
                value={img}
                onChange={(e) => setImg(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Cover Banner URL
              </label>
              <input
                type="url"
                placeholder="https://... (or leave empty for default)"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Short Biography / Overview
            </label>
            <textarea
              rows={3}
              placeholder="Summary of accomplishments, career highlights, and cultural impact..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Inspirational Quote / Motto
            </label>
            <input
              type="text"
              placeholder="e.g. Music is the timeless bridge uniting traditional soul with modern art."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="Live Shows, Keynote, Fusion, BNS"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Follower Reach / Audience Size
              </label>
              <input
                type="text"
                placeholder="e.g. 1.4M or 500K"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Available For (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="Musical Shows, Opening Ceremonies, Private Concerts, Keynotes"
              value={availableForInput}
              onChange={(e) => setAvailableForInput(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
              />
              <span className="text-xs font-semibold text-neutral-800">Available for Events</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
              />
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verified Luminary
              </span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Notable Person
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
