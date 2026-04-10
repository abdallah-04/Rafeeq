import React from 'react'
import { View, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { schoolStep1Schema, SchoolStep1Form } from '@/lib/schemas/schoolSignup'
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
  const { t } = useTranslation()
  const setStep1 = useSchoolSignupStore((s) => s.setStep1)

  const { control, handleSubmit, formState: { errors } } = useForm<SchoolStep1Form>({
    resolver: zodResolver(schoolStep1Schema),
  })

  const onContinue = (data: SchoolStep1Form) => {
    setStep1(data)
    router.push('/(auth)/signup-school-2')
  }

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header
        title={t('Welcome to Rafeeq')}
        //subtitle={t('schoolSignup.subtitle')}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <Card variant="elevated" padded style={styles.card}>

            {/* School Name */}
            <Text variant="label" style={styles.label}>{t('School Name')}</Text>
            <Controller
              control={control}
              name="schoolName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.schoolName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('Enter your school name')}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
            {errors.schoolName && <Text style={styles.error}>{errors.schoolName.message}</Text>}

            {/* School ID */}
            <Text variant="label" style={styles.label}>{t('school Id')}</Text>
            <Controller
              control={control}
              name="schoolId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.schoolId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('Enter your school ID')}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
            {errors.schoolId && <Text style={styles.error}>{errors.schoolId.message}</Text>}

            {/* Advisor Name */}
            <Text variant="label" style={styles.label}>{t('Advisor Name')}</Text>
            <Controller
              control={control}
              name="advisorName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.advisorName && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('Enter advisor name')}
                  placeholderTextColor={colors.textMuted}
                />
              )}
            />
            {errors.advisorName && <Text style={styles.error}>{errors.advisorName.message}</Text>}

            {/* Advisor National ID */}
            <Text variant="label" style={styles.label}>{t('`Advisor National Id')}</Text>
            <Controller
              control={control}
              name="advisorNationalId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.advisorNationalId && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="0000000000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
              )}
            />
            {errors.advisorNationalId && <Text style={styles.error}>{errors.advisorNationalId.message}</Text>}

            <Button label={t('common.continue')} onPress={handleSubmit(onContinue)} style={styles.btn} />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="textMuted" style={styles.dividerText}>{t('common.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text variant="caption" style={styles.loginText}>
              {t('Already Have an account?')}{' '}
              <Text
                variant="caption"
                style={styles.loginLink}
                onPress={() => router.push('/(auth)/login')}
              >
                {t('log In')}
              </Text>
            </Text>

          </Card>

          <Footer
            onLanguagePress={() => {}}
            onPrivacyPress={() => {}}
            onTermsPress={() => {}}
            currentLanguage="English (US)"
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
  label: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
