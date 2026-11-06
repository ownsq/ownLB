import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, CheckCircle2, Circle, BookOpen, Clock, Play, Pause, 
  RotateCcw, Sparkles, Award, FileText, Share2, ExternalLink, 
  ChevronRight, ChevronDown, Check, HelpCircle, Volume2, Save,
  Maximize2, Minimize2, Eye
} from "lucide-react";
import { BuddhismCourse, CourseLesson, CourseModule } from "../../types/buddhismCourse";
import { 
  getUserLearningState, 
  toggleLessonCompletion, 
  recordQuizScore, 
  saveLessonNote, 
  getCourseProgress, 
  enrollInCourse,
  issueCourseCertificate
} from "../../utils/buddhismCourseStorage";
import { CourseCertificateModal } from "./CourseCertificateModal";

interface CoursePlayerProps {
  course: BuddhismCourse;
  onBack: () => void;
  studentName?: string;
  studentEmail?: string;
}

export function CoursePlayer({
  course,
  onBack,
  studentName = "Dhamma Student",
  studentEmail = "student@community.org"
}: CoursePlayerProps) {
  const [learningState, setLearningState] = useState(getUserLearningState);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Meditation Timer state
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(600);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Study note state
  const [noteText, setNoteText] = useState("");

  const activeModule: CourseModule | undefined = course.modules[activeModuleIndex];
  const activeLesson: CourseLesson | undefined = activeModule?.lessons[activeLessonIndex];

  // Refresh user learning state
  const refreshState = () => {
    setLearningState(getUserLearningState());
  };

  useEffect(() => {
    // Ensure enrolled
    enrollInCourse(course.id);
    refreshState();

    const handleUpdate = () => refreshState();
    window.addEventListener("lanka_learning_updated", handleUpdate);
    return () => window.removeEventListener("lanka_learning_updated", handleUpdate);
  }, [course.id]);

  // Load existing note when lesson changes
  useEffect(() => {
    if (activeLesson) {
      const savedNotes = learningState.lessonNotes[course.id] || {};
      setNoteText(savedNotes[activeLesson.id] || "");
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setIsQuizMode(false);
    }
  }, [activeLesson?.id, course.id]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playBellChime();
            showToast("Mindfulness session complete. Sadhu!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Sound chime simulator via Web Audio API
  const playBellChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz tranquil frequency
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3);
    } catch {
      // AudioContext unavailable or suppressed
    }
  };

  const progress = getCourseProgress(course, learningState);
  const completedLessonsForCourse = learningState.completedLessonIds[course.id] || [];
  const isCurrentLessonComplete = activeLesson ? completedLessonsForCourse.includes(activeLesson.id) : false;

  const handleToggleCurrentLesson = () => {
    if (!activeLesson) return;
    const nowDone = toggleLessonCompletion(course.id, activeLesson.id);
    refreshState();
    showToast(nowDone ? "Lesson completed! Sadhu!" : "Marked as incomplete");
  };

  const handleSaveNote = () => {
    if (!activeLesson) return;
    saveLessonNote(course.id, activeLesson.id, noteText);
    showToast("Study note saved!");
  };

  const handleNextLesson = () => {
    if (!activeModule) return;
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else if (activeModule.quiz && activeModule.quiz.length > 0 && !isQuizMode) {
      setIsQuizMode(true);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonIndex(0);
      setIsQuizMode(false);
    } else {
      showToast("You have reached the end of the course syllabus!");
    }
  };

  const handlePrevLesson = () => {
    if (isQuizMode) {
      setIsQuizMode(false);
      return;
    }
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    } else if (activeModuleIndex > 0) {
      const prevMod = course.modules[activeModuleIndex - 1];
      setActiveModuleIndex(activeModuleIndex - 1);
      setActiveLessonIndex(prevMod.lessons.length - 1);
      setIsQuizMode(false);
    }
  };

  const handleQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIndex]: optionIndex
    });
  };

  const handleSubmitQuiz = () => {
    if (!activeModule?.quiz) return;
    let score = 0;
    activeModule.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    recordQuizScore(course.id, activeModule.id, score, activeModule.quiz.length);
    setQuizSubmitted(true);
    refreshState();
    playBellChime();
    showToast(`Quiz completed: ${score} / ${activeModule.quiz.length} correct!`);
  };

  const handleClaimCertificate = () => {
    issueCourseCertificate(course, studentName, studentEmail);
    refreshState();
    setShowCertificateModal(true);
  };

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-sm font-medium border border-neutral-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CourseCertificateModal
          course={course}
          studentName={studentName}
          studentEmail={studentEmail}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Top Learning Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Courses Directory</span>
          </button>

          <div className="h-4 w-px bg-neutral-200 shrink-0" />

          <div className="truncate min-w-0">
            <h1 className="text-sm font-bold text-neutral-900 truncate">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 truncate">
              <span>{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.instructor.name}</span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Course Progress Bar */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-neutral-500">Progress:</span>
            <div className="w-24 bg-neutral-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="font-bold text-emerald-700 tabular-nums">
              {progress.percentage}%
            </span>
          </div>

          {progress.isComplete && (
            <button
              onClick={handleClaimCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          )}

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Study Deck */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Left Curriculum Sidebar (hidden in full focus mode on small screens) */}
        {!isFocusMode && (
          <aside className="w-full lg:w-80 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col h-[calc(100vh-57px)] sticky top-[57px] overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                  Course Curriculum
                </span>
                <span className="text-neutral-500 tabular-nums">
                  {progress.completedCount} / {progress.totalLessons} Completed
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Modules Tree */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {course.modules.map((mod, mIdx) => {
                const isModActive = activeModuleIndex === mIdx;
                const quizScore = learningState.quizScores[course.id]?.[mod.id];

                return (
                  <div key={mod.id} className="rounded-xl border border-neutral-200/80 overflow-hidden">
                    <button
                      onClick={() => {
                        setActiveModuleIndex(mIdx);
                        setActiveLessonIndex(0);
                        setIsQuizMode(false);
                      }}
                      className={`w-full p-3 text-left flex items-start justify-between gap-2 transition-colors ${
                        isModActive ? "bg-amber-50/70 border-b border-amber-200/50" : "bg-neutral-50 hover:bg-neutral-100"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                          Module {mod.moduleNumber}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 mt-0.5 leading-snug">
                          {mod.title}
                        </h4>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                          isModActive ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Lessons list under active module */}
                    {isModActive && (
                      <div className="p-1 space-y-0.5 bg-white">
                        {mod.lessons.map((les, lIdx) => {
                          const isCurrent = activeLessonIndex === lIdx && !isQuizMode;
                          const isDone = completedLessonsForCourse.includes(les.id);

                          return (
                            <button
                              key={les.id}
                              onClick={() => {
                                setActiveLessonIndex(lIdx);
                                setIsQuizMode(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                                isCurrent
                                  ? "bg-amber-100/70 font-semibold text-neutral-900"
                                  : "text-neutral-600 hover:bg-neutral-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">
                                {les.durationMinutes}m
                              </span>
                            </button>
                          );
                        })}

                        {/* Module Quiz Button if present */}
                        {mod.quiz && mod.quiz.length > 0 && (
                          <button
                            onClick={() => setIsQuizMode(true)}
                            className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors mt-1 border-t border-neutral-100 ${
                              isQuizMode
                                ? "bg-amber-600 text-white font-bold"
                                : "text-amber-800 hover:bg-amber-50 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Module Knowledge Check</span>
                            </div>
                            {quizScore && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isQuizMode ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 font-bold"
                              }`}>
                                {quizScore.score}/{quizScore.total}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Canonical Reference footer */}
            <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between">
              <span className="truncate">{course.source.name}</span>
              <a
                href={course.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Sutta Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </aside>
        )}

        {/* Center Reader Deck */}
        <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {!isQuizMode && activeLesson ? (
            <div className="space-y-6">
              {/* Lesson Top Bar & Typography Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    <span className="font-semibold text-amber-800">
                      Module {activeModule?.moduleNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Lesson {activeLessonIndex + 1} of {activeModule?.lessons.length}</span>
                    {activeLesson.suttaReference && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-serif italic text-neutral-600">
                          {activeLesson.suttaReference}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Reader Tools */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setTextSize("sm")}
                      className={`px-2 py-1 rounded ${textSize === "sm" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500"}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setTextSize("base")}
                      className={`px-2 py-1 rounded ${textSize === "base" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500"}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setTextSize("lg")}
                      className={`px-2 py-1 rounded ${textSize === "lg" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500"}`}
                    >
                      A+
                    </button>
                  </div>

                  <button
                    onClick={handleToggleCurrentLesson}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isCurrentLessonComplete
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-neutral-900 hover:bg-neutral-800 text-white"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCurrentLessonComplete ? "Completed ✓" : "Mark Complete"}</span>
                  </button>
                </div>
              </div>

              {/* Lesson Summary Callout */}
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl text-neutral-800 text-sm leading-relaxed">
                <span className="font-bold text-amber-900 block mb-1 text-xs uppercase tracking-wider">
                  Core Lesson Takeaway
                </span>
                {activeLesson.summary}
              </div>

              {/* Lesson Main Content Sections */}
              <div className={`space-y-6 text-neutral-800 leading-relaxed ${
                textSize === "sm" ? "text-sm" : textSize === "lg" ? "text-lg" : "text-base"
              }`}>
                {activeLesson.contentSections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h3 className="font-bold text-xl text-neutral-900">
                      {sec.heading}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                      {sec.text}
                    </p>

                    {sec.quote && (
                      <blockquote className="my-4 p-4 bg-neutral-100 rounded-xl border-l-4 border-amber-600 font-serif italic text-neutral-800 text-sm">
                        "{sec.quote.text}"
                        <footer className="mt-1 text-xs font-sans font-semibold text-neutral-500 not-italic">
                          — {sec.quote.source}
                        </footer>
                      </blockquote>
                    )}

                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1.5 text-neutral-700 text-sm">
                        {sec.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Practical Meditation / Bhavana Session Widget */}
              {activeLesson.practicalExercise && (
                <div className="mt-8 bg-neutral-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-base text-white">
                        {activeLesson.practicalExercise.title}
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-amber-300">
                      Guided Practice · {activeLesson.practicalExercise.duration}
                    </span>
                  </div>

                  <ul className="space-y-2 text-neutral-300 text-xs sm:text-sm pl-4 list-disc">
                    {activeLesson.practicalExercise.instructions.map((inst, iIdx) => (
                      <li key={iIdx}>{inst}</li>
                    ))}
                  </ul>

                  {/* Meditation Timer Deck */}
                  <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold tracking-wider text-amber-400 tabular-nums">
                        {formatTime(timerSeconds)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {[300, 600, 900].map((durationSecs) => (
                          <button
                            key={durationSecs}
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerSeconds(durationSecs);
                              setInitialTimerSeconds(durationSecs);
                            }}
                            className={`px-2 py-1 rounded text-[11px] ${
                              initialTimerSeconds === durationSecs
                                ? "bg-amber-600 text-white font-bold"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                          >
                            {durationSecs / 60}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isTimerRunning ? "Pause Timer" : "Start Mindfulness"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(initialTimerSeconds);
                        }}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={playBellChime}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl"
                        title="Sound Dhamma Bell Chime"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Study Notes Box */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Your Personal Reflections & Study Notes
                    </h4>
                  </div>
                  <button
                    onClick={handleSaveNote}
                    className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notes
                  </button>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record your insights, reflections on Anicca, or questions to ask the venerable Theros..."
                  rows={3}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Bottom Pagination & Navigation */}
              <div className="pt-6 border-t border-neutral-200 flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Previous Lesson
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleCurrentLesson}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isCurrentLessonComplete
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isCurrentLessonComplete ? "Lesson Done ✓" : "Mark as Done"}
                  </button>

                  <button
                    onClick={handleNextLesson}
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : isQuizMode && activeModule?.quiz ? (
            /* Module Knowledge Check Deck */
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Module {activeModule.moduleNumber} Assessment
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 mt-1">
                  Knowledge Check & Sutta Understanding
                </h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Review the essential teachings covered in this module before proceeding to the next.
                </p>
              </div>

              <div className="space-y-6">
                {activeModule.quiz.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const isCorrect = selected === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4"
                    >
                      <h4 className="font-bold text-base text-neutral-900">
                        {qIdx + 1}. {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selected === oIdx;
                          let btnStyle = "border-neutral-200 hover:bg-neutral-50 text-neutral-700";

                          if (quizSubmitted) {
                            if (oIdx === q.correctAnswerIndex) {
                              btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                            } else if (isOptionSelected) {
                              btnStyle = "bg-rose-50 border-rose-300 text-rose-900 line-through";
                            }
                          } else if (isOptionSelected) {
                            btnStyle = "bg-amber-50 border-amber-400 text-amber-900 font-semibold";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswer(qIdx, oIdx)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && oIdx === q.correctAnswerIndex && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                          isCorrect ? "bg-emerald-50/80 text-emerald-900" : "bg-neutral-100 text-neutral-800"
                        }`}>
                          <span className="font-bold block mb-0.5">
                            {isCorrect ? "Correct! Sadhu!" : "Canonical Explanation:"}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setIsQuizMode(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-100"
                >
                  &larr; Back to Lessons
                </button>

                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeModule.quiz.length}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                  >
                    Submit Quiz & Check Answers
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-50"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={handleNextLesson}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Proceed to Next Module</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900">Select a lesson to begin</h3>
              <p className="text-xs text-neutral-500 mt-1">Use the curriculum menu on the left to navigate lessons.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
