import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, Shuffle, Copy, Check, Heart, BookOpen, Volume2, 
  ChevronRight, MessageCircle, Bookmark, Compass, X, Share2, Quote
} from "lucide-react";
import { 
  WisdomSnippet, 
  getTodayWisdom, 
  getRandomWisdom, 
  WISDOM_SNIPPETS,
  toggleSaveWisdom, 
  isWisdomSaved, 
  getSavedWisdomIds,
  getWisdomReflection,
  saveWisdomReflection
} from "../../data/wisdomData";
import { playTempleBellChime } from "../../utils/eventNotificationSystem";

interface DailyWisdomWidgetProps {
  onShowToast?: (message: string) => void;
  variant?: "card" | "banner";
}

export function DailyWisdomWidget({ onShowToast, variant = "card" }: DailyWisdomWidgetProps) {
  const navigate = useNavigate();
  const [wisdom, setWisdom] = useState<WisdomSnippet>(getTodayWisdom);
  const [isSaved, setIsSaved] = useState<boolean>(() => isWisdomSaved(wisdom.id));
  const [copied, setCopied] = useState(false);
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => getSavedWisdomIds().length);
  const [isShuffling, setIsShuffling] = useState(false);

  // Keep saved state and reflection updated when wisdom changes
  useEffect(() => {
    setIsSaved(isWisdomSaved(wisdom.id));
    setReflectionText(getWisdomReflection(wisdom.id));
  }, [wisdom.id]);

  // Keep total saved count in sync with custom events
  useEffect(() => {
    const handleSavedUpdated = () => {
      setSavedCount(getSavedWisdomIds().length);
      setIsSaved(isWisdomSaved(wisdom.id));
    };
    window.addEventListener("lanka_saved_wisdom_updated", handleSavedUpdated);
    return () => window.removeEventListener("lanka_saved_wisdom_updated", handleSavedUpdated);
  }, [wisdom.id]);

  const showToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  const handleNextRandom = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const next = getRandomWisdom(wisdom.id);
      setWisdom(next);
      setIsShuffling(false);
      showToast(`Pulled insight: "${next.theme}" from Learn module`);
    }, 150);
  };

  const handleResetToToday = () => {
    const today = getTodayWisdom();
    setWisdom(today);
    showToast("Loaded official Daily Wisdom for today");
  };

  const handleCopy = () => {
    const fullText = `"${wisdom.quote}"\n\n— ${wisdom.author} (${wisdom.suttaRef})\nFrom the LankaBuddhist Learn Module: ${wisdom.lessonTitle}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
    }
    setCopied(true);
    showToast("Wisdom quote & reference copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlayChime = () => {
    try {
      setIsPlayingChime(true);
      playTempleBellChime();
      showToast("Mindful temple chime sounding... Pause and take a deep breath.");
      setTimeout(() => setIsPlayingChime(false), 2200);
    } catch {
      setIsPlayingChime(false);
    }
  };

  const handleToggleSave = () => {
    const res = toggleSaveWisdom(wisdom.id);
    setIsSaved(res.isSaved);
    setSavedCount(res.allSaved.length);
    showToast(res.isSaved ? "Wisdom quote saved to your personal collection!" : "Removed quote from saved collection.");
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveWisdomReflection(wisdom.id, reflectionText);
    showToast("Daily reflection note saved!");
    setShowReflection(false);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border-2 border-amber-200/90 shadow-sm overflow-hidden relative group transition-all hover:border-amber-300">
      {/* Decorative Lotus/Dhamma subtle background watermark */}
      <div className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none w-48 h-48 -mr-6 -mb-6 text-amber-950">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
        </svg>
      </div>

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-amber-100/90 bg-amber-50/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                Daily Wisdom
              </span>
              <span className="text-[10px] text-amber-700/80 font-medium hidden sm:inline">
                • {formattedDate}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 line-clamp-1">
              Curated from the <strong className="text-neutral-700">Learn Dhamma</strong> module
            </p>
          </div>
        </div>

        {/* Action icons on top right */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlayChime}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 shadow-2xs ${
              isPlayingChime 
                ? "bg-amber-600 text-white border-amber-600 animate-pulse" 
                : "bg-white text-neutral-700 hover:text-amber-700 border-amber-200/80 hover:bg-amber-100/60"
            }`}
            title="Sound Mindful Temple Chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold hidden sm:inline">Mindful Chime</span>
          </button>

          <button
            onClick={handleNextRandom}
            disabled={isShuffling}
            className="p-1.5 rounded-lg border border-amber-200/80 bg-white text-neutral-700 hover:text-amber-700 hover:bg-amber-100/60 text-xs transition-colors flex items-center gap-1 shadow-2xs"
            title="Pull a random quote or teaching from the Learn module"
          >
            <Shuffle className={`w-3.5 h-3.5 text-amber-600 ${isShuffling ? "animate-spin" : ""}`} />
            <span className="text-[10px] font-bold hidden sm:inline">Random Wisdom</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-4 relative z-10">
        {/* Category & Theme Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-200">
              {wisdom.category}
            </span>
            <span className="text-[11px] font-bold text-neutral-800">
              {wisdom.theme}
            </span>
          </div>

          <button
            onClick={() => setShowSavedModal(true)}
            className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 transition-colors"
            title="View saved quotes"
          >
            <Bookmark className="w-3 h-3 text-amber-600" />
            <span>Saved ({savedCount})</span>
          </button>
        </div>

        {/* Primary Quote Block */}
        <div className="relative pl-3 border-l-2 border-amber-500/80 space-y-2">
          <p className="font-serif text-base sm:text-lg text-neutral-900 leading-relaxed font-medium">
            "{wisdom.quote}"
          </p>

          {/* Pali Verse if available */}
          {wisdom.paliVerse && (
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80 text-xs text-amber-950 font-serif space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-700">
                <span>Original Pali Verse</span>
                <span className="text-neutral-400 font-sans font-normal">{wisdom.suttaRef}</span>
              </div>
              <p className="italic font-medium text-amber-900">"{wisdom.paliVerse}"</p>
              {wisdom.paliMeaning && (
                <p className="text-[11px] text-neutral-600 font-sans">{wisdom.paliMeaning}</p>
              )}
            </div>
          )}

          {/* Author and Sutta Ref */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 flex-wrap gap-2">
            <span className="font-semibold text-neutral-800">— {wisdom.author}</span>
            <span className="text-[11px] font-serif italic text-neutral-500 bg-white/70 px-2 py-0.5 rounded border border-neutral-200/60">
              {wisdom.suttaRef}
            </span>
          </div>
        </div>

        {/* Daily Mindful Practice / Application */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Today's Mindful Action</span>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            {wisdom.dailyPractice}
          </p>
        </div>

        {/* Optional Reflection Input toggle */}
        {showReflection ? (
          <form onSubmit={handleSaveReflection} className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-amber-600" />
                <span>My Reflection on this Teaching:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowReflection(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="How can I apply this wisdom today in my relationships, speech, or work?..."
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReflection(false)}
                className="text-xs text-neutral-600 hover:underline px-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg transition-colors shadow-2xs"
              >
                Save Reflection
              </button>
            </div>
          </form>
        ) : reflectionText ? (
          <div 
            onClick={() => setShowReflection(true)}
            className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-800 block">Your Note:</span>
              <p className="text-neutral-700 truncate italic">"{reflectionText}"</p>
            </div>
            <span className="text-[10px] text-amber-700 font-bold shrink-0">Edit</span>
          </div>
        ) : null}

        {/* Bottom Interactive Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {/* Save / Favorite Quote */}
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 font-bold ${
                isSaved 
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" 
                  : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
              }`}
              title={isSaved ? "Saved to your wisdom collection" : "Save this quote"}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : "text-neutral-400"}`} />
              <span className="text-[11px]">{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Copy / Share Quote */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-bold flex items-center gap-1.5 transition-colors"
              title="Copy quote and citation"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span className="text-[11px]">{copied ? "Copied!" : "Share"}</span>
            </button>

            {/* Reflection note toggle if not open */}
            {!showReflection && (
              <button
                onClick={() => setShowReflection(true)}
                className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold flex items-center gap-1.5 transition-colors"
                title="Write a personal reflection note"
              >
                <MessageCircle className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[11px] hidden sm:inline">Reflect</span>
              </button>
            )}
          </div>

          {/* Learn Module Deep Dive Link */}
          <Link
            to={`/learn?lesson=${wisdom.lessonId}`}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
            title={`Read full lesson: ${wisdom.lessonTitle}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>Read in Learn</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Saved Wisdom Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowSavedModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-neutral-200 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 leading-tight">My Saved Wisdom Quotes</h3>
                  <p className="text-xs text-neutral-500">Your curated collection of cherished Buddhist teachings</p>
                </div>
              </div>
              <button onClick={() => setShowSavedModal(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {getSavedWisdomIds().map((id) => {
                const item = WISDOM_SNIPPETS.find(w => w.id === id);
                if (!item) return null;
                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-neutral-200 hover:border-amber-300 transition-colors bg-neutral-50/50 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        {item.category} • {item.theme}
                      </span>
                      <span className="text-neutral-400 italic">{item.suttaRef}</span>
                    </div>
                    <p className="text-sm font-serif italic text-neutral-800 leading-snug">
                      "{item.quote}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-xs">
                      <button
                        onClick={() => {
                          setWisdom(item);
                          setShowSavedModal(false);
                          showToast(`Displayed: "${item.theme}"`);
                        }}
                        className="text-amber-700 hover:underline font-bold text-[11px]"
                      >
                        Load onto Widget &rarr;
                      </button>
                      <button
                        onClick={() => {
                          toggleSaveWisdom(item.id);
                          showToast(`Removed from saved quotes`);
                        }}
                        className="text-neutral-400 hover:text-rose-600 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
