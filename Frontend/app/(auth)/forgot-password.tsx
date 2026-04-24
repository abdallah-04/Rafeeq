import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Input from '@/components/modal/shared/TextInput';
import BackButton from '@/components/modal/shared/BackButton';
import OTPInput from '@/components/modal/shared/OTPInput';
import { useAuthStore } from '@/store/authStore';
import { apiForgotPassword, apiVerifyOTP, apiResetPassword } from '@/services/api';
import { useModal } from '@/components/modal/ModalProvider';

const { colors, spacing, typography, radius } = theme;

type Step = 1 | 2 | 3 | 4;

const RESEND_SECONDS = 60;

const step1Schema = z.object({
  nationalId: z.string().length(10, 'forgotPassword.errors.nationalIdLength'),
});

const step3Schema = z
  .object({
    newPassword: z.string().min(8, 'forgotPassword.errors.passwordTooShort'),
    confirmPassword: z.string().min(1, 'forgotPassword.errors.confirmRequired'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'forgotPassword.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

function StepDots({ current }: { current: Step }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={[styles.dot, current >= s && styles.dotActive]} />
      ))}
    </View>
  );
}

function ResendTimer({ onResend }: { onResend: () => void }) {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <View style={styles.resendRow}>
      <Text style={styles.resendText}>{t('auth.otp.didntReceive')} </Text>
      {seconds > 0 ? (
        <Text style={styles.resendLink}>
          {t('auth.otp.resendIn')} {mm}:{ss}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setSeconds(RESEND_SECONDS);
            onResend();
          }}
        >
          <Text style={styles.resendLink}>{t('auth.otp.resend')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Step1({
  onNext,
  setNationalId,
}: {
  onNext: () => void;
  setNationalId: (id: string) => void;
}) {
  const { show } = useModal();
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { nationalId: '' },
  });

  const onSubmit = async (data: { nationalId: string }) => {
    setLoading(true);
    try {
      await apiForgotPassword(data.nationalId);
      setNationalId(data.nationalId);
      onNext();
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stepCard}>
      <View style={styles.iconBadge}>
        <Text style={styles.iconText}>🔍</Text>
      </View>
      <Text style={[styles.stepTitle, isRTL && styles.textRight]}>{t('forgotPassword.step1.title')}</Text>
      <Text style={[styles.stepDesc, isRTL && styles.textRight]}>{t('forgotPassword.step1.subtitle')}</Text>
      <Controller
        control={control}
        name="nationalId"
        render={({ field: { onChange, value } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            label={t('forgotPassword.step1.label')}
            placeholder={t('forgotPassword.step1.placeholder')}
            keyboardType="numeric"
            errorMsg={errors.nationalId ? t(errors.nationalId.message ?? '') : undefined}
          />
        )}
      />
      <Button
        label={t('common.continue')}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.btn}
      />
    </View>
  );
}

function Step2({
  onNext,
  nationalId,
  setOtpCode,
}: {
  onNext: () => void;
  nationalId: string;
  setOtpCode: (code: string) => void;
}) {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(''));
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const isComplete = otp.every((d) => d !== '');

  const handleVerify = async () => {
    if (!isComplete) return;
    setOtpError('');
    setLoading(true);
    try {
      const code = otp.join('');
      await apiVerifyOTP(nationalId, code);
      setOtpCode(code);
      onNext();
    } catch (err: any) {
      setOtpError(err?.message ?? t('auth.otp.invalidCode', 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(Array(4).fill(''));
    setOtpError('');
    try {
      await apiForgotPassword(nationalId);
    } catch {}
  };

  return (
    <View style={styles.stepCard}>
      <View style={styles.iconBadge}>
        <Text style={styles.iconText}>📱</Text>
      </View>
      <Text style={[styles.stepTitle, isRTL && styles.textRight]}>{t('forgotPassword.step2.title')}</Text>
      <Text style={[styles.stepDesc, isRTL && styles.textRight]}>{t('forgotPassword.step2.subtitle')}</Text>

      <OTPInput
        length={4}
        value={otp}
        onChange={setOtp}
        onComplete={() => {}}
        error={!!otpError}
      />
      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

      <ResendTimer onResend={handleResend} />

      <Button
        label={t('forgotPassword.step2.sendCode', 'Verify Code')}
        onPress={handleVerify}
        loading={loading}
        disabled={!isComplete}
        style={styles.btn}
      />
    </View>
  );
}

function Step3({
  onNext,
  nationalId,
  otpCode,
}: {
  onNext: () => void;
  nationalId: string;
  otpCode: string;
}) {
  const { show } = useModal();
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      await apiResetPassword({
        nationalId,
        otpCode,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      onNext();
    } catch (err: any) {
      show('error', { variant: 'invalidInfo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stepCard}>
      <View style={styles.iconBadge}>
        <Text style={styles.iconText}>🔒</Text>
      </View>
      <Text style={[styles.stepTitle, isRTL && styles.textRight]}>{t('forgotPassword.step3.title')}</Text>
      <Text style={[styles.stepDesc, isRTL && styles.textRight]}>{t('forgotPassword.step3.subtitle')}</Text>

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            label={t('forgotPassword.step3.newPasswordLabel')}
            placeholder={t('forgotPassword.step3.newPasswordPlaceholder')}
            secureEntry
            errorMsg={errors.newPassword ? t(errors.newPassword.message ?? '') : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            label={t('forgotPassword.step3.confirmPasswordLabel')}
            placeholder={t('forgotPassword.step3.confirmPasswordPlaceholder')}
            secureEntry
            errorMsg={errors.confirmPassword ? t(errors.confirmPassword.message ?? '') : undefined}
          />
        )}
      />
      <Button
        label={t('forgotPassword.step3.saveBtn')}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.btn}
      />
    </View>
  );
}

function Step4() {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          router.replace('/(auth)/login');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.stepCard, styles.successCard]}>
      <View style={styles.iconBadge}>
        <Text style={styles.iconText}>✅</Text>
      </View>
      <Text style={[styles.stepTitle, isRTL && styles.textRight]}>{t('forgotPassword.step4.title')}</Text>
      <Text style={[styles.stepDesc, isRTL && styles.textRight]}>{t('forgotPassword.step4.subtitle')}</Text>
      <Text style={styles.countdownText}>
        {t('forgotPassword.step4.returning')} {countdown}s
      </Text>
      <Button
        label={t('forgotPassword.step4.loginBtn')}
        onPress={() => router.replace('/(auth)/login')}
        style={styles.btn}
      />
    </View>
  );
}

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const isRTL = useAuthStore((s) => s.isRTL);
  const [step, setStep] = useState<Step>(1);
  const [nationalId, setNationalId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const slideAnim = useRef(new RNAnimated.Value(0)).current;

  const animateStep = (next: Step) => {
    RNAnimated.sequence([
      RNAnimated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const handleBack = () => {
    if (step === 1) {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/(auth)/login' as any);
      return;
    }
    animateStep((step - 1) as Step);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <BackButton onPress={handleBack} />
          <Text style={styles.headerTitle}>{t('forgotPassword.screenTitle')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
          {step < 4 && <StepDots current={step} />}

          <RNAnimated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
            {step === 1 && <Step1 onNext={() => animateStep(2)} setNationalId={setNationalId} />}
            {step === 2 && (
              <Step2
                onNext={() => animateStep(3)}
                nationalId={nationalId}
                setOtpCode={setOtpCode}
              />
            )}
            {step === 3 && (
              <Step3
                onNext={() => animateStep(4)}
                nationalId={nationalId}
                otpCode={otpCode}
              />
            )}
            {step === 4 && <Step4 />}
          </RNAnimated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  content: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  successCard: {
    alignItems: 'center',
  },
  iconBadge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: 34,
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  btn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  countdownText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
