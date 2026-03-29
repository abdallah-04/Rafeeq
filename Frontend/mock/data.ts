import type {
  Child,
  Parent,
  Teacher,
  School,
  Progress,
  Task,
  Homework,
  Quiz,
  Question,
  Report,
  Note,
  Article,
  ChatMessage,
  Notification,
  SubjectGrade,
  TreeNode,
  AuthState,
} from '../types'

// ─────────────────────────────────────────────
//  1. PROGRESS
//  Defined first because Child references it
// ─────────────────────────────────────────────

export const mockProgressZaid: Progress = {
  overall:          65,
  focusAttention:   62,
  mathematics:      59,
  socialSkills:     90,
  communication:    70,
  motorSkills:      55,
  tasksThisWeek:    2,
  totalTasks:       8,
  quizzesCompleted: 1,
  totalQuizzes:     3,
  activitiesDone:   4,
  totalActivities:  6,
  updatedAt:        '2026-03-28T10:00:00Z',
}

export const mockProgressAyoub: Progress = {
  overall:          78,
  focusAttention:   80,
  mathematics:      75,
  socialSkills:     68,
  communication:    85,
  motorSkills:      72,
  tasksThisWeek:    5,
  totalTasks:       8,
  quizzesCompleted: 2,
  totalQuizzes:     3,
  activitiesDone:   5,
  totalActivities:  6,
  updatedAt:        '2026-03-28T09:00:00Z',
}

export const mockProgressMona: Progress = {
  overall:          45,
  focusAttention:   40,
  mathematics:      38,
  socialSkills:     55,
  communication:    50,
  motorSkills:      42,
  tasksThisWeek:    1,
  totalTasks:       8,
  quizzesCompleted: 0,
  totalQuizzes:     3,
  activitiesDone:   2,
  totalActivities:  6,
  updatedAt:        '2026-03-27T14:00:00Z',
}

// ─────────────────────────────────────────────
//  2. CHILDREN
//  Core of the app — every other object links
//  back to a child via childId
// ─────────────────────────────────────────────

export const mockChildZaid: Child = {
  id:           'child-001',
  name:         'Zaid Ahmad',
  nameAr:       'زيد أحمد',
  nationalId:   '1234567890',
  dateOfBirth:  '2018-03-15',
  age:          8,
  gender:       'male',
  avatarUrl:    undefined,          // no photo — will show initials
  specialNeed:  'ADD',
  level:        2,
  schoolId:     'school-001',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-001',
  parentId:     'parent-001',
  progress:     mockProgressZaid,
  streakDays:   14,
  achievements: 3,
}

export const mockChildAyoub: Child = {
  id:           'child-002',
  name:         'Ayoub Maher',
  nameAr:       'أيوب ماهر',
  nationalId:   '0987654321',
  dateOfBirth:  '2017-07-22',
  age:          9,
  gender:       'male',
  avatarUrl:    undefined,
  specialNeed:  'ADHD',
  level:        3,
  schoolId:     'school-001',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-001',
  parentId:     'parent-002',
  progress:     mockProgressAyoub,
  streakDays:   7,
  achievements: 5,
}

export const mockChildMona: Child = {
  id:           'child-003',
  name:         'Mona Ramzi',
  nameAr:       'منى رمزي',
  nationalId:   '1122334455',
  dateOfBirth:  '2019-01-10',
  age:          7,
  gender:       'female',
  avatarUrl:    undefined,
  specialNeed:  'ASD',
  level:        1,
  schoolId:     'school-001',
  schoolName:   'Al-Noor School',
  teacherId:    'teacher-001',
  parentId:     'parent-003',
  progress:     mockProgressMona,
  streakDays:   3,
  achievements: 1,
}

// Convenience array — use this for lists
export const mockChildren: Child[] = [
  mockChildZaid,
  mockChildAyoub,
  mockChildMona,
]

// ─────────────────────────────────────────────
//  3. PARENT
//  One parent per child for now.
//  mockParent is the "logged in" parent (Zaid's dad)
// ─────────────────────────────────────────────

export const mockParent: Parent = {
  id:         'parent-001',
  name:       'Ahmad Khalid',
  nameAr:     'أحمد خالد',
  phone:      '+96279XXXXXXX',
  nationalId: '9988776655',
  role:       'parent',
  avatarUrl:  undefined,
  language:   'en',
  createdAt:  '2026-01-10T08:00:00Z',
  children:   [mockChildZaid],      // Zaid is Ahmad's child
}

// ─────────────────────────────────────────────
//  4. TEACHER
//  Ahmad Sami teaches the class that includes
//  all three mock children
// ─────────────────────────────────────────────

export const mockTeacher: Teacher = {
  id:           'teacher-001',
  name:         'Ahmad Sami',
  nameAr:       'أحمد سامي',
  phone:        '+96278XXXXXXX',
  nationalId:   '5566778899',
  role:         'teacher',
  avatarUrl:    undefined,
  language:     'en',
  createdAt:    '2025-09-01T08:00:00Z',
  schoolId:     'school-001',
  grade:        'Grade 2',
  section:      'Section A',
  teacherNumber: 'TCH-2024-001',
  students:     mockChildren,
}

export const mockTeacher2: Teacher = {
  id:           'teacher-002',
  name:         'Tala Kamal',
  nameAr:       'تالا كمال',
  phone:        '+96277XXXXXXX',
  nationalId:   '4455667788',
  role:         'teacher',
  avatarUrl:    undefined,
  language:     'ar',
  createdAt:    '2025-09-01T08:00:00Z',
  schoolId:     'school-001',
  grade:        'Grade 3',
  section:      'Section B',
  teacherNumber: 'TCH-2024-002',
  students:     [],
}

export const mockTeachers: Teacher[] = [mockTeacher, mockTeacher2]

// ─────────────────────────────────────────────
//  5. SCHOOL
// ─────────────────────────────────────────────

export const mockSchool: School = {
  id:               'school-001',
  name:             'Al-Noor School',
  nameAr:           'مدرسة النور',
  schoolId:         'SCH-2024-001',
  advisorName:      'Sara Mahmoud',
  advisorNationalId: '3344556677',
  phone:            '+96265XXXXXXX',
  location:         'Amman',
  description:      'A school specialising in education for children with special needs.',
  teachers:         mockTeachers,
  logoUrl:          undefined,
  createdAt:        '2020-08-15T08:00:00Z',
}

// ─────────────────────────────────────────────
//  6. TASKS
//  Daily tasks on the learning tree
//  dayNumber maps to the tree node (1–7)
// ─────────────────────────────────────────────

export const mockTasks: Task[] = [
  {
    id:            'task-001',
    title:         'Color sorting activity',
    titleAr:       'نشاط تصنيف الألوان',
    description:   'Sort colored blocks into matching groups.',
    descriptionAr: 'رتّب المكعبات الملونة في مجموعات متطابقة.',
    status:        'completed',
    childId:       'child-001',
    dueDate:       '2026-03-24',
    completedAt:   '2026-03-24T11:00:00Z',
    dayNumber:     1,
  },
  {
    id:            'task-002',
    title:         'Count objects 1–10',
    titleAr:       'عدّ الأشياء من ١ إلى ١٠',
    description:   'Count the objects shown on each card.',
    descriptionAr: 'عدّ الأشياء المعروضة على كل بطاقة.',
    status:        'completed',
    childId:       'child-001',
    dueDate:       '2026-03-25',
    completedAt:   '2026-03-25T10:30:00Z',
    dayNumber:     2,
  },
  {
    id:            'task-003',
    title:         'Animal sounds quiz',
    titleAr:       'اختبار أصوات الحيوانات',
    description:   'Match the animal to the sound it makes.',
    descriptionAr: 'طابق الحيوان مع الصوت الذي يصدره.',
    status:        'completed',
    childId:       'child-001',
    dueDate:       '2026-03-26',
    completedAt:   '2026-03-26T09:00:00Z',
    dayNumber:     3,
  },
  {
    id:            'task-004',
    title:         'Reading activity',
    titleAr:       'نشاط القراءة',
    description:   'Read the short story with a parent.',
    descriptionAr: 'اقرأ القصة القصيرة مع أحد الوالدين.',
    status:        'in_progress',
    childId:       'child-001',
    dueDate:       '2026-03-29',
    dayNumber:     4,                // current day on the tree
  },
  {
    id:            'task-005',
    title:         'Shape recognition',
    titleAr:       'التعرف على الأشكال',
    description:   'Identify circles, squares, and triangles.',
    descriptionAr: 'تعرّف على الدوائر والمربعات والمثلثات.',
    status:        'pending',
    childId:       'child-001',
    dueDate:       '2026-03-30',
    dayNumber:     5,
  },
  {
    id:            'task-006',
    title:         'Social story practice',
    titleAr:       'تدريب على القصص الاجتماعية',
    description:   'Act out the social story with a helper.',
    descriptionAr: 'قم بتمثيل القصة الاجتماعية مع مساعد.',
    status:        'pending',
    childId:       'child-001',
    dueDate:       '2026-03-31',
    dayNumber:     6,
  },
  {
    id:            'task-007',
    title:         'Week review quiz',
    titleAr:       'اختبار مراجعة الأسبوع',
    description:   'Complete the end-of-week review quiz.',
    descriptionAr: 'أكمل اختبار مراجعة نهاية الأسبوع.',
    status:        'pending',
    childId:       'child-001',
    dueDate:       '2026-04-01',
    dayNumber:     7,                // crown node — end of week
  },
]

// ─────────────────────────────────────────────
//  7. LEARNING TREE
//  Maps tasks to tree nodes
//  status drives the visual: checkmark / penguin / dot / crown
// ─────────────────────────────────────────────

export const mockTreeNodes: TreeNode[] = [
  { day: 1, title: 'Colors',   titleAr: 'الألوان',    status: 'completed', tasks: [mockTasks[0]] },
  { day: 2, title: 'Numbers',  titleAr: 'الأرقام',    status: 'completed', tasks: [mockTasks[1]] },
  { day: 3, title: 'Animals',  titleAr: 'الحيوانات',  status: 'completed', tasks: [mockTasks[2]] },
  { day: 4, title: 'Reading',  titleAr: 'القراءة',    status: 'current',   tasks: [mockTasks[3]] },
  { day: 5, title: 'Shapes',   titleAr: 'الأشكال',    status: 'upcoming',  tasks: [mockTasks[4]] },
  { day: 6, title: 'Social',   titleAr: 'الاجتماعي',  status: 'upcoming',  tasks: [mockTasks[5]] },
  { day: 7, title: 'Review',   titleAr: 'المراجعة',   status: 'locked',    tasks: [mockTasks[6]] },
]

// ─────────────────────────────────────────────
//  8. HOMEWORK
// ─────────────────────────────────────────────

export const mockHomework: Homework[] = [
  {
    id:           'hw-001',
    title:        'Math worksheet — addition',
    titleAr:      'ورقة عمل رياضيات — الجمع',
    subject:      'Mathematics',
    subjectAr:    'الرياضيات',
    description:  'Complete exercises 1–10 on page 24.',
    dueDate:      '2026-03-31',
    assignedDate: '2026-03-27',
    status:       'not_submitted',
    teacherId:    'teacher-001',
    classId:      'class-001',
  },
  {
    id:           'hw-002',
    title:        'Arabic reading — short story',
    titleAr:      'قراءة عربية — قصة قصيرة',
    subject:      'Arabic',
    subjectAr:    'اللغة العربية',
    description:  'Read pages 12–14 and answer the 3 questions.',
    dueDate:      '2026-03-30',
    assignedDate: '2026-03-26',
    status:       'submitted',
    teacherId:    'teacher-001',
    classId:      'class-001',
  },
  {
    id:           'hw-003',
    title:        'Science — draw a plant',
    titleAr:      'علوم — ارسم نباتاً',
    subject:      'Science',
    subjectAr:    'العلوم',
    description:  'Draw and label the parts of a plant.',
    dueDate:      '2026-04-02',
    assignedDate: '2026-03-28',
    status:       'not_submitted',
    teacherId:    'teacher-001',
    classId:      'class-001',
  },
]

// ─────────────────────────────────────────────
//  9. QUIZ QUESTIONS
//  Defined before quizzes because Quiz holds Question[]
// ─────────────────────────────────────────────

export const mockQuestionsColors: Question[] = [
  {
    id:            'q-001',
    quizId:        'quiz-001',
    text:          'What color is the sky?',
    textAr:        'ما لون السماء؟',
    type:          'multiple_choice',
    options:       ['Red', 'Blue', 'Green', 'Yellow'],
    optionsAr:     ['أحمر', 'أزرق', 'أخضر', 'أصفر'],
    correctAnswer: 'Blue',
    order:         1,
  },
  {
    id:            'q-002',
    quizId:        'quiz-001',
    text:          'What color is grass?',
    textAr:        'ما لون العشب؟',
    type:          'multiple_choice',
    options:       ['Blue', 'Purple', 'Green', 'Orange'],
    optionsAr:     ['أزرق', 'بنفسجي', 'أخضر', 'برتقالي'],
    correctAnswer: 'Green',
    order:         2,
  },
  {
    id:            'q-003',
    quizId:        'quiz-001',
    text:          'Bananas are yellow.',
    textAr:        'الموز أصفر اللون.',
    type:          'true_false',
    correctAnswer: 'true',
    order:         3,
  },
]

export const mockQuestionsNumbers: Question[] = [
  {
    id:            'q-004',
    quizId:        'quiz-002',
    text:          'How many fingers are on one hand?',
    textAr:        'كم عدد أصابع اليد الواحدة؟',
    type:          'multiple_choice',
    options:       ['3', '4', '5', '6'],
    optionsAr:     ['٣', '٤', '٥', '٦'],
    correctAnswer: '5',
    order:         1,
  },
  {
    id:            'q-005',
    quizId:        'quiz-002',
    text:          'What number comes after 7?',
    textAr:        'ما الرقم الذي يأتي بعد ٧؟',
    type:          'multiple_choice',
    options:       ['6', '8', '9', '10'],
    optionsAr:     ['٦', '٨', '٩', '١٠'],
    correctAnswer: '8',
    order:         2,
  },
  {
    id:            'q-006',
    quizId:        'quiz-002',
    text:          'Count: ★★★ — how many stars?',
    textAr:        'عدّ: ★★★ — كم عدد النجوم؟',
    type:          'multiple_choice',
    options:       ['2', '3', '4', '5'],
    optionsAr:     ['٢', '٣', '٤', '٥'],
    correctAnswer: '3',
    order:         3,
  },
]

// ─────────────────────────────────────────────
//  10. QUIZZES
// ─────────────────────────────────────────────

export const mockQuizzes: Quiz[] = [
  {
    id:            'quiz-001',
    title:         "Color's quiz",
    titleAr:       'اختبار الألوان',
    subject:       'General',
    subjectAr:     'عام',
    level:         2,
    questionCount: 3,
    durationMins:  10,
    status:        'completed',
    score: {
      childId:     'child-001',
      quizId:      'quiz-001',
      correct:     2,
      total:       3,
      percentage:  67,
      completedAt: '2026-03-26T11:00:00Z',
    },
    questions:     mockQuestionsColors,
    assignedDate:  '2026-03-24',
    dueDate:       '2026-03-28',
    teacherId:     'teacher-001',
    classId:       'class-001',
  },
  {
    id:            'quiz-002',
    title:         'Numbers 1–10',
    titleAr:       'الأرقام من ١ إلى ١٠',
    subject:       'Mathematics',
    subjectAr:     'الرياضيات',
    level:         2,
    questionCount: 3,
    durationMins:  10,
    status:        'in_progress',
    questions:     mockQuestionsNumbers,
    assignedDate:  '2026-03-27',
    dueDate:       '2026-03-31',
    teacherId:     'teacher-001',
    classId:       'class-001',
  },
  {
    id:            'quiz-003',
    title:         'Animal sounds',
    titleAr:       'أصوات الحيوانات',
    subject:       'General',
    subjectAr:     'عام',
    level:         2,
    questionCount: 3,
    durationMins:  10,
    status:        'new',
    questions:     [],
    assignedDate:  '2026-03-28',
    dueDate:       '2026-04-01',
    teacherId:     'teacher-001',
    classId:       'class-001',
  },
  {
    id:            'quiz-004',
    title:         'Days of the week',
    titleAr:       'أيام الأسبوع',
    subject:       'General',
    subjectAr:     'عام',
    level:         2,
    questionCount: 3,
    durationMins:  10,
    status:        'later',
    questions:     [],
    assignedDate:  '2026-03-28',
    dueDate:       '2026-04-03',
    teacherId:     'teacher-001',
    classId:       'class-001',
  },
]

// ─────────────────────────────────────────────
//  11. REPORTS & NOTES
//  From teacher → parent
// ─────────────────────────────────────────────

export const mockReports: Report[] = [
  {
    id:          'report-001',
    title:       'Weekly progress report',
    titleAr:     'تقرير التقدم الأسبوعي',
    body:        'Zaid showed great improvement in focus this week. He completed 3 out of 4 tasks and participated actively in group activities.',
    bodyAr:      'أظهر زيد تحسناً ملحوظاً في التركيز هذا الأسبوع. أكمل ٣ من أصل ٤ مهام وشارك بفاعلية في الأنشطة الجماعية.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'unread',
    createdAt:   '2026-03-27T09:00:00Z',
    childId:     'child-001',
  },
  {
    id:          'report-002',
    title:       'Behavioral observation',
    titleAr:     'ملاحظة سلوكية',
    body:        'Zaid had a particularly good day on Tuesday. He helped a classmate and stayed focused during reading time.',
    bodyAr:      'كان لزيد يوم جيد بشكل خاص يوم الثلاثاء. ساعد زميلاً في الفصل وبقي مركزاً خلال وقت القراءة.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'unread',
    createdAt:   '2026-03-25T11:30:00Z',
    childId:     'child-001',
  },
  {
    id:          'report-003',
    title:       'Monthly summary — February',
    titleAr:     'ملخص شهر فبراير',
    body:        'Overall a positive month. Recommend continuing daily reading practice at home.',
    bodyAr:      'كان شهراً إيجابياً بشكل عام. يُنصح بمواصلة ممارسة القراءة اليومية في المنزل.',
    authorName:  'Ms. Sara Mahmoud',
    status:      'read',
    createdAt:   '2026-03-01T08:00:00Z',
    childId:     'child-001',
  },
]

export const mockNotes: Note[] = [
  {
    id:        'note-001',
    title:     'Reminder — bring colored pencils',
    titleAr:   'تذكير — أحضر أقلام التلوين',
    body:      'Please make sure Zaid brings his colored pencils on Sunday for the art session.',
    bodyAr:    'يرجى التأكد من إحضار زيد أقلام التلوين يوم الأحد لجلسة الفن.',
    authorName: 'Ahmad Sami',
    createdAt:  '2026-03-28T07:00:00Z',
    childId:    'child-001',
    teacherId:  'teacher-001',
  },
]

// ─────────────────────────────────────────────
//  12. SUBJECT GRADES
//  Used on the School Page → Grades tab
// ─────────────────────────────────────────────

export const mockSubjectGrades: SubjectGrade[] = [
  { subject: 'Arabic',  subjectAr: 'عربي',    score: 79, maxScore: 100, color: '#4A8BF5' },
  { subject: 'Math',    subjectAr: 'رياضيات', score: 59, maxScore: 100, color: '#F97316' },
  { subject: 'Science', subjectAr: 'علوم',    score: 85, maxScore: 100, color: '#BA6DE9' },
  { subject: 'English', subjectAr: 'إنجليزي', score: 92, maxScore: 100, color: '#22C55E' },
  { subject: 'Art',     subjectAr: 'فنون',    score: 97, maxScore: 100, color: '#FFB84C' },
  { subject: 'PE',      subjectAr: 'تربية بدنية', score: 88, maxScore: 100, color: '#EF4444' },
]

// ─────────────────────────────────────────────
//  13. ARTICLES
//  Explore screen
// ─────────────────────────────────────────────

export const mockArticles: Article[] = [
  {
    id:           'article-001',
    title:        'How to support a child with ADD at home',
    titleAr:      'كيف تدعم طفلاً مصاباً باضطراب انتباه في المنزل',
    body:         'Children with ADD benefit greatly from structured routines...',
    bodyAr:       'يستفيد الأطفال المصابون باضطراب الانتباه كثيراً من الروتين المنظم...',
    category:     'parenting',
    readTimeMins: 8,
    viewCount:    13000,
    likeCount:    250,
    isSaved:      false,
    authorName:   'Dr. Layla Hassan',
    publishedAt:  '2026-03-20T08:00:00Z',
  },
  {
    id:           'article-002',
    title:        '5 speech exercises you can do every day',
    titleAr:      '٥ تمارين نطق يمكنك ممارستها يومياً',
    body:         'Consistent practice is the key to improving speech clarity...',
    bodyAr:       'الممارسة المتسقة هي مفتاح تحسين وضوح النطق...',
    category:     'speech',
    readTimeMins: 5,
    viewCount:    8400,
    likeCount:    180,
    isSaved:      true,
    authorName:   'Sara Nabulsi',
    publishedAt:  '2026-03-18T10:00:00Z',
  },
  {
    id:           'article-003',
    title:        'Understanding sensory processing in children',
    titleAr:      'فهم المعالجة الحسية عند الأطفال',
    body:         'Sensory processing differences affect how children respond to their environment...',
    bodyAr:       'تؤثر الفروقات في المعالجة الحسية على كيفية استجابة الأطفال لبيئتهم...',
    category:     'special_needs',
    readTimeMins: 10,
    viewCount:    6200,
    likeCount:    140,
    isSaved:      false,
    authorName:   'Dr. Omar Farouk',
    publishedAt:  '2026-03-15T09:00:00Z',
  },
]

// Saved articles — pre-filtered for the Saved screen
export const mockSavedArticles: Article[] = mockArticles.filter(a => a.isSaved)

// ─────────────────────────────────────────────
//  14. CHAT MESSAGES
//  Chatbot screen — a short sample conversation
// ─────────────────────────────────────────────

export const mockChatMessages: ChatMessage[] = [
  {
    id:        'msg-001',
    role:      'assistant',
    content:   'Hello! I\'m Rafeeq 🐧 How can I guide you today?',
    timestamp: '2026-03-29T10:00:00Z',
  },
  {
    id:        'msg-002',
    role:      'user',
    content:   'How can I help Zaid focus better at home?',
    timestamp: '2026-03-29T10:01:00Z',
  },
  {
    id:        'msg-003',
    role:      'assistant',
    content:   'Great question! Here are 3 things that help children with ADD focus:\n\n1. Short tasks with breaks (10 min work, 5 min break)\n2. A quiet, tidy workspace with no distractions\n3. Visual timers so they can see time passing\n\nWould you like more details on any of these?',
    timestamp: '2026-03-29T10:01:30Z',
  },
]

// ─────────────────────────────────────────────
//  15. NOTIFICATIONS
// ─────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id:        'notif-001',
    type:      'report',
    title:     'New report from Ms. Sara',
    titleAr:   'تقرير جديد من الأستاذة سارة',
    body:      'A new weekly progress report has been added for Zaid.',
    bodyAr:    'تم إضافة تقرير تقدم أسبوعي جديد لزيد.',
    isRead:    false,
    createdAt: '2026-03-27T09:05:00Z',
  },
  {
    id:        'notif-002',
    type:      'homework',
    title:     'New homework assigned',
    titleAr:   'تم تعيين واجب جديد',
    body:      'Math worksheet due March 31.',
    bodyAr:    'ورقة عمل رياضيات موعدها ٣١ مارس.',
    isRead:    false,
    createdAt: '2026-03-27T08:00:00Z',
  },
  {
    id:        'notif-003',
    type:      'achievement',
    title:     'Zaid earned a new achievement!',
    titleAr:   'حصل زيد على إنجاز جديد!',
    body:      'Zaid completed 3 days in a row. Keep it up!',
    bodyAr:    'أكمل زيد ٣ أيام متتالية. هكذا يكون!',
    isRead:    true,
    createdAt: '2026-03-26T15:00:00Z',
  },
]

// Unread count — useful for the bell badge
export const mockUnreadCount = mockNotifications.filter(n => !n.isRead).length

// ─────────────────────────────────────────────
//  16. AUTH STATE
//  The initial Zustand store state when logged
//  in as the mock parent
// ─────────────────────────────────────────────

export const mockAuthState: AuthState = {
  role:            'parent',
  user:            mockParent,
  token:           'mock-jwt-token-abc123',
  selectedChild:   mockChildZaid,
  language:        'en',
  isRTL:           false,
  isAuthenticated: true,
}

// Same thing but logged in as the mock teacher
export const mockAuthStateTeacher: AuthState = {
  role:            'teacher',
  user:            mockTeacher,
  token:           'mock-jwt-token-def456',
  selectedChild:   null,
  language:        'en',
  isRTL:           false,
  isAuthenticated: true,
}