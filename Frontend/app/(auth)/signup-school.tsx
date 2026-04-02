import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { schoolStep1Schema, SchoolStep1Form } from '@/lib/schemas/schoolSignup'
import { useSchoolSignupStore } from '@/store/schoolSignupStore'
import React from 'react'

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('schoolSignup.title')}</Text>
      <Text style={styles.subtitle}>{t('schoolSignup.subtitle')}</Text>

      <View style={styles.card}>

        <Text style={styles.label}>{t('schoolSignup.schoolName')}</Text>
        <Controller
          control={control}
          name="schoolName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.schoolName && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder={t('schoolSignup.schoolNamePlaceholder')}
            />
          )}
        />
        {errors.schoolName && <Text style={styles.error}>{errors.schoolName.message}</Text>}

        <Text style={styles.label}>{t('schoolSignup.schoolId')}</Text>
        <Controller
          control={control}
          name="schoolId"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.schoolId && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder={t('schoolSignup.schoolIdPlaceholder')}
              keyboardType="default"
            />
          )}
        />
        {errors.schoolId && <Text style={styles.error}>{errors.schoolId.message}</Text>}

        <Text style={styles.label}>{t('schoolSignup.advisorName')}</Text>
        <Controller
          control={control}
          name="advisorName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.advisorName && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder={t('schoolSignup.advisorNamePlaceholder')}
            />
          )}
        />
        {errors.advisorName && <Text style={styles.error}>{errors.advisorName.message}</Text>}

        <Text style={styles.label}>{t('schoolSignup.advisorNationalId')}</Text>
        <Controller
          control={control}
          name="advisorNationalId"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.advisorNationalId && styles.inputError]}
              onChangeText={onChange}
              value={value}
              placeholder="0000000000"
              keyboardType="numeric"
              maxLength={10}
            />
          )}
        />
        {errors.advisorNationalId && <Text style={styles.error}>{errors.advisorNationalId.message}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onContinue)}>
          <Text style={styles.buttonText}>{t('common.continue')}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('common.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.loginText}>
          {t('schoolSignup.alreadyHaveAccount')}{' '}
          <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
            {t('common.logIn')}
          </Text>
        </Text>

      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFF',
    padding: 24,
  },
  title: {
    fontFamily: 'Lexend',
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Lexend',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontFamily: 'Lexend',
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F1F5FB',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    fontFamily: 'Lexend',
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'Lexend',
  },
  button: {
    backgroundColor: '#508DF7',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#508DF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontFamily: 'Lexend',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: 'Lexend',
    fontSize: 12,
    color: '#94A3B8',
  },
  loginText: {
    textAlign: 'center',
    fontFamily: 'Lexend',
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    color: '#508DF7',
    fontWeight: '700',
  },
})