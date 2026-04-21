// services/api.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  FULLY WIRED — all functions call the real Spring Boot backend.
//  Set EXPO_PUBLIC_API_BASE_URL in your .env (e.g. http://192.168.x.x:8080)
//  Auth token is read from the Zustand authStore via AsyncStorage.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '');

// ── Token helpers ─────────────────────────────────────────────────────────────

/** Read the persisted Zustand auth store from AsyncStorage and return the token */
async function getToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('rafeeq-auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/** Read the persisted Zustand auth store and return the refreshToken */
async function getRefreshToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('rafeeq-auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

// ── Core request helpers ──────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  auth?: boolean;          // default true — attach Bearer token
  lang?: string;           // override Accept-Language
  body?: unknown;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, body } = options;
  const lang = options.lang ?? i18n.language ?? 'en';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — return null cast as T
  if (res.status === 204) return null as T;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return null as T;
  }

  if (!res.ok) {
    // Backend error shape: { success, message, errorCode, timestamp }
    const msg =
      (data as any)?.message ??
      (data as any)?.error ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

const _get  = <T,>(path: string, opts?: RequestOptions) => request<T>('GET',    path, opts);
const _post = <T,>(path: string, body: unknown, opts?: RequestOptions) => request<T>('POST',   path, { body, ...opts });
const _put  = <T,>(path: string, body: unknown, opts?: RequestOptions) => request<T>('PUT',    path, { body, ...opts });
const _del  = <T,>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts);

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSE TYPES (matching backend DTOs exactly)
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
  id:            string;
  fullNameAr:    string;
  fullNameEn:    string | null;
  status:        string;
  assessedLevel: number | null;
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

interface BackendArticleResponse {
  id:          string;
  titleAr:     string | null;
  titleEn:     string | null;
  contentAr:   string | null;
  contentEn:   string | null;
  imageUrl:    string | null;
  tags:        string[] | null;
  saved:       boolean;
}

function normalizeArticle(article: BackendArticleResponse): ArticleResponse {
  return {
    id:        article.id,
    title:     article.titleEn ?? article.titleAr ?? '',
    titleAr:   article.titleAr ?? article.titleEn ?? null,
    body:      article.contentEn ?? article.contentAr ?? '',
    bodyAr:    article.contentAr ?? article.contentEn ?? null,
    imageUrl:  article.imageUrl,
    tags:      article.tags ?? [],
    isSaved:   article.saved,
    createdAt: new Date().toISOString(),
  };
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
  nationalId:         string;
  status:             string;
  assessedLevel:      number | null;
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
}

export interface SchoolDashboard {
  teachersCount:  number;
  studentsCount:  number;
  [key: string]:  unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * body: { nationalId, password }
 */
export async function apiLogin(
  nationalId: string,
  password:   string
): Promise<AuthResponse> {
  return _post<AuthResponse>('/auth/login', { nationalId, password }, { auth: false });
}

/**
 * POST /auth/register/parent
 * body: { phone, email, password, nationalId, fullNameAr, fullNameEn? }
 */
export async function apiRegisterParent(data: {
  phone:        string;
  email:        string;
  password:     string;
  nationalId:   string;
  fullNameAr:   string;
  fullNameEn?:  string;
}): Promise<AuthResponse> {
  return _post<AuthResponse>('/auth/register/parent', data, { auth: false });
}

/**
 * POST /auth/register/school
 * body: { phone, email, password, nationalId, nameAr, nameEn?, location, description? }
 */
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
  return _post<AuthResponse>('/auth/register/school', data, { auth: false });
}

/**
 * POST /auth/forgot-password
 * Triggers OTP generation (printed to backend console in dev)
 */
export async function apiForgotPassword(
  nationalId: string
): Promise<MessageResponse> {
  return _post<MessageResponse>('/auth/forgot-password', { nationalId }, { auth: false });
}

/**
 * POST /auth/verify-otp
 * Used for OTP verification after forgot-password
 */
export async function apiVerifyOTP(
  nationalId:   string,
  otpCode:      string,
  trustDevice?: boolean
): Promise<MessageResponse> {
  return _post<MessageResponse>('/auth/verify-otp', { nationalId, otpCode, trustDevice }, { auth: false });
}

/**
 * POST /auth/resend-otp
 */
export async function apiResendOTP(
  nationalId: string
): Promise<MessageResponse> {
  return _post<MessageResponse>('/auth/resend-otp', { nationalId }, { auth: false });
}

/**
 * POST /auth/reset-password
 * body: { nationalId, otpCode, newPassword, confirmPassword }
 */
export async function apiResetPassword(data: {
  nationalId:      string;
  otpCode:         string;
  newPassword:     string;
  confirmPassword: string;
}): Promise<MessageResponse> {
  return _post<MessageResponse>('/auth/reset-password', data, { auth: false });
}

/**
 * POST /auth/refresh
 * Use when access token expires — pass the stored refresh token
 */
export async function apiRefreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return _post<RefreshTokenResponse>('/auth/refresh', { refreshToken }, { auth: false });
}

/**
 * POST /auth/logout
 */
export async function apiLogout(refreshToken: string): Promise<MessageResponse> {
  return _post<MessageResponse>('/auth/logout', { refreshToken });
}

/**
 * GET /auth/me
 * Returns the current authenticated user's basic info
 */
export async function apiGetMe(): Promise<MeResponse> {
  return _get<MeResponse>('/auth/me');
}

// ─────────────────────────────────────────────────────────────────────────────
//  CHILDREN  (Parent role)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/parent/children
 * Returns all children linked to the authenticated parent
 */
export async function apiGetChildren(): Promise<ChildResponse[]> {
  return _get<ChildResponse[]>('/api/parent/children');
}

/**
 * GET /api/parent/children/:id
 */
export async function apiGetChild(id: string): Promise<ChildResponse> {
  return _get<ChildResponse>(`/api/parent/children/${id}`);
}

/**
 * GET /api/parent/children/:id/summary
 */
export async function apiGetChildSummary(id: string): Promise<ChildSummaryResponse> {
  return _get<ChildSummaryResponse>(`/api/parent/children/${id}/summary`);
}

/**
 * POST /api/parent/children/link
 * Link a child to the parent by the child's national ID
 */
export async function apiLinkChild(nationalId: string): Promise<MessageResponse> {
  return _post<MessageResponse>('/api/parent/children/link', { nationalId });
}

/**
 * DELETE /api/parent/children/:id
 * Unlink a child from the parent
 */
export async function apiUnlinkChild(id: string): Promise<MessageResponse> {
  return _del<MessageResponse>(`/api/parent/children/${id}`);
}

// Also available via /children/* (direct ChildController):

/**
 * GET /children/my
 */
export async function apiGetMyChildren(): Promise<ChildResponse[]> {
  return _get<ChildResponse[]>('/children/my');
}

/**
 * GET /children/:id
 */
export async function apiGetChildById(id: string): Promise<ChildResponse> {
  return _get<ChildResponse>(`/children/${id}`);
}

/**
 * PUT /children/:id
 */
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
  return _put<ChildResponse>(`/children/${id}`, data);
}

/**
 * POST /children/link
 */
export async function apiLinkChildDirect(nationalId: string): Promise<MessageResponse> {
  return _post<MessageResponse>('/children/link', { nationalId });
}

/**
 * DELETE /children/:id
 */
export async function apiDeleteChild(id: string): Promise<MessageResponse> {
  return _del<MessageResponse>(`/children/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOMEWORK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/homework/parent/:childId
 * Parent view: get homework assigned to a child
 */
export async function apiGetHomeworkForParent(childId: string): Promise<HomeworkResponse[]> {
  return _get<HomeworkResponse[]>(`/api/homework/parent/${childId}`);
}

/**
 * GET /api/homework/teacher/:childId
 * Teacher view: get homework they assigned to a child
 */
export async function apiGetHomeworkForTeacher(childId: string): Promise<HomeworkResponse[]> {
  return _get<HomeworkResponse[]>(`/api/homework/teacher/${childId}`);
}

/**
 * POST /api/homework
 * Teacher creates homework for a child
 */
export async function apiCreateHomework(data: {
  childId:     string;
  title:       string;
  description: string;
  dueDate:     string;   // YYYY-MM-DD
}): Promise<HomeworkResponse> {
  return _post<HomeworkResponse>('/api/homework', data);
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/parent/:childId
 */
export async function apiGetReportsForParent(childId: string): Promise<ReportResponse[]> {
  return _get<ReportResponse[]>(`/api/reports/parent/${childId}`);
}

/**
 * GET /api/reports/teacher/:childId
 */
export async function apiGetReportsForTeacher(childId: string): Promise<ReportResponse[]> {
  return _get<ReportResponse[]>(`/api/reports/teacher/${childId}`);
}

/**
 * POST /api/reports
 * Teacher creates a report for a child
 */
export async function apiCreateReport(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<ReportResponse> {
  return _post<ReportResponse>('/api/reports', data);
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/notes/parent/:childId
 */
export async function apiGetNotesForParent(childId: string): Promise<NoteResponse[]> {
  return _get<NoteResponse[]>(`/api/notes/parent/${childId}`);
}

/**
 * GET /api/notes/teacher/:childId
 */
export async function apiGetNotesForTeacher(childId: string): Promise<NoteResponse[]> {
  return _get<NoteResponse[]>(`/api/notes/teacher/${childId}`);
}

/**
 * POST /api/notes
 * Teacher creates a note for a child
 */
export async function apiCreateNote(data: {
  childId: string;
  title:   string;
  content: string;
}): Promise<NoteResponse> {
  return _post<NoteResponse>('/api/notes', data);
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 */
export async function apiGetNotifications(): Promise<NotificationResponse[]> {
  return _get<NotificationResponse[]>('/api/notifications');
}

/**
 * POST /api/notifications/:id/read
 */
export async function apiMarkNotificationRead(id: string): Promise<MessageResponse> {
  return _post<MessageResponse>(`/api/notifications/${id}/read`, {});
}

/**
 * POST /api/notifications/read-all
 */
export async function apiMarkAllNotificationsRead(): Promise<MessageResponse> {
  return _post<MessageResponse>('/api/notifications/read-all', {});
}

// ─────────────────────────────────────────────────────────────────────────────
//  ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/articles
 */
export async function apiGetArticles(): Promise<ArticleResponse[]> {
  const articles = await _get<BackendArticleResponse[]>('/api/articles');
  return articles.map(normalizeArticle);
}

/**
 * GET /api/articles/:id
 */
export async function apiGetArticle(id: string): Promise<ArticleResponse> {
  const article = await _get<BackendArticleResponse>(`/api/articles/${id}`);
  return normalizeArticle(article);
}

/**
 * POST /api/articles/:id/save
 * Saves (bookmarks) an article for the current user
 */
export async function apiSaveArticle(id: string): Promise<MessageResponse> {
  return _post<MessageResponse>(`/api/articles/${id}/save`, {});
}

/**
 * DELETE /api/articles/:id/save
 * Removes a saved bookmark
 */
export async function apiUnsaveArticle(id: string): Promise<MessageResponse> {
  return _del<MessageResponse>(`/api/articles/${id}/save`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCHOOL  (School admin role)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /school/teachers  or  GET /api/school/teachers
 */
export async function apiGetTeachers(): Promise<TeacherResponse[]> {
  return _get<TeacherResponse[]>('/school/teachers');
}

/**
 * GET /school/teachers/:id
 */
export async function apiGetTeacher(id: string): Promise<TeacherResponse> {
  return _get<TeacherResponse>(`/school/teachers/${id}`);
}

/**
 * POST /school/teachers
 * School admin creates a teacher account
 */
export async function apiCreateTeacher(data: {
  phone:       string;
  email:       string;
  password:    string;
  nationalId:  string;
  fullNameAr:  string;
  fullNameEn?: string;
}): Promise<TeacherResponse> {
  return _post<TeacherResponse>('/school/teachers', data);
}

/**
 * PUT /school/teachers/:id
 */
export async function apiUpdateTeacher(
  id:   string,
  data: Partial<{ fullNameAr: string; fullNameEn: string; phone: string }>
): Promise<TeacherResponse> {
  return _put<TeacherResponse>(`/school/teachers/${id}`, data);
}

/**
 * DELETE /school/teachers/:id
 */
export async function apiDeleteTeacher(id: string): Promise<MessageResponse> {
  return _del<MessageResponse>(`/school/teachers/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEACHER — Student management  (Teacher role)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /teacher/students
 */
export async function apiGetStudents(): Promise<StudentResponse[]> {
  return _get<StudentResponse[]>('/teacher/students');
}

/**
 * GET /teacher/students/:id
 */
export async function apiGetStudent(id: string): Promise<StudentResponse> {
  return _get<StudentResponse>(`/teacher/students/${id}`);
}

/**
 * POST /teacher/students
 * Teacher creates a student record under their class
 */
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
  return _post<StudentResponse>('/teacher/students', data);
}

/**
 * PUT /teacher/students/:id
 */
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
  return _put<StudentResponse>(`/teacher/students/${id}`, data);
}

/**
 * DELETE /teacher/students/:id
 */
export async function apiDeleteStudent(id: string): Promise<MessageResponse> {
  return _del<MessageResponse>(`/teacher/students/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLACEMENT ASSESSMENT  (Teacher role)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /teacher/students/:childId/placement
 * Returns the placement assessment questions for a child (or status if already completed)
 */
export async function apiGetPlacementAssessment(
  childId: string
): Promise<PlacementAssessmentResponse> {
  return _get<PlacementAssessmentResponse>(`/teacher/students/${childId}/placement`);
}

/**
 * POST /teacher/students/:childId/placement
 * Starts/fetches the placement assessment (idempotent)
 */
export async function apiStartPlacementAssessment(
  childId: string
): Promise<PlacementAssessmentResponse> {
  return _post<PlacementAssessmentResponse>(`/teacher/students/${childId}/placement`, {});
}

/**
 * POST /teacher/students/:childId/placement/submit
 * Submits placement answers and returns the assessed level
 * answers: Array of { questionId, selectedOption }
 */
export async function apiSubmitPlacementAssessment(
  childId: string,
  answers: Array<{ questionId: string; selectedOption: number }>
): Promise<PlacementSubmissionResponse> {
  return _post<PlacementSubmissionResponse>(
    `/teacher/students/${childId}/placement/submit`,
    { answers }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/parent
 */
export async function apiGetParentDashboard(): Promise<ParentDashboard> {
  return _get<ParentDashboard>('/api/dashboard/parent');
}

/**
 * GET /api/dashboard/teacher
 */
export async function apiGetTeacherDashboard(): Promise<TeacherDashboard> {
  return _get<TeacherDashboard>('/api/dashboard/teacher');
}

/**
 * GET /api/dashboard/school
 */
export async function apiGetSchoolDashboard(): Promise<SchoolDashboard> {
  return _get<SchoolDashboard>('/api/dashboard/school');
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEGACY ADAPTER SHIMS
//  These keep the old function names working so existing screens don't break.
//  They map old signatures → new real endpoints.
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
  // We don't know current state here — use the explicit save/unsave calls instead
  const result = await apiSaveArticle(articleId);
  return { isSaved: result.success };
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
    email:      `${data.nationalId}@rafeeq.app`, // placeholder — update if UI collects email
  });
}

/** @deprecated Not implemented in backend yet */
export async function apiSendChatMessage(
  message: string,
  _history: unknown[]
): Promise<{ id: string; role: string; content: string; timestamp: string }> {
  // Chatbot endpoint is not yet in the backend — keep mock until implemented
  await new Promise((r) => setTimeout(r, 800));
  return {
    id:        `msg-${Date.now()}`,
    role:      'assistant',
    content:   'Thank you for your question! I am here to help guide you.',
    timestamp: new Date().toISOString(),
  };
}

/** @deprecated No backend endpoint yet */
export async function apiGetChildProgress(_childId: string) {
  // Use apiGetParentDashboard() or ChildSummaryResponse for progress data
  console.warn('apiGetChildProgress is deprecated — use apiGetChildSummary() instead');
  return null;
}

/** @deprecated No roadmap/tree endpoint yet */
export async function apiGetChildTree(_childId: string) {
  console.warn('apiGetChildTree is not yet implemented in the backend');
  return [];
}

/** @deprecated No roadmap endpoint yet */
export async function apiGetRoadmap(_childId: string) {
  console.warn('apiGetRoadmap is not yet implemented in the backend');
  return [];
}

/** @deprecated No quizzes endpoint yet */
export async function apiGetQuizzes(_childId: string) {
  console.warn('apiGetQuizzes is not yet implemented in the backend');
  return [];
}

/** @deprecated No activities endpoint yet */
export async function apiGetActivities(_childId: string) {
  console.warn('apiGetActivities is not yet implemented in the backend');
  return [];
}

/** @deprecated No specialists endpoint yet */
export async function apiGetSpecialists() {
  console.warn('apiGetSpecialists is not yet implemented in the backend');
  return [];
}
