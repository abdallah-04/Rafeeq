import React, { useMemo } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, I18nManager } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { createSchoolStep2Schema, SchoolStep2Form } from '@/lib/schemas/schoolSignup'
import { useSchoolSignupStore } from '@/store/schoolSignupStore'
import Footer from '@/components/modal/shared/Footer'
import { Text } from '@/components/modal/shared/Text'
import { Button } from '@/components/modal/shared/Button'
import Card from '@/components/modal/shared/Card'
import Header from '@/components/modal/shared/Header'
import ScreenWrapper from '@/components/modal/shared/ScreenWap'
import { theme } from '@/theme'
import { StatusBar } from 'expo-status-bar'

import { 
  AdvisorPhoneInput, 
  PasswordInput, 
  ConfirmPasswordInput 
} from '@/components/modal/inputs/formInputs';

const { colors, spacing, typography } = theme

export default function SchoolSignupStep2() {
  const { t, i18n } = useTranslation()
  const setStep2 = useSchoolSignupStore((s) => s.setStep2)

  const isRTL = i18n.language === 'ar' || I18nManager.isRTL

  const schema = useMemo(() => createSchoolStep2Schema(t), [t])
  const { control, handleSubmit } = useForm<SchoolStep2Form>({
    resolver: zodResolver(schema),
  })

  const onContinue = (data: SchoolStep2Form) => {
    setStep2(data)
    router.push('/(auth)/verify-school-phone')
  }

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header 
        title={t('schoolSignup.title')} 
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="caption" color="textSecondary" style={[styles.subtitle, isRTL && styles.subtitleRTL]}>
            {t('schoolSignup.step2Subtitle')}
          </Text>

          <Card variant="elevated" padded style={styles.card}>

            <AdvisorPhoneInput 
              control={control} 
              name="advisorPhone"
              label={t('schoolSignup.advisorPhone')}
              placeholder="7X XXX XXXX"
            />

            <PasswordInput 
              control={control} 
              name="password"
              label={t('schoolSignup.createPassword')}
              placeholder="••••••••"
            />

            <ConfirmPasswordInput 
              control={control} 
              name="confirmPassword"
              passwordName="password"
              label={t('schoolSignup.confirmPassword')}
              placeholder="••••••••"
            />

            <Button 
              label={t('common.continue')} 
              onPress={handleSubmit(onContinue)} 
              style={styles.btn} 
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="textMuted">
                {t('common.or')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Text variant="caption" style={[styles.loginText, isRTL && styles.loginTextRTL]}>
              {t('auth.signup.haveAccount')}{' '}
              <Text 
                variant="caption" 
                style={styles.loginLink} 
                onPress={() => router.push('/(auth)/login')}
              >
                {t('common.login')}
              </Text>
            </Text>

          </Card>

          <Footer
            onPrivacyPress={() => {}}
            onTermsPress={() => {}}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  subtitleRTL: {
    textAlign: 'center',
  },
  card: {
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
  },
  btn: {
    marginTop: spacing.md,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  loginText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  loginTextRTL: {
    textAlign: 'center',
  },
  loginLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
})