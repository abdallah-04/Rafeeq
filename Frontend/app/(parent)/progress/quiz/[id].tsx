import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import Header from '@/components/modal/shared/Header'
import { Text } from '@/components/modal/shared/Text'
import Card from '@/components/modal/shared/Card'
import BottomNav from '@/components/modal/shared/BottomNav'
import { apiGetQuiz, QuizResponse } from '@/services/api'
import { theme } from '@/theme'

export default function QuizDetailScreen() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ id?: string }>()
  const quizId = Array.isArray(params.id) ? params.id[0] : params.id
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!quizId) {
      setError(t('quiz.missingId', 'Quiz could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    apiGetQuiz(quizId)
      .then((data) => {
        if (!cancelled) {
          setQuiz(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [quizId, t])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/progress/quiz' as any)
  }

  return (
    <View style={styles.container}>
      <Header title={t('progress.tabs.quizzes', 'Quizzes')} onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {quiz ? (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.title}>{quiz.title}</Text>
            <Text style={styles.meta}>
              {t('quiz.levelMeta', {
                level: quiz.level ?? '--',
                count: quiz.totalQuestions ?? quiz.questions.length,
                defaultValue: `Level ${quiz.level ?? '--'} · ${quiz.totalQuestions ?? quiz.questions.length} questions`,
              })}
            </Text>

            {quiz.questions.map((question, index) => (
              <View key={question.id} style={styles.questionBlock}>
                <Text style={styles.questionTitle}>{index + 1}. {question.question}</Text>
                {question.options.map((option, optionIndex) => (
                  <Text key={`${question.id}-${optionIndex}`} style={styles.optionText}>
                    {optionIndex + 1}. {option}
                  </Text>
                ))}
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <BottomNav />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.xl, paddingBottom: 32 },
  card: { gap: theme.spacing.md },
  title: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  questionBlock: {
    gap: 6,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.backgroundLight,
  },
  questionTitle: {
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  optionText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
})
