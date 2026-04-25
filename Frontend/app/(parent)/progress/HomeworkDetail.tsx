import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { theme } from '@/theme'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/modal/shared/Text'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import Badge from '@/components/modal/shared/Badge'
import BottomNav from '@/components/modal/shared/BottomNav'
import { apiGetHomeworkDetail, HomeworkResponse } from '@/services/api'

export default function HomeworkDetail() {
  const { t, i18n } = useTranslation()
  const params = useLocalSearchParams<{ homeworkId?: string }>()
  const homeworkId = Array.isArray(params.homeworkId) ? params.homeworkId[0] : params.homeworkId
  const [homework, setHomework] = useState<HomeworkResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!homeworkId) {
      setError(t('homework.missingId', 'Homework could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    apiGetHomeworkDetail(homeworkId)
      .then((data) => {
        if (!cancelled) {
          setHomework(data)
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
  }, [homeworkId, t])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/progress/homeworks' as any)
  }

  return (
    <View style={styles.container}>
      <Header title={t('homework.title')} onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {homework ? (
          <Card variant="outlined" style={styles.mainCard}>
            <Text style={styles.title}>{homework.title}</Text>
            <Text style={styles.meta}>
              {homework.dueDate
                ? t('homework.dueDateLabel', {
                    date: new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB'),
                    defaultValue: `Due ${new Date(homework.dueDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB')}`,
                  })
                : t('homework.noDueDate', 'No due date')}
            </Text>

            <View style={styles.badgeRow}>
              {homework.groupNumber != null ? <Badge label={`H.W ${homework.groupNumber}`} variant="blue" /> : null}
              {homework.orderNum != null ? <Badge label={`#${homework.orderNum}`} variant="purple" /> : null}
              <Badge label={homework.status} variant={homework.status?.toLowerCase() === 'completed' ? 'green' : 'orange'} />
            </View>

            <Text style={styles.description}>
              {homework.description || t('homework.noDescription', 'No description available.')}
            </Text>
          </Card>
        ) : null}
      </ScrollView>

      <BottomNav />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.xl, alignItems: 'center', paddingBottom: 32 },
  mainCard: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'left',
    color: theme.colors.textPrimary,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily.regular,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
})
