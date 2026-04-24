import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import Avatar from '@/components/modal/shared/Avatar'
import { Text } from '@/components/modal/shared/Text'
import { theme } from '@/theme'
import {
  apiGetSchoolTeacherStudents,
  apiGetTeacher,
  StudentResponse,
  TeacherResponse,
} from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const { colors, spacing, radius, typography } = theme

type AssignedStudent = StudentResponse & {
  teacherId?: string | null
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  value: string
  label: string
  color: string
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function InfoRow({
  icon,
  tileColor,
  iconColor,
  label,
  value,
  isRTL,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  value: string
  isRTL: boolean
  last?: boolean
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider, isRTL && styles.infoRowRTL]}>
      <View style={[styles.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoCaption, isRTL && styles.textRight]}>{label}</Text>
        <Text style={[styles.infoValue, isRTL && styles.textRight]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function StudentCard({
  student,
  teacherId,
  isRTL,
  chevron,
}: {
  student: AssignedStudent
  teacherId: string
  isRTL: boolean
  chevron: React.ComponentProps<typeof Ionicons>['name']
}) {
  const displayName = isRTL
    ? student.fullNameAr ?? student.fullNameEn ?? '—'
    : student.fullNameEn ?? student.fullNameAr ?? '—'
  const level = student.assessedLevel ?? student.level
  const progress = Math.min(Math.max((level ?? 0) * 20, 0), 100)

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/(school)/student/[id]',
          params: { id: student.id, teacherId },
        } as any)
      }
    >
      <Card variant="outlined" style={styles.studentCard}>
        <View style={[styles.studentRow, isRTL && styles.studentRowRTL]}>
          <Avatar name={displayName} size="md" />

          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, isRTL && styles.textRight]} numberOfLines={1}>
              {displayName}
            </Text>

            <View style={[styles.studentPills, isRTL && styles.studentPillsRTL]}>
              {level != null ? (
                <View style={[styles.studentPill, styles.studentPillPrimary]}>
                  <Text style={styles.studentPillPrimaryText}>
                    {isRTL ? `المستوى ${level}` : `Level ${level}`}
                  </Text>
                </View>
              ) : null}

              {student.learningDifficulty ? (
                <View style={[styles.studentPill, styles.studentPillAccent]}>
                  <Text style={styles.studentPillAccentText}>
                    {student.learningDifficulty.replace(/_/g, ' ')}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.studentProgressRow, isRTL && styles.studentProgressRowRTL]}>
              <View style={styles.studentProgressTrack}>
                <View style={[styles.studentProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.studentProgressText}>{`${progress}%`}</Text>
            </View>
          </View>

          <Ionicons name={chevron} size={18} color={colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  )
}

export default function TeacherDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isRTL = useAuthStore((s) => s.isRTL)
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward'

  const [teacher, setTeacher] = useState<TeacherResponse | null>(null)
  const [students, setStudents] = useState<AssignedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(school)/teachers' as any)
  }, [])

  const loadStudents = useCallback(async (teacherData: TeacherResponse) => {
    try {
      const studentList = (await apiGetSchoolTeacherStudents(teacherData.id)) as AssignedStudent[]
      setStudents(studentList)
    } catch {
      setStudents([])
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const teacherData = await apiGetTeacher(id ?? '')
      setTeacher(teacherData)
      await loadStudents(teacherData)
    } catch {
      setTeacher(null)
      setStudents([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id, loadStudents])

  useEffect(() => {
    load()
  }, [load])

  const displayName = useMemo(() => {
    if (!teacher) return '—'
    return isRTL
      ? teacher.fullNameAr ?? teacher.fullNameEn ?? '—'
      : teacher.fullNameEn ?? teacher.fullNameAr ?? '—'
  }, [isRTL, teacher])

  const alternateName = teacher
    ? isRTL
      ? teacher.fullNameEn
      : teacher.fullNameAr
    : null

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
      </SafeAreaView>
    )
  }

  if (!teacher) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Header title={t('teachers.title')} onBack={handleBack} />
        <View style={styles.notFound}>
          <Text variant="heading" color="textPrimary" style={styles.centered}>
            {t('teachers.emptyTitle', 'Teacher not found')}
          </Text>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
            <Text style={styles.backBtnText}>{t('common.back', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title={displayName} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
            }}
          />
        }
      >
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name={displayName} size="lg" />
          <Text style={[styles.teacherName, isRTL && styles.textRight]}>{displayName}</Text>
          {alternateName && alternateName !== displayName ? (
            <Text style={[styles.teacherAltName, isRTL && styles.textRight]}>{alternateName}</Text>
          ) : null}

          <View style={styles.rolePill}>
            <Ionicons name="school-outline" size={12} color={colors.primary} />
            <Text style={styles.rolePillText}>{t('roleSelect.teacherTitle', 'Teacher')}</Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon="call-outline"
            value={teacher.phone || '—'}
            label={t('profile.phone')}
            color={colors.primary}
          />
          <StatCard
            icon="card-outline"
            value={teacher.nationalId}
            label={t('teacherDetail.nationalId', 'National ID')}
            color="#FFB84C"
          />
          <StatCard
            icon="key-outline"
            value={teacher.userId.slice(0, 8)}
            label={t('teacherDetail.account', 'Account')}
            color="#22A05A"
          />
        </View>

        <Text
          variant="label"
          color="textPrimary"
          style={[styles.sectionTitle, isRTL && styles.textRight]}
        >
          {t('profile.info')}
        </Text>
        <Card variant="outlined" padded={false}>
          <InfoRow
            icon="person-outline"
            tileColor="#EDF4FE"
            iconColor={colors.primary}
            label={t('teacherDetail.name', 'Teacher Name')}
            value={displayName}
            isRTL={isRTL}
          />
          {alternateName && alternateName !== displayName ? (
            <InfoRow
              icon="text-outline"
              tileColor="#FFF3DF"
              iconColor="#FFB84C"
              label={t('teacherDetail.altName', 'Alternate Name')}
              value={alternateName}
              isRTL={isRTL}
            />
          ) : null}
          <InfoRow
            icon="call-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.phone')}
            value={teacher.phone || '—'}
            isRTL={isRTL}
          />
          <InfoRow
            icon="card-outline"
            tileColor="#E8F7EE"
            iconColor="#22A05A"
            label={t('teacherDetail.nationalId', 'National ID')}
            value={teacher.nationalId}
            isRTL={isRTL}
            last
          />
        </Card>

        <View>
          <View style={styles.studentsHeader}>
            <Text
              variant="label"
              color="textPrimary"
              style={[styles.sectionTitle, isRTL && styles.textRight]}
            >
              {t('teacherDetail.assignedStudents', 'Students assigned to this teacher')}
            </Text>
            <View style={styles.studentsCountPill}>
              <Text style={styles.studentsCountText}>{students.length}</Text>
            </View>
          </View>

          {students.length > 0 ? (
            <View style={styles.studentList}>
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  teacherId={teacher.id}
                  isRTL={isRTL}
                  chevron={chevron}
                />
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyStudentsCard}>
              <Ionicons name="people-outline" size={20} color={colors.textMuted} />
              <View style={styles.emptyStudentsCopy}>
                <Text style={[styles.emptyStudentsTitle, isRTL && styles.textRight]}>
                  {t('teacherDetail.noStudentsTitle', 'No assigned students yet')}
                </Text>
                <Text style={[styles.emptyStudentsText, isRTL && styles.textRight]}>
                  {t(
                    'teacherDetail.noStudentsSubtitle',
                    'Students linked to this teacher will appear here.'
                  )}
                </Text>
              </View>
            </Card>
          )}
        </View>

        <Card variant="outlined" style={styles.actionsCard}>
          <Text style={[styles.actionsTitle, isRTL && styles.textRight]}>
            {t('teacherDetail.accountActions', 'Account Actions')}
          </Text>

          <TouchableOpacity activeOpacity={1} style={styles.deactivateBtn}>
            <Text style={styles.deactivateText}>
              {t('teacherDetail.deactivate', 'Deactivate Teacher')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={1} style={styles.removeBtn}>
            <Text style={styles.removeText}>
              {t('teacherDetail.remove', 'Remove Teacher')}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  teacherName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  teacherAltName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  textRight: {
    textAlign: 'right',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLighter,
    marginTop: spacing.xs,
  },
  rolePillText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  studentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentsCountPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  studentsCountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  studentList: {
    gap: spacing.sm,
  },
  studentCard: {
    padding: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  studentRowRTL: {
    flexDirection: 'row-reverse',
  },
  studentInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  studentName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  studentPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  studentPillsRTL: {
    flexDirection: 'row-reverse',
  },
  studentPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  studentPillPrimary: {
    backgroundColor: colors.primaryLighter,
  },
  studentPillPrimaryText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  studentPillAccent: {
    backgroundColor: '#FFF3DF',
  },
  studentPillAccentText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFB84C',
  },
  studentProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studentProgressRowRTL: {
    flexDirection: 'row-reverse',
  },
  studentProgressTrack: {
    flex: 1,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  studentProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  studentProgressText: {
    minWidth: 38,
    textAlign: 'right',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowRTL: {
    flexDirection: 'row-reverse',
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: {
    flex: 1,
    gap: 2,
  },
  infoCaption: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  emptyStudentsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyStudentsCopy: {
    flex: 1,
    gap: 4,
  },
  emptyStudentsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  emptyStudentsText: {
    fontSize: typography.fontSize.xs,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  actionsCard: {
    gap: spacing.md,
    borderColor: '#FEE2E2',
  },
  actionsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  deactivateBtn: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactivateText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: '#F97316',
  },
  removeBtn: {
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#EF4444',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtnText: {
    color: colors.white,
    fontFamily: typography.fontFamily.semiBold,
  },
})
