import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

// ─── Mock Data ────────────────────────────────────────────────
const STUDENTS: Record<string, {
  id: string; name: string; nameAr: string;
  age: number; condition: string; level: string;
  progress: number; avatarBg: string; initials: string;
  teacher: string; grade: string; school: string;
}> = {
  '1': { id: '1', name: 'Ayoub Maher',  nameAr: 'أيوب ماهر',  age: 8, condition: 'ADD',  level: 'Level 3', progress: 65, avatarBg: '#FFD9B3', initials: 'AM', teacher: 'Mr. Ahmad', grade: 'Grade 4-A', school: 'Al Noor School' },
  '2': { id: '2', name: 'Mona Ramzi',   nameAr: 'منى رمزي',   age: 9, condition: 'ADHD', level: 'Level 5', progress: 72, avatarBg: '#C8E6C9', initials: 'MR', teacher: 'Ms. Tala',  grade: 'Grade 3-B', school: 'Al Noor School' },
  '3': { id: '3', name: 'Nagham Marq',  nameAr: 'نغم مارق',   age: 7, condition: 'IFD',  level: 'Level 1', progress: 48, avatarBg: '#BBDEFB', initials: 'NM', teacher: 'Mr. Ahmad', grade: 'Grade 2-A', school: 'Al Noor School' },
};

// ─── Tab content data ─────────────────────────────────────────
const GRADES = [
  { subject: 'Arabic',  score: 92, color: '#508DF7' },
  { subject: 'Math',    score: 88, color: '#FFB84C' },
  { subject: 'Science', score: 79, color: '#BA6DE9' },
  { subject: 'English', score: 84, color: '#22C55E' },
  { subject: 'Art',     score: 55, color: '#FF6B6B' },
  { subject: 'PE',      score: 97, color: '#06B6D4' },
];

const HW_TASKS = [
  { id: '1', title: 'Reading Homework – Lesson 7', subject: 'Arabic language',  due: 'Tomorrow', status: 'pending',  statusColor: '#FFB84C' },
  { id: '2', title: 'Math Worksheet – Chapter 4',  subject: 'Mathematics',      due: 'Today',    status: 'done',     statusColor: '#22C55E' },
  { id: '3', title: 'Science Quiz Prep',            subject: 'Science',          due: 'Oct 28',   status: 'pending',  statusColor: '#FFB84C' },
];

const PROGRESS_SUBJECTS = [
  { subject: 'Arabic',  percent: 79, color: '#508DF7' },
  { subject: 'Math',    percent: 59, color: '#FFB84C' },
  { subject: 'Science', percent: 85, color: '#BA6DE9' },
];

const REPORTS = [
  { id: '1', author: 'Ms. Sara Mahmoud – Math', text: 'Zaid did well on the term test overall, but we notice difficulty with fractions. Extra practice this week is advised.', time: 'Today, 8:30 AM', read: false },
  { id: '2', author: 'Ms. Sara Mahmoud – Math', text: 'Zaid did well on the term test overall, but we notice difficulty with fractions. Extra practice this week is advised.', time: 'Today, 8:30 AM', read: false },
  { id: '3', author: 'Ms. Sara Mahmoud – Math', text: 'Zaid did well on the term test overall, but we notice difficulty with fractions. Extra practice this week is advised.', time: 'Today, 8:30 AM', read: true },
];

// ─── Tab Components ───────────────────────────────────────────
function GradesTab({ isRTL }: { isRTL: boolean }) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>
        Current Term Grades
      </Text>
      <View style={tabStyles.gradesGrid}>
        {GRADES.map((g) => {
          const scoreColor =
            g.score >= 90 ? '#22C55E' :
            g.score >= 70 ? '#508DF7' :
            g.score >= 50 ? '#FFB84C' : '#FF6B6B';
          return (
            <View key={g.subject} style={tabStyles.gradeCard}>
              <Text style={tabStyles.gradeSubject}>{g.subject}</Text>
              <Text style={[tabStyles.gradeScore, { color: scoreColor }]}>
                {g.score}
              </Text>
              <Text style={tabStyles.gradeOutOf}>/100</Text>
            </View>
          );
        })}
      </View>

      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight, { marginTop: 20 }]}>
        Coming Up This Week
      </Text>
      {HW_TASKS.slice(0, 2).map((hw) => (
        <View key={hw.id} style={tabStyles.hwCard}>
          <View style={tabStyles.hwIcon}>
            <Text style={{ fontSize: 20 }}>📚</Text>
          </View>
          <View style={tabStyles.hwInfo}>
            <Text style={[tabStyles.hwTitle, isRTL && tabStyles.textRight]}>{hw.title}</Text>
            <Text style={[tabStyles.hwSubject, isRTL && tabStyles.textRight]}>{hw.subject}</Text>
          </View>
          <View style={[tabStyles.dueBadge, { backgroundColor: hw.statusColor + '22' }]}>
            <Text style={[tabStyles.dueText, { color: hw.statusColor }]}>{hw.due}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function HWTasksTab({ isRTL }: { isRTL: boolean }) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>
        All Homework & Tasks
      </Text>
      {HW_TASKS.map((hw) => (
        <View key={hw.id} style={tabStyles.hwCard}>
          <View style={tabStyles.hwIcon}>
            <Text style={{ fontSize: 20 }}>📖</Text>
          </View>
          <View style={tabStyles.hwInfo}>
            <Text style={[tabStyles.hwTitle, isRTL && tabStyles.textRight]}>{hw.title}</Text>
            <Text style={[tabStyles.hwSubject, isRTL && tabStyles.textRight]}>{hw.subject}</Text>
          </View>
          <View style={[tabStyles.dueBadge, { backgroundColor: hw.statusColor + '22' }]}>
            <Text style={[tabStyles.dueText, { color: hw.statusColor }]}>{hw.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function ProgressTab({ student, isRTL }: { student: typeof STUDENTS['1']; isRTL: boolean }) {
  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      {/* Overall progress card */}
      <View style={tabStyles.overallCard}>
        <Text style={tabStyles.overallTitle}>Overall progress</Text>
        <Text style={tabStyles.overallSub}>Second semester</Text>
        <View style={[tabStyles.overallRow, isRTL && tabStyles.rowReverse]}>
          <View style={tabStyles.overallTrack}>
            <View style={[tabStyles.overallFill, { width: `${student.progress}%` }]} />
          </View>
          <Text style={tabStyles.overallPct}>{student.progress}%</Text>
        </View>
      </View>

      {/* Subject bars */}
      <View style={tabStyles.subjectCard}>
        <Text style={{ fontSize: 16, marginBottom: 14 }}>✏️</Text>
        {PROGRESS_SUBJECTS.map((s) => (
          <View key={s.subject} style={tabStyles.subjectRow}>
            <Text style={[tabStyles.subjectName, isRTL && tabStyles.textRight]}>{s.subject}</Text>
            <View style={tabStyles.subjectTrack}>
              <View style={[tabStyles.subjectFill, { width: `${s.percent}%`, backgroundColor: s.color }]} />
            </View>
            <Text style={[tabStyles.subjectPct, { color: s.color }]}>{s.percent}%</Text>
          </View>
        ))}
      </View>

      {/* Teacher note */}
      <View style={tabStyles.noteCard}>
        <Text style={{ fontSize: 20, marginBottom: 8 }}>💬</Text>
        <Text style={[tabStyles.noteTitle, isRTL && tabStyles.textRight]}>Note – Last Week</Text>
        <Text style={[tabStyles.noteText, isRTL && tabStyles.textRight]}>
          {student.name} needs extra support in Math, especially fractions. A short daily review is highly recommended.
        </Text>
        <Text style={[tabStyles.noteAuthor, isRTL && tabStyles.textRight]}>
          Ms. Sara Mahmoud · Mar 20
        </Text>
      </View>
    </ScrollView>
  );
}

function ReportsTab({ isRTL }: { isRTL: boolean }) {
  const [filter, setFilter] = useState<'unread' | 'read'>('unread');
  const filtered = REPORTS.filter((r) => filter === 'unread' ? !r.read : r.read);

  return (
    <ScrollView contentContainerStyle={tabStyles.content} showsVerticalScrollIndicator={false}>
      {/* Unread / Read toggle */}
      <View style={tabStyles.toggle}>
        {(['unread', 'read'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[tabStyles.toggleBtn, filter === f && tabStyles.toggleBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[tabStyles.toggleText, filter === f && tabStyles.toggleTextActive]}>
              {f === 'unread' ? `Unread(${REPORTS.filter(r => !r.read).length})` : 'Read'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length > 0 && (
        <Text style={[tabStyles.sectionTitle, isRTL && tabStyles.textRight]}>New</Text>
      )}

      {filtered.map((r) => (
        <View key={r.id} style={tabStyles.reportCard}>
          <View style={[tabStyles.reportRow, isRTL && tabStyles.rowReverse]}>
            <View style={tabStyles.reportAvatar}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={tabStyles.reportInfo}>
              <Text style={[tabStyles.reportAuthor, isRTL && tabStyles.textRight]}>{r.author}</Text>
              <Text style={[tabStyles.reportText, isRTL && tabStyles.textRight]}>{r.text}</Text>
              <Text style={[tabStyles.reportTime, isRTL && tabStyles.textRight]}>{r.time}</Text>
            </View>
          </View>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={tabStyles.emptyState}>
          <Text style={tabStyles.emptyIcon}>📭</Text>
          <Text style={tabStyles.emptyText}>No {filter} reports</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
type Tab = 'grades' | 'hw' | 'progress' | 'reports';

export default function SchoolStudentDetailScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isRTL = i18n.language === 'ar';

  const student = STUDENTS[id ?? '1'] ?? STUDENTS['1'];
  const [activeTab, setActiveTab] = useState<Tab>('grades');

  const TABS: { key: Tab; label: string; labelAr: string }[] = [
    { key: 'grades',   label: 'Grades',     labelAr: 'الدرجات' },
    { key: 'hw',       label: 'HW & Tasks', labelAr: 'الواجبات' },
    { key: 'progress', label: 'Progress',   labelAr: 'التقدم' },
    { key: 'reports',  label: 'Reports',    labelAr: 'التقارير' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Nav Bar ── */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{student.name}</Text>
          <Text style={styles.navSub}>{student.grade}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      {/* ── Student Header Card ── */}
      <View style={styles.headerCard}>
        <View style={[styles.headerInner, isRTL && styles.rowReverse]}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: student.avatarBg }]}>
            <Text style={styles.avatarText}>{student.initials}</Text>
          </View>

          {/* Info */}
          <View style={styles.headerInfo}>
            <Text style={[styles.studentName, isRTL && styles.textRight]}>
              {student.name}
            </Text>
            {/* Progress bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${student.progress}%` }]} />
              </View>
              <Text style={styles.progressPct}>{student.progress}%</Text>
            </View>
            {/* Tags */}
            <View style={[styles.tagsRow, isRTL && styles.rowReverse]}>
              <View style={styles.tagOrange}>
                <Text style={styles.tagOrangeText}>{student.condition}</Text>
              </View>
              <View style={styles.tagBlue}>
                <Text style={styles.tagBlueText}>{student.age} Years</Text>
              </View>
              <View style={styles.tagPurple}>
                <Text style={styles.tagPurpleText}>{student.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Teacher + school row */}
        <View style={[styles.metaRow, isRTL && styles.rowReverse]}>
          <Text style={styles.metaText}>👨‍🏫 {student.teacher}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>🏫 {student.school}</Text>
        </View>
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {isRTL ? tab.labelAr : tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Tab Content ── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'grades'   && <GradesTab isRTL={isRTL} />}
        {activeTab === 'hw'       && <HWTasksTab isRTL={isRTL} />}
        {activeTab === 'progress' && <ProgressTab student={student} isRTL={isRTL} />}
        {activeTab === 'reports'  && <ReportsTab isRTL={isRTL} />}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  // Nav
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  backIcon: { fontSize: 18, color: '#508DF7' },
  navCenter: { alignItems: 'center' },
  navTitle: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e' },
  navSub: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  bellIcon: { fontSize: 18 },
  bellBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B', borderWidth: 1.5, borderColor: '#fff' },

  // Header card
  headerCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#508DF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, marginBottom: 12 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(80,141,247,0.15)', flexShrink: 0 },
  avatarText: { fontFamily: 'Lexend_700Bold', fontSize: 20, color: '#1a1a2e' },
  headerInfo: { flex: 1 },
  studentName: { fontFamily: 'Lexend_700Bold', fontSize: 17, color: '#1a1a2e', marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  progressTrack: { flex: 1, height: 7, backgroundColor: '#EEF2FF', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#508DF7', borderRadius: 99 },
  progressPct: { fontFamily: 'Lexend_700Bold', fontSize: 12, color: '#508DF7', minWidth: 32, textAlign: 'right' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagOrange: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagOrangeText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#D97706' },
  tagBlue: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagBlueText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#1D4ED8' },
  tagPurple: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagPurpleText: { fontFamily: 'Lexend_600SemiBold', fontSize: 10, color: '#7C3AED' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 0.5, borderTopColor: '#F0F0F0', paddingTop: 10 },
  metaText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#6B7280' },
  metaDot: { color: '#D1D5DB', fontSize: 12 },

  // Tab bar
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E8EEFF' },
  tabBarContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
  tabBtnActive: { backgroundColor: '#508DF7' },
  tabText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#fff', fontFamily: 'Lexend_700Bold' },
});

// Tab inner styles
const tabStyles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#1a1a2e', marginBottom: 12 },

  // Grades grid
  gradesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gradeCard: { width: '30%', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  gradeSubject: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  gradeScore: { fontFamily: 'Lexend_700Bold', fontSize: 22 },
  gradeOutOf: { fontFamily: 'Lexend_400Regular', fontSize: 10, color: '#D1D5DB' },

  // HW card
  hwCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  hwIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  hwInfo: { flex: 1 },
  hwTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e' },
  hwSubject: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  dueBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  dueText: { fontFamily: 'Lexend_600SemiBold', fontSize: 11 },

  // Progress tab
  overallCard: { backgroundColor: '#508DF7', borderRadius: 20, padding: 18, marginBottom: 14 },
  overallTitle: { fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#fff', marginBottom: 2 },
  overallSub: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overallTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, overflow: 'hidden' },
  overallFill: { height: '100%', backgroundColor: '#FFB84C', borderRadius: 99 },
  overallPct: { fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#FFB84C' },
  subjectCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  subjectRow: { marginBottom: 12 },
  subjectName: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#374151', marginBottom: 5 },
  subjectTrack: { height: 7, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 2 },
  subjectFill: { height: '100%', borderRadius: 99 },
  subjectPct: { fontFamily: 'Lexend_700Bold', fontSize: 12, textAlign: 'right' },
  noteCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noteTitle: { fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: '#1a1a2e', marginBottom: 6 },
  noteText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  noteAuthor: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },

  // Reports tab
  toggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: { backgroundColor: '#508DF7' },
  toggleText: { fontFamily: 'Lexend_500Medium', fontSize: 13, color: '#9CA3AF' },
  toggleTextActive: { color: '#fff', fontFamily: 'Lexend_700Bold' },
  reportCard: { backgroundColor: '#EEF4FF', borderRadius: 16, padding: 14, marginBottom: 10 },
  reportRow: { flexDirection: 'row', gap: 12 },
  reportAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reportInfo: { flex: 1 },
  reportAuthor: { fontFamily: 'Lexend_600SemiBold', fontSize: 13, color: '#1a1a2e', marginBottom: 4 },
  reportText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: '#374151', lineHeight: 18, marginBottom: 4 },
  reportTime: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontFamily: 'Lexend_500Medium', fontSize: 14, color: '#9CA3AF' },
});
