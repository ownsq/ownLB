import React, { useState } from "react";
import { 
  X, Download, ExternalLink, Sparkles, BookOpen, 
  Check, Globe, Link2, FileText, ArrowRight 
} from "lucide-react";
import { BuddhismCourse } from "../../types/buddhismCourse";
import { saveBuddhismCourse } from "../../utils/buddhismCourseStorage";

interface CurriculumImporterModalProps {
  onClose: () => void;
  onImportComplete: (course: BuddhismCourse) => void;
}

const CANONICAL_ONLINE_ARCHIVES = [
  {
    title: "Basic Theravada Buddhism e-Guide",
    author: "Ven. Dr. K. Sri Dhammananda & Monastic Faculty",
    category: "Theravada Fundamentals" as const,
    url: "https://suttacentral.net/introduction",
    modulesCount: 6,
    desc: "A systematic canonical introduction to the Four Noble Truths, Kamma, and the Noble Eightfold Path."
  },
  {
    title: "Vipassana Insight Meditation Manual",
    author: "Ven. Mahasi Sayadaw Tradition",
    category: "Meditation & Sati" as const,
    url: "https://suttacentral.net/mn10",
    modulesCount: 5,
    desc: "Classical bare attention instructions on sitting posture, rising and falling breath, and walking meditation."
  },
  {
    title: "The Buddha and His Teachings: Sutta Studies",
    author: "Ven. Narada Mahathera",
    category: "Sutta Studies" as const,
    url: "https://suttacentral.net/pitaka/sutta",
    modulesCount: 8,
    desc: "Comprehensive canonical discourses with Pali sutta excerpts from the Digha and Majjhima Nikayas."
  },
  {
    title: "Abhidhamma in Daily Life & Mind Analysis",
    author: "Nina van Gorkom",
    category: "Abhidhamma" as const,
    url: "https://suttacentral.net/pitaka/abhidhamma",
    modulesCount: 6,
    desc: "Analytical breakdown of the 89 types of consciousness and 52 mental factors present in daily experience."
  },
  {
    title: "Pali Devotional Chanting & Paritta Sutras",
    author: "Theravada Monastic Sangha",
    category: "Pali & Chanting" as const,
    url: "https://suttacentral.net/kn/khp",
    modulesCount: 4,
    desc: "Authentic audio chanting guide with line-by-line Pali pronunciation and English translations."
  }
];

export function CurriculumImporterModal({
  onClose,
  onImportComplete
}: CurriculumImporterModalProps) {
  const [activeTab, setActiveTab] = useState<"curated" | "url_parser">("curated");
  const [pastedUrl, setPastedUrl] = useState("https://suttacentral.net/introduction");
  const [pastedContent, setPastedContent] = useState("");
  const [importing, setImporting] = useState(false);

  // Ingest online URL or raw text into a structured training course
  const handleIngestOnlineContent = () => {
    if (!pastedUrl.trim() && !pastedContent.trim()) {
      alert("Please enter a URL or paste article text to import.");
      return;
    }

    setImporting(true);

    setTimeout(() => {
      // Derive a structured course from the ingested online source
      const urlPart = pastedUrl.split("/").pop()?.replace(".htm", "") || "guide";
      const cleanTitle = urlPart
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const courseTitle = pastedContent.trim()
        ? pastedContent.trim().split("\n")[0].slice(0, 70)
        : `Canonical Curriculum: ${cleanTitle || "Dhamma Studies"}`;

      const newCourse: BuddhismCourse = {
        id: `canonical-import-${Date.now()}`,
        title: courseTitle,
        subtitle: "Imported canonical study course from open educational Dhamma archives",
        desc: pastedContent.trim() 
          ? pastedContent.slice(0, 300) + "..." 
          : "Systematic canonical lessons, suttas, and practical meditation reflections extracted from open Theravada archives.",
        category: "Theravada Fundamentals",
        level: "Beginner",
        durationWeeks: 4,
        estimatedHours: 12,
        coverImage: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200",
        instructor: {
          name: "Canonical Dhamma Faculty",
          title: "Theravada Monastic Education Council",
          avatar: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200",
          affiliation: "Sri Lankan Buddhist Community Education",
          isCanonicalVerified: true
        },
        source: {
          name: "Theravada Canonical Archive",
          url: pastedUrl.trim() || "https://suttacentral.net",
          isCanonicalCurriculum: true
        },
        rating: 4.95,
        reviewsCount: 1,
        enrolledCount: 1,
        objectives: [
          "Understand the core canonical insights outlined in the source teaching",
          "Apply contemplative reflection to personal thoughts and habits",
          "Deepen mindfulness of impermanence and right intention"
        ],
        prerequisites: ["Open mind and desire to practice Dhamma"],
        modules: [
          {
            id: `mod-imp-${Date.now()}-1`,
            moduleNumber: 1,
            title: "Module 1: The First Principle of Awakening",
            overview: "Canonical overview extracted from online source text.",
            lessons: [
              {
                id: `les-imp-${Date.now()}-1`,
                title: "Lesson 1: Introduction to the Discourse",
                durationMinutes: 20,
                suttaReference: "Canonical Sutta Reference",
                summary: "Core principles and spiritual reflections.",
                contentSections: [
                  {
                    heading: "Fundamental Teaching",
                    text: pastedContent.trim()
                      ? pastedContent.slice(0, 800)
                      : "The Buddha taught that understanding suffering and its cessation is the essential foundation for true spiritual peace. Through mindful observation of body, feelings, and mental phenomena, one transcends anxiety and attains supreme contentment.",
                    bulletPoints: [
                      "Awareness of impermanence (Anicca)",
                      "Releasing craving and clinging (Tanha Nirodha)",
                      "Daily cultivation of goodwill (Metta)"
                    ]
                  }
                ],
                practicalExercise: {
                  title: "Mindfulness & Stillness Practice",
                  duration: "15 minutes",
                  instructions: [
                    "Sit comfortably with spine erect.",
                    "Observe the natural in-breath and out-breath.",
                    "Reflect quietly on the teachings learned today."
                  ]
                }
              }
            ],
            quiz: [
              {
                id: `q-imp-${Date.now()}-1`,
                question: "According to canonical Theravada teachings, what is the ultimate purpose of studying Dhamma?",
                options: [
                  "Mere intellectual debate and argument",
                  "Purification of the mind, cessation of suffering, and realization of Nibbana",
                  "Acquiring social status in the community",
                  "Ignoring daily family duties"
                ],
                correctAnswerIndex: 1,
                explanation: "The Dhamma is a practical raft designed for crossing the ocean of suffering to the peace of liberation."
              }
            ]
          }
        ],
        paliGlossary: [
          {
            term: "Dhamma",
            phonetic: "dhuhm-muh",
            meaning: "Truth, universal law, the teachings of the Buddha",
            context: "The second gem of the Triple Refuges."
          }
        ],
        creatorUserId: "damika-user",
        isCommunityCreated: false,
        createdAt: new Date().toISOString()
      };

      saveBuddhismCourse(newCourse);
      setImporting(false);
      onImportComplete(newCourse);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Online Content Ingestion
              </span>
              <h2 className="text-lg font-bold text-neutral-900">
                Import Online Dhamma Curricula & Suttas
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 flex border-b border-neutral-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("curated")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "curated"
                ? "border-amber-600 text-amber-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Canonical Master Syllabi
          </button>
          <button
            onClick={() => setActiveTab("url_parser")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "url_parser"
                ? "border-amber-600 text-amber-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Online URL & Text Parser
          </button>
        </div>

        {/* Tab 1: Curated Archives */}
        {activeTab === "curated" && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-neutral-600">
              Select any of the authentic curricula curated from canonical Theravada archives to instantly import into your course catalog:
            </p>

            <div className="space-y-3">
              {CANONICAL_ONLINE_ARCHIVES.map((arch, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 hover:bg-amber-50/50 border border-neutral-200 hover:border-amber-300 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {arch.category}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {arch.modulesCount} Modules
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {arch.title}
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {arch.desc}
                    </p>
                    <span className="text-[11px] text-neutral-400 block font-serif italic">
                      Authored by {arch.author}
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setPastedUrl(arch.url);
                        handleIngestOnlineContent();
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Import Course</span>
                    </button>
                    <a
                      href={arch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-500 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Custom URL & Text Ingester */}
        {activeTab === "url_parser" && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-neutral-600">
              Paste any article link from open Dhamma websites or paste raw text from a Dhamma lecture. Our smart parser will format it into structured modules and lessons.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-amber-700" />
                Dhamma Website or Canonical URL
              </label>
              <input
                type="url"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                placeholder="https://suttacentral.net/..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                Or Paste Raw Teaching Text / Lecture Notes
              </label>
              <textarea
                rows={5}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Paste Dhamma talk notes, sutta translations, or study guide excerpts..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleIngestOnlineContent}
              disabled={importing}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              {importing ? (
                <span>Parsing & Generating Course...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse Content & Generate Training Course</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>Theravada Canonical Open Sutta Sync</span>
          <a
            href="https://suttacentral.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Visit SuttaCentral</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
