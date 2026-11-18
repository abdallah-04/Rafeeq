// services/mock/db.ts
// ─────────────────────────────────────────────────────────────────────────────
//  In-memory + AsyncStorage backed mock database. Replaces the real backend.
//
//  Demo accounts (password for all: 123456)
//    School  : 1111111111
//    Teacher : 2222222222
//    Parent  : 4444444444
//
//  Linkable children for the parent "add child" flow:
//    5000000003 (Omar – pending placement exam)
//    5000000004 (Sara – active, has a learning tree)
//
//  Bilingual content is stored with an optional `ar` override object. The API
//  layer picks the right language at read time (see `localize` in api.tsx).
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockArticles } from '@/mock/articles';
import type {
  ActivityResponse,
  ChildResponse,
  HomeworkResponse,
  LearningTreeResponse,
  NoteResponse,
  NotificationResponse,
  PlacementQuestionResponse,
  QuizQuestionResponse,
  QuizResponse,
  ReportResponse,
  TeacherResponse,
  TreeItemResponse,
} from '../api';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Entity with an optional Arabic override for its text fields. */
export type Loc<T> = T & { ar?: Partial<T> };

export type MockRole = 'ROLE_SCHOOL' | 'ROLE_TEACHER' | 'ROLE_PARENT';

export interface MockUser {
  userId:     string;
  role:       MockRole;
  nationalId: string;
  password:   string;
  email:      string;
  phone:      string;
}

export type MockQuestion = QuizQuestionResponse & { ar?: Partial<QuizQuestionResponse> };
export type MockQuiz     = Omit<QuizResponse, 'questions'> & {
  questions: MockQuestion[];
  ar?:       Partial<Pick<QuizResponse, 'title'>>;
};

export interface MockDb {
  version:       number;
  seq:           number;
  users:         MockUser[];
  teachers:      Array<TeacherResponse & { schoolUserId: string }>;
  children:      ChildResponse[];
  trees:         Array<Loc<LearningTreeResponse>>;
  treeItems:     Array<Loc<TreeItemResponse>>;
  activities:    Array<Loc<ActivityResponse>>;
  quizzes:       MockQuiz[];
  homeworks:     Array<Loc<HomeworkResponse>>;
  reports:       ReportResponse[];
  notes:         NoteResponse[];
  notifications: Array<Loc<NotificationResponse> & { userId: string }>;
  savedArticles: Record<string, string[]>;
}

const DB_VERSION = 1;
const STORAGE_KEY = 'rafeeq-mock-db';

// ── Persistence ───────────────────────────────────────────────────────────────

let cache: MockDb | null = null;
let loading: Promise<MockDb> | null = null;

export async function getDb(): Promise<MockDb> {
  if (cache) return cache;
  if (!loading) {
    loading = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as MockDb;
          if (parsed?.version === DB_VERSION) {
            cache = parsed;
            return parsed;
          }
        }
      } catch {
        /* fall through to seed */
      }
      cache = buildSeed();
      await saveDb();
      return cache;
    })().finally(() => {
      loading = null;
    });
  }
  return loading;
}

export async function saveDb(): Promise<void> {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* best effort */
  }
}

/** Throw away all changes and restore the seed data. */
export async function resetMockDb(): Promise<void> {
  cache = buildSeed();
  await saveDb();
}

export function nextId(db: MockDb, prefix: string): string {
  db.seq += 1;
  return `${prefix}-${db.seq}`;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const dateOnly = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);

// ── Learning content bank ─────────────────────────────────────────────────────

interface Bi { en: string; ar: string }
const bi = (en: string, ar: string): Bi => ({ en, ar });

interface BankQuestion { q: Bi; options: [Bi, Bi, Bi]; correct: 1 | 2 | 3 }
interface BankLesson {
  theme:    Bi;
  homework: Bi;
  activity: { title: Bi; desc: Bi; steps: Bi; materials: Bi; outcome: Bi };
  quiz:     [BankQuestion, BankQuestion];
}
interface BankTopic { topic: Bi; summary: Bi; lessons: [BankLesson, BankLesson, BankLesson] }

const BANK: Record<1 | 2 | 3, BankTopic> = {
  1: {
    topic:   bi('Numbers & Counting', 'الأعداد والعد'),
    summary: bi('A gentle 3-day path to count and compare numbers up to 10.', 'مسار لطيف من ٣ أيام لتعلّم العد والمقارنة حتى الرقم ١٠.'),
    lessons: [
      {
        theme: bi('Counting to 5', 'العد حتى ٥'),
        homework: bi('Count five objects around the house and tell a parent what you found.', 'عُدّ خمسة أشياء في البيت وأخبر أحد والديك بما وجدت.'),
        activity: {
          title: bi('Count the Toy Cars', 'عدّ سيارات اللعب'),
          desc: bi('Line up toy cars and count them together.', 'رتّب سيارات اللعب وعدّها معًا.'),
          steps: bi('Place 1 to 5 cars on the table. Point to each car while counting out loud.', 'ضع من ١ إلى ٥ سيارات على الطاولة. أشر إلى كل سيارة وأنت تعدّ بصوت عالٍ.'),
          materials: bi('5 small toys', '٥ ألعاب صغيرة'),
          outcome: bi('Child counts up to 5 with one-to-one pointing.', 'يعدّ الطفل حتى ٥ مع الإشارة لكل عنصر.'),
        },
        quiz: [
          { q: bi('How many fingers are on one hand?', 'كم عدد الأصابع في اليد الواحدة؟'), options: [bi('3', '٣'), bi('5', '٥'), bi('7', '٧')], correct: 2 },
          { q: bi('Which number comes after 2?', 'ما الرقم الذي يأتي بعد ٢؟'), options: [bi('1', '١'), bi('4', '٤'), bi('3', '٣')], correct: 3 },
        ],
      },
      {
        theme: bi('Bigger or Smaller', 'أكبر أم أصغر'),
        homework: bi('Compare two groups of spoons and say which group has more.', 'قارن بين مجموعتين من الملاعق وقل أيهما أكثر.'),
        activity: {
          title: bi('More or Less Game', 'لعبة أكثر أو أقل'),
          desc: bi('Compare two piles of blocks.', 'قارن بين كومتين من المكعبات.'),
          steps: bi('Make two piles of blocks. Ask which pile has more, then count to check.', 'كوّن كومتين من المكعبات. اسأل أيهما أكثر ثم عدّ للتأكد.'),
          materials: bi('10 building blocks', '١٠ مكعبات بناء'),
          outcome: bi('Child compares quantities using "more" and "less".', 'يقارن الطفل الكميات باستخدام «أكثر» و«أقل».'),
        },
        quiz: [
          { q: bi('Which is bigger, 7 or 4?', 'أيهما أكبر، ٧ أم ٤؟'), options: [bi('4', '٤'), bi('7', '٧'), bi('They are equal', 'متساويان')], correct: 2 },
          { q: bi('Which is smaller, 3 or 9?', 'أيهما أصغر، ٣ أم ٩؟'), options: [bi('3', '٣'), bi('9', '٩'), bi('They are equal', 'متساويان')], correct: 1 },
        ],
      },
      {
        theme: bi('Counting to 10', 'العد حتى ١٠'),
        homework: bi('Count ten steps while walking and write the last number.', 'عُدّ عشر خطوات أثناء المشي واكتب الرقم الأخير.'),
        activity: {
          title: bi('Jump and Count', 'اقفز وعُدّ'),
          desc: bi('Jump once for each number up to 10.', 'اقفز مرة لكل رقم حتى ١٠.'),
          steps: bi('Count aloud and jump once per number. Rest, then try counting backwards.', 'عُدّ بصوت عالٍ واقفز مرة لكل رقم. استرح ثم جرّب العد التنازلي.'),
          materials: bi('Open floor space', 'مساحة فارغة على الأرض'),
          outcome: bi('Child counts to 10 smoothly.', 'يعدّ الطفل حتى ١٠ بسلاسة.'),
        },
        quiz: [
          { q: bi('What number comes right before 10?', 'ما الرقم الذي يأتي قبل ١٠ مباشرة؟'), options: [bi('8', '٨'), bi('9', '٩'), bi('11', '١١')], correct: 2 },
          { q: bi('How many days are in a week?', 'كم عدد أيام الأسبوع؟'), options: [bi('7', '٧'), bi('5', '٥'), bi('10', '١٠')], correct: 1 },
        ],
      },
    ],
  },
  2: {
    topic:   bi('Letters & Words', 'الحروف والكلمات'),
    summary: bi('A 3-day path to recognise letters and read short words.', 'مسار من ٣ أيام للتعرف على الحروف وقراءة كلمات قصيرة.'),
    lessons: [
      {
        theme: bi('Letter Sounds', 'أصوات الحروف'),
        homework: bi('Find three things at home that start with the letter B.', 'ابحث عن ثلاثة أشياء في البيت تبدأ بحرف الباء.'),
        activity: {
          title: bi('Sound Hunt', 'البحث عن الأصوات'),
          desc: bi('Hunt for objects that start with a chosen sound.', 'ابحث عن أشياء تبدأ بصوت محدد.'),
          steps: bi('Pick a letter. Walk around the room and name each object that starts with it.', 'اختر حرفًا. تجوّل في الغرفة وسمِّ كل شيء يبدأ به.'),
          materials: bi('Picture cards (optional)', 'بطاقات صور (اختياري)'),
          outcome: bi('Child links a letter with its first sound.', 'يربط الطفل بين الحرف وصوته الأول.'),
        },
        quiz: [
          { q: bi('Which word starts with the sound "S"?', 'أي كلمة تبدأ بصوت «س»؟'), options: [bi('Sun', 'شمس'), bi('Moon', 'قمر'), bi('Star', 'نجمة')], correct: 1 },
          { q: bi('Which letter does "Ball" start with?', 'بأي حرف تبدأ كلمة «بطة»؟'), options: [bi('M', 'م'), bi('T', 'ت'), bi('B', 'ب')], correct: 3 },
        ],
      },
      {
        theme: bi('Short Words', 'كلمات قصيرة'),
        homework: bi('Read three short words from a picture book out loud.', 'اقرأ ثلاث كلمات قصيرة من كتاب مصوّر بصوت عالٍ.'),
        activity: {
          title: bi('Build a Word', 'كوّن كلمة'),
          desc: bi('Arrange letter cards to build short words.', 'رتّب بطاقات الحروف لتكوين كلمات قصيرة.'),
          steps: bi('Show a picture, then arrange letter cards to spell its name together.', 'أظهر صورة ثم رتّبا بطاقات الحروف لتهجئة اسمها معًا.'),
          materials: bi('Letter cards', 'بطاقات حروف'),
          outcome: bi('Child builds a 3-letter word with help.', 'يكوّن الطفل كلمة من ٣ حروف بمساعدة.'),
        },
        quiz: [
          { q: bi('Which word names an animal?', 'أي كلمة تدل على حيوان؟'), options: [bi('Cat', 'قطة'), bi('Chair', 'كرسي'), bi('Cup', 'كوب')], correct: 1 },
          { q: bi('How many letters are in "sun"?', 'كم عدد الحروف في كلمة «شمس»؟'), options: [bi('2', '٢'), bi('3', '٣'), bi('4', '٤')], correct: 2 },
        ],
      },
      {
        theme: bi('Reading a Sentence', 'قراءة جملة'),
        homework: bi('Read one short sentence to a family member.', 'اقرأ جملة قصيرة لأحد أفراد العائلة.'),
        activity: {
          title: bi('Sentence Puzzle', 'أحجية الجملة'),
          desc: bi('Put word cards in order to make a sentence.', 'رتّب بطاقات الكلمات لتكوين جملة.'),
          steps: bi('Mix the word cards, then arrange them so the sentence makes sense. Read it aloud.', 'اخلط بطاقات الكلمات ثم رتّبها لتصبح الجملة مفهومة. اقرأها بصوت عالٍ.'),
          materials: bi('Word cards', 'بطاقات كلمات'),
          outcome: bi('Child reads a 3-word sentence.', 'يقرأ الطفل جملة من ٣ كلمات.'),
        },
        quiz: [
          { q: bi('Which ends a sentence?', 'ما الذي ينهي الجملة؟'), options: [bi('A full stop', 'نقطة'), bi('A number', 'رقم'), bi('A colour', 'لون')], correct: 1 },
          { q: bi('Which sentence makes sense?', 'أي جملة مفهومة؟'), options: [bi('Cat the milk drinks', 'اللبن القطة تشرب'), bi('The cat drinks milk', 'القطة تشرب اللبن'), bi('Drinks milk cat the', 'تشرب اللبن القطة')], correct: 2 },
        ],
      },
    ],
  },
  3: {
    topic:   bi('Focus & Attention', 'التركيز والانتباه'),
    summary: bi('A 3-day path of short games to build sustained attention.', 'مسار من ٣ أيام بألعاب قصيرة لبناء الانتباه المستمر.'),
    lessons: [
      {
        theme: bi('Listening Carefully', 'الاستماع بتركيز'),
        homework: bi('Listen to a 2-minute story and tell one thing you remember.', 'استمع لقصة مدتها دقيقتان وأخبر بشيء واحد تتذكره.'),
        activity: {
          title: bi('Simon Says', 'سيمون يقول'),
          desc: bi('Follow instructions only when they start with the magic word.', 'نفّذ التعليمات فقط عندما تبدأ بالكلمة السحرية.'),
          steps: bi('Give simple actions. The child acts only if you say "please" first.', 'أعطِ حركات بسيطة. ينفّذ الطفل فقط إذا قلت «من فضلك» أولًا.'),
          materials: bi('None', 'لا شيء'),
          outcome: bi('Child follows a one-step instruction reliably.', 'ينفّذ الطفل تعليمة من خطوة واحدة بثبات.'),
        },
        quiz: [
          { q: bi('What should you do when someone is speaking to you?', 'ماذا تفعل عندما يتحدث إليك أحد؟'), options: [bi('Look and listen', 'أنظر وأستمع'), bi('Run away', 'أهرب'), bi('Cover my ears', 'أغطي أذني')], correct: 1 },
          { q: bi('Which helps you focus?', 'ما الذي يساعدك على التركيز؟'), options: [bi('A noisy room', 'غرفة صاخبة'), bi('A quiet desk', 'مكتب هادئ'), bi('Many toys', 'ألعاب كثيرة')], correct: 2 },
        ],
      },
      {
        theme: bi('Spot the Difference', 'اكتشف الفروق'),
        homework: bi('Find 3 differences between two pictures.', 'اعثر على ٣ فروق بين صورتين.'),
        activity: {
          title: bi('Picture Detective', 'محقق الصور'),
          desc: bi('Compare two similar pictures and find the differences.', 'قارن بين صورتين متشابهتين واكتشف الفروق.'),
          steps: bi('Show two similar pictures. Give 2 minutes to find the differences, then celebrate.', 'أظهر صورتين متشابهتين. امنح دقيقتين لاكتشاف الفروق ثم احتفلا.'),
          materials: bi('Two similar pictures', 'صورتان متشابهتان'),
          outcome: bi('Child keeps attention on a task for 2 minutes.', 'يحافظ الطفل على انتباهه في مهمة لمدة دقيقتين.'),
        },
        quiz: [
          { q: bi('Which shape is different? ○ ○ □ ○', 'أي شكل مختلف؟ ○ ○ □ ○'), options: [bi('First', 'الأول'), bi('Third', 'الثالث'), bi('Fourth', 'الرابع')], correct: 2 },
          { q: bi('How long should you try before asking for help?', 'كم تحاول قبل أن تطلب المساعدة؟'), options: [bi('One second', 'ثانية واحدة'), bi('A few minutes', 'بضع دقائق'), bi('Never', 'أبدًا')], correct: 2 },
        ],
      },
      {
        theme: bi('Finish What You Start', 'أكمل ما بدأت'),
        homework: bi('Complete a 10-piece puzzle without stopping.', 'أكمل أحجية من ١٠ قطع دون توقف.'),
        activity: {
          title: bi('Puzzle Time', 'وقت الأحجية'),
          desc: bi('Complete a short puzzle to the end.', 'أكمل أحجية قصيرة حتى النهاية.'),
          steps: bi('Set a visual timer for 5 minutes. Work on the puzzle until the timer ends.', 'اضبط مؤقتًا مرئيًا لمدة ٥ دقائق. اعمل على الأحجية حتى ينتهي الوقت.'),
          materials: bi('Puzzle, visual timer', 'أحجية ومؤقت مرئي'),
          outcome: bi('Child stays on task for 5 minutes.', 'يبقى الطفل منشغلًا بالمهمة لمدة ٥ دقائق.'),
        },
        quiz: [
          { q: bi('What should you do when a task is hard?', 'ماذا تفعل عندما تكون المهمة صعبة؟'), options: [bi('Give up', 'أستسلم'), bi('Take a breath and try again', 'آخذ نفسًا وأحاول مجددًا'), bi('Throw it', 'أرميها')], correct: 2 },
          { q: bi('A timer helps us…', 'المؤقت يساعدنا على…'), options: [bi('See how much time is left', 'معرفة الوقت المتبقي'), bi('Sleep', 'النوم'), bi('Eat', 'الأكل')], correct: 1 },
        ],
      },
    ],
  },
};

export function topicFor(level: number | null | undefined): 1 | 2 | 3 {
  const l = Math.min(3, Math.max(1, Math.round(level ?? 1)));
  return l as 1 | 2 | 3;
}

// ── Tree generation ───────────────────────────────────────────────────────────

/**
 * Removes any existing tree content for the child and generates a fresh
 * 9-step learning tree (3 days x homework / activity / quiz).
 * The first `completedCount` steps are marked as done.
 */
export function generateTree(db: MockDb, child: ChildResponse, completedCount = 0): void {
  const cid = child.id;
  db.trees = db.trees.filter((t) => t.childId !== cid);
  db.treeItems = db.treeItems.filter((i) => !i.treeId.endsWith(`-${cid}`));
  db.activities = db.activities.filter((a) => a.childId !== cid || !a.treeId);
  db.quizzes = db.quizzes.filter((q) => q.childId !== cid || !q.treeId);
  db.homeworks = db.homeworks.filter((h) => h.childId !== cid || !h.treeId);

  const level = topicFor(child.assessedLevel ?? child.level);
  const bank = BANK[level];
  const treeId = `tree-${cid}`;
  const finished = completedCount >= 9;

  db.trees.push({
    id: treeId,
    childId: cid,
    level,
    topic: bank.topic.en,
    topicId: `topic-${level}`,
    summary: bank.summary.en,
    status: finished ? 'COMPLETED' : 'ACTIVE',
    generatedAt: daysAgo(3),
    ar: { topic: bank.topic.ar, summary: bank.summary.ar },
  });

  bank.lessons.forEach((lesson, gi) => {
    const group = gi + 1;
    const kinds = ['HOMEWORK', 'ACTIVITY', 'QUIZ'] as const;

    kinds.forEach((kind, ki) => {
      const order = gi * 3 + ki + 1;
      const done = order <= completedCount;
      const itemRowId = `ti-${cid}-${order}`;
      const contentId = `${kind.toLowerCase()}-${cid}-${group}`;
      const status = done ? 'COMPLETED' : 'PENDING';
      const completedAt = done ? daysAgo(Math.max(0, 9 - order)) : null;

      let title: Bi;
      let description: Bi;

      if (kind === 'HOMEWORK') {
        title = bi(`Homework: ${lesson.theme.en}`, `واجب: ${lesson.theme.ar}`);
        description = lesson.homework;
        db.homeworks.push({
          id: contentId, childId: cid, title: title.en, description: description.en,
          dueDate: dateOnly(group - 1), status, authorRole: 'AI', createdAt: daysAgo(3),
          treeId, treeItemId: itemRowId, groupNumber: group, orderNum: order,
          ar: { title: title.ar, description: description.ar },
        });
      } else if (kind === 'ACTIVITY') {
        title = lesson.activity.title;
        description = lesson.activity.desc;
        db.activities.push({
          id: contentId, childId: cid, treeId, treeItemId: itemRowId,
          title: title.en, description: description.en,
          instructions: lesson.activity.steps.en, materialsNeeded: lesson.activity.materials.en,
          expectedOutcome: lesson.activity.outcome.en, status, groupNumber: group, orderNum: order,
          completedAt,
          ar: {
            title: title.ar, description: description.ar, instructions: lesson.activity.steps.ar,
            materialsNeeded: lesson.activity.materials.ar, expectedOutcome: lesson.activity.outcome.ar,
          },
        });
      } else {
        title = bi(`Quiz: ${lesson.theme.en}`, `اختبار: ${lesson.theme.ar}`);
        description = bi('Short quiz', 'اختبار قصير');
        db.quizzes.push({
          id: contentId, childId: cid, treeId, treeItemId: itemRowId, title: title.en, level,
          totalQuestions: lesson.quiz.length, score: done ? 100 : null, status,
          groupNumber: group, orderNum: order, startedAt: completedAt, completedAt,
          ar: { title: title.ar },
          questions: lesson.quiz.map((q, qi) => ({
            id: `${contentId}-q${qi + 1}`,
            question: q.q.en,
            options: q.options.map((o) => o.en),
            correctOption: q.correct,
            explanation: null,
            orderNum: qi + 1,
            points: 5,
            ar: { question: q.q.ar, options: q.options.map((o) => o.ar) },
          })),
        });
      }

      db.treeItems.push({
        id: itemRowId, treeId, itemId: contentId, itemType: kind,
        title: title.en, description: description.en, status,
        orderNum: order, groupNumber: group,
        locked: order > completedCount + 1, completed: done,
        maxPoints: 10, earnedPoints: done ? 10 : 0, completedAt,
        ar: { title: title.ar, description: description.ar },
      });
    });
  });
}

// ── Placement exam ────────────────────────────────────────────────────────────

export const PLACEMENT_QUESTIONS: Array<PlacementQuestionResponse & { correct: number }> = [
  { id: 'pq-1', orderNum: 1, level: 1, points: 1, correct: 2,
    questionEn: 'How many ears does a person have?', questionAr: 'كم أذنًا لدى الإنسان؟',
    optionsEn: ['1', '2', '3'], optionsAr: ['١', '٢', '٣'] },
  { id: 'pq-2', orderNum: 2, level: 1, points: 1, correct: 1,
    questionEn: 'Which color is the sky on a clear day?', questionAr: 'ما لون السماء في يوم صافٍ؟',
    optionsEn: ['Blue', 'Green', 'Red'], optionsAr: ['أزرق', 'أخضر', 'أحمر'] },
  { id: 'pq-3', orderNum: 3, level: 2, points: 2, correct: 3,
    questionEn: 'What is 4 + 3?', questionAr: 'كم يساوي ٤ + ٣؟',
    optionsEn: ['6', '8', '7'], optionsAr: ['٦', '٨', '٧'] },
  { id: 'pq-4', orderNum: 4, level: 2, points: 2, correct: 2,
    questionEn: 'Which word starts with the letter "M"?', questionAr: 'أي كلمة تبدأ بحرف «م»؟',
    optionsEn: ['Apple', 'Moon', 'Tree'], optionsAr: ['تفاحة', 'مدرسة', 'شجرة'] },
  { id: 'pq-5', orderNum: 5, level: 3, points: 3, correct: 1,
    questionEn: 'Complete the pattern: 2, 4, 6, __', questionAr: 'أكمل النمط: ٢، ٤، ٦، __',
    optionsEn: ['8', '7', '9'], optionsAr: ['٨', '٧', '٩'] },
  { id: 'pq-6', orderNum: 6, level: 3, points: 3, correct: 3,
    questionEn: 'Which sentence is correct?', questionAr: 'أي جملة صحيحة؟',
    optionsEn: ['Dog the runs', 'Runs dog the', 'The dog runs'], optionsAr: ['الكلب يجري', 'يجري الكلب ال', 'ال كلب يجري'] },
];

// ── Seed ──────────────────────────────────────────────────────────────────────

const SCHOOL_USER = 'u-school-1';
const PARENT_USER = 'u-parent-1';

function makeChild(p: Partial<ChildResponse> & Pick<ChildResponse, 'id' | 'fullNameAr' | 'nationalId'>): ChildResponse {
  return {
    userId: `u-${p.id}`, fullNameEn: null, className: null, level: null, gender: null,
    dateOfBirth: null, learningDifficulty: null, parentId: null, teacherId: null, phone: null,
    status: 'PENDING_PLACEMENT', assessedLevel: null, placementCompletedAt: null, active: true,
    ...p,
  };
}

function buildSeed(): MockDb {
  const db: MockDb = {
    version: DB_VERSION,
    seq: 1000,
    users: [
      { userId: SCHOOL_USER,   role: 'ROLE_SCHOOL',  nationalId: '1111111111', password: '123456', email: 'school@rafeeq.app',  phone: '0500000001' },
      { userId: 'u-teacher-1', role: 'ROLE_TEACHER', nationalId: '2222222222', password: '123456', email: 'teacher@rafeeq.app', phone: '0500000002' },
      { userId: 'u-teacher-2', role: 'ROLE_TEACHER', nationalId: '2222222223', password: '123456', email: 'noura@rafeeq.app',   phone: '0500000003' },
      { userId: 'u-teacher-3', role: 'ROLE_TEACHER', nationalId: '2222222224', password: '123456', email: 'khaled@rafeeq.app',  phone: '0500000004' },
      { userId: PARENT_USER,   role: 'ROLE_PARENT',  nationalId: '4444444444', password: '123456', email: 'parent@rafeeq.app',  phone: '0500000005' },
    ],
    teachers: [
      { id: 'teacher-1', userId: 'u-teacher-1', schoolUserId: SCHOOL_USER, fullNameAr: 'سارة المطيري', fullNameEn: 'Sara Al-Mutairi', phone: '0500000002', nationalId: '2222222222' },
      { id: 'teacher-2', userId: 'u-teacher-2', schoolUserId: SCHOOL_USER, fullNameAr: 'نورة العتيبي', fullNameEn: 'Noura Al-Otaibi', phone: '0500000003', nationalId: '2222222223' },
      { id: 'teacher-3', userId: 'u-teacher-3', schoolUserId: SCHOOL_USER, fullNameAr: 'خالد الشمري',  fullNameEn: 'Khaled Al-Shammari', phone: '0500000004', nationalId: '2222222224' },
    ],
    children: [
      makeChild({ id: 'child-1', fullNameAr: 'زيد أحمد', fullNameEn: 'Zaid Ahmad', nationalId: '5000000001', className: 'Grade 2', level: 2,
        gender: 'MALE', dateOfBirth: '2018-03-15', learningDifficulty: 'ADHD', parentId: PARENT_USER, teacherId: 'teacher-1',
        status: 'ACTIVE', assessedLevel: 2, placementCompletedAt: daysAgo(10), phone: '0500000005' }),
      makeChild({ id: 'child-2', fullNameAr: 'لينا أحمد', fullNameEn: 'Lina Ahmad', nationalId: '5000000002', className: 'Grade 1', level: 1,
        gender: 'FEMALE', dateOfBirth: '2019-07-02', learningDifficulty: 'ASD', parentId: PARENT_USER, teacherId: 'teacher-1',
        status: 'ACTIVE', assessedLevel: 1, placementCompletedAt: daysAgo(8), phone: '0500000005' }),
      makeChild({ id: 'child-3', fullNameAr: 'عمر خالد', fullNameEn: 'Omar Khaled', nationalId: '5000000003', className: 'Grade 2',
        gender: 'MALE', dateOfBirth: '2018-11-21', learningDifficulty: 'DYS', teacherId: 'teacher-1', status: 'PENDING_PLACEMENT' }),
      makeChild({ id: 'child-4', fullNameAr: 'سارة ناصر', fullNameEn: 'Sara Nasser', nationalId: '5000000004', className: 'Grade 3', level: 3,
        gender: 'FEMALE', dateOfBirth: '2017-05-09', learningDifficulty: 'ADD', teacherId: 'teacher-1',
        status: 'ACTIVE', assessedLevel: 3, placementCompletedAt: daysAgo(6) }),
      makeChild({ id: 'child-5', fullNameAr: 'ياسر فهد', fullNameEn: 'Yasser Fahad', nationalId: '5000000005', className: 'Grade 2', level: 2,
        gender: 'MALE', dateOfBirth: '2018-01-30', learningDifficulty: 'IFD', teacherId: 'teacher-2',
        status: 'ACTIVE', assessedLevel: 2, placementCompletedAt: daysAgo(12) }),
      makeChild({ id: 'child-6', fullNameAr: 'ريم سعد', fullNameEn: 'Reem Saad', nationalId: '5000000006', className: 'Grade 1',
        gender: 'FEMALE', dateOfBirth: '2019-09-12', learningDifficulty: 'OTHER', teacherId: 'teacher-3', status: 'PENDING_PLACEMENT' }),
    ],
    trees: [], treeItems: [], activities: [], quizzes: [], homeworks: [],
    reports: [], notes: [], notifications: [], savedArticles: { [PARENT_USER]: ['2'] },
  };

  generateTree(db, db.children[0], 4);
  generateTree(db, db.children[1], 2);
  generateTree(db, db.children[3], 0);
  generateTree(db, db.children[4], 6);

  // Teacher-authored homework (not part of the tree)
  db.homeworks.push(
    { id: 'hw-t-1', childId: 'child-1', title: 'Read page 12 aloud', description: 'Read page 12 of the reader book to a parent and underline words you find hard.',
      dueDate: dateOnly(2), status: 'PENDING', authorRole: 'TEACHER', createdAt: daysAgo(1),
      ar: { title: 'قراءة الصفحة ١٢ بصوت عالٍ', description: 'اقرأ الصفحة ١٢ من كتاب القراءة لأحد والديك وضع خطًا تحت الكلمات الصعبة.' } },
    { id: 'hw-t-2', childId: 'child-1', title: 'Number worksheet', description: 'Finish the counting worksheet from class.',
      dueDate: dateOnly(-2), status: 'SUBMITTED', authorRole: 'TEACHER', createdAt: daysAgo(5),
      ar: { title: 'ورقة عمل الأعداد', description: 'أكمل ورقة عمل العد التي أخذناها في الصف.' } },
    { id: 'hw-t-3', childId: 'child-2', title: 'Draw your family', description: 'Draw your family and say each name out loud.',
      dueDate: dateOnly(3), status: 'PENDING', authorRole: 'TEACHER', createdAt: daysAgo(1),
      ar: { title: 'ارسم عائلتك', description: 'ارسم عائلتك وانطق اسم كل فرد بصوت عالٍ.' } },
    { id: 'hw-t-4', childId: 'child-4', title: 'Sort the shapes', description: 'Sort the shape cards by color and by size.',
      dueDate: dateOnly(4), status: 'PENDING', authorRole: 'TEACHER', createdAt: daysAgo(2),
      ar: { title: 'صنّف الأشكال', description: 'صنّف بطاقات الأشكال حسب اللون وحسب الحجم.' } },
  );

  db.notes.push(
    { id: 'note-1', childId: 'child-1', title: 'Great focus today', content: 'Zaid stayed seated for the whole reading block. Keep using the visual timer at home.', createdAt: daysAgo(1) },
    { id: 'note-2', childId: 'child-1', title: 'Needs short breaks', content: 'After 10 minutes of writing he gets restless. Short movement breaks help.', createdAt: daysAgo(4) },
    { id: 'note-3', childId: 'child-2', title: 'Wonderful progress', content: 'Lina answered two questions in front of the class today. Please praise her effort.', createdAt: daysAgo(2) },
    { id: 'note-4', childId: 'child-4', title: 'Quick learner', content: 'Sara picks up new concepts fast but needs reminders to finish tasks.', createdAt: daysAgo(3) },
  );

  db.reports.push(
    { id: 'rep-1', childId: 'child-1', title: 'Weekly report', content: 'This week Zaid completed 4 of 9 learning steps. Attention span improved from 5 to 8 minutes. Next goal: independent counting to 10.', createdAt: daysAgo(2) },
    { id: 'rep-2', childId: 'child-1', title: 'Monthly report', content: 'Overall progress is steady at 65%. Strengths: social skills and communication. Support needed: sustained attention during written tasks.', createdAt: daysAgo(14) },
    { id: 'rep-3', childId: 'child-2', title: 'Weekly report', content: 'Lina completed 2 learning steps and is becoming more confident speaking in group time.', createdAt: daysAgo(2) },
    { id: 'rep-4', childId: 'child-4', title: 'Placement summary', content: 'Sara was placed at level 3. A focus & attention learning path has been generated.', createdAt: daysAgo(6) },
  );

  db.notifications.push(
    { id: 'n-1', userId: PARENT_USER, title: 'New homework', body: 'Zaid has a new homework: Read page 12 aloud.', isRead: false, createdAt: daysAgo(1),
      ar: { title: 'واجب جديد', body: 'لدى زيد واجب جديد: قراءة الصفحة ١٢ بصوت عالٍ.' } },
    { id: 'n-2', userId: PARENT_USER, title: 'New teacher note', body: 'Teacher Sara left a note about Zaid.', isRead: false, createdAt: daysAgo(1),
      ar: { title: 'ملاحظة جديدة من المعلمة', body: 'تركت المعلمة سارة ملاحظة عن زيد.' } },
    { id: 'n-3', userId: PARENT_USER, title: 'Weekly report ready', body: 'The weekly report for Lina is ready to read.', isRead: true, createdAt: daysAgo(2),
      ar: { title: 'التقرير الأسبوعي جاهز', body: 'التقرير الأسبوعي للينا جاهز للقراءة.' } },
    { id: 'n-4', userId: 'u-teacher-1', title: 'Placement pending', body: 'Omar Khaled is waiting for the placement exam.', isRead: false, createdAt: daysAgo(1),
      ar: { title: 'اختبار تحديد المستوى معلّق', body: 'عمر خالد بانتظار اختبار تحديد المستوى.' } },
    { id: 'n-5', userId: 'u-teacher-1', title: 'Homework submitted', body: 'Zaid submitted the number worksheet.', isRead: true, createdAt: daysAgo(2),
      ar: { title: 'تم تسليم الواجب', body: 'سلّم زيد ورقة عمل الأعداد.' } },
    { id: 'n-6', userId: SCHOOL_USER, title: 'New student added', body: 'A new student was added to Teacher Khaled\'s class.', isRead: false, createdAt: daysAgo(1),
      ar: { title: 'تمت إضافة طالب جديد', body: 'تمت إضافة طالب جديد إلى صف المعلم خالد.' } },
    { id: 'n-7', userId: SCHOOL_USER, title: 'Monthly summary', body: 'The monthly school summary is available.', isRead: true, createdAt: daysAgo(6),
      ar: { title: 'الملخص الشهري', body: 'الملخص الشهري للمدرسة متاح الآن.' } },
  );

  return db;
}

// Re-exported so api.tsx can build article responses without importing the mock file directly.
export { mockArticles };
