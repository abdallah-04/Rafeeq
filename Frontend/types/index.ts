// ── LANGUAGE / LOCALE ────────────────────────
export type Language = 'en' | 'ar';
 
export type UserRole = 'parent' | 'teacher' | 'school';
 
export type Gender = 'male' | 'female';
 
// ── DIFFICULTY / SPECIAL NEEDS ───────────────
export type SpecialNeedType =
  | 'ADD'       // Attention Deficit Disorder
  | 'ADHD'      // Attention Deficit Hyperactivity Disorder
  | 'IFD'       // Intellectual and Functional Disability
  | 'ASD'       // Autism Spectrum Disorder
  | 'DYS'       // Dyslexia
  | 'OTHER';
 
export type LearningLevel = 1 | 2 | 3 | 4 | 5;
 
// ── USER (BASE) ──────────────────────────────
export interface User {
  id:          string;
  name:        string;
  nameAr:      string;
  phone:       string;         // +962XXXXXXXX
  nationalId:  string;         // 10-digit Jordanian NID
  role:        UserRole;
  avatarUrl?:  string;
  language:    Language;
  createdAt:   string;         // ISO date string
}
 
// ── PARENT ───────────────────────────────────
export interface Parent extends User {
  role:       'parent';
  children:   Child[];
}
 
// ── TEACHER ──────────────────────────────────
export interface Teacher extends User {
  role:         'teacher';
  schoolId:     string;
  grade:        string;        // e.g. "Grade 2"
  section:      string;        // e.g. "Section A"
  students:     Child[];
  teacherNumber: string;
}
 
// ── SCHOOL ───────────────────────────────────
export interface School {
  id:           string;
  name:         string;
  nameAr:       string;
  schoolId:     string;
  advisorName:  string;
  advisorNationalId: string;
  phone:        string;
  location:     string;        // e.g. "Amman"
  description?: string;
  teachers:     Teacher[];
  logoUrl?:     string;
  createdAt:    string;
}
 
// ── CHILD ────────────────────────────────────
export interface Child {
  id:             string;
  name:           string;
  nameAr:         string;
  nationalId:     string;
  dateOfBirth:    string;      // ISO date string
  age:            number;
  gender:         Gender;
  avatarUrl?:     string;
  specialNeed:    SpecialNeedType;
  level:          LearningLevel;
  schoolId:       string;
  schoolName:     string;
  teacherId?:     string;
  parentId:       string;
  progress:       Progress;
  streakDays:     number;
  achievements:   number;
}
 
// ── PROGRESS ─────────────────────────────────
export interface Progress {
  overall:          number;    // 0–100
  focusAttention:   number;
  mathematics:      number;
  socialSkills:     number;
  communication:    number;
  motorSkills:      number;
  tasksThisWeek:    number;
  totalTasks:       number;
  quizzesCompleted: number;
  totalQuizzes:     number;
  activitiesDone:   number;
  totalActivities:  number;
  updatedAt:        string;
}
 
// ── TASK ─────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
 
export interface Task {
  id:          string;
  title:       string;
  titleAr:     string;
  description: string;
  descriptionAr: string;
  status:      TaskStatus;
  childId:     string;
  dueDate?:    string;
  completedAt?: string;
  dayNumber?:  number;         // Learning tree day (1–7)
}
 
// ── HOMEWORK ─────────────────────────────────
export type HomeworkStatus = 'not_submitted' | 'submitted' | 'graded';
 
export interface Homework {
  id:           string;
  title:        string;
  titleAr:      string;
  subject:      string;
  subjectAr:    string;
  description:  string;
  dueDate:      string;
  assignedDate: string;
  status:       HomeworkStatus;
  grade?:       number;
  teacherId:    string;
  classId:      string;
  attachments?: Attachment[];
}
 
// ── REPORT ───────────────────────────────────
export type ReportStatus = 'unread' | 'read';
 
export interface Report {
  id:          string;
  title:       string;
  titleAr:     string;
  body:        string;
  bodyAr:      string;
  authorName:  string;
  authorAvatar?: string;
  status:      ReportStatus;
  createdAt:   string;
  childId:     string;
}
 
// ── NOTE ─────────────────────────────────────
export interface Note {
  id:          string;
  title:       string;
  titleAr:     string;
  body:        string;
  bodyAr:      string;
  authorName:  string;
  createdAt:   string;
  childId:     string;
  teacherId:   string;
}
 
// ── EXAM ─────────────────────────────────────
export type ExamStatus = 'upcoming' | 'completed' | 'missed';
 
export interface Exam {
  id:          string;
  title:       string;
  titleAr:     string;
  subject:     string;
  subjectAr:   string;
  date:        string;
  duration:    number;         // minutes
  status:      ExamStatus;
  score?:      Score;
  classId:     string;
}
 
// ── QUESTION ─────────────────────────────────
export type QuestionType = 'multiple_choice' | 'true_false' | 'match' | 'fill_blank';
 
export interface Question {
  id:            string;
  quizId:        string;
  text:          string;
  textAr:        string;
  type:          QuestionType;
  options?:      string[];
  optionsAr?:    string[];
  correctAnswer: string;
  imageUrl?:     string;
  order:         number;
}
 
// ── SCORE ────────────────────────────────────
export interface Score {
  childId:     string;
  quizId?:     string;
  examId?:     string;
  correct:     number;
  total:       number;
  percentage:  number;         // 0–100
  completedAt: string;
}
 
// ── QUIZ ─────────────────────────────────────
export type QuizStatus = 'new' | 'in_progress' | 'completed' | 'later';
 
export interface Quiz {
  id:           string;
  title:        string;
  titleAr:      string;
  subject:      string;
  subjectAr:    string;
  level:        LearningLevel;
  questionCount: number;
  durationMins: number;
  status:       QuizStatus;
  score?:       Score;
  questions:    Question[];
  assignedDate: string;
  dueDate:      string;
  teacherId:    string;
  classId:      string;
}
 
// ── ARTICLE ──────────────────────────────────
export type ArticleCategory =
  | 'parenting'
  | 'special_needs'
  | 'learning'
  | 'speech'
  | 'behavioral'
  | 'motor';
 
export interface Article {
  id:          string;
  title:       string;
  titleAr:     string;
  body:        string;
  bodyAr:      string;
  category:    ArticleCategory;
  readTimeMins: number;
  viewCount:   number;
  likeCount:   number;
  isSaved:     boolean;
  authorName:  string;
  coverUrl?:   string;
  publishedAt: string;
}
 
// ── SPECIALIST ───────────────────────────────
export type SpecialistType = 'speech_therapist' | 'occupational_therapist' | 'special_ed';
 
export interface Specialist {
  id:           string;
  name:         string;
  nameAr:       string;
  type:         SpecialistType;
  schoolId:     string;
  avatarUrl?:   string;
  qualification: string;
}
 
// ── CHAT MESSAGE ─────────────────────────────
export type MessageRole = 'user' | 'assistant';
export type AttachmentType = 'image' | 'file' | 'voice' | 'camera';
 
export interface Attachment {
  id:       string;
  type:     AttachmentType;
  uri:      string;
  name?:    string;
  mimeType?: string;
  size?:    number;
}
 
export interface ChatMessage {
  id:          string;
  role:        MessageRole;
  content:     string;
  attachments?: Attachment[];
  timestamp:   string;
  isTyping?:   boolean;        // for typing indicator
}
 
// ── NOTIFICATION ─────────────────────────────
export type NotificationType =
  | 'homework'
  | 'quiz'
  | 'report'
  | 'note'
  | 'announcement'
  | 'achievement';
 
export interface Notification {
  id:        string;
  type:      NotificationType;
  title:     string;
  titleAr:   string;
  body:      string;
  bodyAr:    string;
  isRead:    boolean;
  createdAt: string;
  targetId?: string;           // id of related entity
}
 
// ── CALENDAR DAY ─────────────────────────────
export interface CalendarDay {
  date:     string;            // ISO date
  label:    string;            // e.g. "Mon"
  dayNum:   number;            // e.g. 10
  isToday:  boolean;
  hasEvent: boolean;
}
 
// ── GRADE ────────────────────────────────────
export interface SubjectGrade {
  subject:   string;
  subjectAr: string;
  score:     number;
  maxScore:  number;
  color:     string;           // hex
}
 
// ── LEARNING TREE NODE ───────────────────────
export type TreeNodeStatus = 'completed' | 'current' | 'upcoming' | 'locked';
 
export interface TreeNode {
  day:      number;            // 1–7 (or more)
  title:    string;
  titleAr:  string;
  status:   TreeNodeStatus;
  tasks:    Task[];
}
 
// ── AUTH STATE (for Zustand) ─────────────────
export interface AuthState {
  role:             UserRole | null;
  user:             User | null;
  token:            string | null;
  selectedChild:    Child | null;
  language:         Language;
  isRTL:            boolean;
  isAuthenticated:  boolean;
  languageSelected: boolean;
  isLoading:        boolean;
  error:            string | null;
}