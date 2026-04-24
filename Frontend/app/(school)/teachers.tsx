import React, { useCallback, useState } from 'react'
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/theme'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Header from '@/components/modal/shared/Header'
import Avatar from '@/components/modal/shared/Avatar'
import { apiGetTeachers, TeacherResponse } from '@/services/api'
import { useModal } from '@/components/modal/ModalProvider'
import { useAuthStore } from '@/store/authStore'

const { colors, spacing, typography, radius } = theme

function TeacherCard({
  teacher,
  isRTL,
  chevron,
}: {
  teacher: TeacherResponse
  isRTL: boolean
  chevron: React.ComponentProps<typeof Ionicons>['name']
}) {
  const displayName = isRTL
    ? teacher.fullNameAr ?? teacher.fullNameEn ?? '—'
    : teacher.fullNameEn ?? teacher.fullNameAr ?? '—'

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(school)/teacher/${teacher.id}` as any)}
      activeOpacity={0.75}
    >
      <Card variant="elevated" style={styles.teacherCard}>
        <View style={[styles.cardRow, isRTL && styles.cardRowRTL]}>
          <Avatar name={displayName} size="md" />

          <View style={styles.cardInfo}>
            <Text
              variant="label"
              color="textPrimary"
              style={[styles.teacherName, isRTL && styles.textRight]}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
              <View style={styles.metaPill}>
                <Ionicons name="call-outline" size={13} color={colors.primary} />
                <Text variant="caption" color="textSecondary" numberOfLines={1}>
                  {teacher.phone || '—'}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="card-outline" size={13} color={colors.warning} />
                <Text variant="caption" color="textSecondary" numberOfLines={1}>
                  {teacher.nationalId}
                </Text>
              </View>
            </View>
          </View>

          <Ionicons name={chevron} size={18} color={colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  )
}

function EmptyState({ t }: { t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require('@/assets/images/mascot/rafeeq_clabbing.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text variant="heading" color="textPrimary" style={styles.centered}>
        {t('teachers.emptyTitle')}
      </Text>
      <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>
        {t('teachers.emptySubtitle')}
      </Text>

      <Button
        label={t('teachers.addFirst')}
        onPress={() => router.push('/(school)/add-teacher')}
        style={styles.ctaBtn}
      />
    </View>
  )
}

export default function TeachersScreen() {
  const { t } = useTranslation()
  const { show } = useModal()
  const isRTL = useAuthStore((s) => s.isRTL)
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward'

  const [teachers, setTeachers] = useState<TeacherResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(school)/teachers' as any)
  }, [])

  const load = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setIsLoading(true)
      try {
        setTeachers(await apiGetTeachers())
      } catch {
        show('error', { variant: 'invalidInfo' })
      } finally {
        setIsLoading(false)
        setRefreshing(false)
      }
    },
    [show]
  )

  useFocusEffect(
    useCallback(() => {
      load(teachers.length === 0)
    }, [load, teachers.length])
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title={t('teachers.title')} onBack={handleBack} />

      <Text style={styles.subtitle}>{t('school.teachers.subtitle')}</Text>

      <Card variant="elevated" style={styles.mainCard}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                load(false)
              }}
            />
          }
        >
          {teachers.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <View style={styles.list}>
              {teachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  isRTL={isRTL}
                  chevron={chevron}
                />
              ))}

              <TouchableOpacity
                style={styles.addTeacherCard}
                onPress={() => router.push('/(school)/add-teacher')}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={32} color={colors.primary} />
                <Text variant="caption" color="primary" style={styles.addText}>
                  {t('teachers.addTeacher')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Card>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subtitle: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  mainCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  teacherCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardRowRTL: {
    flexDirection: 'row-reverse',
  },
  cardInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  teacherName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  textRight: {
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaRowRTL: {
    flexDirection: 'row-reverse',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  centered: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  ctaBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  addTeacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundLight,
    marginTop: spacing.xs,
  },
  addText: {
    fontFamily: typography.fontFamily.medium,
  },
})
