import React, { useCallback, useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, StatusBar, StyleSheet, ActivityIndicator } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import QuizCard from '@/components/modal/parent/quizcard'
import { useActiveChildStore } from '@/store/activeChildStore'
import { Text } from '@/components/modal/shared/Text'
import { apiGetQuizzes, apiGetTreeItems, QuizResponse, TreeItemResponse } from '@/services/api'
import type { BadgeVariant } from '@/components/modal/parent/StatusBadge'
import { theme } from '@/theme'
import { buildLearningTreeAccessMap } from '@/utils/learningTree'
import { pickLocalizedName } from '@/utils/localizedName'

function toBadgeVariant(quiz: QuizResponse, treeItems: TreeItemResponse[]): BadgeVariant {
  if (!quiz.treeItemId) {
    const normalized = quiz.status?.toLowerCase()
    if (normalized === 'completed') return 'completed'
    if (normalized === 'in_progress') return 'in_progress'
    return 'new'
  }

  const step = buildLearningTreeAccessMap(treeItems).get(quiz.treeItemId)

  if (step?.isLocked) return 'locked'
  if (step?.isCompleted || quiz.status?.toLowerCase() === 'completed') return 'completed'
  if (step?.isCurrent) return 'current'
  return 'new'
}

export default function QuizzesScreen() {
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()
  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homework'),
    ],
    [t]
  )

  const [activeTab, setActiveTab] = useState(tabs[1])
  const activeChild = useActiveChildStore((state) => state.activeChild)
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([])
  const [treeItems, setTreeItems] = useState<TreeItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const childName = pickLocalizedName(i18n.language === 'ar', activeChild?.fullNameAr, activeChild?.fullNameEn, 'Zaid')
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 6
  const childBadges = [
    ...(activeChild?.level ? [{ label: `${t('common.level', 'Level')} ${activeChild.level}`, color: '#A78BFA' }] : []),
    { label: t('myChildren.years', { age: childAge }), color: '#60A5FA' },
  ]

  const loadQuizzes = useCallback(async () => {
    if (!activeChild?.id) {
      setQuizzes([])
      setTreeItems([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [quizResponse, treeItemResponse] = await Promise.all([
        apiGetQuizzes(activeChild.id),
        apiGetTreeItems(activeChild.id).catch(() => []),
      ])
      setQuizzes(quizResponse)
      setTreeItems(treeItemResponse)
    } catch (err) {
      setQuizzes([])
      setTreeItems([])
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setIsLoading(false)
    }
  }, [activeChild?.id, t])

  useFocusEffect(
    useCallback(() => {
      setActiveTab(tabs[1])
      loadQuizzes()
    }, [loadQuizzes, tabs])
  )

  const accessMap = useMemo(() => buildLearningTreeAccessMap(treeItems), [treeItems])

  const learningTreeQuizzes = useMemo(
    () => quizzes.filter((quiz) => Boolean(quiz.treeItemId || quiz.treeId)),
    [quizzes]
  )

  const otherQuizzes = useMemo(
    () => quizzes.filter((quiz) => !quiz.treeItemId && !quiz.treeId),
    [quizzes]
  )

  const shouldGroupQuizzes = learningTreeQuizzes.length > 0 && otherQuizzes.length > 0

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(parent)/progress/progress-page' as any)
  }

  const handleTabChange = (tab: string) => {
    if (tab === tabs[0]) {
      router.replace('/(parent)/progress/progress-page' as any)
      return
    }
    if (tab === tabs[2]) {
      router.replace('/(parent)/progress/activities' as any)
      return
    }
    if (tab === tabs[3]) {
      router.replace('/(parent)/progress/homeworks' as any)
      return
    }

    setActiveTab(tabs[1])
  }

  const renderQuizCard = (quiz: QuizResponse) => {
    const step = quiz.treeItemId ? accessMap.get(quiz.treeItemId) ?? null : null

    return (
      <QuizCard
        key={quiz.id}
        title={quiz.title}
        questionsCount={quiz.totalQuestions ?? quiz.questions.length}
        durationMinutes={5}
        metaText={
          quiz.level != null
            ? t('quiz.levelMeta', {
                level: quiz.level,
                count: quiz.totalQuestions ?? quiz.questions.length,
                defaultValue: `Level ${quiz.level} - ${quiz.totalQuestions ?? quiz.questions.length} questions`,
              })
            : undefined
        }
        status={toBadgeVariant(quiz, treeItems)}
        icon={require('@/assets/images/icons/math.png')}
        iconBgColor="#FDE68A"
        iconTintColor="#D97706"
        disabled={Boolean(step?.isLocked)}
        onPress={() => router.push({
          pathname: '/(parent)/progress/quiz/[id]' as any,
          params: { id: quiz.id, childId: quiz.childId },
        })}
      />
    )
  }

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <Header
        title={t('progress.tabs.quizzes', 'Quizzes')}
        onBack={handleBack}
        rightElement={<HeaderRightButton onPress={() => router.push('/(parent)/settings' as any)} />}
      />

      <ChildSelector
        name={childName}
        age={childAge}
        avatar={require('@/assets/images/boy.png')}
        badges={childBadges}
        onPress={() => {}}
      />

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: theme.spacing.xl + insets.bottom }]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('quizzes.thisWeek', "This week's quizzes")}</Text>
        </View>

        {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
        {error ? <Text style={styles.messageText}>{error}</Text> : null}
        {!isLoading && !error && quizzes.length === 0 ? (
          <Text style={styles.messageText}>
            {t('quiz.emptyState', 'No quizzes available for this child yet.')}
          </Text>
        ) : null}

        {shouldGroupQuizzes ? (
          <>
            <Text style={styles.groupTitle}>{t('tree.title', 'Learning Tree')}</Text>
            {learningTreeQuizzes.map(renderQuizCard)}
            <Text style={styles.groupTitle}>{t('homework.fromTeacher', 'From Teacher')}</Text>
            {otherQuizzes.map(renderQuizCard)}
          </>
        ) : (
          quizzes.map(renderQuizCard)
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

function HeaderRightButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsButton}>
      <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  groupTitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  settingsButton: {
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  centered: { marginVertical: theme.spacing.md },
  messageText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
})
