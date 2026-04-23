import React, { useState } from 'react'
import { Alert, I18nManager, ScrollView, StyleSheet, TouchableOpacity, View, Modal, Pressable } from 'react-native'
import * as Updates from 'expo-updates'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/theme'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/Appstore'
import type { Language } from '@/store/Appstore'
import { Text } from '@/components/modal/shared/Text'
import Header from '@/components/modal/shared/Header'
import Card from '@/components/modal/shared/Card'

const { colors, spacing, radius, typography } = theme

const MOCK_SCHOOL = {
  name: 'Al-Noor Academy',
  schoolId: 'SCH-2024-0318',
  advisorName: 'Dr. Rana Al-Kharabsheh',
  phone: '+962 6 553 2180',
  email: 'info@alnoor.edu.jo',
  city: 'Amman',
  verified: true,
  stats: { teachers: 24, students: 186, avgProgress: 78 },
}

// ---- Sub-components ----

function InfoRow({
  icon,
  tileColor,
  iconColor,
  label,
  value,
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  value: string
  last?: boolean
}) {
  const isRTL = I18nManager.isRTL
  
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <View style={[styles.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={[styles.infoTextCol, isRTL && styles.infoTextColRTL]}>
        <Text style={[styles.infoCaption, isRTL && styles.infoCaptionRTL]}>{label}</Text>
        <Text style={[styles.infoValue, isRTL && styles.infoValueRTL]} numberOfLines={1}>{value}</Text>
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
  last = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  tileColor: string
  iconColor: string
  label: string
  valueLabel?: string
  onPress: () => void
  last?: boolean
}) {
  const isRTL = I18nManager.isRTL
  
  return (
    <TouchableOpacity
      style={[styles.infoRow, !last && styles.infoRowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.infoValue, styles.settingsLabel, isRTL && styles.settingsLabelRTL]}>
        {label}
      </Text>
      {valueLabel ? (
        <Text style={[styles.settingsValue, isRTL && styles.settingsValueRTL]}>{valueLabel}</Text>
      ) : null}
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ---- Main screen ----

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const setLanguage = useAppStore((s) => s.setLanguage)
  const language = useAppStore((s) => s.language)
  const [langModalVisible, setLangModalVisible] = useState(false)

  function handleLogout() {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMsg'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => router.replace('/(auth)/login'),
        },
      ],
    )
  }

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang)
    setLangModalVisible(false)
  }

  const LANGUAGES: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: t('language.english'), native: 'English' },
    { code: 'ar', label: t('language.arabic'), native: 'العربية' },
  ]

  const isRTL = I18nManager.isRTL

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.logoSlot}>
            <Ionicons name="business" size={32} color={colors.primary} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>{MOCK_SCHOOL.name}</Text>
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={12} color={colors.white} />
              <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.locationText}>{MOCK_SCHOOL.city}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statCard, { backgroundColor: '#EDF4FE' }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {MOCK_SCHOOL.stats.teachers}
          </Text>
          <Text style={styles.statLabel}>{t('profile.stats.teachers')}</Text>
        </View>

        {/* School information */}
        <Text variant="label" color="textPrimary" style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {t('profile.info')}
        </Text>
        <Card variant="outlined" padded={false}>
          <InfoRow
            icon="card-outline"
            tileColor="#EDF4FE"
            iconColor={colors.primary}
            label={t('profile.schoolId')}
            value={MOCK_SCHOOL.schoolId}
          />
          <InfoRow
            icon="person-outline"
            tileColor="#FFF3DF"
            iconColor="#FFB84C"
            label={t('profile.advisor')}
            value={MOCK_SCHOOL.advisorName}
          />
          <InfoRow
            icon="call-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.phone')}
            value={MOCK_SCHOOL.phone}
          />
          <InfoRow
            icon="mail-outline"
            tileColor="#E8F7EE"
            iconColor="#22A05A"
            label={t('profile.email')}
            value={MOCK_SCHOOL.email}
            last
          />
        </Card>

        {/* Settings */}
        <Text variant="label" color="textPrimary" style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {t('profile.settings')}
        </Text>
        <Card variant="outlined" padded={false}>
          <SettingsRow
            icon="settings-outline"
            tileColor="#EDF4FE"
            iconColor={colors.primary}
            label={t('profile.editInfo')}
            onPress={() => {
              router.push('/(school)/edit-profile' as any)
            }}
          />
          <SettingsRow
            icon="globe-outline"
            tileColor="#F3E7FB"
            iconColor="#BA6DE9"
            label={t('profile.language')}
            valueLabel={language === 'ar' ? 'العربية' : 'English'}
            onPress={() => setLangModalVisible(true)}
            last
          />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>RAFEEQ · v1.0.0</Text>
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setLangModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, isRTL && styles.sheetTitleRTL]}>
              {t('language.select')}
            </Text>
            {LANGUAGES.map((lang) => {
              const selected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langRow, selected && styles.langRowSelected, isRTL && styles.langRowRTL]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langLabel, selected && styles.langLabelSelected, isRTL && styles.langLabelRTL]}>
                    {lang.native}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
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

  // Bell
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

  // Hero card
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
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: colors.white,
    flexShrink: 1,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.white,
    fontFamily: 'Lexend-SemiBold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Lexend-Regular',
  },

  // Stats
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
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Lexend-SemiBold',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitleRTL: {
    textAlign: 'right',
  },

  // Info / Settings rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
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
  infoTextColRTL: {
    alignItems: 'flex-end',
  },
  infoCaption: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Lexend-Regular',
  },
  infoCaptionRTL: {
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'Lexend-SemiBold',
    flexShrink: 1,
  },
  infoValueRTL: {
    textAlign: 'right',
  },
  settingsLabel: {
    flex: 1,
  },
  settingsLabelRTL: {
    textAlign: 'right',
  },
  settingsValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Lexend-Regular',
    marginEnd: spacing.xs,
  },
  settingsValueRTL: {
    marginStart: spacing.xs,
    marginEnd: 0,
  },

  // Logout
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
    fontSize: 15,
    fontFamily: 'Lexend-Bold',
    color: '#EF4444',
  },

  // Footer
  footer: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Modal styles
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
    fontSize: typography?.fontSize?.lg || 18,
    fontFamily: 'Lexend-Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetTitleRTL: {
    textAlign: 'center',
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
    fontSize: typography?.fontSize?.base || 16,
    fontFamily: 'Lexend-Medium',
    color: colors.textPrimary,
  },
  langLabelRTL: {
    textAlign: 'right',
  },
  langLabelSelected: {
    color: colors.primary,
    fontFamily: 'Lexend-SemiBold',
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'Lexend-Bold',
  },
})