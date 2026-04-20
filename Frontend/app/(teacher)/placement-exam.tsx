import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Text } from '@/components/RNText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TEACHER_STUDENTS_MAP } from './_students';
import BackButton from '@/components/BackButton';

// ─── Types ────────────────────────────────────────────────────
type Option = { labelAr: string; labelEn: string; scores: Partial<Record<Difficulty, number>> };
type Question = { id: number; textAr: string; textEn: string; options: Option[] };
type Difficulty = 'ADD' | 'ADHD' | 'DYS' | 'IFD' | 'ASD';

// ─── أسئلة الامتحان ───────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: 1,
    textAr: 'كيف يتصرف الطالب عند تلقي تعليمات طويلة؟',
    textEn: 'How does the student behave when receiving long instructions?',
    options: [
      { labelAr: 'يفقد التركيز بسرعة ويشتت انتباهه', labelEn: 'Loses focus quickly and gets distracted', scores: { ADD: 3, ADHD: 2 } },
      { labelAr: 'يتحرك كثيراً ويجد صعوبة في الجلوس', labelEn: 'Moves a lot and struggles to sit still', scores: { ADHD: 3 } },
      { labelAr: 'يفهم ببطء ويحتاج تكراراً', labelEn: 'Understands slowly and needs repetition', scores: { IFD: 3 } },
      { labelAr: 'يستجيب بشكل طبيعي', labelEn: 'Responds normally', scores: {} },
    ],
  },
  {
    id: 2,
    textAr: 'ما مستوى أداء الطالب في القراءة؟',
    textEn: 'What is the student\'s reading performance level?',
    options: [
      { labelAr: 'يعكس الحروف أو يخلط بين الكلمات المتشابهة', labelEn: 'Reverses letters or confuses similar words', scores: { DYS: 3 } },
      { labelAr: 'يقرأ ببطء شديد مع أخطاء متكررة', labelEn: 'Reads very slowly with frequent errors', scores: { DYS: 2, IFD: 1 } },
      { labelAr: 'يجد صعوبة في التركيز أثناء القراءة', labelEn: 'Has difficulty concentrating while reading', scores: { ADD: 2 } },
      { labelAr: 'يقرأ بشكل مقبول', labelEn: 'Reads acceptably', scores: {} },
    ],
  },
  {
    id: 3,
    textAr: 'كيف يتفاعل الطالب مع الآخرين في الفصل؟',
    textEn: 'How does the student interact with others in class?',
    options: [
      { labelAr: 'يتجنب التفاعل ويفضل العزلة', labelEn: 'Avoids interaction and prefers isolation', scores: { ASD: 3 } },
      { labelAr: 'يتفاعل بشكل مندفع وغير مناسب', labelEn: 'Interacts impulsively and inappropriately', scores: { ADHD: 3 } },
      { labelAr: 'يتفاعل لكن ببطء وتحفظ', labelEn: 'Interacts but slowly and hesitantly', scores: { IFD: 2 } },
      { labelAr: 'يتفاعل بشكل طبيعي', labelEn: 'Interacts normally', scores: {} },
    ],
  },
  {
    id: 4,
    textAr: 'هل يُظهر الطالب سلوكيات متكررة أو اهتمامات محددة جداً؟',
    textEn: 'Does the student show repetitive behaviors or very specific interests?',
    options: [
      { labelAr: 'نعم، بشكل واضح وملحوظ', labelEn: 'Yes, clearly and noticeably', scores: { ASD: 3 } },
      { labelAr: 'أحياناً في مواقف معينة', labelEn: 'Sometimes in certain situations', scores: { ASD: 1 } },
      { labelAr: 'نادراً أو لا', labelEn: 'Rarely or no', scores: {} },
      { labelAr: 'يُظهر اندفاعية في الاهتمامات لكنها متغيرة', labelEn: 'Shows impulsive interests but they change', scores: { ADHD: 1 } },
    ],
  },
  {
    id: 5,
    textAr: 'كيف هو أداء الطالب في المهام اليدوية والكتابة؟',
    textEn: 'How is the student\'s performance in manual tasks and writing?',
    options: [
      { labelAr: 'خط غير مقروء وصعوبة في التحكم بالقلم', labelEn: 'Illegible handwriting and difficulty controlling the pen', scores: { DYS: 2, IFD: 1 } },
      { labelAr: 'يكتب لكن ببطء شديد', labelEn: 'Writes but very slowly', scores: { IFD: 2 } },
      { labelAr: 'يتشتت ولا يكمل الكتابة', labelEn: 'Gets distracted and doesn\'t finish writing', scores: { ADD: 2, ADHD: 1 } },
      { labelAr: 'أداء طبيعي', labelEn: 'Normal performance', scores: {} },
    ],
  },
  {
    id: 6,
    textAr: 'كيف يتحكم الطالب في نشاطه الحركي داخل الفصل؟',
    textEn: 'How does the student control their physical activity inside the classroom?',
    options: [
      { labelAr: 'لا يستطيع الجلوس ساكناً ودائم الحركة', labelEn: 'Cannot sit still and always moving', scores: { ADHD: 3 } },
      { labelAr: 'يتحرك أكثر من المعتاد لكن يمكن ضبطه', labelEn: 'Moves more than usual but can be managed', scores: { ADHD: 1, ADD: 1 } },
      { labelAr: 'هادئ لكن غير منتبه', labelEn: 'Quiet but inattentive', scores: { ADD: 2 } },
      { labelAr: 'هادئ ومنتبه', labelEn: 'Quiet and attentive', scores: {} },
    ],
  },
  {
    id: 7,
    textAr: 'كيف يستجيب الطالب للتعليمات الاجتماعية؟',
    textEn: 'How does the student respond to social instructions?',
    options: [
      { labelAr: 'لا يفهم الإيماءات والتعابير الاجتماعية', labelEn: 'Doesn\'t understand social gestures and expressions', scores: { ASD: 3 } },
      { labelAr: 'يفهم لكن يتأخر في الاستجابة', labelEn: 'Understands but slow to respond', scores: { IFD: 2 } },
      { labelAr: 'يستجيب لكن بطريقة مندفعة', labelEn: 'Responds but impulsively', scores: { ADHD: 2 } },
      { labelAr: 'يستجيب بشكل طبيعي', labelEn: 'Responds normally', scores: {} },
    ],
  },
  {
    id: 8,
    textAr: 'ما مستوى الطالب في الرياضيات والمفاهيم الأساسية؟',
    textEn: 'What is the student\'s level in math and basic concepts?',
    options: [
      { labelAr: 'صعوبة كبيرة في المفاهيم الأساسية جداً', labelEn: 'Great difficulty with very basic concepts', scores: { IFD: 3 } },
      { labelAr: 'يفهم لكن يحتاج وقتاً طويلاً', labelEn: 'Understands but needs a long time', scores: { IFD: 1, DYS: 1 } },
      { labelAr: 'يفهم لكن يفقد التركيز أثناء الحل', labelEn: 'Understands but loses focus while solving', scores: { ADD: 2 } },
      { labelAr: 'أداء مقبول', labelEn: 'Acceptable performance', scores: {} },
    ],
  },
  {
    id: 9,
    textAr: 'هل يُظهر الطالب صعوبة في التعرف على الأصوات والحروف؟',
    textEn: 'Does the student show difficulty recognizing sounds and letters?',
    options: [
      { labelAr: 'نعم، صعوبة واضحة في ربط الصوت بالحرف', labelEn: 'Yes, clear difficulty linking sound to letter', scores: { DYS: 3 } },
      { labelAr: 'يخلط بين أصوات متشابهة', labelEn: 'Confuses similar sounds', scores: { DYS: 2 } },
      { labelAr: 'بطيء في التعلم لكن يتحسن', labelEn: 'Slow to learn but improving', scores: { IFD: 1 } },
      { labelAr: 'لا توجد صعوبة', labelEn: 'No difficulty', scores: {} },
    ],
  },
  {
    id: 10,
    textAr: 'كيف يُعبّر الطالب عن نفسه لفظياً؟',
    textEn: 'How does the student express themselves verbally?',
    options: [
      { labelAr: 'كلام محدود جداً أو غائب', labelEn: 'Very limited or absent speech', scores: { ASD: 2, IFD: 2 } },
      { labelAr: 'يتكلم لكن بجمل قصيرة وبسيطة', labelEn: 'Speaks but with short simple sentences', scores: { IFD: 2 } },
      { labelAr: 'يتكلم كثيراً ودون انتظار دوره', labelEn: 'Talks a lot without waiting for their turn', scores: { ADHD: 2 } },
      { labelAr: 'تعبير لفظي طبيعي', labelEn: 'Normal verbal expression', scores: {} },
    ],
  },
];

// ─── خوارزمية حساب النتيجة ────────────────────────────────────
const DIFFICULTY_LABELS: Record<Difficulty, { ar: string; en: string; color: string }> = {
  ADD:  { ar: 'اضطراب نقص الانتباه',                        en: 'ADD — Attention Deficit Disorder',     color: '#508DF7' },
  ADHD: { ar: 'اضطراب فرط الحركة ونقص الانتباه',           en: 'ADHD — Hyperactivity & Attention',     color: '#BA6DE9' },
  DYS:  { ar: 'عسر القراءة',                                en: 'Dyslexia',                             color: '#F59E0B' },
  IFD:  { ar: 'الإعاقة الذهنية والوظيفية',                  en: 'Intellectual & Functional Disability', color: '#EF4444' },
  ASD:  { ar: 'طيف التوحد',                                 en: 'Autism Spectrum Disorder',             color: '#22C55E' },
};

const LEVEL_MAP: Record<Difficulty, string> = {
  ADD: 'Level 2', ADHD: 'Level 2', DYS: 'Level 1', IFD: 'Level 1', ASD: 'Level 1',
};

function calcResult(answers: Record<number, Option>) {
  const totals: Record<Difficulty, number> = { ADD: 0, ADHD: 0, DYS: 0, IFD: 0, ASD: 0 };
  Object.values(answers).forEach((opt) => {
    (Object.entries(opt.scores) as [Difficulty, number][]).forEach(([d, s]) => {
      totals[d] += s;
    });
  });
  const top = (Object.entries(totals) as [Difficulty, number][]).sort((a, b) => b[1] - a[1]);
  const winner = top[0][0] as Difficulty;
  const maxPossible = QUESTIONS.length * 3;
  const confidence = Math.min(100, Math.round((top[0][1] / maxPossible) * 100 * 2.5));
  return { difficulty: winner, level: LEVEL_MAP[winner], confidence };
}

// ─── Component ────────────────────────────────────────────────
type Phase = 'intro' | 'exam' | 'result';

export default function PlacementExamScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const student = TEACHER_STUDENTS_MAP[studentId ?? '1'] ?? TEACHER_STUDENTS_MAP['1'];

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Option>>({});
  const [result, setResult] = useState<ReturnType<typeof calcResult> | null>(null);

  const question = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;
  const selectedOption = answers[question?.id];

  // ── الانتقال للسؤال التالي أو النتيجة
  const handleNext = () => {
    if (!selectedOption) return;
    if (isLast) {
      setResult(calcResult(answers));
      setPhase('result');
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  // ── طباعة (Alert لأن RN لا يدعم print API مباشرة)
  const handlePrint = () => {
    Alert.alert(
      isRTL ? 'طباعة الاختبار' : 'Print Exam',
      isRTL
        ? 'في التطبيق الفعلي، سيُصدَّر الاختبار كـ PDF ويُرسَل للطباعة. هذه الميزة تحتاج اتصالاً بخادم الطباعة.'
        : 'In the real app, the exam will be exported as a PDF and sent to print. This feature requires a connection to the print server.',
      [{ text: isRTL ? 'حسناً' : 'OK' }]
    );
  };

  // ── حفظ النتيجة (mock)
  const handleSave = () => {
    Alert.alert(
      isRTL ? 'تم الحفظ ✅' : 'Saved ✅',
      isRTL
        ? 'تم تحديث ملف الطالب بنتيجة الاختبار.'
        : 'Student profile has been updated with the exam result.',
      [{ text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() }]
    );
  };

  // ─────────────────────────────────────────────────────────────
  // PHASE: INTRO
  // ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>
            {t('teacher.placementExam.examTitle', 'Placement Exam')}
          </Text>
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
            <Text style={styles.printBtnText}>🖨️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.introContent}>
          {/* Student Card */}
          <View style={styles.studentMiniCard}>
            <View style={[styles.miniAvatar, { backgroundColor: student.avatarBg }]}>
              <Text style={styles.miniAvatarText}>{student.initials}</Text>
            </View>
            <View>
              <Text style={[styles.miniName, isRTL && styles.textRight]}>
                {isRTL ? student.nameAr : student.name}
              </Text>
              <Text style={[styles.miniSub, isRTL && styles.textRight]}>
                {t('teacher.placementExam.levelNotSet', 'Level Not Set')}
              </Text>
            </View>
          </View>

          {/* Exam Info Card */}
          <View style={styles.infoCard}>
            <Text style={[styles.infoTitle, isRTL && styles.textRight]}>
              {t('teacher.placementExam.examTitle', 'Placement Exam')}
            </Text>
            <Text style={[styles.infoSubtitle, isRTL && styles.textRight]}>
              {t('teacher.placementExam.examSubtitle')}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoChip}><Text style={styles.infoChipText}>📋 {QUESTIONS.length} {isRTL ? 'سؤالاً' : 'Questions'}</Text></View>
              <View style={styles.infoChip}><Text style={styles.infoChipText}>⏱️ ~{isRTL ? '١٥ دقيقة' : '15 min'}</Text></View>
              <View style={styles.infoChip}><Text style={styles.infoChipText}>🎯 {isRTL ? 'تشخيص الصعوبة' : 'Difficulty Detection'}</Text></View>
            </View>
          </View>

          {/* What We Detect */}
          <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
            {isRTL ? 'الصعوبات التي يُشخِّصها الاختبار' : 'Difficulties This Exam Detects'}
          </Text>
          <View style={styles.diffGrid}>
            {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, typeof DIFFICULTY_LABELS[Difficulty]][]).map(([key, val]) => (
              <View key={key} style={[styles.diffChip, { borderLeftColor: val.color, borderLeftWidth: 3 }]}>
                <Text style={[styles.diffCode, { color: val.color }]}>{key}</Text>
                <Text style={styles.diffLabel}>{isRTL ? val.ar : val.en}</Text>
              </View>
            ))}
          </View>

          {/* Print Note */}
          <View style={styles.printNoteCard}>
            <Text style={styles.printNoteText}>
              🖨️ {t('teacher.placementExam.printNote')}
            </Text>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('exam')}>
            <Text style={styles.startBtnText}>
              {t('teacher.placementExam.startBtn', '🚀 Start Exam')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.printBtnFull} onPress={handlePrint}>
            <Text style={styles.printBtnFullText}>
              🖨️ {t('teacher.placementExam.printBtn', 'Print Exam')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE: EXAM
  // ─────────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => { if (currentQ > 0) setCurrentQ(q => q - 1); else setPhase('intro'); }} />
          <Text style={styles.navTitle}>
            {t('teacher.placementExam.question', { current: currentQ + 1, total: QUESTIONS.length })}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.examContent}>
          <View style={styles.questionCard}>
            <Text style={[styles.questionText, isRTL && styles.textRight]}>
              {isRTL ? question.textAr : question.textEn}
            </Text>
          </View>

          <View style={styles.optionsWrap}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionCard, isSelected && styles.optionSelected]}
                  onPress={() => setAnswers((prev) => ({ ...prev, [question.id]: opt }))}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                    {isSelected && <View style={styles.optionRadioDot} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    isRTL && styles.textRight,
                  ]}>
                    {isRTL ? opt.labelAr : opt.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.startBtn, !selectedOption && styles.btnDisabled]}
            onPress={handleNext}
            disabled={!selectedOption}
          >
            <Text style={styles.startBtnText}>
              {isLast
                ? t('teacher.placementExam.finish', 'Finish Exam')
                : t('teacher.placementExam.next', 'Next')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE: RESULT
  // ─────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const diffInfo = DIFFICULTY_LABELS[result.difficulty];
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>
            {t('teacher.placementExam.result.title', 'Exam Result')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultContent}>
          {/* Trophy */}
          <View style={styles.trophyWrap}>
            <Text style={styles.trophyIcon}>🎯</Text>
          </View>
          <Text style={styles.resultTitle}>
            {t('teacher.placementExam.result.title', 'Exam Result')}
          </Text>
          <Text style={styles.resultStudentName}>
            {isRTL ? student.nameAr : student.name}
          </Text>

          {/* Result Cards */}
          <View style={[styles.resultCard, { borderLeftColor: diffInfo.color, borderLeftWidth: 4 }]}>
            <Text style={[styles.resultCardLabel, isRTL && styles.textRight]}>
              {t('teacher.placementExam.result.detected', 'Detected Difficulty')}
            </Text>
            <Text style={[styles.resultCardValue, { color: diffInfo.color }, isRTL && styles.textRight]}>
              {isRTL ? diffInfo.ar : diffInfo.en}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <View style={[styles.resultSmallCard, { flex: 1 }]}>
              <Text style={styles.resultSmallLabel}>
                {t('teacher.placementExam.result.level', 'Suggested Level')}
              </Text>
              <Text style={styles.resultSmallValue}>{result.level}</Text>
            </View>
            <View style={[styles.resultSmallCard, { flex: 1 }]}>
              <Text style={styles.resultSmallLabel}>
                {t('teacher.placementExam.result.confidence', 'Accuracy')}
              </Text>
              <Text style={[styles.resultSmallValue, { color: '#22C55E' }]}>{result.confidence}%</Text>
            </View>
          </View>

          {/* Confidence Bar */}
          <View style={styles.confTrack}>
            <View style={[styles.confFill, { width: `${result.confidence}%`, backgroundColor: diffInfo.color }]} />
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Text style={[styles.disclaimerText, isRTL && styles.textRight]}>
              {isRTL
                ? '⚠️ هذه النتيجة مساعِدة وليست تشخيصاً طبياً. يُنصح بمراجعة متخصص لتأكيد التشخيص.'
                : '⚠️ This result is a guide, not a medical diagnosis. Please consult a specialist to confirm.'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.startBtn} onPress={handleSave}>
            <Text style={styles.startBtnText}>
              {t('teacher.placementExam.result.saveBtn', 'Save Result & Update Profile')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.printBtnFull}
            onPress={() => { setPhase('exam'); setCurrentQ(0); setAnswers({}); setResult(null); }}
          >
            <Text style={styles.printBtnFullText}>
              🔄 {t('teacher.placementExam.result.retakeBtn', 'Retake Exam')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  rowReverse: { flexDirection: 'row-reverse' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F7FF',
  },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  textRight: { textAlign: 'right' },

  printBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  printBtnText: { fontSize: 22 },

  // ── Intro ──
  introContent: { padding: 16, paddingBottom: 32 },

  studentMiniCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  miniAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e' },
  miniName: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#1a1a2e' },
  miniSub: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#F59E0B', marginTop: 2 },

  infoCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  infoTitle: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e', marginBottom: 6 },
  infoSubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoChip: {
    backgroundColor: '#EEF4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
  },
  infoChipText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: '#508DF7' },

  sectionLabel: {
    fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#1a1a2e', marginBottom: 10,
  },
  diffGrid: { gap: 8, marginBottom: 20 },
  diffChip: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  diffCode: { fontFamily: 'Lexend_700Bold', fontSize: 13, marginBottom: 2 },
  diffLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#6b7280' },

  printNoteCard: {
    backgroundColor: '#FFF8E6', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A',
  },
  printNoteText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#92400E', lineHeight: 18 },

  // ── Bottom Bar ──
  bottomBar: { padding: 16, gap: 10, backgroundColor: '#F5F7FF' },
  startBtn: {
    backgroundColor: '#508DF7', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },
  btnDisabled: { backgroundColor: '#C4D4F7', opacity: 0.6 },
  printBtnFull: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  printBtnFullText: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#6b7280' },

  // ── Progress Bar ──
  progressTrack: { height: 5, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  progressFill: { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },

  // ── Exam ──
  examContent: { padding: 16, paddingBottom: 32 },
  questionCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 20,
    shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  questionText: { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e', lineHeight: 26 },

  optionsWrap: { gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  optionSelected: { borderColor: '#508DF7', backgroundColor: '#EEF4FF' },
  optionRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  optionRadioSelected: { borderColor: '#508DF7' },
  optionRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#508DF7' },
  optionText: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#374151', flex: 1, lineHeight: 22 },
  optionTextSelected: { fontFamily: 'Lexend_600SemiBold', color: '#1a1a2e' },

  // ── Result ──
  resultContent: { padding: 20, paddingBottom: 32, alignItems: 'center' },
  trophyWrap: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#EEF4FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  trophyIcon: { fontSize: 44 },
  resultTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e', marginBottom: 4 },
  resultStudentName: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#6b7280', marginBottom: 24 },

  resultCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  resultCardLabel: { fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#9CA3AF', marginBottom: 6 },
  resultCardValue: { fontFamily: 'Lexend_700Bold', fontSize: 16 },

  resultRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  resultSmallCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, alignItems: 'center',
  },
  resultSmallLabel: { fontFamily: 'Lexend_500Medium', fontSize: 11, color: '#9CA3AF', marginBottom: 6, textAlign: 'center' },
  resultSmallValue: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e' },

  confTrack: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 99, marginBottom: 20, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 99 },

  disclaimerCard: {
    width: '100%', backgroundColor: '#FFF8E6', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  disclaimerText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#92400E', lineHeight: 20 },
});