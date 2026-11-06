import React, { useState } from "react";
import { 
  BookOpen, Clock, Award, Star, CheckCircle2, Bookmark, 
  ExternalLink, User, Sparkles, ChevronRight, Play
} from "lucide-react";
import { BuddhismCourse } from "../../types/buddhismCourse";
import { toggleSaveCourse } from "../../utils/buddhismCourseStorage";

interface CourseCardProps {
  key?: React.Key;
  course: BuddhismCourse;
  isEnrolled: boolean;
  progressPercentage: number;
  isSaved: boolean;
  onSelectCourse: (course: BuddhismCourse) => void;
  onToggleSave?: (courseId: string) => void;
  onEditCourse?: (course: BuddhismCourse) => void;
  currentUserId?: string;
}

export function CourseCard({
  course,
  isEnrolled,
  progressPercentage,
  isSaved,
  onSelectCourse,
  onToggleSave,
  onEditCourse,
  currentUserId
}: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [savedState, setSavedState] = useState(isSaved);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleSaveCourse(course.id);
    setSavedState(next);
    if (onToggleSave) onToggleSave(course.id);
  };

  const isCreator = currentUserId && course.creatorUserId === currentUserId;

  return (
    <div
      onClick={() => onSelectCourse(course)}
      className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Cover Image or Fallback */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          {!imageError && course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-700 via-amber-800 to-neutral-900 flex flex-col items-center justify-center p-6 text-white text-center">
              <BookOpen className="w-10 h-10 text-amber-200/80 mb-2" />
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">
                {course.category}
              </span>
              <p className="text-sm font-bold mt-1 line-clamp-1">{course.title}</p>
            </div>
          )}

          {/* Top Floating Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {course.source.isCanonicalCurriculum ? (
              <span className="pointer-events-auto text-[11px] font-semibold text-neutral-900 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 border border-neutral-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Canonical Curriculum
              </span>
            ) : course.isCommunityCreated ? (
              <span className="pointer-events-auto text-[11px] font-semibold text-neutral-900 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 border border-neutral-200/60">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Community Course
              </span>
            ) : <span />}

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={handleSaveClick}
                aria-label={savedState ? "Remove bookmark" : "Bookmark course"}
                className={`p-2 rounded-lg backdrop-blur-md transition-colors ${
                  savedState
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-black/40 text-white hover:bg-black/60"
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Bottom Duration Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <span className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md">
              {course.durationWeeks} Weeks · {course.estimatedHours} Hours
            </span>
            {isEnrolled && (
              <span className="bg-emerald-600/90 backdrop-blur-sm px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
            <span className="font-semibold text-amber-800">{course.category}</span>
            <span aria-hidden="true">·</span>
            <span>{course.level}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-neutral-700 font-medium">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {course.rating.toFixed(2)} ({course.reviewsCount})
            </span>
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-base text-neutral-900 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {course.desc}
          </p>

          {/* Instructor & Source Line */}
          <div className="pt-2 flex items-center gap-2.5 text-xs text-neutral-600">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-neutral-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                {course.instructor.name.charAt(0)}
              </div>
            )}
            <div className="truncate">
              <span className="font-semibold text-neutral-800 block truncate">
                {course.instructor.name}
              </span>
              <span className="text-[11px] text-neutral-400 block truncate">
                {course.instructor.affiliation || course.source.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Progress */}
      <div className="p-5 pt-0">
        {isEnrolled && (
          <div className="mb-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-500">Course Progress</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">
            {course.modules.length} Modules · {course.modules.reduce((a, m) => a + m.lessons.length, 0)} Lessons
          </span>

          <span className="font-bold text-amber-700 group-hover:text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
            {isEnrolled ? "Continue Learning" : "View Syllabus"}
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
