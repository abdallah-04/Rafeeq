import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import {
  apiGetPlacementAssessment,
  apiStartPlacementAssessment,
  apiSubmitPlacementAssessment,
  apiUpdateStudent,
  PlacementAssessmentResponse,
  PlacementQuestionResponse,
} from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

// ─── Observational Exam (Difficulty Detection) ────────────────
// This exam is filled by the TEACHER to determine learning difficulty.
// Results are saved to child.learningDifficulty via updateStudent.
// This runs FIRST before the backend MCQ academic level exam.

type ObsOption  = { labelAr: string; labelEn: string; scores: Partial<Record<Difficulty, number>> };
type ObsQuestion = { id: number; textAr: string; textEn: string; options: ObsOption[] };
type Difficulty  = 'ADD' | 'ADHD' | 'DYS' | 'IFD' | 'ASD';

const OBS_QUESTIONS: ObsQuestion[] = [
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
    textEn: "What is the student's reading performance level?",
    options: [
      { labelAr: 'يعكس الحروف أو يخلط بين الكلمات المتشابهة', labelEn: 'Reverses letters or confuses similar words', scores: { DYS: 3 } },
      { labelAr: 'يقرأ ببطء شديد مع أخطاء متكررة',             labelEn: 'Reads very slowly with frequent errors', scores: { DYS: 2, IFD: 1 } },
      { labelAr: 'يجد صعوبة في التركيز أثناء القراءة',          labelEn: 'Has difficulty concentrating while reading', scores: { ADD: 2 } },
      { labelAr: 'يقرأ بشكل مقبول',                             labelEn: 'Reads acceptably', scores: {} },
    ],
  },
  {
    id: 3,
    textAr: 'كيف يتفاعل الطالب مع الآخرين في الفصل؟',
    textEn: 'How does the student interact with others in class?',
    options: [
      { labelAr: 'يتجنب التفاعل ويفضل العزلة',                labelEn: 'Avoids interaction and prefers isolation', scores: { ASD: 3 } },
      { labelAr: 'يتفاعل بشكل مندفع وغير مناسب',              labelEn: 'Interacts impulsively and inappropriately', scores: { ADHD: 3 } },
      { labelAr: 'يتفاعل لكن ببطء وتحفظ',                     labelEn: 'Interacts but slowly and hesitantly', scores: { IFD: 2 } },
      { labelAr: 'يتفاعل بشكل طبيعي',                         labelEn: 'Interacts normally', scores: {} },
    ],
  },
  {
    id: 4,
    textAr: 'هل يُظهر الطالب سلوكيات متكررة أو اهتمامات محددة جداً؟',
    textEn: 'Does the student show repetitive behaviors or very specific interests?',
    options: [
      { labelAr: 'نعم، بشكل واضح وملحوظ',            labelEn: 'Yes, clearly and noticeably', scores: { ASD: 3 } },
      { labelAr: 'أحياناً في مواقف معينة',             labelEn: 'Sometimes in certain situations', scores: { ASD: 1 } },
      { labelAr: 'نادراً أو لا',                      labelEn: 'Rarely or no', scores: {} },
      { labelAr: 'يُظهر اندفاعية في الاهتمامات',      labelEn: 'Shows impulsive but changing interests', scores: { ADHD: 1 } },
    ],
  },
  {
    id: 5,
    textAr: 'كيف هو أداء الطالب في المهام اليدوية والكتابة؟',
    textEn: "How is the student's performance in manual tasks and writing?",
    options: [
      { labelAr: 'خط غير مقروء وصعوبة في التحكم بالقلم', labelEn: 'Illegible handwriting and difficulty with pen control', scores: { DYS: 2, IFD: 1 } },
      { labelAr: 'يكتب لكن ببطء شديد',                   labelEn: 'Writes but very slowly', scores: { IFD: 2 } },
      { labelAr: 'يتشتت ولا يكمل الكتابة',               labelEn: "Gets distracted and doesn't finish writing", scores: { ADD: 2, ADHD: 1 } },
      { labelAr: 'أداء طبيعي',                           labelEn: 'Normal performance', scores: {} },
    ],
  },
];

const DIFFICULTY_MAP: Record<Difficulty, string> = {
  ADD: 'ADHD', ADHD: 'ADHD', DYS: 'DYSLEXIA', IFD: 'DEVELOPMENTAL_DELAY', ASD: 'AUTISM',
};

const DIFFICULTY_LABELS: Record<Difficulty, { ar: string; en: string; color: string }> = {
  ADD:  { ar: 'اضطراب نقص الانتباه',                en: 'Attention Deficit Disorder',           color: '#3B82F6' },
  ADHD: { ar: 'نقص الانتباه وفرط الحركة',           en: 'ADHD',                                  color: '#8B5CF6' },
  DYS:  { ar: 'عسر القراءة',                        en: 'Dyslexia',                              color: '#F59E0B' },
  IFD:  { ar: 'الإعاقة الذهنية والوظيفية',          en: 'Intellectual & Functional Disability', color: '#EF4444' },
  ASD:  { ar: 'طيف التوحد',                         en: 'Autism Spectrum Disorder',              color: '#22C55E' },
};

function calcObsResult(answers: Record<number, ObsOption>) {
  const totals: Record<Difficulty, number> = { ADD: 0, ADHD: 0, DYS: 0, IFD: 0, ASD: 0 };
  Object.values(answers).forEach((opt) => {
    (Object.entries(opt.scores) as [Difficulty, number][]).forEach(([d, s]) => { totals[d] += s; });
  });
  const top = (Object.entries(totals) as [Difficulty, number][]).sort((a, b) => b[1] - a[1]);
  const winner = top[0][0] as Difficulty;
  const maxPossible = OBS_QUESTIONS.length * 3;
  const confidence = Math.min(100, Math.round((top[0][1] / maxPossible) * 100 * 2.5));
  return { difficulty: winner, confidence, backendDifficulty: DIFFICULTY_MAP[winner] };
}

// ─── MCQ Phase: Backend Academic Level Exam ───────────────────
// This runs AFTER the observational exam.
// Questions come from the backend (fixed seeded MCQ questions).
// Answers: selectedOption is 1-4 (index of correct option).

type Phase = 'obs_intro' | 'obs_exam' | 'obs_result' | 'mcq_loading' | 'mcq_exam' | 'mcq_done';

export default function PlacementExamScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName?: string }>();
  const isRTL = i18n.language === 'ar';

  // ── Observational exam state ──
  const [phase,       setPhase]       = useState<Phase>('obs_intro');
  const [currentObs,  setCurrentObs]  = useState(0);
  const [obsAnswers,  setObsAnswers]  = useState<Record<number, ObsOption>>({});
  const [obsResult,   setObsResult]   = useState<ReturnType<typeof calcObsResult> | null>(null);

  // ── MCQ exam state ──
  const [mcqData,     setMcqData]     = useState<PlacementAssessmentResponse | null>(null);
  const [mcqIndex,    setMcqIndex]    = useState(0);
  const [mcqAnswers,  setMcqAnswers]  = useState<Record<string, number>>({});  // { questionId: selectedOption 1-4 }
  const [mcqResult,   setMcqResult]   = useState<{ level: number; confidence: number } | null>(null);
  const [saving,      setSaving]      = useState(false);

  // ── Load MCQ data ──
  const loadMcq = async () => {
    if (!studentId) return;
    setPhase('mcq_loading');
    try {
      const data = await apiGetPlacementAssessment(studentId);
      if (data.placementCompleted) {
        show('error', { variant: 'invalidInfo' });
        return;
      }
      setMcqData(data);
      setPhase('mcq_exam');
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
      setPhase('obs_result'); // stay on obs result
    }
  };

  // ── Save obs result + start MCQ ──
  const handleSaveObsAndStartMcq = async () => {
    if (!obsResult || !studentId) return;
    setSaving(true);
    try {
      // Save detected difficulty to child profile
      await apiUpdateStudent(studentId, { learningDifficulty: obsResult.backendDifficulty });
      // Now load the backend MCQ exam
      await loadMcq();
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setSaving(false);
    }
  };

  // ── Submit MCQ answers ──
  const handleSubmitMcq = async () => {
    if (!studentId || !mcqData) return;
    setSaving(true);
    try {
      const answers = mcqData.questions.map((q: PlacementQuestionResponse) => ({
        questionId:     q.id,
        selectedOption: mcqAnswers[q.id] ?? 1,  // default 1 if unanswered
      }));
      const result = await apiSubmitPlacementAssessment(studentId, answers);
      setMcqResult({ level: result.assessedLevel, confidence: result.score });
      setPhase('mcq_done');
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setSaving(false);
    }
  };

  const mcqQuestion = mcqData?.questions[mcqIndex];
  const obsQuestion  = OBS_QUESTIONS[currentObs];
  const obsSelected  = obsAnswers[obsQuestion?.id];
  const obsIsLast    = currentObs === OBS_QUESTIONS.length - 1;

  // ─── PHASE: OBS INTRO ──────────────────────────────────────
  if (phase === 'obs_intro') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>{t('teacher.placementExam.examTitle', 'Placement Exam')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.introContent}>
          <View style={styles.infoCard}>
            <Text style={[styles.infoTitle, isRTL && styles.textRight]}>
              {t('teacher.placementExam.examTitle', 'Placement Exam')}
            </Text>
            <Text style={[styles.infoSubtitle, isRTL && styles.textRight]}>
              {isRTL
                ? 'هذا الاختبار من مرحلتين:\n١. مراقبة السلوك (للمعلم) لتحديد صعوبة التعلم\n٢. اختبار أكاديمي (للطالب) لتحديد المستوى الدراسي'
                : 'This exam has two parts:\n1. Behavioral observation (teacher fills) — detects learning difficulty\n2. Academic MCQ (student answers) — determines academic level'}
            </Text>
            <View style={styles.infoRow}>
              <View style={styles.infoChip}><Text style={styles.infoChipText}>📋 {OBS_QUESTIONS.length} {isRTL ? 'ملاحظات' : 'Observations'}</Text></View>
              <View style={styles.infoChip}><Text style={styles.infoChipText}>🎯 {isRTL ? 'تحديد المستوى' : 'Level Detection'}</Text></View>
            </View>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('obs_exam')}>
            <Text style={styles.startBtnText}>{t('teacher.placementExam.startBtn', 'Start Exam')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── PHASE: OBS EXAM ───────────────────────────────────────
  if (phase === 'obs_exam') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => { if (currentObs === 0) setPhase('obs_intro'); else setCurrentObs(q => q - 1); }} />
          <Text style={styles.navTitle}>{currentObs + 1} / {OBS_QUESTIONS.length}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentObs + 1) / OBS_QUESTIONS.length) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.examContent}>
          <View style={styles.questionCard}>
            <Text style={[styles.questionText, isRTL && styles.textRight]}>
              {isRTL ? obsQuestion.textAr : obsQuestion.textEn}
            </Text>
          </View>

          {obsQuestion.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.optionCard, obsSelected === opt && styles.optionSelected]}
              onPress={() => setObsAnswers(prev => ({ ...prev, [obsQuestion.id]: opt }))}
              activeOpacity={0.8}
            >
              <View style={[styles.optionBullet, obsSelected === opt && styles.optionBulletSelected]}>
                <Text style={[styles.optionBulletText, obsSelected === opt && styles.optionBulletTextSelected]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[styles.optionText, isRTL && styles.textRight, obsSelected === opt && styles.optionTextSelected]}>
                {isRTL ? opt.labelAr : opt.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.nextBtn, !obsSelected && styles.nextBtnDisabled]}
            disabled={!obsSelected}
            onPress={() => {
              if (obsIsLast) {
                setObsResult(calcObsResult(obsAnswers));
                setPhase('obs_result');
              } else {
                setCurrentObs(q => q + 1);
              }
            }}
          >
            <Text style={styles.nextBtnText}>
              {obsIsLast ? (isRTL ? 'عرض النتيجة' : 'See Result') : (isRTL ? 'التالي' : 'Next')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── PHASE: OBS RESULT ────────────────────────────────────
  if (phase === 'obs_result' && obsResult) {
    const diffInfo = DIFFICULTY_LABELS[obsResult.difficulty];
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.navTitle}>{t('teacher.placementExam.result.title', 'Exam Result')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.trophyWrap}><Text style={styles.trophyIcon}>🎯</Text></View>
          <Text style={styles.resultTitle}>{t('teacher.placementExam.result.title', 'Exam Result')}</Text>
          {studentName ? <Text style={styles.resultStudentName}>{studentName}</Text> : null}

          <View style={[styles.resultCard, { borderLeftColor: diffInfo.color, borderLeftWidth: 4 }]}>
            <Text style={[styles.resultCardLabel, isRTL && styles.textRight]}>
              {t('teacher.placementExam.result.detected', 'Detected Difficulty')}
            </Text>
            <Text style={[styles.resultCardValue, { color: diffInfo.color }, isRTL && styles.textRight]}>
              {isRTL ? diffInfo.ar : diffInfo.en}
            </Text>
          </View>

          <View style={styles.resultSmallCard}>
            <Text style={styles.resultSmallLabel}>{t('teacher.placementExam.result.confidence', 'Accuracy')}</Text>
            <Text style={[styles.resultSmallValue, { color: '#22C55E' }]}>{obsResult.confidence}%</Text>
          </View>

          <View style={styles.confTrack}>
            <View style={[styles.confFill, { width: `${obsResult.confidence}%`, backgroundColor: diffInfo.color }]} />
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={[styles.disclaimerText, isRTL && styles.textRight]}>
              {isRTL
                ? '⚠️ هذه النتيجة مساعِدة وليست تشخيصاً طبياً. ستُحفظ في ملف الطالب وستُستخدم لتحديد المستوى الدراسي.'
                : '⚠️ This is a guide, not a medical diagnosis. It will be saved to the student profile and used for academic level placement.'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.startBtn, saving && styles.nextBtnDisabled]}
            disabled={saving}
            onPress={handleSaveObsAndStartMcq}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>
                  {isRTL ? 'حفظ ومتابعة الاختبار الأكاديمي →' : 'Save & Continue to Academic Exam →'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── PHASE: MCQ LOADING ───────────────────────────────────
  if (phase === 'mcq_loading') {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#508DF7" />
        <Text style={{ marginTop: 16, fontFamily: 'Lexend_400Regular', color: '#6B7280' }}>
          {isRTL ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
        </Text>
      </SafeAreaView>
    );
  }

  // ─── PHASE: MCQ EXAM ──────────────────────────────────────
  if (phase === 'mcq_exam' && mcqData && mcqQuestion) {
    const isLastMcq = mcqIndex === mcqData.questions.length - 1;
    const lang       = isRTL ? 'Ar' : 'En';
    const qText      = isRTL ? mcqQuestion.questionAr : mcqQuestion.questionEn;
    const options    = isRTL ? mcqQuestion.optionsAr  : mcqQuestion.optionsEn;
    const selected   = mcqAnswers[mcqQuestion.id];

    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => { if (mcqIndex === 0) setPhase('obs_result'); else setMcqIndex(i => i - 1); }} />
          <Text style={styles.navTitle}>{mcqIndex + 1} / {mcqData.questions.length}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((mcqIndex + 1) / mcqData.questions.length) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.examContent}>
          <View style={styles.questionCard}>
            <Text style={[styles.questionText, isRTL && styles.textRight]}>{qText}</Text>
          </View>

          {options.map((opt: string | null, i: number) => (
            opt ? (
              <TouchableOpacity
                key={i}
                style={[styles.optionCard, selected === (i + 1) && styles.optionSelected]}
                onPress={() => setMcqAnswers(prev => ({ ...prev, [mcqQuestion.id]: i + 1 }))}
                activeOpacity={0.8}
              >
                <View style={[styles.optionBullet, selected === (i + 1) && styles.optionBulletSelected]}>
                  <Text style={[styles.optionBulletText, selected === (i + 1) && styles.optionBulletTextSelected]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isRTL && styles.textRight, selected === (i + 1) && styles.optionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ) : null
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            disabled={!selected}
            onPress={() => {
              if (isLastMcq) handleSubmitMcq();
              else setMcqIndex(i => i + 1);
            }}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>
                  {isLastMcq ? (isRTL ? 'إنهاء الاختبار' : 'Finish Exam') : (isRTL ? 'التالي' : 'Next')}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── PHASE: MCQ DONE ──────────────────────────────────────
  if (phase === 'mcq_done' && mcqResult) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <View style={{ width: 40 }} />
          <Text style={styles.navTitle}>{isRTL ? 'اكتمل التقييم' : 'Assessment Complete'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.trophyWrap}><Text style={styles.trophyIcon}>✅</Text></View>
          <Text style={styles.resultTitle}>{isRTL ? 'تم تفعيل حساب الطالب!' : 'Student Account Activated!'}</Text>
          {studentName ? <Text style={styles.resultStudentName}>{studentName}</Text> : null}

          <View style={styles.resultCard}>
            <Text style={[styles.resultCardLabel, isRTL && styles.textRight]}>
              {isRTL ? 'المستوى الأكاديمي المحدد' : 'Determined Academic Level'}
            </Text>
            <Text style={[styles.resultCardValue, { color: '#508DF7' }, isRTL && styles.textRight]}>
              {isRTL ? `المستوى ${mcqResult.level}` : `Level ${mcqResult.level}`}
            </Text>
          </View>

          <View style={styles.resultSmallCard}>
            <Text style={styles.resultSmallLabel}>{isRTL ? 'نسبة الدقة' : 'Score'}</Text>
            <Text style={[styles.resultSmallValue, { color: '#22C55E' }]}>{mcqResult.confidence}%</Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={[styles.disclaimerText, isRTL && styles.textRight]}>
              {isRTL
                ? '✅ أصبح حساب الطالب نشطاً. يمكن لولي الأمر الآن ربط الطالب بحسابه.'
                : "✅ Student account is now ACTIVE. The parent can now link this student to their account."}
            </Text>
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.back()}>
            <Text style={styles.startBtnText}>{isRTL ? 'العودة للطلاب' : 'Back to Students'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F5F7FF' },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  progressTrack: { height: 4, backgroundColor: '#E5E7EB', marginHorizontal: 20, borderRadius: 99 },
  progressFill:  { height: 4, backgroundColor: '#508DF7', borderRadius: 99 },

  introContent: { padding: 16, paddingBottom: 32 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  infoTitle: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e', marginBottom: 8 },
  infoSubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#6B7280', lineHeight: 22, marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoChip: { backgroundColor: '#EEF4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  infoChipText: { fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#508DF7' },

  examContent: { padding: 16, paddingBottom: 32 },
  questionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  questionText: { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e', lineHeight: 26 },

  optionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#E5E7EB' },
  optionSelected: { borderColor: '#508DF7', backgroundColor: '#EEF4FF' },
  optionBullet: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  optionBulletSelected: { backgroundColor: '#508DF7' },
  optionBulletText: { fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#6B7280' },
  optionBulletTextSelected: { color: '#fff' },
  optionText: { flex: 1, fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#374151', lineHeight: 22 },
  optionTextSelected: { color: '#1a1a2e', fontFamily: 'Lexend_500Medium' },

  bottomBar: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, gap: 10 },
  startBtn: { backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center' },
  startBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
  nextBtn: { backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#93C5FD' },
  nextBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },

  resultContent: { padding: 16, paddingBottom: 24 },
  trophyWrap: { alignItems: 'center', marginBottom: 12 },
  trophyIcon: { fontSize: 56 },
  resultTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e', textAlign: 'center', marginBottom: 4 },
  resultStudentName: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  resultCardLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  resultCardValue: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e' },
  resultSmallCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  resultSmallLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  resultSmallValue: { fontFamily: 'Lexend_700Bold', fontSize: 22 },
  confTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 99, marginBottom: 14, overflow: 'hidden' },
  confFill:  { height: 8, borderRadius: 99 },
  disclaimerCard: { backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, marginBottom: 10 },
  disclaimerText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#92400E', lineHeight: 20 },
});