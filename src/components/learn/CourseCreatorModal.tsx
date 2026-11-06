import React, { useState } from "react";
import { 
  X, Plus, Trash2, BookOpen, Clock, Sparkles, Check, 
  HelpCircle, Image as ImageIcon, ChevronRight, FileText, ArrowRight,
  Layers, ExternalLink
} from "lucide-react";
import { BuddhismCourse, CourseModule, CourseLesson, PaliTerm } from "../../types/buddhismCourse";
import { CANONICAL_QUICK_TEMPLATES } from "../../data/buddhismCoursesData";
import { saveBuddhismCourse } from "../../utils/buddhismCourseStorage";

interface CourseCreatorModalProps {
  onClose: () => void;
  onCourseCreated: (course: BuddhismCourse) => void;
  currentUserName: string;
  currentUserAvatar?: string;
}

const PRESET_IMAGES = [
  { label: "Golden Buddha & Bodhi Tree", url: "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=1200" },
  { label: "Tranquil Forest Meditation", url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200" },
  { label: "Ancient Palm Leaf Suttas", url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&q=80&w=1200" },
  { label: "Lotus & Temple Courtyard", url: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200" },
  { label: "Meditation Hall & Robes", url: "https://images.unsplash.com/photo-1616089308104-58276f5716bb?auto=format&fit=crop&q=80&w=1200" },
];

export function CourseCreatorModal({
  onClose,
  onCourseCreated,
  currentUserName,
  currentUserAvatar
}: CourseCreatorModalProps) {
  const [activeStep, setActiveStep] = useState<"details" | "curriculum" | "glossary">("details");

  // Step 1: Course Overview Details
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<BuddhismCourse["category"]>("Theravada Fundamentals");
  const [level, setLevel] = useState<BuddhismCourse["level"]>("All Levels");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [estimatedHours, setEstimatedHours] = useState(12);
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0].url);
  const [instructorName, setInstructorName] = useState(currentUserName || "Dhamma Instructor");
  const [instructorTitle, setInstructorTitle] = useState("Community Dhamma Teacher");
  const [affiliation, setAffiliation] = useState("Sri Lankan Buddhist Community Network");
  const [sourceName, setSourceName] = useState("Theravada Canonical Archive & Community Notes");
  const [sourceUrl, setSourceUrl] = useState("https://suttacentral.net");

  // Objectives and Prerequisites
  const [objectives, setObjectives] = useState<string[]>([
    "Understand the core canonical foundations in practical daily life",
    "Establish a consistent daily mindfulness meditation routine",
    "Reflect on cause, conditionality, and moral virtue (Sila)"
  ]);
  const [newObjective, setNewObjective] = useState("");

  // Step 2: Modules & Lessons
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: `mod-${Date.now()}-1`,
      moduleNumber: 1,
      title: "Module 1: Foundations of Daily Mindfulness",
      overview: "An introduction to conscious living and mindful breathing.",
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          title: "Lesson 1: The First Steps in Sitting Meditation",
          durationMinutes: 20,
          suttaReference: "Anapanasati Sutta (MN 118)",
          summary: "Learning how to anchor the wandering mind on the physical sensations of the natural breath.",
          contentSections: [
            {
              heading: "Establishing the Posture",
              text: "Begin by finding a comfortable sitting position where the spine is upright without being strained. Close your eyes and gently scan your body to release facial and shoulder tension.",
              bulletPoints: [
                "Sit on a cushion or chair with back straight",
                "Rest hands comfortably in the lap",
                "Keep mouth softly closed and breathe through the nose"
              ]
            }
          ],
          practicalExercise: {
            title: "10-Minute Daily Breath Observation",
            duration: "10 minutes",
            instructions: [
              "Bring awareness to the touch of air at the nostrils.",
              "Observe long breaths and short breaths without forcing.",
              "When thinking occurs, acknowledge it gently and return to the touch."
            ]
          }
        }
      ],
      quiz: [
        {
          id: `q-${Date.now()}-1`,
          question: "What is the primary anchor used in Anapanasati meditation?",
          options: [
            "A visual image of a candle flame",
            "The natural in-and-out breath at the nostrils",
            "A repeated loud verbal phrase",
            "Total physical movement"
          ],
          correctAnswerIndex: 1,
          explanation: "In Anapanasati, the natural breath serves as the constant anchor bringing the mind back into present reality."
        }
      ]
    }
  ]);

  // Step 3: Pali Glossary
  const [paliGlossary, setPaliGlossary] = useState<PaliTerm[]>([
    {
      term: "Sati",
      phonetic: "sah-ti",
      meaning: "Mindfulness, present-moment non-judgmental awareness",
      context: "The fundamental faculty developed through meditation."
    },
    {
      term: "Sila",
      phonetic: "see-luh",
      meaning: "Moral virtue, ethical conduct",
      context: "The indispensable ground for peaceful meditation."
    }
  ]);
  const [newTerm, setNewTerm] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  // Apply Canonical Template Preset
  const handleApplyTemplate = (tplId: string) => {
    const tpl = CANONICAL_QUICK_TEMPLATES.find((t) => t.templateId === tplId);
    if (!tpl) return;

    setTitle(tpl.title);
    setCategory(tpl.category);
    setLevel(tpl.level);
    setDurationWeeks(tpl.durationWeeks);
    setEstimatedHours(tpl.estimatedHours);
    setDesc(tpl.desc);
    setObjectives(tpl.objectives);

    // Generate modules from template
    const newMods: CourseModule[] = tpl.suggestedModules.map((sm, mIdx) => ({
      id: `mod-tpl-${Date.now()}-${mIdx}`,
      moduleNumber: mIdx + 1,
      title: sm.title,
      overview: `Study and meditation guidance for ${sm.title.toLowerCase()}.`,
      lessons: Array.from({ length: sm.lessonsCount }).map((_, lIdx) => ({
        id: `les-tpl-${Date.now()}-${mIdx}-${lIdx}`,
        title: `Lesson ${lIdx + 1}: ${sm.title} Practice Part ${lIdx + 1}`,
        durationMinutes: 20,
        suttaReference: "Tipitaka Sutta Reference",
        summary: `Canonical insights and reflection points for ${sm.title}.`,
        contentSections: [
          {
            heading: "Foundational Insight & Reflection",
            text: `In this lesson, we explore the core teachings of ${sm.title} based on canonical sutta passages and commentaries.`,
            bulletPoints: [
              "Observe the mind in the present moment",
              "Guard the senses and cultivate wholesome intentions",
              "Reflect on non-clinging and universal loving-kindness"
            ]
          }
        ],
        practicalExercise: {
          title: "Mindful Contemplation Session",
          duration: "15 minutes",
          instructions: [
            "Sit in quiet reflection on this teaching.",
            "Notice how craving and aversion arise in daily thoughts.",
            "Practice releasing tension on each exhalation."
          ]
        }
      })),
      quiz: [
        {
          id: `q-tpl-${Date.now()}-${mIdx}`,
          question: `What is the primary spiritual goal emphasized in ${sm.title}?`,
          options: [
            "Acquiring worldly wealth and fame",
            "Cultivating wisdom, mental tranquility, and ethical conduct",
            "Memorizing terms without practicing",
            "Isolating oneself permanently from society"
          ],
          correctAnswerIndex: 1,
          explanation: "Buddhist training always aims at the harmonious cultivation of Sila, Samadhi, and Panna."
        }
      ]
    }));

    setModules(newMods);
    setSourceName("Theravada Canonical Curriculum");
    alert(`Template "${tpl.title}" applied! You can now refine the modules and lessons.`);
  };

  // Add / Remove Objective
  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives([...objectives, newObjective.trim()]);
    setNewObjective("");
  };

  const handleRemoveObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  // Add / Remove Module
  const handleAddModule = () => {
    const nextNum = modules.length + 1;
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      moduleNumber: nextNum,
      title: `Module ${nextNum}: New Dhamma Topic`,
      overview: "Overview of teachings and practical exercises.",
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: "Lesson 1: Introduction",
          durationMinutes: 15,
          suttaReference: "Pali Canon Sutta",
          summary: "Summary of this lesson.",
          contentSections: [
            {
              heading: "Teaching Overview",
              text: "Write your lesson teaching content here with clear explanations.",
              bulletPoints: ["Key takeaway 1", "Key takeaway 2"]
            }
          ]
        }
      ]
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (mIdx: number) => {
    if (modules.length <= 1) {
      alert("A course must have at least one module.");
      return;
    }
    const updated = modules.filter((_, i) => i !== mIdx).map((m, idx) => ({
      ...m,
      moduleNumber: idx + 1
    }));
    setModules(updated);
  };

  // Add Lesson inside Module
  const handleAddLesson = (mIdx: number) => {
    const targetMod = modules[mIdx];
    const newLes: CourseLesson = {
      id: `les-${Date.now()}`,
      title: `Lesson ${targetMod.lessons.length + 1}: Practical Teaching`,
      durationMinutes: 20,
      suttaReference: "Sutta Reference",
      summary: "Key lesson summary.",
      contentSections: [
        {
          heading: "Core Principle",
          text: "Explain the Buddhist principle and its application to modern daily life.",
          bulletPoints: ["Point 1", "Point 2"]
        }
      ],
      practicalExercise: {
        title: "Mindful Practice Exercise",
        duration: "10 minutes",
        instructions: ["Sit quietly and observe present sensations."]
      }
    };

    const updated = [...modules];
    updated[mIdx] = {
      ...targetMod,
      lessons: [...targetMod.lessons, newLes]
    };
    setModules(updated);
  };

  const handleRemoveLesson = (mIdx: number, lIdx: number) => {
    const targetMod = modules[mIdx];
    if (targetMod.lessons.length <= 1) {
      alert("A module must have at least one lesson.");
      return;
    }
    const updated = [...modules];
    updated[mIdx] = {
      ...targetMod,
      lessons: targetMod.lessons.filter((_, i) => i !== lIdx)
    };
    setModules(updated);
  };

  // Add Pali Term
  const handleAddTerm = () => {
    if (!newTerm.trim() || !newMeaning.trim()) return;
    setPaliGlossary([
      ...paliGlossary,
      {
        term: newTerm.trim(),
        phonetic: newTerm.trim().toLowerCase(),
        meaning: newMeaning.trim(),
        context: "Used throughout the course lessons."
      }
    ]);
    setNewTerm("");
    setNewMeaning("");
  };

  // Save & Publish Course
  const handlePublishCourse = () => {
    if (!title.trim()) {
      alert("Please provide a course title.");
      return;
    }
    if (!desc.trim()) {
      alert("Please provide a course description.");
      return;
    }

    const newCourse: BuddhismCourse = {
      id: `course-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || `${category} training course for dedicated practitioners`,
      desc: desc.trim(),
      category,
      level,
      durationWeeks: Number(durationWeeks) || 4,
      estimatedHours: Number(estimatedHours) || 12,
      coverImage: coverImage || PRESET_IMAGES[0].url,
      instructor: {
        name: instructorName.trim() || currentUserName || "Community Teacher",
        title: instructorTitle.trim(),
        avatar: currentUserAvatar || "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=200",
        affiliation: affiliation.trim(),
        isCanonicalVerified: true
      },
      source: {
        name: sourceName.trim() || "Community Dhamma Curriculum",
        url: sourceUrl.trim() || "https://suttacentral.net",
        isCanonicalCurriculum: true
      },
      rating: 5.0,
      reviewsCount: 1,
      enrolledCount: 1,
      objectives: objectives.filter((o) => o.trim().length > 0),
      prerequisites: ["Open heart and sincere commitment to practice"],
      modules,
      paliGlossary,
      creatorUserId: "damika-user",
      isCommunityCreated: true,
      createdAt: new Date().toISOString()
    };

    saveBuddhismCourse(newCourse);
    onCourseCreated(newCourse);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Community Dhamma Academy
            </span>
            <h2 className="text-xl font-bold text-neutral-900">
              Create New Buddhist Training Course
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canonical Quick Syllabi Templates Bar */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-amber-900">
              Verified Canonical Syllabi:
            </span>
            <span className="text-amber-800 hidden sm:inline">
              Pre-load canonical modules with 1 click:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {CANONICAL_QUICK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.templateId}
                type="button"
                onClick={() => handleApplyTemplate(tpl.templateId)}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-medium text-[11px] transition-colors shadow-2xs"
              >
                + {tpl.title.split(":")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-6 pt-3 flex border-b border-neutral-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveStep("details")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === "details"
                ? "border-amber-600 text-amber-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>1. Course Details & Cover</span>
          </button>

          <button
            onClick={() => setActiveStep("curriculum")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === "curriculum"
                ? "border-amber-600 text-amber-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>2. Modules & Lessons ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveStep("glossary")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === "glossary"
                ? "border-amber-600 text-amber-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>3. Pali Terms & Sources</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeStep === "details" && (
            <div className="space-y-5">
              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Foundations of Buddhist Ethics & Sila for Daily Life"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  Subtitle / Short Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g., A 4-week step-by-step masterclass exploring right speech, action, and right livelihood"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Dhamma Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BuddhismCourse["category"])}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Theravada Fundamentals">Theravada Fundamentals</option>
                    <option value="Meditation & Sati">Meditation & Sati (Mindfulness)</option>
                    <option value="Sutta Studies">Sutta Studies (Canonical Discourses)</option>
                    <option value="Abhidhamma">Abhidhamma (Psychology of Consciousness)</option>
                    <option value="Buddhist Ethics">Buddhist Ethics & Family Harmony</option>
                    <option value="Pali & Chanting">Pali & Chanting (Parittas)</option>
                    <option value="Youth & Family">Youth & Family Education</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as BuddhismCourse["level"])}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All Levels">All Levels (Open to Beginners & Experienced)</option>
                    <option value="Beginner">Beginner (Foundations & Basics)</option>
                    <option value="Intermediate">Intermediate (Pali Discourse Studies)</option>
                    <option value="Advanced">Advanced (Abhidhamma & Deep Meditation)</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Course Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800">
                    Estimated Total Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  Course Overview & Description *
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detail what students will discover, canonical background, and how this training deepens spiritual peace..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                />
              </div>

              {/* Cover Image Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800">
                  Cover Image
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(img.url)}
                      className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                        coverImage === img.url ? "border-amber-600 scale-[1.02]" : "border-neutral-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] font-medium px-1 rounded truncate">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste a custom image URL..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              {/* Objectives List */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-800">
                  Learning Objectives
                </label>
                <div className="space-y-1.5">
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold text-xs">•</span>
                      <span className="flex-1 text-xs text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        {obj}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Add another learning objective..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddObjective();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddObjective}
                      className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === "curriculum" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Syllabus Modules & Lessons
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Structure the course into progressive modules and detailed lessons.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-5">
                {modules.map((mod, mIdx) => (
                  <div
                    key={mod.id}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Module {mod.moduleNumber}
                        </span>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[mIdx].title = e.target.value;
                            setModules(updated);
                          }}
                          className="w-full font-bold text-sm bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(mIdx)}
                        className="text-neutral-400 hover:text-rose-600 p-1.5 self-end"
                        title="Remove Module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lessons under this module */}
                    <div className="space-y-3 pt-2 pl-2 sm:pl-4 border-l-2 border-amber-300">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-700">
                          Lessons in this Module ({mod.lessons.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddLesson(mIdx)}
                          className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                      </div>

                      {mod.lessons.map((les, lIdx) => (
                        <div
                          key={les.id}
                          className="bg-white border border-neutral-200 rounded-lg p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].title = e.target.value;
                                setModules(updated);
                              }}
                              className="font-semibold text-neutral-900 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 flex-1"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-neutral-400">Duration:</span>
                              <input
                                type="number"
                                min={5}
                                max={120}
                                value={les.durationMinutes}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[mIdx].lessons[lIdx].durationMinutes = Number(e.target.value);
                                  setModules(updated);
                                }}
                                className="w-14 px-1.5 py-0.5 text-center bg-neutral-50 border border-neutral-200 rounded"
                              />
                              <span className="text-[10px] text-neutral-400">mins</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLesson(mIdx, lIdx)}
                              className="text-neutral-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={les.suttaReference || ""}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].suttaReference = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="Sutta reference (e.g. SN 56.11)"
                              className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-[11px]"
                            />
                            <input
                              type="text"
                              value={les.summary}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mIdx].lessons[lIdx].summary = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="Lesson core takeaway summary"
                              className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === "glossary" && (
            <div className="space-y-6">
              {/* Pali Glossary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Pali Terms & Canonical Glossary
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Add key Pali terminology so students can learn canonical definitions.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {paliGlossary.map((term, tIdx) => (
                    <div
                      key={tIdx}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-amber-900 mr-2">
                          {term.term}
                        </span>
                        <span className="text-neutral-600">
                          {term.meaning}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaliGlossary(paliGlossary.filter((_, i) => i !== tIdx))}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <input
                      type="text"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="Pali Term (e.g. Sati)"
                      className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      placeholder="Meaning (e.g. Mindfulness)"
                      className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg sm:col-span-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddTerm}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
                    >
                      + Add Term
                    </button>
                  </div>
                </div>
              </div>

              {/* Source Attribution */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-900">
                  Primary Source & Canonical Attribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600">
                      Curriculum / Archive Name
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g. Theravada Sutta Pitaka or Sri Lanka Monastic Academy"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600">
                      Reference Website URL
                    </label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://suttacentral.net/..."
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div>
            {activeStep !== "details" && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === "curriculum") setActiveStep("details");
                  if (activeStep === "glossary") setActiveStep("curriculum");
                }}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              >
                &larr; Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeStep !== "glossary" ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === "details") setActiveStep("curriculum");
                  else if (activeStep === "curriculum") setActiveStep("glossary");
                }}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishCourse}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Publish Training Course</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
