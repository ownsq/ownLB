import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Book, PlayCircle, Headphones, Video, BookOpen, 
  Star, Calendar, X, Sparkles, CheckCircle2, ChevronRight, Share2, 
  Check, Plus, Download, Globe, Award, ExternalLink, Bookmark,
  Layers, Users, RotateCcw, Filter, User
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BuddhismCourse } from "../types/buddhismCourse";
import { 
  getAllBuddhismCourses, 
  getUserLearningState, 
  getCourseProgress, 
  resetCoursesToDefaults,
  deleteBuddhismCourse
} from "../utils/buddhismCourseStorage";
import { CourseCard } from "../components/learn/CourseCard";
import { CoursePlayer } from "../components/learn/CoursePlayer";
import { CourseCreatorModal } from "../components/learn/CourseCreatorModal";
import { CurriculumImporterModal } from "../components/learn/CurriculumImporterModal";
import { CourseCertificateModal } from "../components/learn/CourseCertificateModal";
import { subscribeCourses } from "../lib/firestoreService";

interface QuickDhammaLesson {
  id: string;
  category: string;
  title: string;
  desc: string;
  img: string;
  duration: string;
  suttaRef: string;
  content: {
    heading: string;
    text: string;
    points: string[];
  }[];
}

const QUICK_LESSONS_DATA: QuickDhammaLesson[] = [
  {
    id: "noble-truths",
    category: "Teachings",
    title: "The Four Noble Truths (Catur-Arya Sacca)",
    desc: "The foundational framework of all Buddhist teachings discovered by Gautama Buddha under the Bodhi tree.",
    img: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
    duration: "10 mins read",
    suttaRef: "Dhammacakkappavattana Sutta (SN 56.11)",
    content: [
      {
        heading: "1. The Truth of Suffering (Dukkha Sacca)",
        text: "Birth is suffering, aging is suffering, illness is suffering, death is suffering; sorrow, lamentation, pain, grief, and despair are suffering; association with what is unpleasant is suffering; separation from what is pleasing is suffering; not to get what one desires is suffering.",
        points: ["Dukkha-dukkha: Plain physical and mental pain", "Viparinama-dukkha: Suffering from impermanence and change", "Sankhara-dukkha: Suffering inherent in conditioned existence"]
      },
      {
        heading: "2. The Origin of Suffering (Samudaya Sacca)",
        text: "The cause of suffering is craving (Tanha) which produces rebirth, accompanied by delight and lust, seeking enjoyment now here and now there.",
        points: ["Kama-tanha: Craving for sensual pleasures", "Bhava-tanha: Craving for becoming and eternal existence", "Vibhava-tanha: Craving for non-existence or annihilation"]
      },
      {
        heading: "3. The Cessation of Suffering (Nirodha Sacca)",
        text: "The complete fading away and cessation of that very craving, its relinquishment and utter liberation — the attainment of Nibbana.",
        points: ["Extinguishing the fires of greed (Raga), hatred (Dosa), and delusion (Moha)"]
      },
      {
        heading: "4. The Path Leading to the Cessation of Suffering (Magga Sacca)",
        text: "The Noble Eightfold Path: right view, right intention, right speech, right action, right livelihood, right effort, right mindfulness, and right concentration.",
        points: ["Wisdom (Panna): Right View & Right Intention", "Morality (Sila): Right Speech, Right Action & Right Livelihood", "Concentration (Samadhi): Right Effort, Right Mindfulness & Right Concentration"]
      }
    ]
  },
  {
    id: "eightfold-path",
    category: "Teachings",
    title: "The Noble Eightfold Path (Ariya Atthangika Magga)",
    desc: "The middle path that avoids the extremes of self-indulgence and self-mortification, leading to peace, discernment, and enlightenment.",
    img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600",
    duration: "12 mins read",
    suttaRef: "Magga-vibhanga Sutta (SN 45.8)",
    content: [
      {
        heading: "The Three Higher Trainings",
        text: "The path is grouped into three great training disciplines that develop hand in hand.",
        points: [
          "Sila (Virtue): Purifies words and actions so that the mind is calm and guilt-free.",
          "Samadhi (Meditation): Develops single-pointed focus and serenity.",
          "Panna (Wisdom): Cultivates direct seeing into the true nature of phenomena."
        ]
      }
    ]
  },
  {
    id: "five-precepts",
    category: "Getting Started",
    title: "The Five Precepts (Panca Sila)",
    desc: "The ethical compass for lay practitioners to safeguard peace of mind, family harmony, and moral clarity.",
    img: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=600",
    duration: "8 mins read",
    suttaRef: "Sigalovada Sutta (DN 31)",
    content: [
      {
        heading: "Ethical Living for Householders",
        text: "To refrain from killing, stealing, sexual misconduct, false speech, and intoxicants.",
        points: [
          "Cultivates non-harming (Ahimsa) and compassion for all living beings",
          "Protects personal and familial integrity"
        ]
      }
    ]
  }
];

export function LearnBuddhism() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Courses and user learning state
  const [courses, setCourses] = useState<BuddhismCourse[]>(getAllBuddhismCourses);
  const [learningState, setLearningState] = useState(getUserLearningState);

  // Active view states
  const [activeCourse, setActiveCourse] = useState<BuddhismCourse | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "canonical" | "community" | "my_learning" | "my_created" | "quick_articles">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showImporterModal, setShowImporterModal] = useState(false);
  const [selectedQuickLesson, setSelectedQuickLesson] = useState<QuickDhammaLesson | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const refreshData = () => {
    setCourses(getAllBuddhismCourses());
    setLearningState(getUserLearningState());
  };

  useEffect(() => {
    refreshData();

    const handleCoursesUpdated = () => refreshData();
    const handleLearningUpdated = () => refreshData();

    window.addEventListener("lanka_courses_updated", handleCoursesUpdated);
    window.addEventListener("lanka_learning_updated", handleLearningUpdated);

    const unsubCourses = subscribeCourses((liveCourses) => {
      if (liveCourses && liveCourses.length > 0) {
        setCourses(liveCourses as BuddhismCourse[]);
      }
    });

    // Deep link support via ?course=id or ?lesson=id
    const courseIdParam = searchParams.get("course");
    if (courseIdParam) {
      const match = getAllBuddhismCourses().find((c) => c.id === courseIdParam);
      if (match) setActiveCourse(match);
    }

    const lessonParam = searchParams.get("lesson");
    if (lessonParam) {
      const matchLesson = QUICK_LESSONS_DATA.find((l) => l.id === lessonParam);
      if (matchLesson) setSelectedQuickLesson(matchLesson);
    }

    return () => {
      unsubCourses();
      window.removeEventListener("lanka_courses_updated", handleCoursesUpdated);
      window.removeEventListener("lanka_learning_updated", handleLearningUpdated);
    };
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Tab filter
      if (activeTab === "canonical" && !c.source.isCanonicalCurriculum) return false;
      if (activeTab === "community" && !c.isCommunityCreated) return false;
      if (activeTab === "my_learning" && !learningState.enrolledCourseIds.includes(c.id)) return false;
      if (activeTab === "my_created" && c.creatorUserId !== user?.id) return false;

      // Category filter
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;

      // Level filter
      if (selectedLevel !== "All" && c.level !== selectedLevel && c.level !== "All Levels") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = c.title.toLowerCase().includes(q);
        const inDesc = c.desc.toLowerCase().includes(q);
        const inInstructor = c.instructor.name.toLowerCase().includes(q);
        const inCategory = c.category.toLowerCase().includes(q);
        return inTitle || inDesc || inInstructor || inCategory;
      }

      return true;
    });
  }, [courses, activeTab, selectedCategory, selectedLevel, searchQuery, learningState, user?.id]);

  // Statistics
  const totalEnrolled = learningState.enrolledCourseIds.length;
  const totalCertificates = learningState.certificates.length;
  const totalCompletedLessons = Object.values(learningState.completedLessonIds || {}).reduce(
    (sum: number, list: string[] | unknown) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  // If a course is actively opened in the Study Player, render player
  if (activeCourse) {
    return (
      <CoursePlayer
        course={activeCourse}
        onBack={() => setActiveCourse(null)}
        studentName={user?.name || "Dhamma Student"}
        studentEmail={user?.email || "student@community.org"}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-sm font-medium border border-neutral-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Course Creator Modal */}
      {showCreatorModal && (
        <CourseCreatorModal
          onClose={() => setShowCreatorModal(false)}
          onCourseCreated={(newCourse) => {
            setShowCreatorModal(false);
            showToast(`Course "${newCourse.title}" published!`);
            setActiveCourse(newCourse);
          }}
          currentUserName={user?.name || "Community Member"}
          currentUserAvatar={user?.avatar}
        />
      )}

      {/* Curriculum Importer Modal */}
      {showImporterModal && (
        <CurriculumImporterModal
          onClose={() => setShowImporterModal(false)}
          onImportComplete={(imported) => {
            setShowImporterModal(false);
            showToast(`Curriculum "${imported.title}" imported!`);
            setActiveCourse(imported);
          }}
        />
      )}

      {/* Quick Lesson Reader Modal */}
      {selectedQuickLesson && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedQuickLesson(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedQuickLesson.category} · {selectedQuickLesson.duration}
                </span>
                <h3 className="font-bold text-2xl text-neutral-900 mt-2">{selectedQuickLesson.title}</h3>
                <p className="text-xs text-neutral-500 mt-1 font-serif italic">{selectedQuickLesson.suttaRef}</p>
              </div>
              <button onClick={() => setSelectedQuickLesson(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4 text-sm text-neutral-700">
              <div className="rounded-xl overflow-hidden aspect-video">
                <img src={selectedQuickLesson.img} alt={selectedQuickLesson.title} className="w-full h-full object-cover" />
              </div>

              <p className="text-base text-neutral-800 font-medium leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                {selectedQuickLesson.desc}
              </p>

              {selectedQuickLesson.content.map((sec, idx) => (
                <div key={idx} className="space-y-2 border-b border-neutral-100 pb-4 last:border-0">
                  <h4 className="font-bold text-base text-neutral-900">{sec.heading}</h4>
                  <p className="leading-relaxed text-neutral-700">{sec.text}</p>
                  {sec.points && (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 pt-1">
                      {sec.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner: Sri Lankan Community Dhamma Academy & Training Hub */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-neutral-950 text-white shadow-xl border border-amber-900/40">
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-10" />
        
        {/* Decorative background image */}
        <img
          referrerPolicy="no-referrer"
          src="https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1600"
          alt="Serene Buddha Sculpture in Ancient Garden"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay z-0"
        />

        <div className="relative z-20 p-6 sm:p-10 lg:p-12 max-w-4xl space-y-5">
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <span>Online Dhamma Academy</span>
            <span aria-hidden="true">·</span>
            <span>Theravada Canonical Studies</span>
            <span aria-hidden="true">·</span>
            <span>Sutta Central & Monastic Archives</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Learn Buddhism & Practical Dhamma Training Courses
          </h1>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
            Explore authentic training courses sourced from canonical Theravada scriptures and our global Sri Lankan community. Study the Four Noble Truths, master Vipassana meditation, practice with interactive timers, take quizzes, and create your own training courses.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreatorModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Training Course</span>
            </button>

            <button
              onClick={() => setShowImporterModal(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Import Online Curriculum</span>
            </button>

            <a
              href="https://suttacentral.net"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Explore SuttaCentral</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* User Progress KPI Ribbon */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
            <div>
              <span className="font-bold text-white text-base mr-1.5 tabular-nums">
                {totalEnrolled}
              </span>
              <span>Enrolled Courses</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div>
              <span className="font-bold text-amber-300 text-base mr-1.5 tabular-nums">
                {totalCompletedLessons}
              </span>
              <span>Lessons Completed</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div>
              <span className="font-bold text-emerald-400 text-base mr-1.5 tabular-nums">
                {totalCertificates}
              </span>
              <span>Verified Certificates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Study Deck Controls & Search Bar */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
            {[
              { id: "all", label: "All Courses" },
              { id: "canonical", label: "Canonical Curricula" },
              { id: "community", label: "Community Created" },
              { id: "my_learning", label: `My Learning (${totalEnrolled})` },
              { id: "my_created", label: "My Created Courses" },
              { id: "quick_articles", label: "Sutta Quick Readings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-amber-600 text-white font-bold shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachings, Vipassana, Suttas..."
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-neutral-100 text-xs">
          <span className="text-neutral-400 shrink-0 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            Filter:
          </span>

          {[
            "All",
            "Theravada Fundamentals",
            "Meditation & Sati",
            "Sutta Studies",
            "Abhidhamma",
            "Buddhist Ethics",
            "Pali & Chanting"
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors text-xs ${
                selectedCategory === cat
                  ? "bg-amber-100 text-amber-900 font-bold border border-amber-300"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Course Grid Area */}
      {activeTab !== "quick_articles" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {activeTab === "canonical" && "Authentic Canonical Curricula"}
                {activeTab === "community" && "Community-Authored Buddhist Courses"}
                {activeTab === "my_learning" && "Your Enrolled Training Courses"}
                {activeTab === "my_created" && "Courses You Have Created"}
                {activeTab === "all" && "All Buddhism Training Courses"}
              </h2>
              <p className="text-xs text-neutral-500">
                Showing {filteredCourses.length} structured courses with modules, lessons, and quizzes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreatorModal(true)}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Course</span>
              </button>
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isEnrolled = learningState.enrolledCourseIds.includes(course.id);
                const progress = getCourseProgress(course, learningState);
                const isSaved = learningState.savedCourseIds.includes(course.id);

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolled}
                    progressPercentage={progress.percentage}
                    isSaved={isSaved}
                    onSelectCourse={(c) => setActiveCourse(c)}
                    currentUserId={user?.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900">
                No courses found in this category
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try clearing your search query or create a new course using open syllabus templates.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowCreatorModal(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                >
                  Create Course Now
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Sutta Quick Readings Tab */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Essential Dhamma Readings & Sutta Excerpts
              </h2>
              <p className="text-xs text-neutral-500">
                Click any card to read foundational Pali canonical discourses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_LESSONS_DATA.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setSelectedQuickLesson(lesson)}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={lesson.img}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {lesson.duration}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {lesson.category}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-800 transition-colors mt-2 mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {lesson.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-medium">
                    <span className="text-neutral-400 font-serif italic text-[11px] truncate max-w-[150px]">
                      {lesson.suttaRef}
                    </span>
                    <span className="text-amber-700 font-bold group-hover:underline flex items-center gap-1">
                      Read Lesson <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Online Resource Spotlight: Theravada Sutta & Canonical e-Library */}
      <section className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-2xl border border-amber-200 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-700" />
              <h3 className="text-base font-bold text-neutral-900">
                Theravada Sutta & Canonical e-Library
              </h3>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
              Explore open Pali canonical texts, translations from the Tipitaka (Digha, Majjhima, Samyutta, Anguttara, Khuddaka), guided meditation manuals, and Theravada monastic chants with audio guides.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://suttacentral.net"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>SuttaCentral</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>

            <a
              href="https://suttacentral.net/kn/khp"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Canonical Chants</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearnBuddhism;
