import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

// ─── Road map days ─────────────────────────────────────────────
const DAYS = [
  { day: 1, status: 'done',    label: 'Day 1', labelAr: 'اليوم 1' },
  { day: 2, status: 'done',    label: 'Day 2', labelAr: 'اليوم 2' },
  { day: 3, status: 'done',    label: 'Day 3', labelAr: 'اليوم 3' },
  { day: 4, status: 'current', label: 'Day 4', labelAr: 'اليوم 4' },
  { day: 5, status: 'pending', label: 'Day 5', labelAr: 'اليوم 5' },
  { day: 6, status: 'pending', label: 'Day 6', labelAr: 'اليوم 6' },
  { day: 7, status: 'crown',   label: 'Day 7', labelAr: 'اليوم 7' },
];

// ─── Day Work Modals config ────────────────────────────────────
const DAY_MODALS: Record<number, { title: string; content: string; cta: string; type: string }> = {
  4: { title: "What to do today",  content: "Complete Task 6 and review H.W 4",       cta: "Let's go!", type: 'info' },
  5: { title: "Day 5 Work",        content: "Task 7 & H.W 5 are ready for today",     cta: "Okay",      type: 'info' },
  6: { title: "Day 6 Work",        content: "Quiz 3 & H.W 5 — finish before end of day", cta: "Okay",   type: 'quiz' },
  7: { title: "Day 7 Work",        content: "Final Exam 1 is scheduled for today 🎓", cta: "Okay",      type: 'exam' },
};

function DayNode({ day, onPress }: { day: typeof DAYS[0]; onPress: () => void }) {
  const isDone    = day.status === 'done';
  const isCurrent = day.status === 'current';
  const isCrown   = day.status === 'crown';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.dayNodeWrap}>
      <View
        style={[
          styles.dayNode,
          isDone    && styles.dayNodeDone,
          isCurrent && styles.dayNodeCurrent,
          isCrown   && styles.dayNodeCrown,
          !isDone && !isCurrent && !isCrown && styles.dayNodePending,
        ]}
      >
        {isDone    && <Text style={styles.dayNodeIcon}>✓</Text>}
        {isCurrent && <Text style={styles.dayNodeIcon}>📖</Text>}
        {isCrown   && <Text style={styles.dayNodeIcon}>👑</Text>}
        {day.status === 'pending' && <Text style={styles.dayNodeNumber}>{day.day}</Text>}
      </View>
      <Text style={styles.dayLabel}>{day.label}</Text>
    </TouchableOpacity>
  );
}

function DayModal({ visible, day, onClose, t }: { visible: boolean; day: number | null; onClose: () => void; t: any }) {
  const config = day ? DAY_MODALS[day] : null;
  if (!config) return null;

  const iconMap: Record<string, string> = { info: '📋', quiz: '📝', exam: '🎓' };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>{iconMap[config.type]}</Text>
          <Text style={styles.modalTitle}>{config.title}</Text>
          <Text style={styles.modalContent}>{config.content}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{config.cta}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Today Quiz Modal ─────────────────────────────────────────
function TodayQuizModal({ visible, onClose, t }: { visible: boolean; onClose: () => void; t: any }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>📝</Text>
          <Text style={styles.modalTitle}>{t('teacher.quiz.todayQuiz', 'Today Quiz')}</Text>
          <Text style={styles.quizMeta}>3 {t('teacher.quiz.questions', 'Questions')}</Text>
          <Text style={styles.quizMeta}>Quiz 2</Text>
          <Text style={styles.quizMeta}>10 {t('teacher.quiz.mins', 'mins')}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('teacher.quiz.start', 'Start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Great Job Modal ──────────────────────────────────────────
function GreatJobModal({ visible, onClose, t }: { visible: boolean; onClose: () => void; t: any }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={{ fontSize: 52 }}>✅</Text>
          <Text style={styles.modalTitle}>{t('teacher.modal.greatJob', 'Great Job')}</Text>
          <Text style={styles.modalContent}>{t('teacher.modal.wellDone', 'You did a great job, well done!')}</Text>
          <Text style={styles.quizMeta}>Task 1 & H.W 2</Text>
          <Text style={styles.quizMeta}>21/10/2026</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('teacher.modal.okay', 'Okay')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function TeacherRoadMapScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const [dayModal, setDayModal] = useState<number | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showGreatJob, setShowGreatJob] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // Winding path positions (alternating left/right)
  const nodePositions = [
    screenWidth * 0.5 - 36,        // Day 1 center
    screenWidth * 0.7,             // Day 2 right
    screenWidth * 0.5 - 36,        // Day 3 center
    screenWidth * 0.25,            // Day 4 left (current)
    screenWidth * 0.5 - 36,        // Day 5 center
    screenWidth * 0.7,             // Day 6 right
    screenWidth * 0.5 - 36,        // Day 7 center
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('teacher.roadmap.title', "Ayoub's Tree")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.treeScroll} showsVerticalScrollIndicator={false}>
        {/* Winding path tree */}
        <View style={styles.treePath}>
          {DAYS.map((day, i) => (
            <View
              key={day.day}
              style={[
                styles.nodePosition,
                { top: i * 100 + 20, left: nodePositions[i] },
              ]}
            >
              <DayNode
                day={day}
                onPress={() => {
                  if (DAY_MODALS[day.day]) setDayModal(day.day);
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Day Work Modals */}
      <DayModal
        visible={dayModal !== null}
        day={dayModal}
        onClose={() => setDayModal(null)}
        t={t}
      />
      <TodayQuizModal visible={showQuizModal} onClose={() => setShowQuizModal(false)} t={t} />
      <GreatJobModal  visible={showGreatJob}  onClose={() => setShowGreatJob(false)}  t={t} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  backIcon: { fontSize: 18, color: '#508DF7' },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  treeScroll: { paddingBottom: 60, paddingHorizontal: 16 },

  treePath: { position: 'relative', height: 800 },
  nodePosition: { position: 'absolute' },

  dayNodeWrap: { alignItems: 'center', gap: 4 },
  dayNode: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  dayNodeDone:    { backgroundColor: '#22C55E' },
  dayNodeCurrent: { backgroundColor: '#508DF7', borderWidth: 4, borderColor: '#fff' },
  dayNodePending: { backgroundColor: '#E8EEFF', borderWidth: 2, borderColor: '#C8D9FB' },
  dayNodeCrown:   { backgroundColor: '#FFB84C' },
  dayNodeIcon:    { fontSize: 28 },
  dayNodeNumber:  { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#93C5FD' },
  dayLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: '#6B7280' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', width: 300, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  modalIcon: { fontSize: 48 },
  modalTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e', textAlign: 'center' },
  modalContent: { fontFamily: 'Lexend_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  quizMeta: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#374151' },
  modalBtn: { marginTop: 8, backgroundColor: '#508DF7', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  modalBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff' },
});
