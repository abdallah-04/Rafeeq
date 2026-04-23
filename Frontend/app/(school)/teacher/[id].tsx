import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import BackButton from '@/components/BackButton'
import { colors, spacing, borderRadius } from '@/constants'
import { apiGetTeacher, apiGetStudents, TeacherResponse, StudentResponse } from '@/services/api'

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  ADD:   { bg: '#EFF6FF', text: '#3B82F6' },
  ADHD:  { bg: '#FDF4FF', text: '#A855F7' },
  IFD:   { bg: '#FFF7ED', text: '#F97316' },
  ASD:   { bg: '#F0FDF4', text: '#16A34A' },
  DYS:   { bg: '#FFF1F2', text: '#E11D48' },
  OTHER: { bg: '#F9FAFB', text: '#6B7280' },
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}
const statStyles = StyleSheet.create({
  card:  { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', gap: 4, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  icon:  { fontSize: 20 },
  value: { fontFamily: 'Lexend-Bold', fontSize: 18, fontWeight: '700' },
  label: { fontFamily: 'Lexend-Regular', fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
})

function StudentRow({ student }: { student: StudentResponse }) {
  const diffColor = DIFFICULTY_COLORS[student.learningDifficulty ?? 'OTHER'] ?? DIFFICULTY_COLORS.OTHER
  const displayName = student.fullNameEn ?? student.fullNameAr ?? '—'
  return (
    <TouchableOpacity
      style={rowStyles.row}
      onPress={() => router.push(`/(school)/student/${student.id}` as any)}
      accessibilityRole="button"
    >
      <View style={rowStyles.avatar}>
        <Text style={rowStyles.avatarText}>{displayName.charAt(0)}</Text>
      </View>
      <View style={rowStyles.info}>
        <View style={rowStyles.topRow}>
          <Text style={rowStyles.name}>{displayName}</Text>
          <View style={[rowStyles.badge, student.status === 'ACTIVE' ? rowStyles.badgeGreen : rowStyles.badgeOrange]}>
            <Text style={[rowStyles.badgeText, student.status === 'ACTIVE' ? rowStyles.textGreen : rowStyles.textOrange]}>
              {student.status === 'ACTIVE' ? 'Active' : 'Pending'}
            </Text>
          </View>
        </View>
        <View style={rowStyles.tagsRow}>
          {student.level != null && (
            <View style={rowStyles.levelBadge}>
              <Text style={rowStyles.levelText}>Level {student.level}</Text>
            </View>
          )}
          {student.learningDifficulty && (
            <View style={[rowStyles.diffBadge, { backgroundColor: diffColor.bg }]}>
              <Text style={[rowStyles.diffText, { color: diffColor.text }]}>{student.learningDifficulty}</Text>
            </View>
          )}
        </View>
        <View style={rowStyles.progressBg}>
          <View style={[rowStyles.progressFill, { width: '0%' }]} />
        </View>
        <Text style={rowStyles.progressText}>—</Text>
      </View>
    </TouchableOpacity>
  )
}
const rowStyles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLighter, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.primary },
  info:        { flex: 1 },
  topRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  name:        { fontSize: 14, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.textPrimary, flex: 1 },
  badge:       { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  badgeGreen:  { backgroundColor: '#E6F9F0' },
  badgeOrange: { backgroundColor: '#FFF3E0' },
  badgeText:   { fontSize: 11, fontFamily: 'Lexend-SemiBold', fontWeight: '600' },
  textGreen:   { color: '#22C55E' },
  textOrange:  { color: '#E65100' },
  tagsRow:     { flexDirection: 'row', gap: spacing.sm, marginBottom: 7 },
  levelBadge:  { backgroundColor: '#EFF6FF', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 2 },
  levelText:   { fontSize: 11, fontFamily: 'Lexend-SemiBold', color: '#3B82F6', fontWeight: '600' },
  diffBadge:   { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 2 },
  diffText:    { fontSize: 11, fontFamily: 'Lexend-SemiBold', fontWeight: '600' },
  progressBg:  { height: 6, backgroundColor: colors.border, borderRadius: 99, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  progressText:{ fontSize: 11, fontFamily: 'Lexend-SemiBold', color: colors.textSecondary, textAlign: 'right', marginTop: 3 },
})

export default function TeacherDetailScreen() {
  const { t }  = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [teacher,    setTeacher]    = useState<TeacherResponse | null>(null)
  const [students,   setStudents]   = useState<StudentResponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [tc, sts] = await Promise.all([
        apiGetTeacher(id ?? ''),
        apiGetStudents(),
      ])
      setTeacher(tc)
      setStudents(sts)
    } catch { }
    finally { setLoading(false); setRefreshing(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
    </SafeAreaView>
  )

  if (!teacher) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Teacher</Text>
        <View style={{ width: 36 }} />
      </View>
      <Text style={{ textAlign: 'center', marginTop: 60, color: colors.textSecondary }}>Teacher not found</Text>
    </SafeAreaView>
  )

  const displayName = teacher.fullNameEn ?? teacher.fullNameAr ?? '—'
  const displayNameAr = teacher.fullNameAr

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{displayName}</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
          </View>
          <Text style={styles.teacherName}>{displayName}</Text>
          {displayNameAr && displayName !== displayNameAr && (
            <Text style={styles.teacherNameAr}>{displayNameAr}</Text>
          )}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <StatCard icon="👨‍🎓" value={String(students.length)} label={t('teachers.students', 'Students')} color={colors.primary} />
          <StatCard icon="📈"   value="—"                       label="Avg Progress"                        color="#22C55E" />
          <StatCard icon="🪪"   value={teacher.nationalId ?? '—'} label="National ID"                     color="#FFB84C" />
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {[
            { icon: '📞', label: 'Phone',       value: (teacher as any).phone ?? '—' },
            { icon: '🪪', label: 'National ID', value: teacher.nationalId ?? '—' },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Students section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('teacherDetail.students', 'Students')}</Text>
          <TouchableOpacity onPress={() => router.push('/(school)/add-student')} style={styles.addStudentBtn}>
            <Text style={styles.addStudentText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {students.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecondary, paddingVertical: 20 }}>No students yet</Text>
        ) : (
          students.map((s) => <StudentRow key={s.id} student={s} />)
        )}

        {/* Danger zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{t('teacherDetail.dangerZone', 'Account Actions')}</Text>
          <TouchableOpacity style={styles.deactivateBtn}>
            <Text style={styles.deactivateText}>{t('teacherDetail.deactivate', 'Deactivate Teacher')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn}>
            <Text style={styles.removeText}>{t('teacherDetail.remove', 'Remove Teacher')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.backgroundLight },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:    { fontSize: 18, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.textPrimary },
  editBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  editIcon:       { fontSize: 16 },
  container:      { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  profileCard:    { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  avatar:         { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLighter, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, borderWidth: 3, borderColor: colors.primary + '33' },
  avatarText:     { fontSize: 30, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.primary },
  teacherName:    { fontSize: 20, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.textPrimary },
  teacherNameAr:  { fontSize: 15, fontFamily: 'Lexend-Regular', color: colors.textSecondary },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6F9F0', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 99, marginTop: spacing.sm },
  statusDot:      { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
  statusText:     { fontSize: 12, fontFamily: 'Lexend-SemiBold', color: '#22C55E', fontWeight: '600' },
  statsRow:       { flexDirection: 'row', gap: spacing.md },
  infoCard:       { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  infoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: colors.border, gap: spacing.md },
  infoIcon:       { fontSize: 16, width: 24 },
  infoLabel:      { fontFamily: 'Lexend-Regular', fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue:      { fontFamily: 'Lexend-SemiBold', fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  sectionTitle:   { fontSize: 16, fontFamily: 'Lexend-Bold', fontWeight: '700', color: colors.textPrimary },
  addStudentBtn:  { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  addStudentText: { fontFamily: 'Lexend-SemiBold', fontSize: 13, color: colors.white, fontWeight: '600' },
  dangerCard:     { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: '#FEE2E2', marginTop: spacing.sm },
  dangerTitle:    { fontFamily: 'Lexend-Bold', fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  deactivateBtn:  { height: 48, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  deactivateText: { fontFamily: 'Lexend-SemiBold', fontSize: 14, color: '#F97316', fontWeight: '600' },
  removeBtn:      { height: 48, borderRadius: borderRadius.md, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  removeText:     { fontFamily: 'Lexend-Bold', fontSize: 14, color: '#EF4444', fontWeight: '700' },
})