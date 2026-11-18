// services/api.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  MOCK API — this branch is disconnected from the backend.
//
//  Every function keeps the same name and signature as the real API client, but
//  reads/writes a local mock database (services/mock/db.ts) that is persisted in
//  AsyncStorage. No network requests are made.
//
//  Demo accounts (password for all: 123456)
//    School  / المدرسة  : 1111111111
//    Teacher / المعلم   : 2222222222
//    Parent  / الأهل    : 4444444444
//
//  Children that can be linked from the parent "add child" flow:
//    5000000003 (pending placement exam), 5000000004 (active, has a tree)
//
//  OTP codes: any code is accepted.
//  To restore the seed data call resetMockDb() from services/mock/db.ts.
// ─────────────────────────────────────────────────────────────────────────────

import i18n from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import {
  generateTree,
  getDb,
  mockArticles,
  nextId,
  PLACEMENT_QUESTIONS,
  saveDb,
  type Loc,
  type MockDb,
  type MockQuiz,
  type MockUser,
} from './mock/db';

// ── Core helpers ──────────────────────────────────────────────────────────────

const NETWORK_DELAY_MS = 250;
const TOKEN_PREFIX = 'mock-token-';
const REFRESH_PREFIX = 'mock-refresh-';

const delay = (ms = NETWORK_DELAY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isArabic(): boolean {
  return (i18n.language ?? 'en').startsWith('ar');
}

/** Pick the user's language: merge the Arabic override over the English base. */
function localize<T extends { ar?: object }>(entity: T): Omit<T, 'ar'> {
  const { ar, ...base } = entity;
  return (isArabic() && ar ? { ...base, ...ar } : base) as Omit<T, 'ar'>;
}

const localizeAll = <T extends { ar?: object }>(list: T[]) => list.map((item) => localize(item));

function localizeQuiz(quiz: MockQuiz): QuizResponse {
  const { ar, questions, ...rest } = quiz;
  const base = isArabic() && ar ? { ...rest, ...ar } : rest;
  return {
    ...base,
    questions: questions.map((q) => {
      const { ar: qAr, ...qBase } = q;
      return (isArabic() && qAr ? { ...qBase, ...qAr } : qBase) as QuizQuestionResponse;
    }),
  } as QuizResponse;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function fail(en: string, ar: string): never {
  throw new Error(isArabic() ? ar : en);
}

/** Open the database after a short artificial latency. */
async function open(): Promise<MockDb> {
  await delay();
  return getDb();
}

/** Resolve the logged-in mock user from the token kept in the auth store. */
function currentUser(db: MockDb): MockUser {
  const token = useAuthStore.getState().token ?? '';
  const userId = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : '';
  const user = db.users.find((u) => u.userId === userId);
  if (!user) fail('Unauthorized. Please log in again.', 'غير مصرّح. الرجاء تسجيل الدخول مجددًا.');
  return user;
}

function ok(message = 'OK'): MessageResponse {
  return { success: true, message };
}

function authFor(user: MockUser): AuthResponse {
  return {
    accessToken: `${TOKEN_PREFIX}${user.userId}`,
    refreshToken: `${REFRESH_PREFIX}${user.userId}`,
    role: user.role,
    message: 'Login successful',
  };
}

function findChild(db: MockDb, id: string) {
  const child = db.children.find((c) => c.id === id);
  if (!child) fail('Child not found', 'لم يتم العثور على الطفل');
  return child;
}

/** The teacher record for the logged-in teacher. */
function currentTeacher(db: MockDb, user: MockUser) {
  return db.teachers.find((t) => t.userId === user.userId);
}

/** Children visible to a given user, depending on their role. */
function childrenFor(db: MockDb, user: MockUser) {
  if (user.role === 'ROLE_PARENT') return db.children.filter((c) => c.parentId === user.userId);
  if (user.role === 'ROLE_TEACHER') {
    const teacher = currentTeacher(db, user);
    return db.children.filter((c) => teacher && c.teacherId === teacher.id);
  }
  const teacherIds = db.teachers.filter((t) => t.schoolUserId === user.userId).map((t) => t.id);
  return db.children.filter((c) => c.teacherId && teacherIds.includes(c.teacherId));
}

function treeItemsFor(db: MockDb, childId: string) {
  return db.treeItems
    .filter((i) => i.treeId === `tree-${childId}`)
    .sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
}

function progressFor(db: MockDb, childId: string) {
  const items = treeItemsFor(db, childId);
  if (items.length === 0) return 0;
  return Math.round((items.filter((i) => i.completed).length / items.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers that mutate the mock database
// ─────────────────────────────────────────────────────────────────────────────

function notifyParent(db: MockDb, childId: string, en: { title: string; body: string }, ar: { title: string; body: string }) {
  const child = db.children.find((c) => c.id === childId);
  if (!child?.parentId) return;
  db.notifications.unshift({
    id: nextId(db, 'n'), userId: child.parentId, title: en.title, body: en.body,
    isRead: false, createdAt: new Date().toISOString(), ar,
  });
}

function removeChild(db: MockDb, childId: string) {
  db.children = db.children.filter((c) => c.id !== childId);
  db.trees = db.trees.filter((t) => t.childId !== childId);
  db.treeItems = db.treeItems.filter((i) => i.treeId !== `tree-${childId}`);
  db.activities = db.activities.filter((a) => a.childId !== childId);
  db.quizzes = db.quizzes.filter((q) => q.childId !== childId);
  db.homeworks = db.homeworks.filter((h) => h.childId !== childId);
  db.notes = db.notes.filter((n) => n.childId !== childId);
  db.reports = db.reports.filter((r) => r.childId !== childId);
}

function completeItem(db: MockDb, itemId: string): TreeItemCompletionResponse {
  const item = db.treeItems.find((i) => i.id === itemId);
  if (!item) fail('Learning tree item not found', 'لم يتم العثور على عنصر في المسار');
  const tree = db.trees.find((t) => t.id === item.treeId);
  const childId = tree?.childId ?? item.treeId.replace('tree-', '');
  const now = new Date().toISOString();

  if (!item.completed) {
    item.completed = true;
    item.locked = false;
    item.status = 'COMPLETED';
    item.completedAt = now;
    item.earnedPoints = item.maxPoints;

    const homework = db.homeworks.find((h) => h.id === item.itemId);
    if (homework) homework.status = 'COMPLETED';
    const activity = db.activities.find((a) => a.id === item.itemId);
    if (activity) { activity.status = 'COMPLETED'; activity.completedAt = now; }
    const quiz = db.quizzes.find((q) => q.id === item.itemId);
    if (quiz) { quiz.status = 'COMPLETED'; quiz.completedAt = now; quiz.startedAt = quiz.startedAt ?? now; }

    const next = treeItemsFor(db, childId).find((i) => !i.completed);
    if (next) next.locked = false;
  }

  const items = treeItemsFor(db, childId);
  const completedItems = items.filter((i) => i.completed).length;
  const treeCompleted = items.length > 0 && completedItems === items.length;
  if (tree) tree.status = treeCompleted ? 'COMPLETED' : 'ACTIVE';

  return {
    treeId: item.treeId,
    itemId: item.id,
    treeCompleted,
    completedItems,
    totalItems: items.length,
    progressPercentage: items.length ? Math.round((completedItems / items.length) * 100) : 0,
    treeStatus: treeCompleted ? 'COMPLETED' : 'ACTIVE',
  };
}

function toTeacher(t: MockDb['teachers'][number]): TeacherResponse {
  const { schoolUserId: _ignored, ...rest } = t;
  return rest;
}

function childName(child: ChildResponse) {
  return isArabic() ? child.fullNameAr : child.fullNameEn ?? child.fullNameAr;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSE TYPES (kept identical to the real API client)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  role:         string;   // 'ROLE_PARENT' | 'ROLE_TEACHER' | 'ROLE_SCHOOL'
  message:      string;
}

export interface MeResponse {
  userId: string;
  role:   string;
  email:  string;
  phone:  string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  accessToken:  string;
  refreshToken: string;
}

export interface ChildResponse {
  id:                    string;
  userId:                string;
  fullNameAr:            string;
  fullNameEn:            string | null;
  className:             string | null;
  level:                 number | null;
  gender:                'MALE' | 'FEMALE' | null;
  dateOfBirth:           string | null;   // LocalDate → ISO string
  learningDifficulty:    string | null;   // ADD | ADHD | ASD | DYS | IFD | OTHER
  parentId:              string | null;
  teacherId:             string | null;
  phone:                 string | null;
  nationalId:            string;
  status:                string;          // PENDING_PLACEMENT | ACTIVE
  assessedLevel:         number | null;
  placementCompletedAt:  string | null;   // LocalDateTime → ISO string
  active:                boolean;
}

export interface ChildSummaryResponse {
  childId:            string;
  childName:          string;
  level:              number | null;
  difficulty:         string | null;
  quizzesCount:       number;
  homeworksCount:     number;
  activitiesCount:    number;
  progressPercentage: number;
}

export interface HomeworkResponse {
  id:          string;
  childId:     string;
  title:       string;
  description: string;
  dueDate:     string;     // LocalDate
  status:      string;
  authorRole:  string;
  createdAt:   string;     // LocalDateTime
  treeId?:     string | null;
  treeItemId?: string | null;
  groupNumber?: number | null;
  orderNum?:   number | null;
}

export interface ReportResponse {
  id:        string;
  childId:   string;
  title:     string;
  content:   string;
  createdAt: string;
}

export interface NoteResponse {
  id:        string;
  childId:   string;
  title:     string;
  content:   string;
  createdAt: string;
}

export interface NotificationResponse {
  id:        string;
  title:     string;
  body:      string;
  isRead:    boolean;
  createdAt: string;
}

export interface ArticleResponse {
  id:          string;
  title:       string;
  titleAr:     string | null;
  body:        string;
  bodyAr:      string | null;
  imageUrl:    string | null;
  tags:        string[];
  isSaved:     boolean;
  createdAt:   string;
}


export interface TeacherResponse {
  id:           string;
  userId:       string;
  fullNameAr:   string;
  fullNameEn:   string | null;
  phone:        string;
  nationalId:   string;
}

export interface StudentResponse {
  id:                 string;
  userId:             string | null;
  fullNameAr:         string;
  fullNameEn:         string | null;
  className:          string | null;
  level:              number | null;
  gender:             string | null;
  dateOfBirth:        string | null;
  learningDifficulty: string | null;
  parentId?:          string | null;
  teacherId?:         string | null;
  phone?:             string | null;
  nationalId:         string;
  status:             string;
  assessedLevel:      number | null;
  placementCompletedAt?: string | null;
  active?:            boolean | null;
}

export interface PlacementQuestionResponse {
  id:          string;
  orderNum:    number;
  level:       number;
  points:      number;
  questionAr:  string | null;
  questionEn:  string | null;
  optionsAr:   Array<string | null>;
  optionsEn:   Array<string | null>;
}

export interface PlacementAssessmentResponse {
  childId:             string;
  childName:           string;
  childStatus:         string;
  placementCompleted:  boolean;
  questions:           PlacementQuestionResponse[];
}

export interface PlacementSubmissionResponse {
  childId:               string;
  assessmentId:          string;
  resultLevel:           number;
  correctAnswers:        number;
  totalQuestions:        number;
  confidencePercentage:  number;
  detectedDifficulty:    string | null;
  childStatus:           string;
  active:                boolean;
  placementCompletedAt:  string | null;
  treeGenerated?:        boolean;
  treeGenerationMessage?: string | null;
}

export interface ChatbotMessageResponse {
  sessionId:          string;
  childId:            string | null;
  userMessage:        string;
  assistantResponse:  string;
  createdAt:          string;
}

export interface LearningTreeResponse {
  id:          string;
  childId:     string;
  level:       number | null;
  topic:       string;
  topicId:     string | null;
  summary:     string;
  status:      string;
  generatedAt: string | null;
}

export interface TreeItemResponse {
  id:                string;
  treeId:            string;
  itemId:            string;
  itemType:          string;
  title:             string | null;
  description:       string | null;
  status:            string;
  orderNum:          number | null;
  groupNumber:       number | null;
  locked:            boolean | null;
  completed:         boolean | null;
  maxPoints:         number | null;
  earnedPoints:      number | null;
  completedAt:       string | null;
}

export interface TreeItemCompletionResponse {
  treeId:             string;
  itemId:             string;
  treeCompleted:      boolean;
  completedItems:     number;
  totalItems:         number;
  progressPercentage: number;
  treeStatus:         string;
}

export interface ActivityResponse {
  id:               string;
  childId:          string;
  treeId:           string | null;
  treeItemId:       string | null;
  title:            string;
  description:      string | null;
  instructions:     string | null;
  materialsNeeded:  string | null;
  expectedOutcome:  string | null;
  status:           string;
  groupNumber:      number | null;
  orderNum:         number | null;
  completedAt:      string | null;
}

export interface QuizQuestionResponse {
  id:            string;
  question:      string;
  options:       string[];
  correctOption: number;
  explanation:   string | null;
  orderNum:      number | null;
  points:        number | null;
}

export interface QuizResponse {
  id:             string;
  childId:        string;
  treeId:         string | null;
  treeItemId:     string | null;
  title:          string;
  level:          number | null;
  totalQuestions: number | null;
  score:          number | null;
  status:         string;
  groupNumber:    number | null;
  orderNum:       number | null;
  startedAt:      string | null;
  completedAt:    string | null;
  questions:      QuizQuestionResponse[];
}

export interface QuizSubmissionResponse {
  quizId:             string;
  treeId:             string | null;
  treeItemId:         string | null;
  score:              number;
  correctAnswers:     number;
  totalQuestions:     number;
  progressPercentage: number | null;
  treeCompleted:      boolean;
  completedItems:     number | null;
  totalItems:         number | null;
  treeStatus:         string | null;
}

export interface ParentDashboard {
  childrenCount:        number;
  activeChildrenCount:  number;
  unreadNotifications:  number;
  progressAverage:      number;
}

export interface TeacherDashboard {
  studentsCount:         number;
  activeStudentsCount:   number;
  pendingPlacementCount: number;
  averageProgress?:      number;
  progressPercentage?:   number;
}

export interface SchoolDashboard {
  teachersCount:  number;
  studentsCount:  number;
  [key: string]:  unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────────────────

export async function apiLogin(
  nationalId: string,
  password:   string
): Promise<AuthResponse> {
  const db = await open();
  const user = db.users.find((u) => u.nationalId === nationalId.trim() && u.password === password);
  if (!user) fail('Invalid national ID or password', 'رقم الهوية أو كلمة المرور غير صحيحة');
  return authFor(user);
}

export async function apiRegisterParent(data: {
  phone:        string;
  email:        string;
  password:     string;
  nationalId:   string;
  fullNameAr:   string;
  fullNameEn?:  string;
}): Promise<AuthResponse> {
  const db = await open();
  if (db.users.some((u) => u.nationalId === data.nationalId)) {
    fail('This national ID is already registered', 'رقم الهوية مسجّل مسبقًا');
  }
  const user: MockUser = {
    userId: nextId(db, 'u-parent'), role: 'ROLE_PARENT', nationalId: data.nationalId,
    password: data.password, email: data.email, phone: data.phone,
  };
  db.users.push(user);
  await saveDb();
  return authFor(user);
}

export async function apiRegisterSchool(data: {
  phone:        string;
  email:        string;
  password:     string;
  nationalId:   string;
  nameAr:       string;
  nameEn?:      string;
  location:     string;
  description?: string;
}): Promise<AuthResponse> {
  const db = await open();
  if (db.users.some((u) => u.nationalId === data.nationalId)) {
    fail('This national ID is already registered', 'رقم الهوية مسجّل مسبقًا');
  }
  const user: MockUser = {
    userId: nextId(db, 'u-school'), role: 'ROLE_SCHOOL', nationalId: data.nationalId,
    password: data.password, email: data.email, phone: data.phone,
  };
  db.users.push(user);
  await saveDb();
  return authFor(user);
}

/** Mock: no SMS is sent — any OTP code is accepted. */
export async function apiForgotPassword(_nationalId: string): Promise<MessageResponse> {
  await delay();
  return ok('Verification code sent');
}

export async function apiVerifyOTP(
  _nationalId:  string,
  _otpCode:     string,
  _trustDevice?: boolean
): Promise<MessageResponse> {
  await delay();
  return ok('Verified');
}

export async function apiResendOTP(_nationalId: string): Promise<MessageResponse> {
  await delay();
  return ok('Verification code sent');
}

export async function apiResetPassword(data: {
  nationalId:      string;
  otpCode:         string;
  newPassword:     string;
  confirmPassword: string;
}): Promise<MessageResponse> {
  const db = await open();
  if (data.newPassword !== data.confirmPassword) {
    fail('Passwords do not match', 'كلمتا المرور غير متطابقتين');
  }
  const user = db.users.find((u) => u.nationalId === data.nationalId);
  if (!user) fail('User not found', 'المستخدم غير موجود');
  user.password = data.newPassword;
  await saveDb();
  return ok('Password updated');
}

export async function apiRefreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const db = await open();
  const userId = refreshToken.startsWith(REFRESH_PREFIX) ? refreshToken.slice(REFRESH_PREFIX.length) : '';
  const user = db.users.find((u) => u.userId === userId);
  if (!user) fail('Invalid refresh token', 'رمز التحديث غير صالح');
  return { accessToken: `${TOKEN_PREFIX}${user.userId}`, refreshToken };
}

export async function apiLogout(_refreshToken: string): Promise<MessageResponse> {
  await delay(50);
  return ok('Logged out');
}

export async function apiGetMe(): Promise<MeResponse> {
  const db = await open();
  const user = currentUser(db);
  return { userId: user.userId, role: user.role, email: user.email, phone: user.phone };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CHILDREN  (Parent role)
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetChildren(): Promise<ChildResponse[]> {
  const db = await open();
  return clone(childrenFor(db, currentUser(db)));
}

export async function apiGetChild(id: string): Promise<ChildResponse> {
  const db = await open();
  return clone(findChild(db, id));
}

export async function apiGetChildSummary(id: string): Promise<ChildSummaryResponse> {
  const db = await open();
  const child = findChild(db, id);
  return {
    childId:            child.id,
    childName:          childName(child),
    level:              child.assessedLevel ?? child.level,
    difficulty:         child.learningDifficulty,
    quizzesCount:       db.quizzes.filter((q) => q.childId === id && q.status === 'COMPLETED').length,
    homeworksCount:     db.homeworks.filter((h) => h.childId === id && ['COMPLETED', 'SUBMITTED', 'GRADED'].includes(h.status)).length,
    activitiesCount:    db.activities.filter((a) => a.childId === id && a.status === 'COMPLETED').length,
    progressPercentage: progressFor(db, id),
  };
}

export async function apiLinkChild(nationalId: string): Promise<MessageResponse> {
  const db = await open();
  const user = currentUser(db);
  const child = db.children.find((c) => c.nationalId === nationalId.trim());
  if (!child) fail('No child found with this national ID', 'لم يتم العثور على طفل بهذا الرقم الوطني');
  if (child.parentId && child.parentId !== user.userId) {
    fail('This child is already linked to another parent', 'هذا الطفل مرتبط بوالد آخر');
  }
  child.parentId = user.userId;
  await saveDb();
  return ok('Child linked successfully');
}

export async function apiUnlinkChild(id: string): Promise<MessageResponse> {
  const db = await open();
  findChild(db, id).parentId = null;
  await saveDb();
  return ok('Child unlinked');
}

export async function apiGetMyChildren(): Promise<ChildResponse[]> {
  return apiGetChildren();
}

export async function apiGetChildById(id: string): Promise<ChildResponse> {
  return apiGetChild(id);
}

export async function apiUpdateChild(
  id: string,
  data: Partial<{
    fullNameAr:         string;
    fullNameEn:         string;
    className:          string;
    level:              number;
    gender:             string;
    dateOfBirth:        string;
    learningDifficulty: string;
  }>
): Promise<ChildResponse> {
  const db = await open();
  const child = findChild(db, id);
  Object.assign(child, data);
  await saveDb();
  return clone(child);
}

export async function apiLinkChildDirect(nationalId: string): Promise<MessageResponse> {
  return apiLinkChild(nationalId);
}

/** Parents unlink a child; teachers/schools remove the record entirely. */
export async function apiDeleteChild(id: string): Promise<MessageResponse> {
  const db = await open();
  const user = currentUser(db);
  if (user.role === 'ROLE_PARENT') {
    findChild(db, id).parentId = null;
  } else {
    findChild(db, id);
    removeChild(db, id);
  }
  await saveDb();
  return ok('Child removed');
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOMEWORK
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetHomeworkForParent(
  childId: string,
  source?: 'ai' | 'teacher'
): Promise<HomeworkResponse[]> {
  const db = await open();
  const list = db.homeworks.filter((h) => {
    if (h.childId !== childId) return false;
    if (source === 'ai') return h.authorRole === 'AI';
    if (source === 'teacher') return h.authorRole === 'TEACHER';
    return true;
  });
  return localizeAll(list) as HomeworkResponse[];
}

export async function apiGetHomeworkForTeacher(childId: string): Promise<HomeworkResponse[]> {
  const db = await open();
  const list = db.homeworks
    .filter((h) => h.childId === childId && h.authorRole === 'TEACHER')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return localizeAll(list) as HomeworkResponse[];
}

export async function apiGetHomeworkForSchool(childId: string): Promise<HomeworkResponse[]> {
  const db = await open();
  return localizeAll(db.homeworks.filter((h) => h.childId === childId)) as HomeworkResponse[];
}

export async function apiCreateHomework(data: {
  childId:     string;
  title:       string;
  description: string;
  dueDate:     string;   // YYYY-MM-DD
}): Promise<HomeworkResponse> {
  const db = await open();
  findChild(db, data.childId);
  const homework: Loc<HomeworkResponse> = {
    id: nextId(db, 'hw'), childId: data.childId, title: data.title, description: data.description,
    dueDate: data.dueDate, status: 'PENDING', authorRole: 'TEACHER', createdAt: new Date().toISOString(),
  };
  db.homeworks.unshift(homework);
  notifyParent(
    db, data.childId,
    { title: 'New homework', body: `New homework assigned: ${data.title}` },
    { title: 'واجب جديد', body: `تم تكليفك بواجب جديد: ${data.title}` },
  );
  await saveDb();
  return clone(homework);
}

export async function apiGetHomeworkDetail(homeworkId: string): Promise<HomeworkResponse> {
  const db = await open();
  const homework = db.homeworks.find((h) => h.id === homeworkId);
  if (!homework) fail('Homework not found', 'لم يتم العثور على الواجب');
  return localize(homework) as HomeworkResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────────────────────────────────────

async function reportsFor(childId: string): Promise<ReportResponse[]> {
  const db = await open();
  return clone(db.reports.filter((r) => r.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export const apiGetReportsForParent  = (childId: string) => reportsFor(childId);
export const apiGetReportsForTeacher = (childId: string) => reportsFor(childId);
export const apiGetReportsForSchool  = (childId: string) => reportsFor(childId);

export async function apiCreateReport(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<ReportResponse> {
  const db = await open();
  findChild(db, data.childId);
  const report: ReportResponse = { id: nextId(db, 'rep'), ...data, createdAt: new Date().toISOString() };
  db.reports.unshift(report);
  notifyParent(
    db, data.childId,
    { title: 'New report', body: `A new report is available: ${data.title}` },
    { title: 'تقرير جديد', body: `يتوفر تقرير جديد: ${data.title}` },
  );
  await saveDb();
  return clone(report);
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTES
// ─────────────────────────────────────────────────────────────────────────────

async function notesFor(childId: string): Promise<NoteResponse[]> {
  const db = await open();
  return clone(db.notes.filter((n) => n.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export const apiGetNotesForParent  = (childId: string) => notesFor(childId);
export const apiGetNotesForTeacher = (childId: string) => notesFor(childId);

export async function apiCreateNote(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<NoteResponse> {
  const db = await open();
  findChild(db, data.childId);
  const note: NoteResponse = { id: nextId(db, 'note'), ...data, createdAt: new Date().toISOString() };
  db.notes.unshift(note);
  notifyParent(
    db, data.childId,
    { title: 'New teacher note', body: `The teacher left a note: ${data.title}` },
    { title: 'ملاحظة جديدة من المعلم', body: `ترك المعلم ملاحظة: ${data.title}` },
  );
  await saveDb();
  return clone(note);
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetNotifications(): Promise<NotificationResponse[]> {
  const db = await open();
  const user = currentUser(db);
  return db.notifications
    .filter((n) => n.userId === user.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((n) => {
      const { userId: _ignored, ...rest } = localize(n) as NotificationResponse & { userId: string };
      return rest;
    });
}

export async function apiMarkNotificationRead(id: string): Promise<MessageResponse> {
  const db = await open();
  const notification = db.notifications.find((n) => n.id === id);
  if (notification) notification.isRead = true;
  await saveDb();
  return ok();
}

export async function apiMarkAllNotificationsRead(): Promise<MessageResponse> {
  const db = await open();
  const user = currentUser(db);
  db.notifications.forEach((n) => { if (n.userId === user.userId) n.isRead = true; });
  await saveDb();
  return ok();
}

// ─────────────────────────────────────────────────────────────────────────────
//  ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

function toArticle(article: (typeof mockArticles)[number], saved: string[]): ArticleResponse {
  return {
    id:        article.id,
    title:     article.title_en,
    titleAr:   article.title_ar,
    body:      article.body_en.join('\n\n'),
    bodyAr:    article.body_ar.join('\n\n'),
    imageUrl:  null,
    tags:      [article.category],
    isSaved:   saved.includes(article.id),
    createdAt: new Date().toISOString(),
  };
}

export async function apiGetArticles(): Promise<ArticleResponse[]> {
  const db = await open();
  const saved = db.savedArticles[currentUser(db).userId] ?? [];
  return mockArticles.map((a) => toArticle(a, saved));
}

export async function apiGetArticle(id: string): Promise<ArticleResponse> {
  const db = await open();
  const saved = db.savedArticles[currentUser(db).userId] ?? [];
  const article = mockArticles.find((a) => a.id === id);
  if (!article) fail('Article not found', 'لم يتم العثور على المقال');
  return toArticle(article, saved);
}

export async function apiSaveArticle(id: string): Promise<MessageResponse> {
  const db = await open();
  const userId = currentUser(db).userId;
  const list = db.savedArticles[userId] ?? [];
  if (!list.includes(id)) list.push(id);
  db.savedArticles[userId] = list;
  await saveDb();
  return ok('Article saved');
}

export async function apiUnsaveArticle(id: string): Promise<MessageResponse> {
  const db = await open();
  const userId = currentUser(db).userId;
  db.savedArticles[userId] = (db.savedArticles[userId] ?? []).filter((a) => a !== id);
  await saveDb();
  return ok('Article removed');
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCHOOL  (School admin role)
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetTeachers(): Promise<TeacherResponse[]> {
  const db = await open();
  const user = currentUser(db);
  return db.teachers.filter((t) => t.schoolUserId === user.userId).map(toTeacher);
}

export async function apiGetTeacher(id: string): Promise<TeacherResponse> {
  const db = await open();
  const teacher = db.teachers.find((t) => t.id === id);
  if (!teacher) fail('Teacher not found', 'لم يتم العثور على المعلم');
  return toTeacher(teacher);
}

export async function apiGetSchoolTeacherStudents(id: string): Promise<StudentResponse[]> {
  const db = await open();
  return clone(db.children.filter((c) => c.teacherId === id));
}

export async function apiGetSchoolStudent(id: string): Promise<ChildResponse> {
  const db = await open();
  return clone(findChild(db, id));
}

export async function apiCreateTeacher(data: {
  phone:       string;
  email:       string;
  password:    string;
  nationalId:  string;
  fullNameAr:  string;
  fullNameEn?: string;
}): Promise<TeacherResponse> {
  const db = await open();
  const school = currentUser(db);
  if (db.users.some((u) => u.nationalId === data.nationalId)) {
    fail('This national ID is already registered', 'رقم الهوية مسجّل مسبقًا');
  }
  const userId = nextId(db, 'u-teacher');
  db.users.push({
    userId, role: 'ROLE_TEACHER', nationalId: data.nationalId, password: data.password,
    email: data.email, phone: data.phone,
  });
  const teacher = {
    id: nextId(db, 'teacher'), userId, schoolUserId: school.userId, fullNameAr: data.fullNameAr,
    fullNameEn: data.fullNameEn ?? null, phone: data.phone, nationalId: data.nationalId,
  };
  db.teachers.push(teacher);
  await saveDb();
  return toTeacher(teacher);
}

export async function apiUpdateTeacher(
  id:   string,
  data: Partial<{ fullNameAr: string; fullNameEn: string; phone: string }>
): Promise<TeacherResponse> {
  const db = await open();
  const teacher = db.teachers.find((t) => t.id === id);
  if (!teacher) fail('Teacher not found', 'لم يتم العثور على المعلم');
  Object.assign(teacher, data);
  await saveDb();
  return toTeacher(teacher);
}

export async function apiDeleteTeacher(id: string): Promise<MessageResponse> {
  const db = await open();
  const teacher = db.teachers.find((t) => t.id === id);
  if (!teacher) fail('Teacher not found', 'لم يتم العثور على المعلم');
  db.teachers = db.teachers.filter((t) => t.id !== id);
  db.users = db.users.filter((u) => u.userId !== teacher.userId);
  db.children.forEach((c) => { if (c.teacherId === id) c.teacherId = null; });
  await saveDb();
  return ok('Teacher deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEACHER — Student management  (Teacher role)
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetStudents(): Promise<StudentResponse[]> {
  const db = await open();
  return clone(childrenFor(db, currentUser(db)));
}

export async function apiGetStudent(id: string): Promise<StudentResponse> {
  const db = await open();
  return clone(findChild(db, id));
}

export async function apiCreateStudent(data: {
  fullNameAr:          string;
  fullNameEn?:         string;
  className?:          string;
  level?:              number;
  gender?:             string;
  dateOfBirth?:        string;   // YYYY-MM-DD
  learningDifficulty?: string;
  phone?:              string;
  email?:              string;
  nationalId:          string;
  password?:           string;
}): Promise<StudentResponse> {
  const db = await open();
  const user = currentUser(db);
  if (db.children.some((c) => c.nationalId === data.nationalId)) {
    fail('A student with this national ID already exists', 'يوجد طالب بهذا الرقم الوطني مسبقًا');
  }
  const id = nextId(db, 'child');
  const gender = data.gender?.toUpperCase();
  const child: ChildResponse = {
    id, userId: `u-${id}`, fullNameAr: data.fullNameAr, fullNameEn: data.fullNameEn ?? null,
    className: data.className ?? null, level: data.level ?? null,
    gender: gender === 'MALE' || gender === 'FEMALE' ? gender : null,
    dateOfBirth: data.dateOfBirth ?? null, learningDifficulty: data.learningDifficulty ?? null,
    parentId: null, teacherId: currentTeacher(db, user)?.id ?? null, phone: data.phone ?? null,
    nationalId: data.nationalId, status: 'PENDING_PLACEMENT', assessedLevel: null,
    placementCompletedAt: null, active: true,
  };
  db.children.push(child);
  await saveDb();
  return clone(child);
}

export async function apiUpdateStudent(
  id:   string,
  data: Partial<{
    fullNameAr:         string;
    fullNameEn:         string;
    className:          string;
    level:              number;
    gender:             string;
    dateOfBirth:        string;
    learningDifficulty: string;
  }>
): Promise<StudentResponse> {
  return apiUpdateChild(id, data);
}

export async function apiDeleteStudent(id: string): Promise<MessageResponse> {
  const db = await open();
  findChild(db, id);
  removeChild(db, id);
  await saveDb();
  return ok('Student deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLACEMENT ASSESSMENT  (Teacher role)
// ─────────────────────────────────────────────────────────────────────────────

function placementFor(child: ChildResponse): PlacementAssessmentResponse {
  const completed = child.status === 'ACTIVE' && Boolean(child.placementCompletedAt);
  return {
    childId:            child.id,
    childName:          childName(child),
    childStatus:        child.status,
    placementCompleted: completed,
    questions: completed
      ? []
      : PLACEMENT_QUESTIONS.map(({ correct: _correct, ...question }) => question),
  };
}

export async function apiGetPlacementAssessment(
  childId: string
): Promise<PlacementAssessmentResponse> {
  const db = await open();
  return placementFor(findChild(db, childId));
}

export async function apiStartPlacementAssessment(
  childId: string
): Promise<PlacementAssessmentResponse> {
  return apiGetPlacementAssessment(childId);
}

export async function apiSubmitPlacementAssessment(
  childId: string,
  answers: Array<{ questionId: string; selectedOption: number }>
): Promise<PlacementSubmissionResponse> {
  const db = await open();
  const child = findChild(db, childId);

  let earned = 0;
  let total = 0;
  let correctAnswers = 0;
  for (const question of PLACEMENT_QUESTIONS) {
    total += question.points;
    const answer = answers.find((a) => a.questionId === question.id);
    if (answer && Number(answer.selectedOption) === question.correct) {
      earned += question.points;
      correctAnswers += 1;
    }
  }

  const ratio = total ? earned / total : 0;
  const resultLevel = ratio >= 0.75 ? 3 : ratio >= 0.4 ? 2 : 1;
  const now = new Date().toISOString();

  child.assessedLevel = resultLevel;
  child.level = resultLevel;
  child.status = 'ACTIVE';
  child.active = true;
  child.placementCompletedAt = now;
  generateTree(db, child, 0);
  notifyParent(
    db, childId,
    { title: 'Placement completed', body: `${child.fullNameEn ?? child.fullNameAr} was placed at level ${resultLevel}.` },
    { title: 'اكتمل تحديد المستوى', body: `تم تحديد مستوى ${child.fullNameAr} عند المستوى ${resultLevel}.` },
  );
  await saveDb();

  return {
    childId,
    assessmentId:         nextId(db, 'assessment'),
    resultLevel,
    correctAnswers,
    totalQuestions:       PLACEMENT_QUESTIONS.length,
    confidencePercentage: Math.round(60 + ratio * 35),
    detectedDifficulty:   child.learningDifficulty,
    childStatus:          child.status,
    active:               true,
    placementCompletedAt: now,
    treeGenerated:        true,
    treeGenerationMessage: isArabic() ? 'تم إنشاء مسار التعلم بنجاح' : 'Learning path generated successfully',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CHATBOT / LEARNING TREE / CONTENT
// ─────────────────────────────────────────────────────────────────────────────

/** Mock: the assistant always answers with the same fixed reply. */
export async function apiSendChatMessage(
  message: string,
  childId?: string | null
): Promise<ChatbotMessageResponse> {
  await delay(700);
  return {
    sessionId:         'mock-session',
    childId:           childId ?? null,
    userMessage:       message,
    assistantResponse: isArabic()
      ? 'شكرًا على رسالتك! أنا رفيق، مساعدك في رحلة تعلّم طفلك. هذه نسخة تجريبية، لذلك لا أستطيع الإجابة بالتفصيل الآن، لكنني هنا لدعمك.'
      : "Thanks for your message! I'm Rafeeq, your companion on your child's learning journey. This is a demo version, so I can't answer in detail yet, but I'm here to support you.",
    createdAt:         new Date().toISOString(),
  };
}

export async function apiGetLearningTree(childId: string): Promise<LearningTreeResponse> {
  const db = await open();
  const tree = db.trees.find((t) => t.childId === childId);
  if (!tree) fail('No active learning tree found for this child', 'لا يوجد مسار تعلّم نشط لهذا الطفل');
  return localize(tree) as LearningTreeResponse;
}

export async function apiGenerateLearningTree(
  childId: string,
  _topicId?: string | null
): Promise<LearningTreeResponse> {
  const db = await open();
  const child = findChild(db, childId);
  generateTree(db, child, 0);
  await saveDb();
  return localize(db.trees.find((t) => t.childId === childId)!) as LearningTreeResponse;
}

export async function apiGetTreeItems(childId: string): Promise<TreeItemResponse[]> {
  const db = await open();
  return localizeAll(treeItemsFor(db, childId)) as TreeItemResponse[];
}

export async function apiCompleteTreeItem(itemId: string): Promise<TreeItemCompletionResponse> {
  const db = await open();
  const result = completeItem(db, itemId);
  await saveDb();
  return result;
}

export async function apiGetActivities(childId: string): Promise<ActivityResponse[]> {
  const db = await open();
  const list = db.activities
    .filter((a) => a.childId === childId)
    .sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
  return localizeAll(list) as ActivityResponse[];
}

export async function apiGetActivity(activityId: string): Promise<ActivityResponse> {
  const db = await open();
  const activity = db.activities.find((a) => a.id === activityId);
  if (!activity) fail('Activity not found', 'لم يتم العثور على النشاط');
  return localize(activity) as ActivityResponse;
}

export async function apiGetQuizzes(childId: string): Promise<QuizResponse[]> {
  const db = await open();
  const list = db.quizzes
    .filter((q) => q.childId === childId)
    .sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
  return list.map(localizeQuiz);
}

export async function apiGetQuiz(quizId: string): Promise<QuizResponse> {
  const db = await open();
  const quiz = db.quizzes.find((q) => q.id === quizId);
  if (!quiz) fail('Quiz not found', 'لم يتم العثور على الاختبار');
  return localizeQuiz(quiz);
}

/** answers[].selectedOption is an option letter: "A", "B", "C"… */
export async function apiSubmitQuiz(
  quizId: string,
  answers: Array<{ questionId: string; selectedOption: string }>
): Promise<QuizSubmissionResponse> {
  const db = await open();
  const quiz = db.quizzes.find((q) => q.id === quizId);
  if (!quiz) fail('Quiz not found', 'لم يتم العثور على الاختبار');

  let correctAnswers = 0;
  for (const question of quiz.questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    const picked = answer ? answer.selectedOption.trim().toUpperCase().charCodeAt(0) - 64 : 0;
    if (picked === question.correctOption) correctAnswers += 1;
  }

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const now = new Date().toISOString();
  quiz.score = score;
  quiz.totalQuestions = totalQuestions;
  quiz.status = 'COMPLETED';
  quiz.startedAt = quiz.startedAt ?? now;
  quiz.completedAt = now;

  const completion = quiz.treeItemId ? completeItem(db, quiz.treeItemId) : null;
  await saveDb();

  return {
    quizId,
    treeId:             quiz.treeId,
    treeItemId:         quiz.treeItemId,
    score,
    correctAnswers,
    totalQuestions,
    progressPercentage: completion?.progressPercentage ?? null,
    treeCompleted:      completion?.treeCompleted ?? false,
    completedItems:     completion?.completedItems ?? null,
    totalItems:         completion?.totalItems ?? null,
    treeStatus:         completion?.treeStatus ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

function averageProgress(db: MockDb, children: ChildResponse[]) {
  if (children.length === 0) return 0;
  return Math.round(children.reduce((sum, c) => sum + progressFor(db, c.id), 0) / children.length);
}

export async function apiGetParentDashboard(): Promise<ParentDashboard> {
  const db = await open();
  const user = currentUser(db);
  const children = childrenFor(db, user);
  return {
    childrenCount:       children.length,
    activeChildrenCount: children.filter((c) => c.status === 'ACTIVE').length,
    unreadNotifications: db.notifications.filter((n) => n.userId === user.userId && !n.isRead).length,
    progressAverage:     averageProgress(db, children),
  };
}

export async function apiGetTeacherDashboard(): Promise<TeacherDashboard> {
  const db = await open();
  const children = childrenFor(db, currentUser(db));
  const average = averageProgress(db, children);
  return {
    studentsCount:         children.length,
    activeStudentsCount:   children.filter((c) => c.status === 'ACTIVE').length,
    pendingPlacementCount: children.filter((c) => c.status === 'PENDING_PLACEMENT').length,
    averageProgress:       average,
    progressPercentage:    average,
  };
}

export async function apiGetSchoolDashboard(): Promise<SchoolDashboard> {
  const db = await open();
  const user = currentUser(db);
  const children = childrenFor(db, user);
  return {
    teachersCount:         db.teachers.filter((t) => t.schoolUserId === user.userId).length,
    studentsCount:         children.length,
    activeStudentsCount:   children.filter((c) => c.status === 'ACTIVE').length,
    pendingPlacementCount: children.filter((c) => c.status === 'PENDING_PLACEMENT').length,
    averageProgress:       averageProgress(db, children),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEGACY ADAPTER SHIMS
//  These keep the old function names working so existing screens don't break.
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Use apiGetChildren() */
export const apiGetChildrenLegacy = apiGetChildren;

/** @deprecated Use apiCreateHomework() */
export async function apiAddHomework(data: {
  childId:     string;
  title:       string;
  description: string;
  dueDate:     string;
}): Promise<HomeworkResponse> {
  return apiCreateHomework(data);
}

/** @deprecated Use apiGetHomeworkForParent() */
export async function apiGetHomework(childId: string): Promise<HomeworkResponse[]> {
  return apiGetHomeworkForParent(childId);
}

/** @deprecated Use apiCreateReport() */
export async function apiAddReport(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<ReportResponse> {
  return apiCreateReport(data);
}

/** @deprecated Use apiGetReportsForParent() */
export async function apiGetReports(childId: string): Promise<ReportResponse[]> {
  return apiGetReportsForParent(childId);
}

/** @deprecated Use apiCreateNote() */
export async function apiAddNote(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<NoteResponse> {
  return apiCreateNote(data);
}

/** @deprecated Use apiGetNotesForParent() */
export async function apiGetNotes(childId: string): Promise<NoteResponse[]> {
  return apiGetNotesForParent(childId);
}

/** @deprecated Use apiSaveArticle() / apiUnsaveArticle() */
export async function apiToggleSaveArticle(
  articleId: string
): Promise<{ isSaved: boolean }> {
  const db = await open();
  const saved = db.savedArticles[currentUser(db).userId] ?? [];
  if (saved.includes(articleId)) {
    await apiUnsaveArticle(articleId);
    return { isSaved: false };
  }
  await apiSaveArticle(articleId);
  return { isSaved: true };
}

/** @deprecated Use apiCreateTeacher() */
export async function apiAddTeacher(data: {
  name:       string;
  nationalId: string;
  phone:      string;
  password:   string;
}): Promise<TeacherResponse> {
  return apiCreateTeacher({
    fullNameAr: data.name,
    nationalId: data.nationalId,
    phone:      data.phone,
    password:   data.password,
    email:      `${data.nationalId}@rafeeq.app`,
  });
}

/** @deprecated Use apiGetChildSummary() */
export async function apiGetChildProgress(_childId: string) {
  return null;
}

/** @deprecated Use apiGetTreeItems() */
export async function apiGetChildTree(childId: string): Promise<TreeItemResponse[]> {
  return apiGetTreeItems(childId);
}

/** @deprecated Use apiGetTreeItems() */
export async function apiGetRoadmap(childId: string): Promise<TreeItemResponse[]> {
  return apiGetTreeItems(childId);
}

/** @deprecated No specialists endpoint yet */
export async function apiGetSpecialists() {
  return [];
}
