import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import BackButton from '@/components/BackButton'
import LearningTreeTimeline from '@/components/learning-tree/LearningTreeTimeline'
import {
  apiGetLearningTree,
  apiGetStudent,
  apiGetTreeItems,
  LearningTreeResponse,
  StudentResponse,
  TreeItemResponse,
} from '@/services/api'
import { theme } from '@/theme'
import { buildLearningTreeSteps } from '@/utils/learningTree'

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function readNumberParam(value?: string | string[]) {
  const raw = readParam(value)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function buildStudentFromParams(params: {
  studentId?: string
  studentNameAr?: string | string[]
  studentNameEn?: string | string[]
  studentLevel?: string | string[]
  studentAssessedLevel?: string | string[]
  studentLearningDifficulty?: string | string[]
  studentStatus?: string | string[]
  studentDateOfBirth?: string | string[]
}): StudentResponse | null {
  if (!params.studentId) {
    return null
  }

  const fullNameAr = readParam(params.studentNameAr)
  const fullNameEn = readParam(params.studentNameEn)

  if (!fullNameAr && !fullNameEn) {
    return null
  }

  return {
    id: params.studentId,
    userId: null,
    fullNameAr: fullNameAr ?? '',
    fullNameEn: fullNameEn ?? null,
    className: null,
    level: readNumberParam(params.studentLevel),
    gender: null,
    dateOfBirth: readParam(params.studentDateOfBirth) ?? null,
    learningDifficulty: readParam(params.studentLearningDifficulty) ?? null,
    nationalId: '',
    status: readParam(params.studentStatus) ?? '',
    assessedLevel: readNumberParam(params.studentAssessedLevel),
  }
}

export default function TeacherRoadMapScreen() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const fonts = isRTL ? theme.typography.fontFamilyAr : theme.typography.fontFamily
  const params = useLocalSearchParams<{
    studentId?: string
    studentNameAr?: string
    studentNameEn?: string
    studentLevel?: string
    studentAssessedLevel?: string
    studentLearningDifficulty?: string
    studentStatus?: string
    studentDateOfBirth?: string
  }>()
  const studentId = readParam(params.studentId)
  const initialStudent = useMemo(() => buildStudentFromParams(params), [params])

  const [student, setStudent] = useState<StudentResponse | null>(initialStudent)
  const [tree, setTree] = useState<LearningTreeResponse | null>(null)
  const [items, setItems] = useState<TreeItemResponse[]>([])
  const [loading, setLoading] = useState(Boolean(studentId))
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const getErrorMessage = useCallback((err: unknown) => {
    return err instanceof Error ? err.message : t('common.error', 'Something went wrong')
  }, [t])

  const isMissingTreeError = useCallback((err: unknown) => {
    const message = getErrorMessage(err).toLowerCase()
    return message.includes('no active learning tree') || message.includes('learning tree found') || message.includes('http 404')
  }, [getErrorMessage])

  const loadTree = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!studentId) {
      setStudent(initialStudent)
      setTree(null)
      setItems([])
      setLoading(false)
      setHasLoaded(true)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const [studentResult, treeResult, itemResult] = await Promise.allSettled([
      apiGetStudent(studentId),
      apiGetLearningTree(studentId),
      apiGetTreeItems(studentId),
    ])

    if (requestIdRef.current !== requestId) {
      return
    }

    if (studentResult.status === 'fulfilled') {
      setStudent(studentResult.value)
    } else {
      setStudent((current) => current ?? initialStudent)
    }

    if (treeResult.status === 'fulfilled') {
      setTree(treeResult.value)
    } else {
      setTree(null)
      if (!isMissingTreeError(treeResult.reason)) {
        setError(getErrorMessage(treeResult.reason))
      }
    }

    if (itemResult.status === 'fulfilled') {
      setItems(itemResult.value)
    } else if (treeResult.status === 'rejected' && isMissingTreeError(treeResult.reason)) {
      setItems([])
    } else if (treeResult.status === 'fulfilled') {
      setError(getErrorMessage(itemResult.reason))
    }

    setHasLoaded(true)
    setLoading(false)
  }, [getErrorMessage, initialStudent, isMissingTreeError, studentId])

  useFocusEffect(
    useCallback(() => {
      loadTree()
    }, [loadTree])
  )

  const steps = useMemo(() => buildLearningTreeSteps(items), [items])
  const completedCount = steps.filter((step) => step.isCompleted).length
  const levelLabel = student?.assessedLevel ?? student?.level ?? tree?.level ?? '--'
  const studentName = isRTL
    ? student?.fullNameAr ?? student?.fullNameEn ?? ''
    : student?.fullNameEn ?? student?.fullNameAr ?? ''

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    if (studentId) {
      router.replace({ pathname: '/(teacher)/Student_dashboard', params: { studentId } } as any)
      return
    }

    router.replace('/(teacher)/(tabs)/students')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.navBar, isRTL && styles.rowReverse]}>
        <BackButton onPress={handleBack} />
        <Text style={[styles.navTitle, { fontFamily: fonts.bold }]}>
          {t('teacher.roadmap.title', 'Learning Tree')}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text
            style={[
              styles.studentName,
              {
                fontFamily: fonts.bold,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {studentName || t('teacher.studentDashboard.title', 'Student Dashboard')}
          </Text>

          <Text
            style={[
              styles.summaryTitle,
              {
                fontFamily: fonts.bold,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {tree?.topic ?? t('tree.noTopic', 'Learning Tree')}
          </Text>

          <Text
            style={[
              styles.summaryBody,
              {
                fontFamily: fonts.regular,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {tree?.summary ?? t('tree.emptySummary', 'Generate a tree after placement to see the child learning path.')}
          </Text>

          <View style={[styles.metaRow, isRTL && styles.rowReverseWrap]}>
            <View style={styles.metaChip}>
              <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                {t('common.level', 'Level')} {levelLabel}
              </Text>
            </View>

            {steps.length > 0 ? (
              <View style={styles.metaChip}>
                <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                  {t('tree.progressCount', {
                    completed: completedCount,
                    total: steps.length,
                    defaultValue: `${completedCount}/${steps.length} completed`,
                  })}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {loading && (!hasLoaded || steps.length === 0) ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
        ) : null}

        {!loading && hasLoaded && error ? (
          <Text style={[styles.messageText, { fontFamily: fonts.medium }]}>
            {error}
          </Text>
        ) : null}

        {!loading && hasLoaded && !error && !tree ? (
          <View style={styles.emptyCard}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  fontFamily: fonts.bold,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('tree.emptyTitle', 'No learning tree yet')}
            </Text>
            <Text
              style={[
                styles.emptyBody,
                {
                  fontFamily: fonts.regular,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('tree.emptyBody', 'Generate the child learning tree after placement to unlock activities, homework, and quizzes.')}
            </Text>
          </View>
        ) : null}

        {!loading && hasLoaded && tree && steps.length === 0 ? (
          <Text style={[styles.messageText, { fontFamily: fonts.medium }]}>
            {t('tree.noSteps', 'No roadmap steps are available yet.')}
          </Text>
        ) : null}

        {steps.length > 0 ? (
          <LearningTreeTimeline
            levelLabel={levelLabel}
            steps={steps}
            readOnly
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  navSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  summaryCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: '#EEF4FF',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  studentName: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  summaryTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  summaryBody: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaChipText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  loader: {
    marginTop: theme.spacing.lg,
  },
  emptyCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  messageText: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rowReverseWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
})
