# Teacher Navigation Wiring — M2 Days 4–5

All routes live inside `app/(teacher)/`. Expo Router handles file-based routing automatically.

---

## Route Map

| File | Route | Navigates To |
|------|-------|-------------|
| `_layout.tsx` | Tab navigator root | index / profile / students |
| `index.tsx` | `/(teacher)/` | → `student-quick-access` (on student card press) |
| `students.tsx` | `/(teacher)/students` | → `student-quick-access`, `add-student` |
| `student-quick-access.tsx` | `/(teacher)/student-quick-access` | → `student-dashboard`, `road-map`, `monthly-exam`, `reports` |
| `student-dashboard.tsx` | `/(teacher)/student-dashboard` | → `notes`, `homework`, `reports` |
| `notes.tsx` | `/(teacher)/notes` | → `add-note` |
| `add-note.tsx` | `/(teacher)/add-note` | → back |
| `homework.tsx` | `/(teacher)/homework` | inline form (no separate route) |
| `reports.tsx` | `/(teacher)/reports` | inline form (no separate route) |
| `monthly-exam.tsx` | `/(teacher)/monthly-exam` | inline Q1→Q2→Q3→score modal |
| `road-map.tsx` | `/(teacher)/road-map` | inline day modals + quiz modal |
| `profile.tsx` | `/(teacher)/profile` | language toggle (i18n) |
| `add-student.tsx` | `/(teacher)/add-student` | → back |

---

## Wire 1: Students list → Quick Access → Dashboard

```tsx
// In index.tsx / students.tsx
router.push({ pathname: '/(teacher)/student-quick-access', params: { studentId: item.id } });

// In student-quick-access.tsx → Dashboard
router.push({ pathname: '/(teacher)/student-dashboard', params: { studentId } });
```

## Wire 2: Dashboard → Notes → Add Note → back

```tsx
// In student-dashboard.tsx
router.push({ pathname: '/(teacher)/notes', params: { studentId } });

// In notes.tsx
router.push({ pathname: '/(teacher)/add-note', params: { studentId } });

// In add-note.tsx
router.back();
```

## Wire 3: Dashboard → H.W

```tsx
// In student-dashboard.tsx
router.push({ pathname: '/(teacher)/homework', params: { studentId } });
// H.W detail is an inline modal inside homework.tsx
```

## Wire 4: Dashboard → Reports

```tsx
// In student-dashboard.tsx
router.push({ pathname: '/(teacher)/reports', params: { studentId } });
// Report detail is inline inside reports.tsx
```

## Wire 5: Quick Access → Monthly Exam → Question flow → Score modal

```tsx
// In student-quick-access.tsx
router.push({ pathname: '/(teacher)/monthly-exam', params: { studentId } });
// Inside monthly-exam.tsx: phase state machine: 'info' → 'quiz' → score modal
// Score modal closes → router.back()
```

## Wire 6: Quick Access → Road Map

```tsx
// In student-quick-access.tsx
router.push({ pathname: '/(teacher)/road-map', params: { studentId } });
```

## Wire 7: Day work modals fire at correct trigger

```tsx
// In road-map.tsx — modals are triggered by tapping day nodes
// Day 4 → "What to do today" modal
// Day 5 → "Day 5 Work (Task 7 & H.W 5)" modal
// Day 6 → "Day 6 Work (Quiz 3 & H.W 5)" modal
// Day 7 → "Day 7 Work (Exam 1)" modal
// All "Great Job" modals trigger after completing tasks/HW/exams
```

## Wire 8: EN / AR verification

```tsx
// In profile.tsx — language toggle
i18n.changeLanguage('ar'); // triggers RTL
i18n.changeLanguage('en'); // triggers LTR

// In app/_layout.tsx (root):
import { I18nManager } from 'react-native';
I18nManager.forceRTL(isRTL);
```

---

## Params passed between screens

All screens receive `studentId` via `useLocalSearchParams<{ studentId: string }>()`.

```tsx
// Example
const { studentId } = useLocalSearchParams<{ studentId: string }>();
const student = STUDENTS[studentId ?? '1'];
```

---

## Mock Data → Real API swap

When backend is ready, replace `STUDENTS` constant with:

```tsx
import { getStudents, getStudentById } from '@/services/api';
const { data: students } = useQuery(['students'], getStudents);
```

All service function signatures are already defined in `services/api.ts`.
