import React from 'react';
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
import { TEACHER_STUDENTS_MAP } from './_students';

// ─── Quick Access items ───────────────────────────────────────
const QUICK_ACCESS = [
  { id: 'roadmap',  labelKey: 'teacher.quickAccess.roadmap',  label: 'Road Map',      icon: '🗺️',  color: '#508DF7', bg: '#EEF4FF', route: '/(teacher)/road-map' },
  { id: 'exam',     labelKey: 'teacher.quickAccess.exam',     label: 'Monthly Exam',  icon: '📝',  color: '#BA6DE9', bg: '#F5EEFF', route: '/(teacher)/monthly-exam' },
  { id: 'reports',  labelKey: 'teacher.quickAccess.reports',  label: 'Reports',       icon: '📊',  color: '#9C6ADE', bg: '#F5EEFF', route: '/(teacher)/reports' },
  { id: 'dashboard',labelKey: 'teacher.quickAccess.dashboard',label: 'Dashboard',     icon: '📋',  color: '#22C55E', bg: '#EDFAF3', route: '/(teacher)/Student_dashboard' },
];

export default function StudentQuickAccessScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const isRTL = i18n.language === 'ar';

  const student = TEACHER_STUDENTS_MAP[studentId ?? '1'] ?? TEACHER_STUDENTS_MAP['1'];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {t('teacher.quickAccess.title', 'Student Profile')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Student Profile Header Card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: student.avatarBg }]}>
            <Text style={styles.avatarText}>{student.initials}</Text>
          </View>

          {/* Name */}
          <Text style={styles.studentName}>{student.name}</Text>

          {/* Info pills row */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{student.condition}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{student.age} {t('teacher.quickAccess.years', 'Years')}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{student.level}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {t('teacher.quickAccess.progress', 'Progress')}
              </Text>
              <Text style={styles.progressValue}>{student.progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${student.progress}%` }]} />
            </View>
          </View>
        </View>

        {/* ── Quick Access Grid ── */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t('teacher.quickAccess.quickAccess', 'Quick Access')}
        </Text>

        <View style={styles.grid}>
          {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.gridItem, { backgroundColor: item.bg }]}
              onPress={() =>
                router.push({
                  pathname: item.route as any,
                  params: { studentId: student.id },
                })
              }
              activeOpacity={0.75}
            >
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={[styles.gridLabel, { color: item.color }]}>
                {t(item.labelKey, item.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Nav
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F5F7FF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backIcon: {
    fontSize: 18,
    color: '#508DF7',
  },
  navTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: '#1a1a2e',
  },

  // Profile card
  profileCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(80,141,247,0.15)',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: '#1a1a2e',
  },
  studentName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#1a1a2e',
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  pillText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#508DF7',
  },
  progressBlock: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#6b7280',
  },
  progressValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#508DF7',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#508DF7',
    borderRadius: 99,
  },

  // Section label
  sectionLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#1a1a2e',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  textRight: {
    textAlign: 'right',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIcon: {
    fontSize: 32,
  },
  gridLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
});