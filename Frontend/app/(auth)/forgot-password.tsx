import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Radius } from '@/theme';


type Step = 1 | 2 | 3 | 4;


const step1Schema = z.object({
  nationalId: z
    .string()
    .min(1, 'forgotPassword.errors.nationalIdRequired')
    .length(10, 'forgotPassword.errors.nationalIdLength'),
});

const step2Schema = z.object({
  phone: z
    .string()
    .min(1, 'forgotPassword.errors.phoneRequired'),
});

const step3Schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'forgotPassword.errors.passwordTooShort'),
    confirmPassword: z.string().min(1, 'forgotPassword.errors.confirmRequired'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'forgotPassword.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;
type Step3Form = z.infer<typeof step3Schema>;


function StepDots({ current }: { current: Step }) {
  return (
    <View style={styles.dotsRow}>
      {([1, 2, 3] as const).map((s) => (
        <View
          key={s}
          style={[styles.dot, current >= s && styles.dotActive]}
        />
      ))}
    </View>
  );
}


function Step1({ onNext }: { onNext: (id: string) => void }) {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { nationalId: '' },
  });

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>🔍</Text>
      <Text style={styles.stepTitle}>{t('forgotPassword.step1.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('forgotPassword.step1.subtitle')}</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('forgotPassword.step1.label')}</Text>
        <Controller
          control={control}
          name="nationalId"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.nationalId && styles.inputError]}
              placeholder={t('forgotPassword.step1.placeholder')}
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              accessibilityLabel={t('forgotPassword.step1.label')}
            />
          )}
        />
        {errors.nationalId && (
          <Text style={styles.errorText}>{t(errors.nationalId.message!)}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSubmit((d) => onNext(d.nationalId))}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>{t('common.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}


function Step2({
  maskedPhone,
  onNext,
}: {
  maskedPhone: string;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { phone: '' },
  });

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>📱</Text>
      <Text style={styles.stepTitle}>{t('forgotPassword.step2.title')}</Text>
      <Text style={styles.stepSubtitle}>
        {t('forgotPassword.step2.subtitle')} {maskedPhone}
      </Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('forgotPassword.step2.label')}</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder={t('forgotPassword.step2.placeholder')}
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              accessibilityLabel={t('forgotPassword.step2.label')}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.errorText}>{t(errors.phone.message!)}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSubmit(() => onNext())}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>{t('common.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}


function Step3({ onNext }: { onNext: (password: string) => void }) {
  const { t } = useTranslation();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>🔒</Text>
      <Text style={styles.stepTitle}>{t('forgotPassword.step3.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('forgotPassword.step3.subtitle')}</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('forgotPassword.step3.newPasswordLabel')}</Text>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.passwordWrap, errors.newPassword && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('forgotPassword.step3.newPasswordPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showNew}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity onPress={() => setShowNew((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showNew ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.newPassword && (
          <Text style={styles.errorText}>{t(errors.newPassword.message!)}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('forgotPassword.step3.confirmPasswordLabel')}</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.passwordWrap, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('forgotPassword.step3.confirmPasswordPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirm}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{t(errors.confirmPassword.message!)}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSubmit((d) => onNext(d.newPassword))}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>{t('forgotPassword.step3.saveBtn')}</Text>
      </TouchableOpacity>
    </View>
  );
}


function Step4() {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);

  // Auto-navigate back to login after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace('/(auth)/login');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.stepContainer}>
      <View style={styles.successCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>
      <Text style={styles.stepTitle}>{t('forgotPassword.step4.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('forgotPassword.step4.subtitle')}</Text>
      <Text style={styles.countdownText}>
        {t('forgotPassword.step4.returning')} {countdown}s...
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.replace('/(auth)/login')}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>{t('forgotPassword.step4.loginBtn')}</Text>
      </TouchableOpacity>
    </View>
  );
}


export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(1);
  const [nationalId, setNationalId] = useState('');

  const maskedPhone = '******785';

  const slideAnim = useRef(new RNAnimated.Value(0)).current;

  const animateStep = (nextStep: Step) => {
    RNAnimated.sequence([
      RNAnimated.timing(slideAnim, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
      RNAnimated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setStep(nextStep);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => {
              if (step === 1) router.back();
              else animateStep((step - 1) as Step);
            }}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('forgotPassword.screenTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {step < 4 && <StepDots current={step} />}

        <RNAnimated.View
          style={[styles.stepWrapper, { transform: [{ translateY: slideAnim }] }]}
        >
          {step === 1 && (
            <Step1
              onNext={(id) => {
                setNationalId(id);
                animateStep(2);
              }}
            />
          )}
          {step === 2 && (
            <Step2
              maskedPhone={maskedPhone}
              onNext={() => animateStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              onNext={(_password) => {
                // TODO: call API to reset password with nationalId + _password
                animateStep(4);
              }}
            />
          )}
          {step === 4 && <Step4 />}
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textDark,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textDark,
    fontFamily: 'Lexend-SemiBold',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,                          
    borderRadius: 4,
  },

  stepWrapper: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },

  stepIcon: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },

  fieldGroup: {
    width: '100%',
    gap: 6,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    fontFamily: 'Lexend-SemiBold',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
    fontSize: 15,
    color: Colors.textDark,
    fontFamily: 'Lexend-Regular',
    width: '100%',
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: 'Lexend-Regular',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    paddingHorizontal: Spacing.lg,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontFamily: 'Lexend-Regular',
  },
  eyeBtn: {
    padding: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Lexend-Bold',
  },

  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontSize: 36,
    color: Colors.white,
    fontWeight: '700',
  },
  countdownText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'Lexend-Regular',
    marginBottom: Spacing.xl,
  },
});