import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

// ─── Exam Questions ───────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    type: 'visual',
    question: 'Count the Carrots',
    questionAr: 'عد الجزر',
    visual: '🥕🥕🥕🥕🥕',
    options: ['3', '2', '5', '7'],
    correct: '5',
  },
  {
    id: 2,
    type: 'text',
    question: 'Based on the last Question:\nif we take 2 of them how much will be left?',
    questionAr: 'بناءً على السؤال السابق:\nإذا أخذنا 2 منها كم سيتبقى؟',
    options: ['2', '4', '6', '3'],
    correct: '3',
  },
  {
    id: 3,
    type: 'choice',
    question: 'What is 3 + 4?',
    questionAr: 'ما هو 3 + 4؟',
    options: ['A. 5', 'B. 6', 'C. 7', 'D. 8'],
    correct: 'C. 7',
  },
];

// ─── Exam Info Screen ─────────────────────────────────────────
function ExamInfoScreen({ onStart, isRTL, t }: { onStart: () => void; isRTL: boolean; t: any }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Exam info card */}
      <View style={styles.examCard}>
        <View style={[styles.examCardRow, isRTL && styles.rowReverse]}>
          <View style={styles.examDetails}>
            <View style={styles.examDetailRow}>
              <Text style={styles.examDetailLabel}>{t('teacher.exam.levelGrade', 'Level Grade')}</Text>
              <Text style={styles.examDetailValue}>4</Text>
            </View>
            <View style={styles.examDetailRow}>
              <Text style={styles.examDetailLabel}>{t('teacher.exam.topic', 'Topic')}</Text>
              <Text style={styles.examDetailValue}>Adding</Text>
            </View>
            <View style={styles.examDetailRow}>
              <Text style={styles.examDetailLabel}>{t('teacher.exam.date', 'Date')}</Text>
              <Text style={styles.examDetailValue}>28/10/2026</Text>
            </View>
            <View style={styles.examDetailRow}>
              <Text style={styles.examDetailLabel}>{t('teacher.exam.next', 'Next')}</Text>
              <Text style={styles.examDetailValue}>28/11/2026</Text>
            </View>
          </View>
          {/* Progress circle + level badge */}
          <View style={styles.examRight}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level 3</Text>
            </View>
            <View style={styles.examCircle}>
              <Text style={styles.examCircleText}>74%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Start Exam button */}
      <TouchableOpacity style={styles.startBtn} onPress={onStart}>
        <Text style={styles.startBtnText}>{t('teacher.exam.startExam', 'Start Exam')}</Text>
      </TouchableOpacity>

      {/* Download button */}
      <TouchableOpacity style={styles.downloadBtn}>
        <Text style={styles.downloadIcon}>↓</Text>
        <Text style={styles.downloadText}>{t('teacher.exam.download', 'Download')}</Text>
      </TouchableOpacity>

      {/* Recent Activity */}
      <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
        {t('teacher.exam.recentActivity', 'Recent Activity')}
      </Text>
      {[
        { label: 'Completed', value: 'Exam 1', score: 'Score 2/3', color: '#22C55E' },
      ].map((item, i) => (
        <View key={i} style={styles.activityCard}>
          <View style={[styles.activityRow, isRTL && styles.rowReverse]}>
            <View style={[styles.activityBadge, { backgroundColor: item.color + '22' }]}>
              <Text style={[styles.activityBadgeText, { color: item.color }]}>{item.label}</Text>
            </View>
            <Text style={styles.activityLabel}>{item.value}</Text>
            <Text style={styles.activityScore}>{item.score}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Question Screen ──────────────────────────────────────────
function QuestionScreen({
  question, qIndex, total, onNext, onFinish, isRTL, t,
}: {
  question: typeof QUESTIONS[0];
  qIndex: number;
  total: number;
  onNext: (answer: string) => void;
  onFinish: (answer: string) => void;
  isRTL: boolean;
  t: any;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const isLast = qIndex === total - 1;

  return (
    <View style={styles.questionScreen}>
      {/* Header */}
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{t('teacher.exam.examQuestions', 'Exam Questions')}</Text>
        <Text style={styles.questionSubtitle}>
          {t('teacher.exam.question', 'Question')} {qIndex + 1}
        </Text>
        {/* Timer */}
        <ExamTimer />
      </View>

      {/* Question card */}
      <View style={styles.questionCard}>
        {question.type === 'visual' && (
          <>
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.visualEmoji}>{question.visual}</Text>
          </>
        )}
        {question.type === 'text' && (
          <Text style={styles.questionText}>{question.question}</Text>
        )}
        {question.type === 'choice' && (
          <Text style={styles.questionText}>{question.question}</Text>
        )}

        {/* Answers grid */}
        <View style={styles.answersGrid}>
          {question.options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.answerBtn,
                selected === opt && styles.answerBtnSelected,
              ]}
              onPress={() => setSelected(opt)}
              activeOpacity={0.75}
            >
              <Text style={[styles.answerText, selected === opt && styles.answerTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Finish button */}
        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          disabled={!selected}
          onPress={() => {
            if (isLast) onFinish(selected!);
            else onNext(selected!);
            setSelected(null);
          }}
        >
          <Text style={styles.nextBtnText}>
            {isLast
              ? t('teacher.exam.finish', 'Finish') + ' 🐧'
              : t('teacher.exam.nextQuestion', 'Next Question')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────
function ExamTimer() {
  const [seconds, setSeconds] = useState(16);
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return (
    <View style={styles.timerBadge}>
      <Text style={styles.timerText}>
        00:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

// ─── Score Modal ──────────────────────────────────────────────
function ScoreModal({ visible, score, total, onClose, t }: { visible: boolean; score: number; total: number; onClose: () => void; t: any }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>✅</Text>
          <Text style={styles.modalTitle}>{t('teacher.exam.greatJob', 'Great Job!')}</Text>
          <Text style={styles.modalSubtitle}>{t('teacher.exam.wellDone', 'You did a great job, well done!')}</Text>
          <Text style={styles.modalScore}>Score: {score}/{total}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('teacher.exam.okay', 'Okay')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function MonthlyExamScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [phase, setPhase] = useState<'info' | 'quiz' | 'done'>('info');
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleStart = () => {
    setQIndex(0);
    setScore(0);
    setShowScore(false);
    setPhase('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (answer === QUESTIONS[qIndex].correct) setScore((s) => s + 1);
    setQIndex((i) => i + 1);
  };

  const handleFinish = (answer: string) => {
    if (answer === QUESTIONS[qIndex].correct) setScore((s) => s + 1);
    setShowScore(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('teacher.exam.monthlyExam', 'Monthly Exam')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {phase === 'info' && (
        <ExamInfoScreen onStart={handleStart} isRTL={isRTL} t={t} />
      )}

      {phase === 'quiz' && (
        <QuestionScreen
          question={QUESTIONS[qIndex]}
          qIndex={qIndex}
          total={QUESTIONS.length}
          onNext={handleAnswer}
          onFinish={handleFinish}
          isRTL={isRTL}
          t={t}
        />
      )}

      <ScoreModal
        visible={showScore}
        score={score}
        total={QUESTIONS.length}
        onClose={() => { setShowScore(false); router.back(); }}
        t={t}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  backIcon: { fontSize: 18, color: '#508DF7' },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  // Exam info
  examCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  examCardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  examDetails: { flex: 1 },
  examDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  examDetailLabel: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#9CA3AF' },
  examDetailValue: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  examRight: { alignItems: 'center', gap: 10, marginLeft: 16 },
  levelBadge: { backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  levelBadgeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: '#7C3AED' },
  examCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#508DF7' },
  examCircleText: { fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#508DF7' },

  startBtn: { backgroundColor: '#508DF7', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 10, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  startBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE9FE', borderRadius: 16, padding: 14, marginBottom: 20, gap: 8 },
  downloadIcon: { fontSize: 18, color: '#7C3AED' },
  downloadText: { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#7C3AED' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e', marginBottom: 10 },
  activityCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  activityBadgeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 12 },
  activityLabel: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#374151', flex: 1 },
  activityScore: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#508DF7' },

  // Question screen
  questionScreen: { flex: 1 },
  questionHeader: { backgroundColor: '#EEF4FF', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  questionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e' },
  questionSubtitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#508DF7', marginTop: 4 },
  timerBadge: { marginTop: 10, backgroundColor: '#508DF7', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99 },
  timerText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },

  questionCard: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  questionText: { fontFamily: 'Lexend_600SemiBold', fontSize: 16, color: '#1a1a2e', textAlign: 'center', lineHeight: 26, marginBottom: 16 },
  visualEmoji: { fontSize: 36, textAlign: 'center', letterSpacing: 4, marginBottom: 20 },

  answersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  answerBtn: { width: '44%', paddingVertical: 20, borderRadius: 16, backgroundColor: '#F5F7FF', alignItems: 'center', borderWidth: 2, borderColor: '#E8EEFF' },
  answerBtnSelected: { borderColor: '#508DF7', backgroundColor: '#EEF4FF' },
  answerText: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#374151' },
  answerTextSelected: { color: '#508DF7' },

  nextBtn: { backgroundColor: '#508DF7', borderRadius: 14, padding: 15, alignItems: 'center', shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  nextBtnDisabled: { backgroundColor: '#93C5FD' },
  nextBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#fff' },

  // Score modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', width: 300, gap: 8 },
  modalIcon: { fontSize: 48, marginBottom: 4 },
  modalTitle: { fontFamily: 'Lexend_700Bold', fontSize: 22, color: '#1a1a2e' },
  modalSubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center' },
  modalScore: { fontFamily: 'Lexend_700Bold', fontSize: 18, color: '#508DF7', marginTop: 8 },
  modalBtn: { marginTop: 12, backgroundColor: '#508DF7', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  modalBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
});
