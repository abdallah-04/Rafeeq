import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import Header from '@/components/modal/shared/Header'
import { Text } from '@/components/modal/shared/Text'
import Card from '@/components/modal/shared/Card'
import Badge from '@/components/modal/shared/Badge'
import BottomNav from '@/components/modal/shared/BottomNav'
import {
  ActivityResponse,
  apiCompleteTreeItem,
  apiGetActivity,
  apiGetTreeItems,
} from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'
import { theme } from '@/theme'
import { buildLearningTreeAccessMap, LearningTreeStep } from '@/utils/learningTree'

export default function ActivityDetailScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const fonts = isRTL ? theme.typography.fontFamilyAr : theme.typography.fontFamily
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ id?: string }>()
  const activityId = Array.isArray(params.id) ? params.id[0] : params.id
  const activeChild = useActiveChildStore((state) => state.activeChild)

  const [activity, setActivity] = useState<ActivityResponse | null>(null)
  const [treeStep, setTreeStep] = useState<LearningTreeStep | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivity = useCallback(async () => {
    if (!activityId) {
      setError(t('activities.missingId', 'Activity could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [activityResponse, treeItems] = await Promise.all([
        apiGetActivity(activityId),
        activeChild?.id ? apiGetTreeItems(activeChild.id).catch(() => []) : Promise.resolve([]),
      ])

      const accessMap = buildLearningTreeAccessMap(treeItems)
      setActivity(activityResponse)
      setTreeStep(
        activityResponse.treeItemId
          ? accessMap.get(activityResponse.treeItemId) ?? null
          : null
      )
    } catch (err) {
      setActivity(null)
      setTreeStep(null)
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [activeChild?.id, activityId, t])

  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(parent)/progress/activities' as any)
  }

  const handleComplete = async () => {
    if (!activity?.treeItemId || !treeStep?.isCurrent) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await apiCompleteTreeItem(activity.treeItemId)
      await loadActivity()
      handleBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setSubmitting(false)
    }
  }

  const isLocked = Boolean(treeStep?.isLocked)
  const isCompleted = Boolean(treeStep?.isCompleted) || activity?.status?.toLowerCase() === 'completed'
  const canComplete = Boolean(activity?.treeItemId && treeStep?.isCurrent && !isCompleted)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={t('activities.title', 'Activities')} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && activity?.treeItemId && isLocked ? (
          <Card variant="outlined" style={styles.infoCard}>
            <Text style={[styles.infoTitle, { fontFamily: fonts.bold }]}>
              {t('tree.locked', 'Locked')}
            </Text>
            <Text
              style={[
                styles.body,
                {
                  fontFamily: fonts.regular,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('tree.unlockPrevious', 'Complete the previous step to unlock this one.')}
            </Text>
          </Card>
        ) : null}

        {!loading && activity && (!activity.treeItemId || !isLocked) ? (
          <>
            <Card variant="outlined" style={styles.card}>
              <Text
                style={[
                  styles.title,
                  {
                    fontFamily: fonts.bold,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {activity.title}
              </Text>

              <View style={styles.badgeRow}>
                {treeStep ? (
                  <Badge label={`${t('tree.step', 'Step')} ${treeStep.stepNumber}`} variant="blue" />
                ) : null}
                {activity.groupNumber != null ? (
                  <Badge label={`${t('tree.day', 'Day')} ${activity.groupNumber}`} variant="purple" />
                ) : null}
                <Badge
                  label={
                    isCompleted
                      ? t('tree.completed', 'Completed')
                      : canComplete
                        ? t('tree.currentStep', 'Current')
                        : activity.status
                  }
                  variant={isCompleted ? 'green' : canComplete ? 'blue' : 'orange'}
                />
              </View>

              {activity.description ? (
                <Text
                  style={[
                    styles.body,
                    {
                      fontFamily: fonts.regular,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {activity.description}
                </Text>
              ) : null}

              {activity.instructions ? (
                <>
                  <Text
                    style={[
                      styles.sectionLabel,
                      {
                        fontFamily: fonts.bold,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {t('activities.instructions', 'Instructions')}
                  </Text>
                  <Text
                    style={[
                      styles.body,
                      {
                        fontFamily: fonts.regular,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {activity.instructions}
                  </Text>
                </>
              ) : null}

              {activity.materialsNeeded ? (
                <>
                  <Text
                    style={[
                      styles.sectionLabel,
                      {
                        fontFamily: fonts.bold,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {t('activities.materials', 'Materials')}
                  </Text>
                  <Text
                    style={[
                      styles.body,
                      {
                        fontFamily: fonts.regular,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {activity.materialsNeeded}
                  </Text>
                </>
              ) : null}

              {activity.expectedOutcome ? (
                <>
                  <Text
                    style={[
                      styles.sectionLabel,
                      {
                        fontFamily: fonts.bold,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {t('activities.expectedOutcome', 'Expected outcome')}
                  </Text>
                  <Text
                    style={[
                      styles.body,
                      {
                        fontFamily: fonts.regular,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {activity.expectedOutcome}
                  </Text>
                </>
              ) : null}
            </Card>

            {canComplete ? (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={submitting}
                onPress={handleComplete}
                style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              >
                {submitting ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={[styles.primaryButtonText, { fontFamily: fonts.bold }]}>
                    {t('tree.complete', 'Mark Complete')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  card: {
    gap: theme.spacing.md,
  },
  infoCard: {
    gap: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  infoTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: theme.colors.buttonPrimaryDisabled,
  },
  primaryButtonText: {
    fontSize: 14,
    color: theme.colors.white,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
})
