export interface CourseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  suttaReference?: string;
  summary: string;
  contentSections: {
    heading: string;
    text: string;
    bulletPoints?: string[];
    quote?: {
      text: string;
      source: string;
    };
  }[];
  practicalExercise?: {
    title: string;
    duration: string;
    instructions: string[];
  };
  audioChantUrl?: string;
  canonicalResourceUrl?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  overview: string;
  lessons: CourseLesson[];
  quiz?: CourseQuizQuestion[];
}

export interface PaliTerm {
  term: string;
  phonetic: string;
  meaning: string;
  context: string;
}

export interface BuddhismCourse {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  category: 
    | "Theravada Fundamentals" 
    | "Meditation & Sati" 
    | "Sutta Studies" 
    | "Abhidhamma" 
    | "Buddhist Ethics" 
    | "Pali & Chanting" 
    | "Youth & Family";
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  durationWeeks: number;
  estimatedHours: number;
  coverImage: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    affiliation?: string;
    isCanonicalVerified?: boolean;
  };
  source: {
    name: string;
    url: string;
    license?: string;
    isCanonicalCurriculum: boolean;
  };
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  objectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  paliGlossary: PaliTerm[];
  creatorUserId?: string;
  isCommunityCreated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  issuedDate: string;
  verificationCode: string;
  instructorName: string;
  curriculumSource: string;
  averageQuizScore: number;
}

export interface UserLearningState {
  enrolledCourseIds: string[];
  completedLessonIds: Record<string, string[]>; // courseId -> lessonIds[]
  quizScores: Record<string, Record<string, { score: number; total: number; passed: boolean }>>; // courseId -> moduleId -> score
  lessonNotes: Record<string, Record<string, string>>; // courseId -> lessonId -> noteText
  certificates: CourseCertificate[];
  savedCourseIds: string[];
}
