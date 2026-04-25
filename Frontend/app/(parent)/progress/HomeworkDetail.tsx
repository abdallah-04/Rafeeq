import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import Badge from '@/components/modal/shared/Badge'
import BottomNav from '@/components/modal/shared/BottomNav'
import { Text } from '@/components/modal/shared/Text'
import {
  apiCompleteTreeItem,
  apiGetHomeworkDetail,
  apiGetTreeItems,
  HomeworkResponse,
} from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'
import { theme } from '@/theme'
import { buildLearningTreeAccessMap, isLearningTreeContentCompletedStatus, LearningTreeStep } from '@/utils/learningTree'

function formatDate(date: string | null | undefined, locale: string) {
  if (!date) {
    return null
  }

  try {
    return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-GB')
  } catch {
    return date
  }
}

export default function HomeworkDetail() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const fonts = isRTL ? theme.typography.fontFamilyAr : theme.typography.fontFamily
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ homeworkId?: string }>()
  const homeworkId = Array.isArray(params.homeworkId) ? params.homeworkId[0] : params.homeworkId
  const activeChild = useActiveChildStore((state) => state.activeChild)

  const [homework, setHomework] = useState<HomeworkResponse | null>(null)
  const [treeStep, setTreeStep] = useState<LearningTreeStep | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [attachmentName, setAttachmentName] = useState<string | null>(null)

  const loadHomework = useCallback(async () => {
    if (!homeworkId) {
      setError(t('homework.missingId', 'Homework could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [homeworkResponse, treeItems] = await Promise.all([
        apiGetHomeworkDetail(homeworkId),
        activeChild?.id ? apiGetTreeItems(activeChild.id).catch(() => []) : Promise.resolve([]),
      ])

      const accessMap = buildLearningTreeAccessMap(treeItems)
      setHomework(homeworkResponse)
      setTreeStep(
        homeworkResponse.treeItemId
          ? accessMap.get(homeworkResponse.treeItemId) ?? null
          : null
      )
    } catch (err) {
      setHomework(null)
      setTreeStep(null)
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [activeChild?.id, homeworkId, t])

  useEffect(() => {
    loadHomework()
  }, [loadHomework])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(parent)/progress/homeworks' as any)
  }

  const handlePickAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setAttachmentName(result.assets[0].fileName ?? t('homework.selectedAttachmentFallback', 'Selected attachment'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    }
  }

  const isLocked = Boolean(treeStep?.isLocked)
  const isTreeHomework = Boolean(homework?.treeItemId)
  const isSubmitted = Boolean(homework && isLearningTreeContentCompletedStatus(homework.status)) || Boolean(treeStep?.isCompleted)
  const canSubmit = Boolean(homework?.treeItemId && treeStep?.isCurrent && !isSubmitted)
  const dueDateLabel = useMemo(
    () => formatDate(homework?.dueDate, i18n.language),
    [homework?.dueDate, i18n.language]
  )

  const handleSubmit = async () => {
    if (!homework?.treeItemId || !treeStep?.isCurrent) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await apiCompleteTreeItem(homework.treeItemId)
      await loadHomework()
      handleBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel = answerText.trim() || attachmentName
    ? t('homework.submitHomework', 'Submit Homework')
    : t('tree.complete', 'Mark Complete')

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={t('homework.title', 'Homework')} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && isTreeHomework && isLocked ? (
          <Card variant="outlined" style={styles.infoCard}>
            <Text style={[styles.infoTitle, { fontFamily: fonts.bold }]}>
              {t('tree.locked', 'Locked')}
            </Text>
            <Text
              style={[
                styles.infoBody,
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

        {!loading && homework && (!isTreeHomework || !isLocked) ? (
          <>
            <Card variant="outlined" style={styles.mainCard}>
              <Text
                style={[
                  styles.title,
                  {
                    fontFamily: fonts.bold,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {homework.title}
              </Text>

              <Text
                style={[
                  styles.meta,
                  {
                    fontFamily: fonts.medium,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {dueDateLabel
                  ? t('homework.dueDateLabel', {
                      date: dueDateLabel,
                      defaultValue: `Due ${dueDateLabel}`,
                    })
                  : t('homework.noDueDate', 'No due date')}
              </Text>

              <View style={styles.badgeRow}>
                {treeStep ? (
                  <Badge
                    label={t('tree.step', 'Step') + ' ' + treeStep.stepNumber}
                    variant="blue"
                  />
                ) : null}
                {homework.groupNumber != null ? (
                  <Badge label={t('tree.day', 'Day') + ' ' + homework.groupNumber} variant="purple" />
                ) : null}
                <Badge
                  label={
                    isSubmitted
                      ? t('tree.completed', 'Completed')
                      : canSubmit
                        ? t('tree.currentStep', 'Current')
                        : homework.status
                  }
                  variant={isSubmitted ? 'green' : canSubmit ? 'blue' : 'orange'}
                />
              </View>

              <Text
                style={[
                  styles.sectionLabel,
                  {
                    fontFamily: fonts.bold,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t('homework.instructionsLabel', 'Instructions')}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    fontFamily: fonts.regular,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {homework.description || t('homework.noDescription', 'No description available.')}
              </Text>
            </Card>

            {canSubmit ? (
              <Card variant="outlined" style={styles.submitCard}>
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      fontFamily: fonts.bold,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('homework.answerLabel', 'Answer')}
                </Text>

                <TextInput
                  multiline
                  value={answerText}
                  onChangeText={setAnswerText}
                  placeholder={t('homework.answerPlaceholder', 'Write the child answer here...')}
                  placeholderTextColor={theme.colors.textMuted}
                  textAlignVertical="top"
                  style={[
                    styles.answerInput,
                    {
                      fontFamily: fonts.regular,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      fontFamily: fonts.bold,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('homework.attachmentLabel', 'Attachment (Optional)')}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePickAttachment}
                  style={styles.uploadBox}
                >
                  <Text style={[styles.uploadIcon, { fontFamily: fonts.bold }]}>+</Text>
                  <Text style={[styles.uploadText, { fontFamily: fonts.medium }]}>
                    {attachmentName ?? t('common.tapToUpload', 'Tap to upload')}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.submitHint,
                    {
                      fontFamily: fonts.regular,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('homework.submitHint', 'Submitting this homework marks the current step as complete.')}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={submitting}
                  onPress={handleSubmit}
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                >
                  {submitting ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={[styles.submitButtonText, { fontFamily: fonts.bold }]}>
                      {submitLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              </Card>
            ) : null}

            {!canSubmit && isTreeHomework && isSubmitted ? (
              <Card variant="outlined" style={styles.infoCard}>
                <Text style={[styles.infoTitle, { fontFamily: fonts.bold }]}>
                  {t('homework.submittedTitle', 'Homework submitted')}
                </Text>
                <Text
                  style={[
                    styles.infoBody,
                    {
                      fontFamily: fonts.regular,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('homework.submittedBody', 'This homework is complete and the next learning-tree step can now open.')}
                </Text>
              </Card>
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
  mainCard: {
    gap: theme.spacing.md,
  },
  submitCard: {
    gap: theme.spacing.md,
  },
  infoCard: {
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  answerInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#EFF6FF',
    color: theme.colors.textPrimary,
  },
  uploadBox: {
    minHeight: 88,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FBFF',
    paddingHorizontal: theme.spacing.md,
  },
  uploadIcon: {
    fontSize: 22,
    color: theme.colors.primary,
  },
  uploadText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  submitHint: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  submitButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.buttonPrimaryDisabled,
  },
  submitButtonText: {
    fontSize: 14,
    color: theme.colors.white,
  },
  infoTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
})
