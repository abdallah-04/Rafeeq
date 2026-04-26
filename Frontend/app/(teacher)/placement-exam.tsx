import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';
import {
  apiStartPlacementAssessment,
  apiSubmitPlacementAssessment,
  PlacementAssessmentResponse,
} from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

type Phase = 'intro' | 'loading' | 'exam' | 'done';

const BROKEN_RTL_TEXT_RE = /[ØÙÃÂ]/;

function isBrokenLocalizedText(value?: string | null) {
  return !!value && (value.includes('\uFFFD') || BROKEN_RTL_TEXT_RE.test(value));
}

function getLocalizedText(isRTL: boolean, preferred?: string | null, fallback?: string | null) {
  if (isRTL && preferred && !isBrokenLocalizedText(preferred)) {
    return preferred;
  }
  return fallback ?? preferred ?? '';
}

function getLocalizedOptions(
  isRTL: boolean,
  preferred?: Array<string | null>,
  fallback?: Array<string | null>
) {
  const hasBrokenPreferred = !!preferred?.some((option) => isBrokenLocalizedText(option));
  const source = isRTL && preferred && !hasBrokenPreferred ? preferred : (fallback ?? preferred ?? []);
  return source.filter((option): option is string => !!option);
}

export default function PlacementExamScreen() {
  const router = useRouter();
  const { show } = useModal();
  const { t, i18n } = useTranslation();
  const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName?: string }>();
  const isRTL = i18n.language === 'ar';

  const [phase, setPhase] = useState<Phase>('intro');
  const [assessment, setAssessment] = useState<PlacementAssessmentResponse | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    level: number;
    correctAnswers: number;
    totalQuestions: number;
    confidence: number;
    treeGenerated: boolean;
    treeGenerationMessage?: string | null;
  } | null>(null);

  const handleExit = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (studentId) {
      router.replace({ pathname: '/(teacher)/Student_dashboard', params: { studentId } } as any);
      return;
    }
    router.replace('/(teacher)/(tabs)/students');
  };

  const currentQuestion = assessment?.questions[questionIndex] ?? null;
  const localizedQuestion = currentQuestion
    ? getLocalizedText(isRTL, currentQuestion.questionAr, currentQuestion.questionEn)
    : '';
  const localizedOptions = currentQuestion
    ? getLocalizedOptions(isRTL, currentQuestion.optionsAr, currentQuestion.optionsEn)
    : [];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  const startExam = async () => {
    if (!studentId) return;
    setSubmitting(true);
    setPhase('loading');
    try {
      const data = await apiStartPlacementAssessment(studentId);
      if (data.placementCompleted) {
        show('error', { variant: 'invalidInfo' });
        handleExit();
        return;
      }
      setAssessment(data);
      setAnswers({});
      setQuestionIndex(0);
      setPhase('exam');
    } catch {
      show('error', { variant: 'invalidInfo' });
      setPhase('intro');
    } finally {
      setSubmitting(false);
    }
  };

  const submitExam = async () => {
    if (!studentId || !assessment) return;
    setSubmitting(true);
    try {
      const payload = assessment.questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id] ?? 1,
      }));
      const response = await apiSubmitPlacementAssessment(studentId, payload);
      setResult({
        level: response.resultLevel,
        correctAnswers: response.correctAnswers,
        totalQuestions: response.totalQuestions,
        confidence: response.confidencePercentage,
        treeGenerated: response.treeGenerated ?? false,
        treeGenerationMessage: response.treeGenerationMessage,
      });
      setPhase('done');
    } catch {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color="#508DF7" />
        <Text style={styles.loadingText}>
          {t('teacher.placementExam.loading', 'Loading questions...')}
        </Text>
      </SafeAreaView>
    );
  }

  if (phase === 'exam' && assessment && currentQuestion) {
    const isLastQuestion = questionIndex === assessment.questions.length - 1;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <BackButton
            onPress={() => {
              if (questionIndex === 0) setPhase('intro');
              else setQuestionIndex((current) => current - 1);
            }}
          />
          <Text style={[styles.navTitle, styles.counterText]}>
            {`${questionIndex + 1} / ${assessment.questions.length}`}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((questionIndex + 1) / assessment.questions.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.examContent}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionHeaderTitle}>
              {t('teacher.placementExam.examTitle', 'Initial Exam')}
            </Text>
            <Text style={styles.questionHeaderSubtitle}>
              {t('teacher.exam.question', 'Question')} {questionIndex + 1}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={[styles.questionText, isRTL && styles.textRight]}>
              {localizedQuestion}
            </Text>
          </View>

          {localizedOptions.map((option, index) => (
            <TouchableOpacity
              key={`${currentQuestion.id}-${index + 1}`}
              style={[styles.optionCard, selectedOption === index + 1 && styles.optionSelected]}
              onPress={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: index + 1 }))}
              activeOpacity={0.8}
            >
              <View style={[styles.optionBullet, selectedOption === index + 1 && styles.optionBulletSelected]}>
                <Text style={[styles.optionBulletText, selectedOption === index + 1 && styles.optionBulletTextSelected]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[styles.optionText, isRTL && styles.textRight, selectedOption === index + 1 && styles.optionTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.nextBtn, (!selectedOption || submitting) && styles.nextBtnDisabled]}
            disabled={!selectedOption || submitting}
            onPress={() => {
              if (isLastQuestion) submitExam();
              else setQuestionIndex((current) => current + 1);
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>
                {isLastQuestion
                  ? t('teacher.exam.finish', 'Finish')
                  : t('teacher.exam.nextQuestion', 'Next Question')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'done' && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.navBar, isRTL && styles.rowReverse]}>
          <View style={{ width: 40 }} />
          <Text style={styles.navTitle}>
            {t('teacher.placementExam.completed', 'Assessment Complete')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.trophyWrap}>
            <Text style={styles.trophyIcon}>✓</Text>
          </View>
          <Text style={styles.resultTitle}>
            {t('teacher.placementExam.resultTitle', 'Student Account Activated')}
          </Text>
          <Text style={styles.resultStudentName}>
            {studentName ?? assessment?.childName ?? ''}
          </Text>

          <View style={styles.resultCard}>
            <Text style={[styles.resultCardLabel, isRTL && styles.textRight]}>
              {t('teacher.placementExam.levelLabel', 'Determined Academic Level')}
            </Text>
            <Text style={[styles.resultCardValue, isRTL && styles.textRight]}>
              {t('teacher.placementExam.levelValue', { defaultValue: `Level ${result.level}`, level: result.level })}
            </Text>
          </View>

          <View style={styles.resultSmallCard}>
            <Text style={styles.resultSmallLabel}>
              {t('teacher.monthlyExam.scoreLabel', 'Score')}
            </Text>
            <Text style={[styles.resultSmallValue, { color: '#22C55E' }]}>
              {`${result.correctAnswers}/${result.totalQuestions}`}
            </Text>
          </View>

          <View style={styles.confTrack}>
            <View style={[styles.confFill, { width: `${result.confidence}%` }]} />
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={[styles.disclaimerText, isRTL && styles.textRight]}>
              {t(
                'teacher.placementExam.activationNote',
                'The student is now active and the parent can link the account.'
              )}
            </Text>
          </View>

          {!result.treeGenerated ? (
            <View style={styles.warningCard}>
              <Text style={[styles.warningText, isRTL && styles.textRight]}>
                {result.treeGenerationMessage
                  ?? t(
                    'teacher.placementExam.treeGenerationWarning',
                    'Placement was saved, but the AI learning tree was not generated.'
                  )}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.startBtn} onPress={handleExit}>
            <Text style={styles.startBtnText}>
              {t('teacher.placementExam.backToStudents', 'Back to Students')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleExit} />
        <Text style={styles.navTitle}>{t('teacher.placementExam.examTitle', 'Initial Exam')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.introContent}>
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, isRTL && styles.textRight]}>
            {t('teacher.placementExam.examTitle', 'Initial Exam')}
          </Text>
          <Text style={[styles.infoSubtitle, isRTL && styles.textRight]}>
            {t(
              'teacher.placementExam.introText',
              'This exam determines the academic level and activates the student account once completed.'
            )}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>
                {t('teacher.placementExam.questionBank', 'Placement Questions')}
              </Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>
                {t('teacher.placementExam.levelChip', 'Level Detection')}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, submitting && styles.nextBtnDisabled]}
          onPress={startExam}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>{t('teacher.placementExam.startBtn', 'Start Exam')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F5F7FF',
  },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  counterText: { writingDirection: 'ltr' },

  progressTrack: { height: 4, backgroundColor: '#E5E7EB', marginHorizontal: 20, borderRadius: 99 },
  progressFill: { height: 4, backgroundColor: '#508DF7', borderRadius: 99 },

  introContent: { padding: 16, paddingBottom: 32 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTitle: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#1a1a2e', marginBottom: 8 },
  infoSubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#6B7280', lineHeight: 22, marginBottom: 14 },
  infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoChip: { backgroundColor: '#EEF4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  infoChipText: { fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#508DF7' },

  loadingText: { marginTop: 16, fontFamily: 'Lexend_400Regular', color: '#6B7280' },

  examContent: { padding: 16, paddingBottom: 32 },
  questionHeader: { backgroundColor: '#EEF4FF', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 20, marginBottom: 16 },
  questionHeaderTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e' },
  questionHeaderSubtitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#508DF7', marginTop: 4 },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  questionText: { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e', lineHeight: 26 },

  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionSelected: { borderColor: '#508DF7', backgroundColor: '#EEF4FF' },
  optionBullet: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  trophyIcon: { fontFamily: 'Lexend_700Bold', fontSize: 36, color: '#22C55E' },
  resultTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e', textAlign: 'center', marginBottom: 4 },
  resultStudentName: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  resultCardValue: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#508DF7' },
  resultSmallCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultSmallLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  resultSmallValue: { fontFamily: 'Lexend_700Bold', fontSize: 22 },
  confTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 99, marginBottom: 14, overflow: 'hidden' },
  confFill: { height: 8, borderRadius: 99, backgroundColor: '#508DF7' },
  disclaimerCard: { backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, marginBottom: 10 },
  disclaimerText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#92400E', lineHeight: 20 },
  warningCard: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 10 },
  warningText: { fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#B91C1C', lineHeight: 20 },
});
