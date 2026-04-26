import React, { useCallback, useMemo, useState } from 'react'
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import Header from '@/components/modal/shared/Header'
import ChildSelector from '@/components/modal/parent/ChildSelector'
import TabBar from '@/components/modal/shared/TabBar'
import { Text } from '@/components/modal/shared/Text'
import StatusBadge, { BadgeVariant } from '@/components/modal/parent/StatusBadge'
import { useActiveChildStore } from '@/store/activeChildStore'
import { ActivityResponse, apiGetActivities, apiGetTreeItems, TreeItemResponse } from '@/services/api'
import { theme } from '@/theme'
import { buildLearningTreeAccessMap } from '@/utils/learningTree'

function toBadgeVariant(activity: ActivityResponse, treeItems: TreeItemResponse[]): BadgeVariant {
  if (!activity.treeItemId) {
    if (activity.status?.toLowerCase() === 'completed') return 'completed'
    if (activity.status?.toLowerCase() === 'in_progress') return 'in_progress'
    return 'later'
  }

  const step = buildLearningTreeAccessMap(treeItems).get(activity.treeItemId)

  if (step?.isLocked) return 'locked'
  if (step?.isCompleted || activity.status?.toLowerCase() === 'completed') return 'completed'
  if (step?.isCurrent) return 'current'
  return 'later'
}

export default function ActivitiesScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const activeChild = useActiveChildStore((state) => state.activeChild)
  const childName = activeChild?.fullNameAr ?? activeChild?.fullNameEn ?? 'Zaid'
  const childAge = activeChild?.dateOfBirth
    ? Math.floor((Date.now() - new Date(activeChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 6
  const childBadges = [
    ...(activeChild?.level ? [{ label: `${t('common.level', 'Level')} ${activeChild.level}`, color: '#A78BFA' }] : []),
    { label: t('myChildren.years', { age: childAge }), color: '#60A5FA' },
  ]

  const tabs = useMemo(
    () => [
      t('progress.tabs.progress', 'Progress'),
      t('progress.tabs.quizzes', 'Quizzes'),
      t('activities.title', 'Activities'),
      t('homework.title', 'Homework'),
    ],
    [t]
  )

  const [activeTab, setActiveTab] = useState(tabs[2])
  const [activities, setActivities] = useState<ActivityResponse[]>([])
  const [treeItems, setTreeItems] = useState<TreeItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivities = useCallback(async () => {
    if (!activeChild?.id) {
      setActivities([])
      setTreeItems([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [activityResponse, treeItemResponse] = await Promise.all([
        apiGetActivities(activeChild.id),
        apiGetTreeItems(activeChild.id).catch(() => []),
      ])
      setActivities(activityResponse)
      setTreeItems(treeItemResponse)
    } catch (err) {
      setActivities([])
      setTreeItems([])
      setError(err instanceof Error ? err.message : t('common.error', 'Something went wrong'))
    } finally {
      setIsLoading(false)
    }
  }, [activeChild?.id, t])

  useFocusEffect(
    useCallback(() => {
      setActiveTab(tabs[2])
      loadActivities()
    }, [loadActivities, tabs])
  )

  const accessMap = useMemo(() => buildLearningTreeAccessMap(treeItems), [treeItems])

  const recommended = useMemo(() => {
    return activities.filter((activity) => {
      const step = activity.treeItemId ? accessMap.get(activity.treeItemId) ?? null : null
      const isLocked = Boolean(step?.isLocked)
      const isCompleted = Boolean(step?.isCompleted) || activity.status?.toLowerCase() === 'completed'
      return !isLocked && !isCompleted
    }).slice(0, 2)
  }, [accessMap, activities])

  const learningTreeActivities = useMemo(
    () => activities.filter((activity) => Boolean(activity.treeItemId || activity.treeId)),
    [activities]
  )

  const otherActivities = useMemo(
    () => activities.filter((activity) => !activity.treeItemId && !activity.treeId),
    [activities]
  )

  const shouldGroupActivities = learningTreeActivities.length > 0 && otherActivities.length > 0

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
    if (tab === tabs[3]) {
      router.replace('/(parent)/progress/homeworks' as any)
      return
    }

    setActiveTab(tabs[2])
  }

  const renderActivityCard = (activity: ActivityResponse) => {
    const step = activity.treeItemId ? accessMap.get(activity.treeItemId) ?? null : null
    const isLocked = Boolean(step?.isLocked)

    return (
      <DailyCard
        key={activity.id}
        title={activity.title}
        subtitle={activity.instructions ?? activity.description ?? t('activities.title', 'Activities')}
        status={toBadgeVariant(activity, treeItems)}
        isRTL={isRTL}
        disabled={isLocked}
        onPress={() => router.push({
          pathname: '/(parent)/activity/[id]' as any,
          params: { id: activity.id, childId: activity.childId },
        })}
      />
    )
  }

  return (
    <ScreenWrapper padded={false} scroll={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      <Header
        title={t('activities.title', 'Activities')}
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.recommendedSection}>
          <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('activities.recommendedFor', { name: childName })}
          </Text>

          {recommended.length > 0 ? (
            recommended.map((activity) => (
              <RecommendedCard
                key={activity.id}
                title={activity.title}
                description={activity.description ?? t('activities.title', 'Activities')}
                isRTL={isRTL}
                onPress={() => router.push({
                  pathname: '/(parent)/activity/[id]' as any,
                  params: { id: activity.id, childId: activity.childId },
                })}
              />
            ))
          ) : (
            <View style={[styles.recommendedEmptyCard, isRTL && styles.recommendedCardRTL]}>
              <View style={styles.dailyIconBox}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.recommendedEmptyText, isRTL && styles.textRight]}>
                {t(
                  'activities.recommendedEmpty',
                  isRTL ? 'لا توجد أنشطة موصى بها الآن.' : 'No recommended activities right now.'
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text variant="heading" style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('activities.daily', 'Daily activities')}
          </Text>
        </View>

        {isLoading ? <ActivityIndicator color={theme.colors.primary} style={styles.centered} /> : null}
        {error ? <Text style={styles.messageText}>{error}</Text> : null}
        {!isLoading && !error && activities.length === 0 ? (
          <Text style={styles.messageText}>
            {t('activities.emptyState', 'No activities available for this child yet.')}
          </Text>
        ) : null}

        {shouldGroupActivities ? (
          <>
            <Text style={[styles.groupTitle, isRTL && styles.textRight]}>{t('tree.title', 'Learning Tree')}</Text>
            {learningTreeActivities.map(renderActivityCard)}
            <Text style={[styles.groupTitle, isRTL && styles.textRight]}>{t('homework.fromTeacher', 'From Teacher')}</Text>
            {otherActivities.map(renderActivityCard)}
          </>
        ) : (
          activities.map(renderActivityCard)
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}

function RecommendedCard({
  title,
  description,
  isRTL,
  onPress,
}: {
  title: string
  description: string
  isRTL: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      style={[styles.recommendedCard, isRTL && styles.recommendedCardRTL]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dailyIconBox}>
        <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.recommendedInfo}>
        <Text style={[styles.recommendedTitle, isRTL && styles.textRight]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.recommendedMeta, isRTL && styles.textRight]} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.recommendedBadge}>
        <Text style={styles.recommendedBadgeText}>
          {t('activities.recommendedBadge', isRTL ? 'موصى به' : 'Recommended')}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function DailyCard({
  title,
  subtitle,
  status,
  onPress,
  isRTL,
  disabled,
}: {
  title: string
  subtitle: string
  status: BadgeVariant
  onPress: () => void
  isRTL: boolean
  disabled: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.dailyCard, isRTL && styles.dailyCardRTL, disabled && styles.dailyCardDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.dailyIconBox}>
        <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.dailyInfo}>
        <Text style={[styles.dailyTitle, isRTL && styles.textRight]}>{title}</Text>
        <Text style={[styles.dailySubtitle, isRTL && styles.textRight]} numberOfLines={2}>{subtitle}</Text>
      </View>
      <StatusBadge variant={status} />
    </TouchableOpacity>
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
    gap: theme.spacing.lg,
  },
  textRight: {
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  groupTitle: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  recommendedSection: {
    gap: theme.spacing.sm,
  },
  recommendedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recommendedCardRTL: {
    flexDirection: 'row-reverse',
  },
  recommendedInfo: {
    flex: 1,
    gap: 4,
  },
  recommendedTitle: {
    fontSize: 15,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  recommendedMeta: {
    fontSize: 12,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  recommendedBadge: {
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  recommendedBadgeText: {
    fontSize: 12,
    fontFamily: 'Lexend_600SemiBold',
    color: theme.colors.primary,
  },
  recommendedEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recommendedEmptyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dailyCardRTL: {
    flexDirection: 'row-reverse',
  },
  dailyCardDisabled: {
    opacity: 0.6,
  },
  dailyIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
  },
  dailyInfo: {
    flex: 1,
    gap: 4,
  },
  dailyTitle: {
    fontSize: 15,
    fontFamily: 'Lexend_700Bold',
    color: theme.colors.textPrimary,
  },
  dailySubtitle: {
    fontSize: 12,
    fontFamily: 'Lexend_400Regular',
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
