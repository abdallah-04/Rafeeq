import React, { useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { useSchoolSignupStore } from '@/store/schoolSignupStore'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import { theme } from '@/theme'
import { StatusBar } from 'expo-status-bar'

const { colors, spacing, typography } = theme

export default function SchoolWelcomeScreen() {
  const { t } = useTranslation()
  const { step1, clearSignup } = useSchoolSignupStore()

  useEffect(() => {
    clearSignup()
  }, [])

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />

      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logoEn}>RAFEEQ</Text>
          <Text style={styles.logoAr}>رفيق</Text>
        </View>

        {/* Hero */}
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text variant="heading" style={styles.welcomeLabel}>{t('schoolWelcome.welcome')}</Text>
            <Text variant="heading" style={styles.advisorName}>
              {t('schoolWelcome.mr')} {step1.advisorName ?? 'Ahmad'}
            </Text>
          </View>
          <Image
            source={require('@/assets/images/mascot/rafeeq_waving.png')}
            style={styles.penguin}
            resizeMode="contain"
          />
        </View>

        <Button
          label={t('common.getStarted')}
          onPress={() => router.replace('/(school)/teachers')}
        />

      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  logoRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoEn: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  logoAr: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  welcomeLabel: {
    color: colors.primary,
  },
  advisorName: {
    color: colors.primary,
  },
  penguin: {
    width: 130,
    height: 130,
  },
})
