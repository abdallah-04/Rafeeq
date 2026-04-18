import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TEACHER_STUDENTS_MAP } from './_students';
import AnimatedProgressCircle from '@/components/AnimatedProgressCircle';
import BackButton from '@/components/BackButton';

const RECENT_NOTES = [
  { id: '1', author: 'Ayoub Parent', authorAr: 'والد أيوب', time: 'Today', timeAr: 'اليوم', text: 'Reviewed last Exam. Please focus more on new TASKS!', avatarBg: '#FFD9B3', initials: 'AP' },
  { id: '2', author: 'Mr. Ahmad',    authorAr: 'الأستاذ أحمد', time: 'Today', timeAr: 'اليوم', text: 'Modify done. Please review the IEP', avatarBg: '#BBDEFB', initials: 'MA' },
];


export default function TeacherStudentDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';
  const student = TEACHER_STUDENTS_MAP[studentId ?? '1'] ?? TEACHER_STUDENTS_MAP['1'];

  const ACTION_BUTTONS = [
    { id: 'notes',   label: t('teacher.dashboard.notes', 'Notes'),       labelAr: 'ملاحظات', icon: '📝', color: '#FFB84C', bg: '#FFF8ED', route: '/(teacher)/notes' },
    { id: 'hw',      label: t('teacher.dashboard.addHW', 'Add H.W'),     labelAr: 'واجب',    icon: '📚', color: '#508DF7', bg: '#EEF4FF', route: '/(teacher)/homework' },
    { id: 'reports', label: t('teacher.dashboard.reports', 'Add Reports'),labelAr: 'تقارير', icon: '📋', color: '#BA6DE9', bg: '#F5EEFF', route: '/(teacher)/reports' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.navTitle}>{isRTL ? student.nameAr : student.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.actionsRow, isRTL && styles.rowReverse]}>
          {ACTION_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={[styles.actionBtn, { backgroundColor: btn.bg }]}
              onPress={() => router.push({ pathname: btn.route as any, params: { studentId } })}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>{btn.icon}</Text>
              <Text style={[styles.actionLabel, { color: btn.color }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.progressCard}>
          <View style={[styles.progressCardInner, isRTL && styles.rowReverse]}>
            {/* Avatar + name + tags */}
            <View style={styles.progressLeft}>
              <View style={[styles.avatar, { backgroundColor: student.avatarBg }]}>
                <Text style={styles.avatarText}>{student.initials}</Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressName}>
                  {isRTL ? student.nameAr : student.name} — {t('teacher.dashboard.progressOf', 'Progress')}
                </Text>
                <View style={styles.tagsRow}>
                  <View style={styles.tagBlue}><Text style={styles.tagBlueText}>Age {student.age}</Text></View>
                  <View style={styles.tagOrange}><Text style={styles.tagOrangeText}>{student.condition}</Text></View>
                  <View style={styles.tagPurple}><Text style={styles.tagPurpleText}>{student.level}</Text></View>
                </View>
              </View>
            </View>
            <AnimatedProgressCircle progress={student.progress} size={88} color="#508DF7" />
          </View>

          <View style={[styles.statsRow, isRTL && styles.rowReverse]}>
            {[
              { icon: '✅', value: '8', label: t('teacher.dashboard.tasks', 'Task') },
              { icon: '📅', value: '14', label: t('teacher.dashboard.daysRow', 'Days in Row') },
              { icon: '⭐', value: '3',  label: t('teacher.dashboard.achievements', 'Achievement') },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value} {stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {t('teacher.dashboard.recentNotes', 'Recent Notes')}
        </Text>

        {RECENT_NOTES.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={[styles.noteHeader, isRTL && styles.rowReverse]}>
              <View style={[styles.noteAvatar, { backgroundColor: note.avatarBg }]}>
                <Text style={styles.noteAvatarText}>{note.initials}</Text>
              </View>
              <View style={styles.noteAuthorBlock}>
                <Text style={[styles.noteAuthor, isRTL && styles.textRight]}>{isRTL ? note.authorAr : note.author}</Text>
                <Text style={[styles.noteTime, isRTL && styles.textRight]}>{isRTL ? note.timeAr : note.time}</Text>
              </View>
            </View>
            <Text style={[styles.noteText, isRTL && styles.textRight]}>{note.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  scrollContent: { paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },

  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontFamily: 'Lexend_600SemiBold', fontSize: 11, textAlign: 'center' },

  progressCard: { marginHorizontal: 16, backgroundColor: '#EEF4FF', borderRadius: 24, padding: 16, marginBottom: 20, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  progressCardInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(80,141,247,0.15)' },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 14, color: '#1a1a2e' },
  progressInfo: { flex: 1 },
  progressName: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e', marginBottom: 5 },
  tagsRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  tagBlue:   { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagOrange: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagPurple: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tagBlueText:   { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#1D4ED8' },
  tagOrangeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#D97706' },
  tagPurpleText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#7C3AED' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(80,141,247,0.12)', paddingTop: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statIcon: { fontSize: 14 },
  statValue: { fontFamily: 'Lexend_500Medium', fontSize: 11, color: '#374151' },

  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#1a1a2e', paddingHorizontal: 20, marginBottom: 10 },

  noteCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  noteAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  noteAvatarText: { fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: '#1a1a2e' },
  noteAuthorBlock: { flex: 1 },
  noteAuthor: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  noteTime: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },
  noteText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#374151', lineHeight: 20 },
});