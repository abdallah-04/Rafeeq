import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import Header from '@/components/modal/shared/Header'
import { Text } from '@/components/modal/shared/Text'
import Card from '@/components/modal/shared/Card'
import BottomNav from '@/components/modal/shared/BottomNav'
import { ActivityResponse, apiGetActivity } from '@/services/api'
import { theme } from '@/theme'

export default function ActivityDetailScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ id?: string }>()
  const activityId = Array.isArray(params.id) ? params.id[0] : params.id
  const [activity, setActivity] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!activityId) {
      setError(t('activities.missingId', 'Activity could not be loaded.'))
      return
    }

    setLoading(true)
    setError(null)

    apiGetActivity(activityId)
      .then((data) => {
        if (!cancelled) {
          setActivity(data)
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
  }, [activityId, t])

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(parent)/progress/activities' as any)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={t('activities.title', 'Activities')} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {activity ? (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.title}>{activity.title}</Text>
            {activity.description ? <Text style={styles.body}>{activity.description}</Text> : null}
            {activity.instructions ? (
              <>
                <Text style={styles.label}>{t('activities.instructions', 'Instructions')}</Text>
                <Text style={styles.body}>{activity.instructions}</Text>
              </>
            ) : null}
            {activity.materialsNeeded ? (
              <>
                <Text style={styles.label}>{t('activities.materials', 'Materials')}</Text>
                <Text style={styles.body}>{activity.materialsNeeded}</Text>
              </>
            ) : null}
            {activity.expectedOutcome ? (
              <>
                <Text style={styles.label}>{t('activities.expectedOutcome', 'Expected outcome')}</Text>
                <Text style={styles.body}>{activity.expectedOutcome}</Text>
              </>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
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
  label: {
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
})
