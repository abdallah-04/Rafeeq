import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import Avatar from '@/components/modal/shared/Avatar'
import { Text } from '@/components/modal/shared/Text'
import { theme } from '@/theme'
import { apiGetTeacher, TeacherResponse } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const { colors, spacing, radius, typography } = theme

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  value: string
  label: string
  color: string
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function InfoRow({
  icon,
  tileColor,
  iconColor,
  label,
  value,
  isRTL,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  value: string
  isRTL: boolean
  last?: boolean
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider, isRTL && styles.infoRowRTL]}>
      <View style={[styles.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoCaption, isRTL && styles.textRight]}>{label}</Text>
        <Text style={[styles.infoValue, isRTL && styles.textRight]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

export default function TeacherDetailScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isRTL = useAuthStore((s) => s.isRTL)

  const [teacher, setTeacher] = useState<TeacherResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(school)/teachers' as any)
  }, [])

  const load = useCallback(async () => {
    try {
      setTeacher(await apiGetTeacher(id ?? ''))
    } catch {
      setTeacher(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const displayName = useMemo(() => {
    if (!teacher) return '—'
    return isRTL
      ? teacher.fullNameAr ?? teacher.fullNameEn ?? '—'
      : teacher.fullNameEn ?? teacher.fullNameAr ?? '—'
  }, [isRTL, teacher])

  const alternateName = teacher
    ? isRTL
      ? teacher.fullNameEn
      : teacher.fullNameAr
    : null

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
      </SafeAreaView>
    )
  }

  if (!teacher) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Header title={t('teachers.title')} onBack={handleBack} />
        <View style={styles.notFound}>
          <Text variant="heading" color="textPrimary" style={styles.centered}>
            {t('teachers.emptyTitle', 'Teacher not found')}
          </Text>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
            <Text style={styles.backBtnText}>{t('common.back', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header title={displayName} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
            }}
          />
        }
      >
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name={displayName} size="lg" />
          <Text style={[styles.teacherName, isRTL && styles.textRight]}>{displayName}</Text>
          {alternateName && alternateName !== displayName ? (
            <Text style={[styles.teacherAltName, isRTL && styles.textRight]}>{alternateName}</Text>
          ) : null}

          <View style={styles.rolePill}>
            <Ionicons name="school-outline" size={12} color={colors.primary} />
            <Text style={styles.rolePillText}>{t('roleSelect.teacherTitle', 'Teacher')}</Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon="call-outline"
            value={teacher.phone || '—'}
            label={t('profile.phone')}
            color={colors.primary}
          />
          <StatCard
            icon="card-outline"
            value={teacher.nationalId}
            label={t('teacherDetail.nationalId', 'National ID')}
            color="#FFB84C"
          />
          <StatCard
            icon="key-outline"
            value={teacher.userId.slice(0, 8)}
            label={t('teacherDetail.account', 'Account')}
            color="#22A05A"
          />
        </View>

        <Text variant="label" color="textPrimary" style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {t('profile.info')}
        </Text>
        <Card variant="outlined" padded={false}>
          <InfoRow
            icon="person-outline"
            tileColor="#EDF4FE"
            iconColor={colors.primary}
            label={t('teacherDetail.name', 'Teacher Name')}
            value={displayName}
            isRTL={isRTL}
          />
          {alternateName && alternateName !== displayName ? (
            <InfoRow
              icon="text-outline"
              tileColor="#FFF3DF"
              iconColor="#FFB84C"
              label={t('teacherDetail.altName', 'Alternate Name')}
              value={alternateName}
              isRTL={isRTL}
            />
          ) : null}
          <InfoRow
            icon="call-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.phone')}
            value={teacher.phone || '—'}
            isRTL={isRTL}
          />
          <InfoRow
            icon="card-outline"
            tileColor="#E8F7EE"
            iconColor="#22A05A"
            label={t('teacherDetail.nationalId', 'National ID')}
            value={teacher.nationalId}
            isRTL={isRTL}
            last
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  teacherName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  teacherAltName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  textRight: {
    textAlign: 'right',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLighter,
    marginTop: spacing.xs,
  },
  rolePillText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowRTL: {
    flexDirection: 'row-reverse',
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: {
    flex: 1,
    gap: 2,
  },
  infoCaption: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtnText: {
    color: colors.white,
    fontFamily: typography.fontFamily.semiBold,
  },
})
