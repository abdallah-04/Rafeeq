// mock/data.ts
// ─────────────────────────────────────────────────────────────────────────────
//  All exports match exactly what api.tsx imports.
//  Bilingual (EN + AR). 3–5 items per list.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  User, Parent, Teacher, School, Child, Progress,
  Task, Homework, Report, Note, Exam, Question, Score,
  Quiz, Article, Specialist, ChatMessage, Notification,
  TreeNode, SubjectGrade,
} from '@/types';

// ── PROGRESS ─────────────────────────────────────────────────────────────────
export const mockProgressZaid: Progress = {
  overall:          65,
  focusAttention:   72,
  mathematics:      59,
  socialSkills:     80,
  communication:    68,
  motorSkills:      55,
  tasksThisWeek:    5,
  totalTasks:       8,
  quizzesCompleted: 2,
  totalQuizzes:     4,
  activitiesDone:   3,
  totalActivities:  6,
  updatedAt:        '2026-04-01T10:00:00Z',
};

// ── CHILDREN ─────────────────────────────────────────────────────────────────
export const mockChildZaid: Child = {
  id:           'child-1',
  name:         'Zaid Ahmad',
  nameAr:       'زيد أحمد',
  nationalId:   '1234567890',
  dateOfBirth:  '2018-03-15',
  age:          8,
  gender:       'male',
  specialNeed:  'ADD',
  level:        2,
  schoolId:     'school-1',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-1',
  parentId:     'parent-1',
  progress:     mockProgressZaid,
  streakDays:   14,
  achievements: 3,
};

export const mockChildAyoub: Child = {
  id:           'child-2',
  name:         'Ayoub Maher',
  nameAr:       'أيوب ماهر',
  nationalId:   '2345678901',
  dateOfBirth:  '2017-06-10',
  age:          9,
  gender:       'male',
  specialNeed:  'ADD',
  level:        3,
  schoolId:     'school-1',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-1',
  parentId:     'parent-2',
  progress:     { ...mockProgressZaid, overall: 62 },
  streakDays:   5,
  achievements: 2,
};

export const mockChildMona: Child = {
  id:           'child-3',
  name:         'Mona Ramzi',
  nameAr:       'منى رمزي',
  nationalId:   '3456789012',
  dateOfBirth:  '2016-11-22',
  age:          9,
  gender:       'female',
  specialNeed:  'ADHD',
  level:        5,
  schoolId:     'school-1',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-1',
  parentId:     'parent-3',
  progress:     { ...mockProgressZaid, overall: 74 },
  streakDays:   10,
  achievements: 4,
};

export const mockChildren: Child[] = [mockChildZaid, mockChildAyoub, mockChildMona];

// ── USERS ─────────────────────────────────────────────────────────────────────
export const mockParent: User = {
  id:         'parent-1',
  name:       'Ahmad Al-Khalidi',
  nameAr:     'أحمد الخالدي',
  phone:      '+962791234567',
  nationalId: '1111111111',
  role:       'parent',
  language:   'en',
  createdAt:  '2026-01-10T08:00:00Z',
};

export const mockTeacher: User = {
  id:         'teacher-1',
  name:       'Sara Mahmoud',
  nameAr:     'سارة محمود',
  phone:      '+962799876543',
  nationalId: '2222222222',
  role:       'teacher',
  language:   'en',
  createdAt:  '2026-01-05T08:00:00Z',
};

// ── TEACHERS ─────────────────────────────────────────────────────────────────
export const mockTeachers: Teacher[] = [
  {
    id:            'teacher-1',
    name:          'Ahmad Sami',
    nameAr:        'أحمد سامي',
    phone:         '+962791111111',
    nationalId:    '4444444444',
    role:          'teacher',
    language:      'en',
    createdAt:     '2026-01-05T08:00:00Z',
    schoolId:      'school-1',
    grade:         'Grade 2',
    section:       'Section A',
    students:      mockChildren,
    teacherNumber: 'T-001',
  },
  {
    id:            'teacher-2',
    name:          'Tala Kamal',
    nameAr:        'تالا كمال',
    phone:         '+962792222222',
    nationalId:    '5555555555',
    role:          'teacher',
    language:      'en',
    createdAt:     '2026-01-08T08:00:00Z',
    schoolId:      'school-1',
    grade:         'Grade 3',
    section:       'Section B',
    students:      [],
    teacherNumber: 'T-002',
  },
];

// ── SCHOOL ────────────────────────────────────────────────────────────────────
export const mockSchool: School = {
  id:                'school-1',
  name:              'Al-Noor Special Education School',
  nameAr:            'مدرسة النور للتربية الخاصة',
  schoolId:          'SCH-001',
  advisorName:       'Omar Nasser',
  advisorNationalId: '3333333333',
  phone:             '+96264123456',
  location:          'Amman',
  teachers:          mockTeachers,
  createdAt:         '2025-09-01T08:00:00Z',
};

// ── HOMEWORK ─────────────────────────────────────────────────────────────────
export const mockHomework: Homework[] = [
  {
    id:           'hw-1',
    title:        'Math Worksheet',
    titleAr:      'ورقة عمل رياضيات',
    subject:      'Mathematics',
    subjectAr:    'الرياضيات',
    description:  'Complete pages 12–14 of the workbook.',
    dueDate:      '2026-04-05T00:00:00Z',
    assignedDate: '2026-04-01T00:00:00Z',
    status:       'not_submitted',
    teacherId:    'teacher-1',
    classId:      'class-1',
  },
  {
    id:           'hw-2',
    title:        'Reading Comprehension',
    titleAr:      'فهم المقروء',
    subject:      'Arabic',
    subjectAr:    'اللغة العربية',
    description:  'Read the story and answer the questions.',
    dueDate:      '2026-04-04T00:00:00Z',
    assignedDate: '2026-04-01T00:00:00Z',
    status:       'submitted',
    teacherId:    'teacher-1',
    classId:      'class-1',
  },
  {
    id:           'hw-3',
    title:        'Science Diagram',
    titleAr:      'رسم علوم',
    subject:      'Science',
    subjectAr:    'العلوم',
    description:  'Draw and label the water cycle.',
    dueDate:      '2026-04-06T00:00:00Z',
    assignedDate: '2026-04-02T00:00:00Z',
    status:       'graded',
    grade:        90,
    teacherId:    'teacher-1',
    classId:      'class-1',
  },
];

// ── QUESTIONS ─────────────────────────────────────────────────────────────────
export const mockQuestionsColors: Question[] = [
  {
    id:            'qc-1',
    quizId:        'quiz-colors',
    text:          'What colour is the sky?',
    textAr:        'ما لون السماء؟',
    type:          'multiple_choice',
    options:       ['Red', 'Blue', 'Green', 'Yellow'],
    optionsAr:     ['أحمر', 'أزرق', 'أخضر', 'أصفر'],
    correctAnswer: 'Blue',
    order:         1,
  },
  {
    id:            'qc-2',
    quizId:        'quiz-colors',
    text:          'Grass is green.',
    textAr:        'العشب أخضر اللون.',
    type:          'true_false',
    options:       ['True', 'False'],
    optionsAr:     ['صحيح', 'خطأ'],
    correctAnswer: 'True',
    order:         2,
  },
  {
    id:            'qc-3',
    quizId:        'quiz-colors',
    text:          'What colour is a banana?',
    textAr:        'ما لون الموزة؟',
    type:          'multiple_choice',
    options:       ['Purple', 'Orange', 'Yellow', 'Pink'],
    optionsAr:     ['بنفسجي', 'برتقالي', 'أصفر', 'وردي'],
    correctAnswer: 'Yellow',
    order:         3,
  },
];

export const mockQuestionsNumbers: Question[] = [
  {
    id:            'qn-1',
    quizId:        'quiz-numbers',
    text:          'What is 2 + 3?',
    textAr:        'ما هو 2 + 3؟',
    type:          'multiple_choice',
    options:       ['3', '4', '5', '6'],
    optionsAr:     ['٣', '٤', '٥', '٦'],
    correctAnswer: '5',
    order:         1,
  },
  {
    id:            'qn-2',
    quizId:        'quiz-numbers',
    text:          'How many days are in a week?',
    textAr:        'كم عدد أيام الأسبوع؟',
    type:          'multiple_choice',
    options:       ['5', '6', '7', '8'],
    optionsAr:     ['٥', '٦', '٧', '٨'],
    correctAnswer: '7',
    order:         2,
  },
  {
    id:            'qn-3',
    quizId:        'quiz-numbers',
    text:          '10 is greater than 5.',
    textAr:        '١٠ أكبر من ٥.',
    type:          'true_false',
    options:       ['True', 'False'],
    optionsAr:     ['صحيح', 'خطأ'],
    correctAnswer: 'True',
    order:         3,
  },
];

// ── QUIZZES ───────────────────────────────────────────────────────────────────
export const mockQuizzes: Quiz[] = [
  {
    id:            'quiz-1',
    title:         'Math Quiz 2',
    titleAr:       'اختبار رياضيات ٢',
    subject:       'Mathematics',
    subjectAr:     'الرياضيات',
    level:         2,
    questionCount: 3,
    durationMins:  10,
    status:        'new',
    questions:     mockQuestionsNumbers,
    assignedDate:  '2026-04-01T00:00:00Z',
    dueDate:       '2026-04-07T00:00:00Z',
    teacherId:     'teacher-1',
    classId:       'class-1',
  },
  {
    id:            'quiz-2',
    title:         'Colours Quiz',
    titleAr:       'اختبار الألوان',
    subject:       'Science',
    subjectAr:     'العلوم',
    level:         1,
    questionCount: 3,
    durationMins:  8,
    status:        'completed',
    score:         { childId: 'child-1', quizId: 'quiz-2', correct: 2, total: 3, percentage: 67, completedAt: '2026-03-28T11:00:00Z' },
    questions:     mockQuestionsColors,
    assignedDate:  '2026-03-25T00:00:00Z',
    dueDate:       '2026-03-30T00:00:00Z',
    teacherId:     'teacher-1',
    classId:       'class-1',
  },
  {
    id:            'quiz-3',
    title:         'Arabic Reading Quiz',
    titleAr:       'اختبار القراءة العربية',
    subject:       'Arabic',
    subjectAr:     'اللغة العربية',
    level:         2,
    questionCount: 4,
    durationMins:  12,
    status:        'in_progress',
    questions:     [],
    assignedDate:  '2026-04-02T00:00:00Z',
    dueDate:       '2026-04-08T00:00:00Z',
    teacherId:     'teacher-1',
    classId:       'class-1',
  },
];

// ── TASKS ─────────────────────────────────────────────────────────────────────
export const mockTasks: Task[] = [
  {
    id:            'task-1',
    title:         'Colour Sorting',
    titleAr:       'ترتيب الألوان',
    description:   'Sort coloured blocks into matching groups.',
    descriptionAr: 'رتّب المكعبات الملونة في مجموعات متطابقة.',
    status:        'completed',
    childId:       'child-1',
    dueDate:       '2026-04-01T00:00:00Z',
    completedAt:   '2026-04-01T12:00:00Z',
    dayNumber:     1,
  },
  {
    id:            'task-2',
    title:         'Story Sequencing',
    titleAr:       'تسلسل القصة',
    description:   'Arrange the story pictures in the correct order.',
    descriptionAr: 'رتّب صور القصة بالترتيب الصحيح.',
    status:        'in_progress',
    childId:       'child-1',
    dueDate:       '2026-04-03T00:00:00Z',
    dayNumber:     2,
  },
  {
    id:            'task-3',
    title:         'Counting Objects',
    titleAr:       'عدّ الأشياء',
    description:   'Count the objects on each card and write the number.',
    descriptionAr: 'عدّ الأشياء في كل بطاقة واكتب الرقم.',
    status:        'pending',
    childId:       'child-1',
    dueDate:       '2026-04-05T00:00:00Z',
    dayNumber:     3,
  },
  {
    id:            'task-4',
    title:         'Shape Matching',
    titleAr:       'مطابقة الأشكال',
    description:   'Match each shape to its correct shadow.',
    descriptionAr: 'طابق كل شكل مع ظله الصحيح.',
    status:        'pending',
    childId:       'child-1',
    dueDate:       '2026-04-06T00:00:00Z',
    dayNumber:     4,
  },
];

// ── LEARNING TREE ─────────────────────────────────────────────────────────────
export const mockTreeNodes: TreeNode[] = [
  { day: 1, title: 'Day 1', titleAr: 'اليوم ١', status: 'completed', tasks: [mockTasks[0]] },
  { day: 2, title: 'Day 2', titleAr: 'اليوم ٢', status: 'completed', tasks: [] },
  { day: 3, title: 'Day 3', titleAr: 'اليوم ٣', status: 'completed', tasks: [] },
  { day: 4, title: 'Day 4', titleAr: 'اليوم ٤', status: 'current',   tasks: [mockTasks[1]] },
  { day: 5, title: 'Day 5', titleAr: 'اليوم ٥', status: 'upcoming',  tasks: [] },
  { day: 6, title: 'Day 6', titleAr: 'اليوم ٦', status: 'upcoming',  tasks: [] },
  { day: 7, title: 'Day 7', titleAr: 'اليوم ٧', status: 'locked',    tasks: [] },
];

// ── REPORTS ───────────────────────────────────────────────────────────────────
export const mockReports: Report[] = [
  {
    id:          'rep-1',
    title:       'Weekly Progress Report',
    titleAr:     'تقرير التقدم الأسبوعي',
    body:        'Zaid has shown great improvement in focus this week. He completed all tasks on time.',
    bodyAr:      'أظهر زيد تحسناً كبيراً في التركيز هذا الأسبوع. أتم جميع المهام في الوقت المحدد.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'unread',
    createdAt:   '2026-03-31T10:00:00Z',
    childId:     'child-1',
  },
  {
    id:          'rep-2',
    title:       'Behavioral Observation',
    titleAr:     'ملاحظة سلوكية',
    body:        'Lara is responding well to the new structured routine.',
    bodyAr:      'استجابت لارا بشكل جيد للروتين المنظم الجديد.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'read',
    createdAt:   '2026-03-24T10:00:00Z',
    childId:     'child-2',
  },
  {
    id:          'rep-3',
    title:       'Monthly Summary',
    titleAr:     'ملخص شهري',
    body:        'Overall performance is on track. Focus on motor skills.',
    bodyAr:      'الأداء العام في المسار الصحيح. التركيز على المهارات الحركية.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'unread',
    createdAt:   '2026-03-15T10:00:00Z',
    childId:     'child-1',
  },
];

// ── NOTES ─────────────────────────────────────────────────────────────────────
export const mockNotes: Note[] = [
  {
    id:         'note-1',
    title:      'Reminder: Medication',
    titleAr:    'تذكير: الدواء',
    body:       'Please give Zaid his medication before school.',
    bodyAr:     'يرجى إعطاء زيد دواءه قبل المدرسة.',
    authorName: 'Ms. Sara Mahmoud',
    createdAt:  '2026-04-01T08:00:00Z',
    childId:    'child-1',
    teacherId:  'teacher-1',
  },
  {
    id:         'note-2',
    title:      'Great Day!',
    titleAr:    'يوم رائع!',
    body:       'Zaid had an exceptional day — very focused and cooperative.',
    bodyAr:     'كان لزيد يوم استثنائي — متركز للغاية ومتعاون.',
    authorName: 'Ms. Sara Mahmoud',
    createdAt:  '2026-03-28T14:00:00Z',
    childId:    'child-1',
    teacherId:  'teacher-1',
  },
];

// ── ARTICLES ──────────────────────────────────────────────────────────────────
export const mockArticles: Article[] = [
  {
    id:           'art-1',
    title:        '5 Ways to Support a Child with ADHD at Home',
    titleAr:      '٥ طرق لدعم طفل مصاب بفرط الحركة في المنزل',
    body:         'Creating a structured environment is key to helping children with ADHD thrive...',
    bodyAr:       'إنشاء بيئة منظمة هو المفتاح لمساعدة الأطفال المصابين بفرط الحركة...',
    category:     'parenting',
    readTimeMins: 4,
    viewCount:    1204,
    likeCount:    87,
    isSaved:      false,
    authorName:   'Dr. Rana Haddad',
    publishedAt:  '2026-03-20T00:00:00Z',
  },
  {
    id:           'art-2',
    title:        'Understanding Autism Spectrum Disorder',
    titleAr:      'فهم اضطراب طيف التوحد',
    body:         'ASD is a developmental disorder that affects communication and behaviour...',
    bodyAr:       'التوحد اضطراب تطوري يؤثر على التواصل والسلوك...',
    category:     'special_needs',
    readTimeMins: 6,
    viewCount:    3421,
    likeCount:    215,
    isSaved:      true,
    authorName:   'Dr. Khalid Mansour',
    publishedAt:  '2026-03-10T00:00:00Z',
  },
  {
    id:           'art-3',
    title:        'Speech Therapy Activities You Can Do at Home',
    titleAr:      'أنشطة علاج النطق التي يمكنك ممارستها في المنزل',
    body:         'Simple daily activities can make a huge difference in speech development...',
    bodyAr:       'يمكن للأنشطة اليومية البسيطة أن تُحدث فرقاً كبيراً في تطور النطق...',
    category:     'speech',
    readTimeMins: 3,
    viewCount:    890,
    likeCount:    64,
    isSaved:      false,
    authorName:   'Ms. Lina Barakat',
    publishedAt:  '2026-02-28T00:00:00Z',
  },
  {
    id:           'art-4',
    title:        'How to Build a Homework Routine for Special Needs Children',
    titleAr:      'كيف تبني روتين واجبات للأطفال ذوي الاحتياجات الخاصة',
    body:         'Consistency and patience are the two pillars of a successful homework routine...',
    bodyAr:       'الاتساق والصبر هما ركيزتا روتين الواجبات الناجح...',
    category:     'learning',
    readTimeMins: 5,
    viewCount:    672,
    likeCount:    45,
    isSaved:      true,
    authorName:   'Ms. Hana Mansour',
    publishedAt:  '2026-02-15T00:00:00Z',
  },
];

export const mockSavedArticles: Article[] = mockArticles.filter((a) => a.isSaved);

// ── CHAT MESSAGES ─────────────────────────────────────────────────────────────
export const mockChatMessages: ChatMessage[] = [
  {
    id:        'msg-1',
    role:      'user',
    content:   'How can I help my child focus better?',
    timestamp: '2026-04-01T09:00:00Z',
  },
  {
    id:        'msg-2',
    role:      'assistant',
    content:   'Great question! Here are 3 strategies: 1) Break tasks into small steps. 2) Use a visual timer. 3) Offer short movement breaks every 20 minutes.',
    timestamp: '2026-04-01T09:00:05Z',
  },
];

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id:        'notif-1',
    type:      'homework',
    title:     'New Homework Assigned',
    titleAr:   'تم تعيين واجب جديد',
    body:      'Math Worksheet is due on April 5th.',
    bodyAr:    'ورقة عمل الرياضيات مستحقة في ٥ أبريل.',
    isRead:    false,
    createdAt: '2026-04-01T08:30:00Z',
    targetId:  'hw-1',
  },
  {
    id:        'notif-2',
    type:      'report',
    title:     'New Report from Teacher',
    titleAr:   'تقرير جديد من المعلم',
    body:      'Ms. Sara has submitted a weekly progress report.',
    bodyAr:    'أرسلت الأستاذة سارة تقرير التقدم الأسبوعي.',
    isRead:    false,
    createdAt: '2026-03-31T10:00:00Z',
    targetId:  'rep-1',
  },
  {
    id:        'notif-3',
    type:      'achievement',
    title:     'Achievement Unlocked!',
    titleAr:   'تم فتح إنجاز جديد!',
    body:      'Zaid completed 7 days in a row. Great job!',
    bodyAr:    'أتمّ زيد ٧ أيام متتالية. أحسنت!',
    isRead:    true,
    createdAt: '2026-03-28T16:00:00Z',
  },
];

// ── SUBJECT GRADES ─────────────────────────────────────────────────────────────
export const mockSubjectGrades: SubjectGrade[] = [
  { subject: 'Mathematics',  subjectAr: 'الرياضيات',       score: 92, maxScore: 100, color: '#4A8BF5' },
  { subject: 'Arabic',       subjectAr: 'اللغة العربية',   score: 88, maxScore: 100, color: '#22C55E' },
  { subject: 'Science',      subjectAr: 'العلوم',           score: 79, maxScore: 100, color: '#F97316' },
  { subject: 'English',      subjectAr: 'اللغة الإنجليزية',score: 84, maxScore: 100, color: '#8B6CF6' },
  { subject: 'Art',          subjectAr: 'التربية الفنية',   score: 55, maxScore: 100, color: '#EC4899' },
  { subject: 'PE',           subjectAr: 'التربية البدنية',  score: 97, maxScore: 100, color: '#F59E0B' },
];