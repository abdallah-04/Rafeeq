// services/api.ts
// ─────────────────────────────────────────────────────────────────────────────
//  Every function is typed and returns mock data.
//  To connect real backend: replace the mock return with a real fetch() call.
//  API_BASE_URL is set in .env as EXPO_PUBLIC_API_BASE_URL
// ─────────────────────────────────────────────────────────────────────────────

import type {
  User, Child, Homework, Report, Note,
  Quiz, Article, Specialist, ChatMessage, Notification, TreeNode,
} from '@/types';

import {
  mockParentUser, mockTeacherUser, mockSchoolUser,
  mockChildren, mockTeachers, mockSchool,
  mockHomework, mockReports, mockNotes,
  mockQuizzes, mockTree, mockArticles,
  mockSpecialists, mockChatMessages, mockNotifications,
} from '@/mock/data';

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.rafeeq.app';

// Helper — swap this for real fetch when backend is ready
async function _get<T>(path: string): Promise<T> {
  // TODO: replace with:
  // const res = await fetch(`${API_BASE_URL}${path}`, {
  //   headers: { Authorization: `Bearer ${token}`, 'Accept-Language': lang },
  // });
  // if (!res.ok) throw new Error(res.statusText);
  // return res.json();
  await new Promise((r) => setTimeout(r, 400)); // simulate network delay
  throw new Error(`_get not yet wired for: ${path}`);
}

async function _post<T>(path: string, body: unknown): Promise<T> {
  // TODO: replace with real POST fetch
  await new Promise((r) => setTimeout(r, 400));
  throw new Error(`_post not yet wired for: ${path}`);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/** POST /auth/login */
export async function apiLogin(
  nationalId: string,
  password: string
): Promise<{ user: User; token: string }> {
  // TODO: replace with real call
  // return _post('/auth/login', { nationalId, password });
  await new Promise((r) => setTimeout(r, 600));
  return { user: mockParentUser, token: 'mock-token-parent' };
}

/** POST /auth/register/parent */
export async function apiRegisterParent(data: {
  nationalId: string;
  phone: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  // TODO: return _post('/auth/register/parent', data);
  await new Promise((r) => setTimeout(r, 600));
  return { user: mockParentUser, token: 'mock-token-parent' };
}

/** POST /auth/register/school */
export async function apiRegisterSchool(data: {
  schoolName: string;
  schoolId: string;
  advisorName: string;
  advisorNationalId: string;
  phone: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  // TODO: return _post('/auth/register/school', data);
  await new Promise((r) => setTimeout(r, 600));
  return { user: mockSchoolUser, token: 'mock-token-school' };
}

/** POST /auth/verify-otp */
export async function apiVerifyOTP(
  phone: string,
  code: string
): Promise<{ success: boolean }> {
  // TODO: return _post('/auth/verify-otp', { phone, code });
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

/** POST /auth/forgot-password */
export async function apiForgotPassword(
  nationalId: string
): Promise<{ maskedPhone: string }> {
  // TODO: return _post('/auth/forgot-password', { nationalId });
  await new Promise((r) => setTimeout(r, 500));
  return { maskedPhone: '******785' };
}

/** POST /auth/reset-password */
export async function apiResetPassword(
  nationalId: string,
  newPassword: string
): Promise<{ success: boolean }> {
  // TODO: return _post('/auth/reset-password', { nationalId, newPassword });
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

/** POST /auth/sanad-oauth */
export async function apiSanadOAuth(): Promise<{ user: User; token: string }> {
  // TODO: return _post('/auth/sanad-oauth', {});
  await new Promise((r) => setTimeout(r, 500));
  return { user: mockParentUser, token: 'mock-token-sanad' };
}

// ── Children ──────────────────────────────────────────────────────────────────

/** GET /children */
export async function apiGetChildren(): Promise<Child[]> {
  // TODO: return _get('/children');
  await new Promise((r) => setTimeout(r, 400));
  return mockChildren;
}

/** POST /children */
export async function apiAddChild(nationalId: string): Promise<Child> {
  // TODO: return _post('/children', { nationalId });
  await new Promise((r) => setTimeout(r, 600));
  return mockChildren[0];
}

/** GET /children/:id/progress */
export async function apiGetChildProgress(childId: string) {
  // TODO: return _get(`/children/${childId}/progress`);
  await new Promise((r) => setTimeout(r, 400));
  return mockChildren.find((c) => c.id === childId)?.progress ?? null;
}

/** GET /children/:id/tree */
export async function apiGetChildTree(childId: string): Promise<TreeNode[]> {
  // TODO: return _get(`/children/${childId}/tree`);
  await new Promise((r) => setTimeout(r, 400));
  return mockTree;
}

/** GET /children/:id/homework */
export async function apiGetHomework(childId: string): Promise<Homework[]> {
  // TODO: return _get(`/children/${childId}/homework`);
  await new Promise((r) => setTimeout(r, 400));
  return mockHomework;
}

/** POST /children/:id/homework/submit */
export async function apiSubmitHomework(
  childId: string,
  homeworkId: string
): Promise<{ success: boolean }> {
  // TODO: return _post(`/children/${childId}/homework/submit`, { homeworkId });
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

/** GET /children/:id/quizzes */
export async function apiGetQuizzes(childId: string) {
  // TODO: return _get(`/children/${childId}/quizzes`);
  await new Promise((r) => setTimeout(r, 400));
  return mockQuizzes;
}

/** GET /children/:id/activities */
export async function apiGetActivities(childId: string) {
  // TODO: return _get(`/children/${childId}/activities`);
  await new Promise((r) => setTimeout(r, 400));
  return [];
}

// ── Teacher ───────────────────────────────────────────────────────────────────

/** GET /teacher/students */
export async function apiGetStudents() {
  // TODO: return _get('/teacher/students');
  await new Promise((r) => setTimeout(r, 400));
  return mockChildren;
}

/** POST /teacher/homework */
export async function apiAddHomework(data: Partial<Homework>) {
  // TODO: return _post('/teacher/homework', data);
  await new Promise((r) => setTimeout(r, 500));
  return { ...data, id: `hw-${Date.now()}` };
}

/** POST /teacher/reports */
export async function apiAddReport(data: Partial<Report>) {
  // TODO: return _post('/teacher/reports', data);
  await new Promise((r) => setTimeout(r, 500));
  return { ...data, id: `rep-${Date.now()}` };
}

/** POST /teacher/notes */
export async function apiAddNote(data: Partial<Note>) {
  // TODO: return _post('/teacher/notes', data);
  await new Promise((r) => setTimeout(r, 500));
  return { ...data, id: `note-${Date.now()}` };
}

/** GET /teacher/exam/:id */
export async function apiGetExam(examId: string) {
  // TODO: return _get(`/teacher/exam/${examId}`);
  await new Promise((r) => setTimeout(r, 400));
  return mockQuizzes[0];
}

/** POST /teacher/exam/:id/score */
export async function apiSubmitExamScore(examId: string, childId: string, score: number, total: number) {
  // TODO: return _post(`/teacher/exam/${examId}/score`, { childId, score, total });
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

// ── School ────────────────────────────────────────────────────────────────────

/** GET /school/teachers */
export async function apiGetTeachers() {
  // TODO: return _get('/school/teachers');
  await new Promise((r) => setTimeout(r, 400));
  return mockTeachers;
}

/** POST /school/teachers */
export async function apiAddTeacher(data: {
  name: string;
  nationalId: string;
  phone: string;
  password: string;
}) {
  // TODO: return _post('/school/teachers', data);
  await new Promise((r) => setTimeout(r, 600));
  return mockTeachers[0];
}

// ── Reports / Notes (parent view) ─────────────────────────────────────────────

/** GET reports for a child */
export async function apiGetReports(childId: string): Promise<Report[]> {
  // TODO: return _get(`/children/${childId}/reports`);
  await new Promise((r) => setTimeout(r, 400));
  return mockReports.filter((r) => r.childId === childId);
}

/** GET notes for a child */
export async function apiGetNotes(childId: string): Promise<Note[]> {
  // TODO: return _get(`/children/${childId}/notes`);
  await new Promise((r) => setTimeout(r, 400));
  return mockNotes.filter((n) => n.childId === childId);
}

// ── Content ───────────────────────────────────────────────────────────────────

/** GET /articles */
export async function apiGetArticles(): Promise<Article[]> {
  // TODO: return _get('/articles');
  await new Promise((r) => setTimeout(r, 400));
  return mockArticles;
}

/** POST /articles/:id/save */
export async function apiToggleSaveArticle(articleId: string): Promise<{ isSaved: boolean }> {
  // TODO: return _post(`/articles/${articleId}/save`, {});
  await new Promise((r) => setTimeout(r, 300));
  return { isSaved: true };
}

/** GET /specialists */
export async function apiGetSpecialists(): Promise<Specialist[]> {
  // TODO: return _get('/specialists');
  await new Promise((r) => setTimeout(r, 400));
  return mockSpecialists;
}

// ── Chatbot ───────────────────────────────────────────────────────────────────

/** POST /chatbot/message */
export async function apiSendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<ChatMessage> {
  // TODO: return _post('/chatbot/message', { message, history });
  await new Promise((r) => setTimeout(r, 800));
  return {
    id:        `msg-${Date.now()}`,
    role:      'assistant',
    content:   'Thank you for your question! I am here to help guide you.',
    timestamp: new Date().toISOString(),
  };
}

// ── Notifications ─────────────────────────────────────────────────────────────

/** GET /notifications */
export async function apiGetNotifications(): Promise<Notification[]> {
  // TODO: return _get('/notifications');
  await new Promise((r) => setTimeout(r, 400));
  return mockNotifications;
}

// ── ML / AI ───────────────────────────────────────────────────────────────────

/** POST /ml/evaluate-child */
export async function apiEvaluateChild(childId: string, answers: Record<string, string>) {
  // TODO: return _post('/ml/evaluate-child', { childId, answers });
  await new Promise((r) => setTimeout(r, 1000));
  return { roadmapId: 'roadmap-1' };
}

/** GET /ml/roadmap/:id */
export async function apiGetRoadmap(childId: string): Promise<TreeNode[]> {
  // TODO: return _get(`/ml/roadmap/${childId}`);
  await new Promise((r) => setTimeout(r, 600));
  return mockTree;
}