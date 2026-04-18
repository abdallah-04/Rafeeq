// Shared teacher-side student data — single source of truth for all (teacher) screens.
// Underscore prefix keeps Expo Router from treating this as a route.

export type TeacherStudent = {
  id: string;
  name: string;
  nameAr: string;
  condition: string;
  conditionColor: string;
  age: number;
  level: string;
  levelColor: string;
  progress: number;
  status: string;
  avatarBg: string;
  initials: string;
};

export const TEACHER_STUDENTS: TeacherStudent[] = [
  {
    id: '1',
    name: 'Ayoub Maher',
    nameAr: 'أيوب ماهر',
    condition: 'ADD',
    conditionColor: '#508DF7',
    age: 8,
    level: 'Level 3',
    levelColor: '#BA6DE9',
    progress: 62,
    status: 'Active',
    avatarBg: '#FFD9B3',
    initials: 'AM',
  },
  {
    id: '2',
    name: 'Mona Ramzi',
    nameAr: 'منى رمزي',
    condition: 'not specified yet',
    conditionColor: '#FF6B6B',
    age: 9,
    level: 'Level 0',
    levelColor: '#BA6DE9',
    progress: 0,
    status: 'Active',
    avatarBg: '#C8E6C9',
    initials: 'MR',
  },
  {
    id: '3',
    name: 'Nagham Marq',
    nameAr: 'نغم مارق',
    condition: 'IFD',
    conditionColor: '#FFB84C',
    age: 7,
    level: 'Level 1',
    levelColor: '#BA6DE9',
    progress: 48,
    status: 'Active',
    avatarBg: '#BBDEFB',
    initials: 'NM',
  },
];

// Keyed record for O(1) lookup by id
export const TEACHER_STUDENTS_MAP: Record<string, TeacherStudent> = Object.fromEntries(
  TEACHER_STUDENTS.map((s) => [s.id, s])
);
