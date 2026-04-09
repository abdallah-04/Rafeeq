import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TEACHER_STUDENTS_MAP } from './_students';
import { NotesFeedSkeleton } from '@/components/LoadingSkeleton';
import AnimatedProgressCircle from '@/components/AnimatedProgressCircle';
import BackButton from '@/components/BackButton';

const PARENT_NOTES = [
  { id: '1', author: 'Ayoub Parent', authorAr: 'والد أيوب', date: 'Today', text: 'Reviewed last Exam. Please focus more on new TASKS!', avatarBg: '#FFD9B3', initials: 'AP' },
  { id: '2', author: 'Ayoub Parent', authorAr: 'والد أيوب', date: '18/10', text: 'Ayoub had a great week! He completed all his activities.', avatarBg: '#FFD9B3', initials: 'AP' },
];

const TEACHER_NOTES = [
  { id: '3', author: 'Mr. Ahmad', authorAr: 'الأستاذ أحمد', date: 'Today', text: 'Modify done. Please review the IEP', avatarBg: '#BBDEFB', initials: 'MA' },
  { id: '4', author: 'Mr. Ahmad', authorAr: 'الأستاذ أحمد', date: '17/10', text: 'Student showed improvement in reading tasks this week.', avatarBg: '#BBDEFB', initials: 'MA' },
];

function NoteItem({ note, isRTL }: { note: typeof PARENT_NOTES[0]; isRTL: boolean }) {
  return (
    <View style={styles.noteCard}>
      <View style={[styles.noteHeader, isRTL && styles.rowReverse]}>
        <View style={[styles.avatar, { backgroundColor: note.avatarBg }]}>
          <Text style={styles.avatarText}>{note.initials}</Text>
        </View>
        <View style={styles.noteAuthorBlock}>
          <Text style={[styles.noteAuthor, isRTL && styles.textRight]}>{note.author}</Text>
          <Text style={[styles.noteDate, isRTL && styles.textRight]}>{note.date}</Text>
        </View>
      </View>
      <Text style={[styles.noteText, isRTL && styles.textRight]}>{note.text}</Text>
    </View>
  );
}

export default function NotesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const student = TEACHER_STUDENTS_MAP[studentId ?? '1'] ?? TEACHER_STUDENTS_MAP['1'];
  const [activeTab, setActiveTab] = useState<'teacher' | 'parent'>('teacher');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <NotesFeedSkeleton count={4} />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Orange header */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isRTL && styles.rowReverse]}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t('teacher.notes.title', 'Notes')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: '/(teacher)/add-note', params: { studentId } })}
          >
            <Text style={styles.addBtnText}>+ {t('teacher.notes.add', 'Add')}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress circle in header */}
        <AnimatedProgressCircle progress={student.progress} size={64} color="#FFB84C" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['teacher', 'parent'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'teacher'
                ? t('teacher.notes.teacherFeed', "Teacher's Feed")
                : t('teacher.notes.parentNotes', 'Parent Notes')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'teacher'
          ? TEACHER_NOTES.map((n) => <NoteItem key={n.id} note={n} isRTL={isRTL} />)
          : PARENT_NOTES.map((n)  => <NoteItem key={n.id} note={n} isRTL={isRTL} />)
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  header: { backgroundColor: '#FFB84C', paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#fff' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  addBtnText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#fff' },
  progressCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 5, borderColor: '#FFB84C' },
  progressCircleText: { fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#FFB84C' },

  tabs: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFB84C' },
  tabText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#fff', fontFamily: 'Lexend_700Bold' },

  noteCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteAuthorBlock: { flex: 1 },
  noteAuthor: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteDate: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },
  noteText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#374151', lineHeight: 20 },
});
