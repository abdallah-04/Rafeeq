import React, { useMemo } from 'react'
import { View, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
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

const { colors, spacing, typography, radius } = theme

export default function SchoolSignupStep1() {
  const { t, i18n } = useTranslation()
  const setStep1 = useSchoolSignupStore((s) => s.setStep1)
  const isRTL = i18n.language === 'ar'

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(auth)/role-select' as any)
  }

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
        onBack={handleBack}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="caption" color="textSecondary" style={styles.subtitle}>
            {t('schoolSignup.subtitle')}
          </Text>

          <Card variant="elevated" padded style={styles.card}>

            {/* School Name */}
            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>{t('schoolSignup.schoolName')}</Text>
            <Controller
              control={control}
              name="schoolName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL, errors.schoolName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('schoolSignup.schoolNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              )}
            />
            {errors.schoolName && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.schoolName.message}</Text>}

            {/* School ID */}
            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>{t('schoolSignup.schoolId')}</Text>
            <Controller
              control={control}
              name="schoolId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL, errors.schoolId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('schoolSignup.schoolIdPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              )}
            />
            {errors.schoolId && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.schoolId.message}</Text>}

            {/* Advisor Name */}
            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>{t('schoolSignup.advisorName')}</Text>
            <Controller
              control={control}
              name="advisorName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL, errors.advisorName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('schoolSignup.advisorNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              )}
            />
            {errors.advisorName && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.advisorName.message}</Text>}

            {/* Advisor National ID */}
            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>{t('schoolSignup.advisorNationalId')}</Text>
            <Controller
              control={control}
              name="advisorNationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL, errors.advisorNationalId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('schoolSignup.advisorNationalIdPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              )}
            />
            {errors.advisorNationalId && <Text style={[styles.error, isRTL && styles.textRight]}>{errors.advisorNationalId.message}</Text>}

            <Button label={t('common.continue')} onPress={handleSubmit(onContinue)} style={styles.btn} />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="textMuted" style={styles.dividerText}>{t('common.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text variant="caption" style={styles.loginText}>
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
  card: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,

  },
  label: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  textRight: {
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
  loginLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
})
