import { BuddhismCourse, UserLearningState, CourseCertificate } from "../types/buddhismCourse";
import { CANONICAL_PRIMARY_COURSES } from "../data/buddhismCoursesData";
import { addBuddhismCourse, deleteBuddhismCourseFromDb } from "../lib/firestoreService";

const COURSES_STORAGE_KEY = "lanka_buddhism_courses_v3";
const LEARNING_STATE_KEY = "lanka_user_learning_state_v3";

const DEFAULT_LEARNING_STATE: UserLearningState = {
  enrolledCourseIds: [],
  completedLessonIds: {},
  quizScores: {},
  lessonNotes: {},
  certificates: [],
  savedCourseIds: []
};

// Retrieve all courses (Built-in Canonical + User-Created)
export function getAllBuddhismCourses(): BuddhismCourse[] {
  try {
    const stored = localStorage.getItem(COURSES_STORAGE_KEY);
    if (stored) {
      const customCourses: BuddhismCourse[] = JSON.parse(stored);
      // Merge unique by ID, custom courses prioritized or appended
      const existingIds = new Set(customCourses.map(c => c.id));
      const builtins = CANONICAL_PRIMARY_COURSES.filter(b => !existingIds.has(b.id));
      return [...customCourses, ...builtins];
    }
  } catch (err) {
    console.error("Error reading courses from localStorage:", err);
  }
  return CANONICAL_PRIMARY_COURSES;
}

// Retrieve single course by ID
export function getBuddhismCourseById(courseId: string): BuddhismCourse | undefined {
  const all = getAllBuddhismCourses();
  return all.find(c => c.id === courseId);
}

// Save or update a course (user created or imported)
export function saveBuddhismCourse(course: BuddhismCourse): void {
  try {
    const all = getAllBuddhismCourses();
    const index = all.findIndex(c => c.id === course.id);
    let updated: BuddhismCourse[];
    if (index >= 0) {
      updated = [...all];
      updated[index] = { ...course, updatedAt: new Date().toISOString() };
    } else {
      updated = [course, ...all];
    }

    // Persist custom/modified courses
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("lanka_courses_updated"));
    // Asynchronously sync to Firestore
    addBuddhismCourse(course as any, course.id).catch(err => {
      console.warn("Firestore sync warning for course:", err);
    });
  } catch (err) {
    console.error("Error saving course to localStorage:", err);
  }
}

// Delete user-created course
export function deleteBuddhismCourse(courseId: string): boolean {
  try {
    const all = getAllBuddhismCourses();
    const filtered = all.filter(c => c.id !== courseId);
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("lanka_courses_updated"));
    deleteBuddhismCourseFromDb(courseId).catch(err => console.warn("Firestore delete course error:", err));
    return true;
  } catch (err) {
    console.error("Error deleting course:", err);
    return false;
  }
}

// User Learning State Management
export function getUserLearningState(): UserLearningState {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    if (stored) {
      return {
        ...DEFAULT_LEARNING_STATE,
        ...JSON.parse(stored)
      };
    }
  } catch (err) {
    console.error("Error reading learning state:", err);
  }
  return DEFAULT_LEARNING_STATE;
}

export function saveUserLearningState(state: Partial<UserLearningState>): UserLearningState {
  try {
    const current = getUserLearningState();
    const updated: UserLearningState = {
      ...current,
      ...state
    };
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("lanka_learning_updated"));
    return updated;
  } catch (err) {
    console.error("Error saving learning state:", err);
    return getUserLearningState();
  }
}

// Enroll / Unenroll
export function enrollInCourse(courseId: string): void {
  const current = getUserLearningState();
  if (!current.enrolledCourseIds.includes(courseId)) {
    const updated = [...current.enrolledCourseIds, courseId];
    saveUserLearningState({ enrolledCourseIds: updated });
  }
}

export function unenrollFromCourse(courseId: string): void {
  const current = getUserLearningState();
  const updated = current.enrolledCourseIds.filter(id => id !== courseId);
  saveUserLearningState({ enrolledCourseIds: updated });
}

// Toggle Lesson Completion
export function toggleLessonCompletion(courseId: string, lessonId: string): boolean {
  const current = getUserLearningState();
  const currentLessons = current.completedLessonIds[courseId] || [];
  let updatedLessons: string[];
  let isNowComplete: boolean;

  if (currentLessons.includes(lessonId)) {
    updatedLessons = currentLessons.filter(id => id !== lessonId);
    isNowComplete = false;
  } else {
    updatedLessons = [...currentLessons, lessonId];
    isNowComplete = true;
  }

  const newCompletedLessonIds = {
    ...current.completedLessonIds,
    [courseId]: updatedLessons
  };

  // If user wasn't enrolled, enroll them automatically
  let enrolled = current.enrolledCourseIds;
  if (!enrolled.includes(courseId)) {
    enrolled = [...enrolled, courseId];
  }

  saveUserLearningState({
    completedLessonIds: newCompletedLessonIds,
    enrolledCourseIds: enrolled
  });

  return isNowComplete;
}

// Record Quiz Score
export function recordQuizScore(
  courseId: string,
  moduleId: string,
  score: number,
  total: number
): void {
  const current = getUserLearningState();
  const passed = total > 0 && score / total >= 0.7; // 70% passing threshold
  const courseScores = current.quizScores[courseId] || {};

  const updatedCourseScores = {
    ...courseScores,
    [moduleId]: { score, total, passed }
  };

  saveUserLearningState({
    quizScores: {
      ...current.quizScores,
      [courseId]: updatedCourseScores
    }
  });
}

// Save Lesson Note
export function saveLessonNote(courseId: string, lessonId: string, noteText: string): void {
  const current = getUserLearningState();
  const courseNotes = current.lessonNotes[courseId] || {};
  const updatedCourseNotes = {
    ...courseNotes,
    [lessonId]: noteText
  };

  saveUserLearningState({
    lessonNotes: {
      ...current.lessonNotes,
      [courseId]: updatedCourseNotes
    }
  });
}

// Toggle Save / Bookmark
export function toggleSaveCourse(courseId: string): boolean {
  const current = getUserLearningState();
  const isSaved = current.savedCourseIds.includes(courseId);
  let updated: string[];
  if (isSaved) {
    updated = current.savedCourseIds.filter(id => id !== courseId);
  } else {
    updated = [...current.savedCourseIds, courseId];
  }
  saveUserLearningState({ savedCourseIds: updated });
  return !isSaved;
}

// Calculate Course Progress Percentage
export function getCourseProgress(course: BuddhismCourse, state: UserLearningState): {
  completedCount: number;
  totalLessons: number;
  percentage: number;
  isComplete: boolean;
} {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  if (totalLessons === 0) return { completedCount: 0, totalLessons: 0, percentage: 0, isComplete: false };

  const completed = state.completedLessonIds[course.id] || [];
  const completedCount = completed.length;
  const percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));
  const isComplete = percentage >= 100;

  return { completedCount, totalLessons, percentage, isComplete };
}

// Issue Certificate of Completion
export function issueCourseCertificate(
  course: BuddhismCourse,
  studentName: string,
  studentEmail: string
): CourseCertificate {
  const current = getUserLearningState();
  const existing = current.certificates.find(c => c.courseId === course.id);
  if (existing) return existing;

  const code = `DHAMMA-${course.id.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const cert: CourseCertificate = {
    id: `cert-${Date.now()}`,
    courseId: course.id,
    courseTitle: course.title,
    studentName: studentName || "Dhamma Student",
    studentEmail: studentEmail || "student@community.org",
    issuedDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    verificationCode: code,
    instructorName: course.instructor.name,
    curriculumSource: course.source.name,
    averageQuizScore: 95
  };

  saveUserLearningState({
    certificates: [cert, ...current.certificates]
  });

  return cert;
}

// Reset courses to factory defaults
export function resetCoursesToDefaults(): void {
  localStorage.removeItem(COURSES_STORAGE_KEY);
  localStorage.removeItem(LEARNING_STATE_KEY);
  window.dispatchEvent(new CustomEvent("lanka_courses_updated"));
  window.dispatchEvent(new CustomEvent("lanka_learning_updated"));
}
