import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
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

type Step = 1 | 2 | 3 | 4;

const step1Schema = z.object({ nationalId: z.string().min(1).length(10) });
const step2Schema = z.object({ phone: z.string().min(1) });
const step3Schema = z
  .object({ newPassword: z.string().min(8), confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
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

function Step1({ onNext }: { onNext: () => void }) {
  const { control, handleSubmit } = useForm({ resolver: zodResolver(step1Schema) });
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>🔍</Text>
      <Text style={styles.stepTitle}>Enter your National ID</Text>
      <Text style={styles.stepDesc}>We'll use it to find your account</Text>
      <Controller
        control={control}
        name="nationalId"
        render={({ field: { onChange, value } }) => (
          <Input value={value} onChangeText={onChange} placeholder="National ID" keyboardType="numeric" />
        )}
      />
      <Button label="Continue" onPress={handleSubmit(() => onNext())} style={styles.btn} />
    </View>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  const { control, handleSubmit } = useForm({ resolver: zodResolver(step2Schema) });
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>📱</Text>
      <Text style={styles.stepTitle}>Verify your phone</Text>
      <Text style={styles.stepDesc}>Enter the phone number on your account</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input value={value} onChangeText={onChange} placeholder="+962 7X XXX XXXX" keyboardType="phone-pad" />
        )}
      />
      <Button label="Send Code" onPress={handleSubmit(() => onNext())} style={styles.btn} />
    </View>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  const { control, handleSubmit } = useForm({ resolver: zodResolver(step3Schema) });
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>🔒</Text>
      <Text style={styles.stepTitle}>New Password</Text>
      <Text style={styles.stepDesc}>Must be at least 8 characters</Text>
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <Input value={value} onChangeText={onChange} placeholder="New password" secureEntry />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input value={value} onChangeText={onChange} placeholder="Confirm password" secureEntry />
        )}
      />
      <Button label="Save Password" onPress={handleSubmit(() => onNext())} style={styles.btn} />
    </View>
  );
}

function Step4() {
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { router.replace('/(auth)/login'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIcon}>✅</Text>
      <Text style={styles.stepTitle}>Password Changed!</Text>
      <Text style={styles.stepDesc}>Redirecting to login in {countdown}s</Text>
      <Button label="Go to Login" onPress={() => router.replace('/(auth)/login')} style={styles.btn} />
    </View>
  );
}

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>(1);
  const slideAnim = useRef(new RNAnimated.Value(0)).current;

  const animateStep = (next: Step) => {
    RNAnimated.sequence([
      RNAnimated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0,   duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton
            onPress={() => {
              if (step === 1) router.back();
              else animateStep((step - 1) as Step);
            }}
          />
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 36 }} />
        </View>

        {step < 4 && <StepDots current={step} />}

        <RNAnimated.View style={{ flex: 1, transform: [{ translateY: slideAnim }] }}>
          {step === 1 && <Step1 onNext={() => animateStep(2)} />}
          {step === 2 && <Step2 onNext={() => animateStep(3)} />}
          {step === 3 && <Step3 onNext={() => animateStep(4)} />}
          {step === 4 && <Step4 />}
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { colors, spacing, typography, radius } = theme;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },

  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  stepIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  stepDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },

  btn: {
    width: '100%',
    marginTop: spacing.xs,
  },
});