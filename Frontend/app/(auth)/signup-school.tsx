import React, { useMemo } from 'react'
import { View, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, I18nManager } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { createSchoolStep1Schema, SchoolStep1Form } from '@/lib/schemas/schoolSignup'
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
    SchoolNameInput, 
  SchoolIdInput, 
  AdvisorNameInput,
  NationalIdInput 
} from '@/components/modal/inputs/formInputs';
const { colors, spacing, typography, radius } = theme

export default function SchoolSignupStep1() {
  const { t, i18n } = useTranslation()
  const setStep1 = useSchoolSignupStore((s) => s.setStep1)

  const isRTL = i18n.language === 'ar' || I18nManager.isRTL

  const schema = useMemo(() => createSchoolStep1Schema(t), [t])
  const { control, handleSubmit, formState: { errors } } = useForm<SchoolStep1Form>({
    resolver: zodResolver(schema),
  })

  const onContinue = (data: SchoolStep1Form) => {
    setStep1(data)
    router.push('/(auth)/signup-school-2')
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
          <Text style={styles.subtitle}>{t('schoolSignup.subtitle')}</Text>
          <Card style={styles.card}>
              {/* School Name */}
            <SchoolNameInput 
              control={control} 
              name="schoolName" 
            />
            {/* School ID */}
            <SchoolIdInput 
              control={control} 
              name="schoolId" 
            />
            {/* Advisor Name */}
            <AdvisorNameInput 
              control={control}
              name="advisorName"
            />

            {/* Advisor National ID */}
            <NationalIdInput 
              control={control}
              name="advisorNationalId"
            />
            <Button label={t('common.continue')} onPress={handleSubmit(onContinue)} style={styles.btn} />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="textMuted" style={styles.dividerText}>
                {t('common.or')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login link*/}
            <Text style={[styles.loginText, isRTL && styles.loginTextRTL]}>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  subtitle: {
    marginTop: -20,
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
    marginBottom: -9, 
  },
  label: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  labelRTL: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.regular,
  },
  errorRTL: {
    textAlign: 'right',
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
  dividerText: {
    paddingHorizontal: spacing.xs,
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