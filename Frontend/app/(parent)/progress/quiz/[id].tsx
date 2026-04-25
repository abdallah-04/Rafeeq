import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import Header from '@/components/modal/shared/Header'
import { Text } from '@/components/modal/shared/Text'
import Card from '@/components/modal/shared/Card'
import BottomNav from '@/components/modal/shared/BottomNav'
import { apiCompleteTreeItem, apiGetQuiz, apiGetTreeItems, QuizResponse } from '@/services/api'
import { useActiveChildStore } from '@/store/activeChildStore'
import { theme } from '@/theme'
import { buildLearningTreeAccessMap, LearningTreeStep } from '@/utils/learningTree'

type SubmissionResult = {
  correctAnswers: number
  totalQuestions: number
  percentage: number
  syncError: string | null
}

export default function QuizDetailScreen() {
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()
  const isRTL = i18n.language === 'ar'
  const params = useLocalSearchParams<{ id?: string }>()
  const quizId = Array.isArray(params.id) ? params.id[0] : params.id
  const activeChild = useActiveChildStore((state) => state.activeChild)

  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [treeStep, setTreeStep] = useState<LearningTreeStep | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)

  const loadQuiz = useCallback(async () => {
    if (!quizId) {
      setError(t('quiz.missingId', 'Quiz could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [quizResponse, treeItems] = await Promise.all([
        apiGetQuiz(quizId),
        activeChild?.id ? apiGetTreeItems(activeChild.id).catch(() => []) : Promise.resolve([]),
      ])

      const accessMap = buildLearningTreeAccessMap(treeItems)
      setQuiz(quizResponse)
      setTreeStep(quizResponse.treeItemId ? accessMap.get(quizResponse.treeItemId) ?? null : null)
      setQuestionIndex(0)
      setAnswers({})
      setResult(null)
    } catch (err) {
      setQuiz(null)
      setTreeStep(null)
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [activeChild?.id, quizId, t])

  useEffect(() => {
    loadQuiz()
  }, [loadQuiz])

  const totalQuestions = quiz?.questions.length ?? 0
  const currentQuestion = quiz?.questions[questionIndex] ?? null
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined
  const isLastQuestion = totalQuestions > 0 && questionIndex === totalQuestions - 1
  const progressPercentage = totalQuestions > 0
    ? Math.round(((questionIndex + 1) / totalQuestions) * 100)
    : 0
  const isLocked = Boolean(treeStep?.isLocked)

  const questionProgressLabel = useMemo(() => {
    if (!totalQuestions) {
      return isRTL ? 'لا توجد أسئلة' : 'No questions'
    }

    return isRTL
      ? `السؤال ${questionIndex + 1} من ${totalQuestions}`
      : `Question ${questionIndex + 1} of ${totalQuestions}`
  }, [isRTL, questionIndex, totalQuestions])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/progress/quiz' as any)
  }

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || submitting || result || isLocked) {
      return
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionIndex + 1,
    }))
  }

  const handleNext = async () => {
    if (!currentQuestion || !selectedOption || isLocked) {
      return
    }

    if (!isLastQuestion) {
      setQuestionIndex((current) => current + 1)
      return
    }

    if (!quiz) {
      return
    }

    const correctAnswers = quiz.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctOption ? 1 : 0)
    }, 0)
    const percentage = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0

    let syncError: string | null = null

    setSubmitting(true)
    try {
      if (quiz.treeItemId && quiz.status?.toLowerCase() !== 'completed') {
        await apiCompleteTreeItem(quiz.treeItemId)
        setQuiz((current) => current ? { ...current, status: 'completed' } : current)
        setTreeStep((current) => current ? {
          ...current,
          isCompleted: true,
          isCurrent: false,
          isLocked: false,
        } : current)
      }
    } catch (err) {
      syncError = err instanceof Error && err.message
        ? err.message
        : isRTL
          ? 'تم حفظ النتيجة محليًا، لكن تعذر مزامنة التقدم الآن.'
          : 'Your score was saved locally, but progress could not be synced right now.'
    } finally {
      setSubmitting(false)
      setResult({
        correctAnswers,
        totalQuestions,
        percentage,
        syncError,
      })
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setQuestionIndex(0)
    setResult(null)
  }

  const renderQuestionFlow = () => {
    if (isLocked) {
      return (
        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.messageText, isRTL && styles.textRight]}>
            {t('tree.unlockPrevious', 'Complete the previous step to unlock this one.')}
          </Text>
        </Card>
      )
    }

    if (!quiz || !currentQuestion) {
      return (
        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.messageText, isRTL && styles.textRight]}>
            {isRTL ? 'لا توجد أسئلة متاحة لهذا الاختبار بعد.' : 'No questions are available for this quiz yet.'}
          </Text>
        </Card>
      )
    }

    return (
      <>
        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.title, isRTL && styles.textRight]}>{quiz.title}</Text>
          <Text style={[styles.meta, isRTL && styles.textRight]}>
            {t('quiz.levelMeta', {
              level: quiz.level ?? '--',
              count: quiz.totalQuestions ?? quiz.questions.length,
              defaultValue: `Level ${quiz.level ?? '--'} - ${quiz.totalQuestions ?? quiz.questions.length} questions`,
            })}
          </Text>
          <Text style={[styles.progressLabel, isRTL && styles.textRight]}>
            {questionProgressLabel}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.questionText, isRTL && styles.textRight]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index + 1

            return (
              <TouchableOpacity
                key={`${currentQuestion.id}-${index + 1}`}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelectOption(index)}
                activeOpacity={0.85}
              >
                <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                  <Text style={[styles.optionBadgeText, isSelected && styles.optionBadgeTextSelected]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isRTL && styles.textRight, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            )
          })}
        </Card>
      </>
    )
  }

  const renderResult = () => {
    if (!quiz || !result) {
      return null
    }

    return (
      <>
        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.title, isRTL && styles.textRight]}>{quiz.title}</Text>
          <Text style={[styles.resultHeading, isRTL && styles.textRight]}>
            {isRTL ? 'تم إرسال الاختبار' : 'Quiz Submitted'}
          </Text>
          <Text style={[styles.resultScore, isRTL && styles.textRight]}>
            {isRTL
              ? `${result.correctAnswers} من ${result.totalQuestions}`
              : `${result.correctAnswers}/${result.totalQuestions}`}
          </Text>
          <Text style={[styles.resultSubtext, isRTL && styles.textRight]}>
            {isRTL
              ? `نسبتك ${result.percentage}%`
              : `You scored ${result.percentage}%`}
          </Text>
          {result.syncError ? (
            <Text style={[styles.syncWarning, isRTL && styles.textRight]}>
              {result.syncError}
            </Text>
          ) : null}
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={[styles.reviewTitle, isRTL && styles.textRight]}>
            {isRTL ? 'مراجعة سريعة' : 'Quick Review'}
          </Text>
          {quiz.questions.map((question, index) => {
            const selected = answers[question.id]
            const isCorrect = selected === question.correctOption
            const selectedText = selected != null ? question.options[selected - 1] : null
            const correctText = question.options[question.correctOption - 1]

            return (
              <View key={question.id} style={styles.reviewItem}>
                <Text style={[styles.reviewQuestion, isRTL && styles.textRight]}>
                  {index + 1}. {question.question}
                </Text>
                <Text style={[styles.reviewAnswer, isRTL && styles.textRight, isCorrect ? styles.reviewAnswerCorrect : styles.reviewAnswerWrong]}>
                  {isRTL
                    ? `إجابتك: ${selectedText ?? '-'}`
                    : `Your answer: ${selectedText ?? '-'}`}
                </Text>
                {!isCorrect ? (
                  <Text style={[styles.reviewAnswer, isRTL && styles.textRight]}>
                    {isRTL
                      ? `الإجابة الصحيحة: ${correctText}`
                      : `Correct answer: ${correctText}`}
                  </Text>
                ) : null}
              </View>
            )
          })}
        </Card>
      </>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={t('progress.tabs.quizzes', 'Quizzes')} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error && !result ? renderQuestionFlow() : null}
        {!loading && !error && result ? renderResult() : null}
      </ScrollView>

      {!loading && !error ? (
        <View style={styles.footer}>
          {isLocked ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBack}
            >
              <Text style={styles.primaryButtonText}>
                {t('common.back', 'Back')}
              </Text>
            </TouchableOpacity>
          ) : result ? (
            <>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry}>
                <Text style={styles.secondaryButtonText}>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/(parent)/progress/quiz' as any)}
              >
                <Text style={styles.primaryButtonText}>
                  {isRTL ? 'العودة إلى الاختبارات' : 'Back to Quizzes'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.secondaryButton, questionIndex === 0 && styles.secondaryButtonDisabled]}
                disabled={questionIndex === 0}
                onPress={() => setQuestionIndex((current) => Math.max(0, current - 1))}
              >
                <Text style={[styles.secondaryButtonText, questionIndex === 0 && styles.secondaryButtonTextDisabled]}>
                  {t('common.back', 'Back')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, (!selectedOption || submitting) && styles.primaryButtonDisabled]}
                disabled={!selectedOption || submitting}
                onPress={handleNext}
              >
                {submitting ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isLastQuestion ? t('common.submit', 'Submit') : t('common.next', 'Next')}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}

      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF4FF',
  },
  optionBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  optionBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionBadgeText: {
    fontSize: 13,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textSecondary,
  },
  optionBadgeTextSelected: {
    color: theme.colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textPrimary,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A5C4FA',
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.white,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  secondaryButtonDisabled: {
    backgroundColor: '#F8FAFC',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  secondaryButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  resultHeading: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  resultScore: {
    fontSize: 28,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.primary,
  },
  resultSubtext: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  syncWarning: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.warning,
    fontFamily: theme.typography.fontFamily.medium,
  },
  reviewTitle: {
    fontSize: 15,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  reviewItem: {
    gap: 4,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewQuestion: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
  },
  reviewAnswer: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  reviewAnswerCorrect: {
    color: '#15803D',
  },
  reviewAnswerWrong: {
    color: theme.colors.error,
  },
  messageText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
  textRight: {
    textAlign: 'right',
  },
})
