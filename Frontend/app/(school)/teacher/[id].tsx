import React from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import BackButton from '@/components/BackButton'
import { colors, spacing, borderRadius } from '@/constants'
import { Text } from '@/components/modal/shared/Text'

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_TEACHERS: Record<string, {
  id: string
  name: string
  nameAr: string
  status: string
  childCount: number
  progress: number
  grade: string
  section: string
  phone: string
  nationalId: string
  joinDate: string
}> = {
  '1': {
    id: '1',
    name: 'Ahmad Sami',
    nameAr: 'أحمد سامي',
    status: 'Active',
    childCount: 3,
    progress: 62,
    grade: 'Grade 2',
    section: 'Section A',
    phone: '+962 7X XXX XXXX',
    nationalId: '98XXXXXXXX',
    joinDate: 'Sep 2024',
  },
  '2': {
    id: '2',
    name: 'Tala Kamal',
    nameAr: 'تالا كمال',
    status: 'Active',
    childCount: 3,
    progress: 62,
    grade: 'Grade 3',
    section: 'Section B',
    phone: '+962 7X XXX XXXX',
    nationalId: '97XXXXXXXX',
    joinDate: 'Oct 2024',
  },
}

const MOCK_STUDENTS = [
  { id: '1', name: 'Ayoub Maher', level: 3, difficulty: 'ADD',  progress: 62, status: 'Active' },
  { id: '2', name: 'Mona Ramzi',  level: 5, difficulty: 'ADHD', progress: 62, status: 'Active' },
  { id: '3', name: 'Nagham Marq', level: 1, difficulty: 'IFD',  progress: 48, status: 'Active' },
]

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  ADD:  { bg: '#EFF6FF', text: '#3B82F6' },
  ADHD: { bg: '#FDF4FF', text: '#A855F7' },
  IFD:  { bg: '#FFF7ED', text: '#F97316' },
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  value: string
  label: string
  color: string
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontFamily: 'Lexend-Regular',
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

// ─── Student Row ──────────────────────────────────────────────
function StudentRow({ student }: { student: typeof MOCK_STUDENTS[0] }) {
  const { t } = useTranslation()
  const diffColor = DIFFICULTY_COLORS[student.difficulty] ?? { bg: '#F3F4F6', text: '#6B7280' }

  return (
    <TouchableOpacity
      style={rowStyles.row}
      onPress={() => router.push(`/(school)/student/${student.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={student.name}
    >
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarText}>{student.name.charAt(0)}</Text>
      </View>

      <View style={rowStyles.info}>
        <View style={rowStyles.topRow}>
          <Text style={rowStyles.name} numberOfLines={1}>{student.name}</Text>
          <View style={rowStyles.activeBadge}>
            <Text style={rowStyles.activeText}>{t('common.active')}</Text>
          </View>
        </View>
        <View style={rowStyles.tagsRow}>
          <View style={rowStyles.levelBadge}>
            <Text style={rowStyles.levelText}>{t('teacher.studentCard.level', { level: student.level })}</Text>
          </View>
          <View style={[rowStyles.diffBadge, { backgroundColor: diffColor.bg }]}>
            <Text style={[rowStyles.diffText, { color: diffColor.text }]}>
              {student.difficulty}
            </Text>
          </View>
        </View>
        <View style={rowStyles.progressBg}>
          <View style={[rowStyles.progressFill, { width: `${student.progress}%` }]} />
        </View>
        <Text style={rowStyles.progressText}>{student.progress}%</Text>
      </View>
    </TouchableOpacity>
  )
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.primary,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  activeBadge: {
    backgroundColor: '#E6F9F0',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeText: {
    fontSize: 11,
    fontFamily: 'Lexend-SemiBold',
    color: '#22C55E',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 7,
    flexWrap: 'wrap',
  },
  levelBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 11,
    fontFamily: 'Lexend-SemiBold',
    color: '#3B82F6',
    fontWeight: '600',
  },
  diffBadge: {
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 11,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
  },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Lexend-SemiBold',
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 3,
  },
})

// ─── Info Row Component ────────────────────────────────────────
function InfoRow({ icon, label, value }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
}) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} style={infoStyles.icon} />
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  icon: { width: 24 },
  label: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
})

// ─── Main Screen ──────────────────────────────────────────────
export default function TeacherDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const teacher = MOCK_TEACHERS[id ?? '1'] ?? MOCK_TEACHERS['1']

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle} numberOfLines={1}>{teacher.name}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(school)/edit-teacher' as any)}>
          <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{teacher.name.charAt(0)}</Text>
          </View>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          <Text style={styles.teacherNameAr}>{teacher.nameAr}</Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{teacher.status}</Text>
          </View>

          <View style={styles.classRow}>
            <View style={styles.classBadge}>
              <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.classBadgeText}>{teacher.grade}</Text>
            </View>
            <View style={styles.classBadge}>
              <Ionicons name="book-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.classBadgeText}>{teacher.section}</Text>
            </View>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <StatCard
            icon="people-outline"
            value={String(teacher.childCount)}
            label={t('teacherDetail.students')}
            color={colors.primary}
          />
          <StatCard
            icon="trending-up-outline"
            value={`${teacher.progress}%`}
            label={t('teacherDetail.avgProgress')}
            color="#22C55E"
          />
          <StatCard
            icon="calendar-outline"
            value={teacher.joinDate}
            label={t('teacherDetail.joined')}
            color="#FFB84C"
          />
        </View>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <InfoRow icon="call-outline" label={t('teacherDetail.phone')} value={teacher.phone} />
          <InfoRow icon="card-outline" label={t('teacherDetail.nationalId')} value={teacher.nationalId} />
          <InfoRow icon="business-outline" label={t('teacherDetail.grade')} value={teacher.grade} />
          <InfoRow icon="book-outline" label={t('teacherDetail.section')} value={teacher.section} />
        </View>

        {/* Students section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('teacherDetail.students')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/(school)/add-student')}
            style={styles.addStudentBtn}
          >
            <Ionicons name="add" size={16} color={colors.white} />
            <Text style={styles.addStudentText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_STUDENTS.map((student) => (
          <StudentRow key={student.id} student={student} />
        ))}

        {/* Danger zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{t('teacherDetail.dangerZone')}</Text>
          <TouchableOpacity style={styles.deactivateBtn}>
            <Text style={styles.deactivateText}>{t('teacherDetail.deactivate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn}>
            <Text style={styles.removeText}>{t('teacherDetail.remove')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  // Profile card
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.primary + '33',
  },
  avatarText: {
    fontSize: 30,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.primary,
  },
  teacherName: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teacherNameAr: {
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
    marginTop: spacing.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Lexend-SemiBold',
    color: '#22C55E',
    fontWeight: '600',
  },
  classRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classBadgeText: {
    fontSize: 12,
    fontFamily: 'Lexend-SemiBold',
    color: colors.textPrimary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Students section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  addStudentText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },

  // Danger zone
  dangerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: spacing.sm,
  },
  dangerTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  deactivateBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactivateText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
  },
  removeBtn: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
})