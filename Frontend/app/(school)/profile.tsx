import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/theme'
import { useAuthStore } from '@/store/authStore'
import { performLogout } from '@/utils/logout'
import { Text } from '@/components/modal/shared/Text'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'
import { apiGetMe, apiGetSchoolDashboard, MeResponse, SchoolDashboard } from '@/services/api'
import type { Language } from '@/types'

const { colors, spacing, radius, typography } = theme

function InfoRow({
  icon,
  tileColor,
  iconColor,
  label,
  value,
  last = false,
  isRTL,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  value: string
  last?: boolean
  isRTL: boolean
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

function SettingsRow({
  icon,
  tileColor,
  iconColor,
  label,
  valueLabel,
  onPress,
  isRTL,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  valueLabel?: string
  onPress: () => void
  isRTL: boolean
  last?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.infoRow, !last && styles.infoRowDivider, isRTL && styles.infoRowRTL]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.infoValue, styles.settingsLabel, isRTL && styles.textRight]}>
        {label}
      </Text>
      {valueLabel ? <Text style={styles.settingsValue}>{valueLabel}</Text> : null}
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={14}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const setLanguage = useAuthStore((s) => s.setLanguage)
  const language = useAuthStore((s) => s.language)
  const isRTL = useAuthStore((s) => s.isRTL)

  const [me, setMe] = useState<MeResponse | null>(null)
  const [dashboard, setDashboard] = useState<SchoolDashboard | null>(null)
  const [langModalVisible, setLangModalVisible] = useState(false)

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const [meResponse, dashboardResponse] = await Promise.all([
          apiGetMe(),
          apiGetSchoolDashboard(),
        ])

        if (!active) return
        setMe(meResponse)
        setDashboard(dashboardResponse)
      } catch {
        if (!active) return
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const displayName = useMemo(() => {
    const candidates = [user?.nameAr, user?.name, me?.email, me?.phone, user?.phone, user?.nationalId]
    return candidates.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim()
      ?? t('roleSelect.schoolTitle')
  }, [me?.email, me?.phone, t, user?.name, user?.nameAr, user?.nationalId, user?.phone])

  const phoneValue = me?.phone || user?.phone || '—'
  const emailValue = me?.email || '—'
  const schoolIdValue = user?.nationalId || me?.userId || '—'
  const teachersCount = dashboard?.teachersCount != null ? String(dashboard.teachersCount) : '—'
  const studentsCount = dashboard?.studentsCount != null ? String(dashboard.studentsCount) : '—'

  const languages: { code: Language; native: string }[] = [
    { code: 'en', native: t('language.english') },
    { code: 'ar', native: t('language.arabic') },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <Header
        title={t('profile.title')}
        rightElement={
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.logoSlot}>
            <Ionicons name="business" size={32} color={colors.primary} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, isRTL && styles.textRight]} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.rolePill}>
              <Ionicons name="school-outline" size={12} color={colors.white} />
              <Text style={styles.rolePillText}>{t('roleSelect.schoolTitle')}</Text>
            </View>
            <View style={[styles.locationRow, isRTL && styles.locationRowRTL]}>
              <Ionicons name="call-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locationText}>{phoneValue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#EDF4FE' }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{teachersCount}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.teachers')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F7EE' }]}>
            <Text style={[styles.statNumber, { color: '#22A05A' }]}>{studentsCount}</Text>
            <Text style={styles.statLabel}>{t('profile.stats.students', 'Students')}</Text>
          </View>
        </View>

        <Text variant="label" color="textPrimary" style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {t('profile.info')}
        </Text>
        <Card variant="outlined" padded={false}>
          <InfoRow
            icon="card-outline"
            tileColor="#EDF4FE"
            iconColor={colors.primary}
            label={t('profile.schoolId')}
            value={schoolIdValue}
            isRTL={isRTL}
          />
          <InfoRow
            icon="person-outline"
            tileColor="#FFF3DF"
            iconColor="#FFB84C"
            label={t('profile.advisor')}
            value={displayName}
            isRTL={isRTL}
          />
          <InfoRow
            icon="call-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.phone')}
            value={phoneValue}
            isRTL={isRTL}
          />
          <InfoRow
            icon="mail-outline"
            tileColor="#E8F7EE"
            iconColor="#22A05A"
            label={t('profile.email')}
            value={emailValue}
            isRTL={isRTL}
            last
          />
        </Card>

        <Text variant="label" color="textPrimary" style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {t('profile.settings')}
        </Text>
        <Card variant="outlined" padded={false}>
          <SettingsRow
            icon="globe-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.language')}
            valueLabel={language === 'ar' ? 'العربية' : 'English'}
            onPress={() => setLangModalVisible(true)}
            isRTL={isRTL}
            last
          />
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={performLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>RAFEEQ · v1.0.0</Text>
      </ScrollView>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setLangModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{t('language.select')}</Text>
            {languages.map((lang) => {
              const selected = language === lang.code
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langRow, isRTL && styles.langRowRTL, selected && styles.langRowSelected]}
                  onPress={() => {
                    setLanguage(lang.code)
                    setLangModalVisible(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langLabel,
                      selected && styles.langLabelSelected,
                      isRTL && styles.textRight,
                    ]}
                  >
                    {lang.native}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    end: 4,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
    marginBottom: spacing.md,
  },
  logoSlot: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  heroName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  textRight: {
    textAlign: 'right',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  rolePillText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontFamily: typography.fontFamily.semiBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationRowRTL: {
    flexDirection: 'row-reverse',
  },
  locationText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semiBold,
    flexShrink: 1,
  },
  settingsLabel: {
    flex: 1,
  },
  settingsValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginEnd: spacing.xs,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: '#EF4444',
  },
  footer: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  langRowRTL: {
    flexDirection: 'row-reverse',
  },
  langRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundLight,
  },
  langLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  langLabelSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
})
