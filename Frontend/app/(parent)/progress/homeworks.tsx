import React, { useCallback, useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ProgressCard from '@/components/modal/parent/ProgressCard'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import QuizCard from '@/components/modal/parent/quizcard'
import CompletionFilter, { CompletionFilterValue } from '@/components/modal/parent/CompletionFilter'
import { theme } from '@/theme'
import { apiGetHomeworkForParent, apiGetTreeItems, HomeworkResponse, TreeItemResponse } from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'
import type { BadgeVariant } from '@/components/modal/parent/StatusBadge'
import { buildLearningTreeAccessMap, isLearningTreeContentCompletedStatus } from '@/utils/learningTree'
import { pickLocalizedName } from '@/utils/localizedName'

function toBadgeVariant(homework: HomeworkResponse, treeItems: TreeItemResponse[]): BadgeVariant {
  if (!homework.treeItemId) {
    return isLearningTreeContentCompletedStatus(homework.status) ? 'completed' : 'start'
  }

  const step = buildLearningTreeAccessMap(treeItems).get(homework.treeItemId)

  if (step?.isLocked) {
    return 'locked'
  }

  if (step?.isCompleted || isLearningTreeContentCompletedStatus(homework.status)) {
    return 'completed'
  }

  if (step?.isCurrent) {
    return 'current'
  }

  return 'start'
}

export default function HomeworksMain() {
  const { t, i18n } = useTranslation()
  const activeChild = useActiveChildStore((state) => state.activeChild)
  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homework'),
    ],
    [t]
  )

  const [activeTab, setActiveTab] = useState(tabs[3])
  const [filter, setFilter] = useState<CompletionFilterValue>('todo')
  const [homeworks, setHomeworks] = useState<HomeworkResponse[]>([])
  const [treeItems, setTreeItems] = useState<TreeItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHomeworks = useCallback(async () => {
    if (!activeChild?.id) {
      setHomeworks([])
      setTreeItems([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [homeworkResponse, treeItemResponse] = await Promise.all([
        apiGetHomeworkForParent(activeChild.id),
        apiGetTreeItems(activeChild.id).catch(() => []),
      ])
      setHomeworks(homeworkResponse)
      setTreeItems(treeItemResponse)
    } catch (err) {
      setHomeworks([])
      setTreeItems([])
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setIsLoading(false)
    }
  }, [activeChild?.id, t])

  useFocusEffect(
    useCallback(() => {
      setActiveTab(tabs[3])
      loadHomeworks()
    }, [loadHomeworks, tabs])
  )

  const accessMap = useMemo(() => buildLearningTreeAccessMap(treeItems), [treeItems])

  const aiHomeworks = useMemo(
    () => homeworks.filter((homework) => Boolean(homework.treeItemId || homework.treeId)),
    [homeworks]
  )

  const filteredHomeworks = useMemo(() => {
    return aiHomeworks.filter((homework) => {
      const step = homework.treeItemId ? accessMap.get(homework.treeItemId) ?? null : null
      const isDone = Boolean(step?.isCompleted) || isLearningTreeContentCompletedStatus(homework.status)

      return filter === 'done' ? isDone : !isDone
    })
  }, [accessMap, aiHomeworks, filter])

  const completedCount = useMemo(() => {
    return aiHomeworks.filter((homework) => {
      const step = homework.treeItemId ? accessMap.get(homework.treeItemId) ?? null : null
      return Boolean(step?.isCompleted) || isLearningTreeContentCompletedStatus(homework.status)
    }).length
  }, [accessMap, aiHomeworks])

  const percentage = aiHomeworks.length ? Math.round((completedCount / aiHomeworks.length) * 100) : 0

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

    if (tab === tabs[1]) {
      router.replace('/(parent)/progress/quiz' as any)
      return
    }

    if (tab === tabs[2]) {
      router.replace('/(parent)/progress/activities' as any)
      return
    }

    setActiveTab(tabs[3])
  }

  const renderHomeworkCard = (homework: HomeworkResponse) => {
    const step = homework.treeItemId ? accessMap.get(homework.treeItemId) ?? null : null
    const isLocked = Boolean(step?.isLocked)

    return (
      <QuizCard
        key={homework.id}
        title={homework.title}
        questionsCount={homework.groupNumber ?? 1}
        durationMinutes={0}
        metaText={
          homework.dueDate
            ? t('homework.dueDateLabel', {
                date: new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB'),
                defaultValue: `Due ${new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB')}`,
              })
            : t('homework.noDueDate', 'No due date')
        }
        status={toBadgeVariant(homework, treeItems)}
        icon={require('@/assets/images/icons/math.png')}
        iconBgColor="#D1FAE5"
        iconTintColor="#059669"
        disabled={isLocked}
        onPress={() =>
          router.push({
            pathname: '/(parent)/progress/HomeworkDetail' as any,
            params: { homeworkId: homework.id, childId: homework.childId },
          })
        }
      />
    )
  }

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <Header title={t('homework.title', 'Homework')} onBack={handleBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressCard
          childName={pickLocalizedName(
            i18n.language === 'ar',
            activeChild?.fullNameAr,
            activeChild?.fullNameEn,
            t('homework.title', 'Homework')
          )}
          monthLabel={t('homework.today', 'Today')}
          description={
            aiHomeworks.length
              ? t('homework.progressSummary', {
                  completed: completedCount,
                  total: aiHomeworks.length,
                  defaultValue: `${completedCount} of ${aiHomeworks.length} tasks completed`,
                })
              : t('homework.noHomeworkYet', 'No homework yet')
          }
          percentage={percentage}
          mascotImage={require('@/assets/images/mascot/rafeeq_reading.png')}
        />

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <CompletionFilter value={filter} onChange={setFilter} />

        <View style={styles.listSection}>
          {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
          {error ? <Text style={styles.messageText}>{error}</Text> : null}
          {!isLoading && !error && filteredHomeworks.length === 0 ? (
            <Text style={styles.messageText}>
              {t('homework.emptyState', 'No homework available for this child yet.')}
            </Text>
          ) : null}

          {filteredHomeworks.map(renderHomeworkCard)}
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  listSection: {
    paddingBottom: 24,
    marginTop: theme.spacing.md,
  },
  groupTitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  centered: {
    marginVertical: theme.spacing.md,
  },
  messageText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
})
