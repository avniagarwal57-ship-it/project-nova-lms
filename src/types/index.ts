export type UserRole = 'learner' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  rankTitle?: string;
  xp: number;
  level: number;
  streakDays: number;
  streakFreezes: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  dailyGoalMinutesCompleted: number;
  themePreference?: 'light' | 'dark' | 'system';
  soundEnabled?: boolean;
  skillsMastered?: string[];
  activeWorldId?: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface LearningWorld {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  color: string;
  accentColor: string;
  gradient: string;
  icon: string;
  bannerImage: string;
  coursesCount: number;
  learnersCount: number;
  difficultyTier: string;
  skillsCount: number;
  featuredCourseId?: string;
}

export interface SkillNode {
  id: string;
  worldId: string;
  name: string;
  category: string;
  level: number;
  xpRequired: number;
  status: 'locked' | 'available' | 'in_progress' | 'mastered';
  prerequisites: string[];
  description: string;
  nextSkills: string[];
  icon: string;
  masteryPercentage: number;
  relatedCourseId?: string;
}

export interface SkillRadarItem {
  subject: string;
  value: number; // 0 - 100
  fullMark: number;
  growth: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'link' | 'slides';
  url: string;
  size?: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
}

export interface FlashcardDeck {
  id: string;
  lessonId: string;
  title: string;
  cards: Flashcard[];
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  prompt: string;
  rubric: string[];
  starterCode?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
  gradedBy?: string;
}

export type LessonType = 'video' | 'text' | 'quiz' | 'flashcards' | 'assignment' | 'quest' | 'code';

export interface CodeExercise {
  id: string;
  title: string;
  instructions: string;
  language: string;
  starterCode: string;
  solutionCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
    description: string;
  }[];
  hints: string[];
}

export interface VisualDiagram {
  id: string;
  title: string;
  description: string;
  nodes: {
    id: string;
    label: string;
    sublabel: string;
    color: string;
    icon?: string;
  }[];
  connections: {
    from: string;
    to: string;
    label?: string;
  }[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  type: LessonType;
  durationMinutes: number;
  xpReward: number;
  videoUrl?: string;
  transcript?: string;
  markdownContent?: string;
  quizId?: string;
  flashcardDeckId?: string;
  assignmentId?: string;
  codeExercise?: CodeExercise;
  visualDiagram?: VisualDiagram;
  resources?: Resource[];
  // 6 Quest Stages for Quest Lessons
  stages?: {
    stage1Concept?: string;
    stage2VisualDiagram?: VisualDiagram;
    stage3Content?: string;
    stage4Exercise?: CodeExercise;
    stage5QuizId?: string;
  };
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  worldId: string;
  worldTitle?: string;
  category: string;
  level: CourseLevel;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  durationMinutes: number;
  rating: number;
  reviewsCount: number;
  enrollmentsCount: number;
  thumbnail: string;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  published: boolean;
  featured?: boolean;
  xpRewardTotal?: number;
  badgeReward?: string;
  chapters: Chapter[];
  reviews?: CourseReview[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercentage: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastAccessedAt: string;
  certificateIssued?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'streak' | 'xp' | 'quizzes' | 'courses' | 'special' | 'skills';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goal: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
  type: 'lessons' | 'quiz' | 'minutes' | 'streak' | 'skill';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  worldId?: string;
  category: string;
  targetRole: string;
  coursesCount: number;
  durationHours: number;
  badgeIcon: string;
  courseIds: string[];
  skillsGained: string[];
}

export interface Note {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeToday: number;
  totalCourses: number;
  totalWorlds: number;
  totalEnrollments: number;
  platformCompletionRate: number;
  totalXpAwarded: number;
  weeklyActivity: { day: string; hours: number; xp: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  streakDays: number;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  isCurrentUser?: boolean;
  activeWorld?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  worldId: string;
  memberCount: number;
  banner: string;
  activeMission: string;
  joined?: boolean;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRank: string;
  content: string;
  badgeEarned?: string;
  courseTitle?: string;
  likes: number;
  likedByMe?: boolean;
  repliesCount: number;
  createdAt: string;
  tags: string[];
}
