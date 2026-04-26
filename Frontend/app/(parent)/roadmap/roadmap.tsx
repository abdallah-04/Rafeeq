import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import BackButton from '@/components/modal/shared/BackButton'
import LearningTreeTimeline from '@/components/learning-tree/LearningTreeTimeline'
import {
  apiGenerateLearningTree,
  apiGetLearningTree,
  apiGetTreeItems,
  LearningTreeResponse,
  TreeItemResponse,
} from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'
import { theme } from '@/theme'
import { buildLearningTreeSteps } from '@/utils/learningTree'

const { colors, spacing, typography } = theme

function statusLabel(status: string, t: ReturnType<typeof useTranslation>['t']) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return t('tree.completed', 'Completed')
    case 'active':
    case 'in_progress':
      return t('tree.active', 'Active')
    default:
      return t('tree.ready', 'Ready')
  }
}

export default function TreeScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const fonts = isRTL ? typography.fontFamilyAr : typography.fontFamily
  const insets = useSafeAreaInsets()
  const activeChild = useActiveChildStore((state) => state.activeChild)

  const [tree, setTree] = useState<LearningTreeResponse | null>(null)
  const [items, setItems] = useState<TreeItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTree = useCallback(async () => {
    if (!activeChild?.id) {
      setTree(null)
      setItems([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [treeResponse, itemResponse] = await Promise.all([
        apiGetLearningTree(activeChild.id),
        apiGetTreeItems(activeChild.id),
      ])
      setTree(treeResponse)
      setItems(itemResponse)
    } catch (err) {
      setTree(null)
      setItems([])
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [activeChild?.id, t])

  useFocusEffect(
    useCallback(() => {
      loadTree()
    }, [loadTree])
  )

  const steps = useMemo(() => buildLearningTreeSteps(items), [items])
  const completedCount = steps.filter((step) => step.isCompleted).length
  const levelLabel = tree?.level ?? activeChild?.level ?? '--'

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(parent)/Home-parent' as any)
  }

  const handleGenerate = async () => {
    if (!activeChild?.id) {
      return
    }

    setGenerating(true)
    setError(null)

    try {
      await apiGenerateLearningTree(activeChild.id)
      await loadTree()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setGenerating(false)
    }
  }

  const handleStepPress = (step: (typeof steps)[number]) => {
    if (step.isLocked || !step.itemId) {
      return
    }

    const childId = tree?.childId ?? activeChild?.id ?? ''

    if (step.normalizedType === 'homework') {
      router.push({
        pathname: '/(parent)/progress/HomeworkDetail' as any,
        params: { homeworkId: step.itemId, childId },
      })
      return
    }

    if (step.normalizedType === 'activity') {
      router.push({
        pathname: '/(parent)/activity/[id]' as any,
        params: { id: step.itemId, childId },
      })
      return
    }

    router.push({
      pathname: '/(parent)/progress/quiz/[id]' as any,
      params: { id: step.itemId, childId },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {t('tree.title', 'Learning Tree')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={generating || loading}
          onPress={tree ? loadTree : handleGenerate}
          style={styles.headerAction}
        >
          {generating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh-outline" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
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

          <View style={[styles.summaryMetaRow, isRTL && styles.rowReverseWrap]}>
            <View style={styles.metaChip}>
              <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                {t('common.level', 'Level')} {levelLabel}
              </Text>
            </View>

            <View style={styles.metaChip}>
              <Text style={[styles.metaChipText, { fontFamily: fonts.medium }]}>
                {statusLabel(tree?.status ?? 'pending', t)}
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

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {!loading && error ? (
          <Text style={[styles.messageText, { fontFamily: fonts.medium }]}>
            {error}
          </Text>
        ) : null}

        {!loading && !tree ? (
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

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={generating}
              onPress={handleGenerate}
              style={styles.primaryButton}
            >
              <Text style={[styles.primaryButtonText, { fontFamily: fonts.bold }]}>
                {generating ? t('tree.generating', 'Generating...') : t('tree.generate', 'Generate Tree')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && tree && steps.length === 0 ? (
          <Text style={[styles.messageText, { fontFamily: fonts.medium }]}>
            {t('tree.noSteps', 'No roadmap steps are available yet.')}
          </Text>
        ) : null}

        {!loading && steps.length > 0 ? (
          <LearningTreeTimeline
            levelLabel={levelLabel}
            steps={steps}
            onStepPress={handleStepPress}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: '#EEF4FF',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  summaryBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
    marginTop: spacing.lg,
  },
  messageText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  emptyCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    color: colors.white,
  },
  rowReverseWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
})
