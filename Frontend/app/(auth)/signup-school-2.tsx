import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createSchoolStep2Schema, SchoolStep2Form } from '@/lib/schemas/schoolSignup';
import { useSchoolSignupStore } from '@/store/schoolSignupStore';
import Footer from '@/components/modal/shared/Footer';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Card from '@/components/modal/shared/Card';
import Header from '@/components/modal/shared/Header';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import { theme } from '@/theme';
import { StatusBar } from 'expo-status-bar';

const { colors, spacing, typography, radius } = theme;

export default function SchoolSignupStep2() {
  const { t, i18n } = useTranslation();
  const setStep2 = useSchoolSignupStore((s) => s.setStep2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(auth)/signup-school' as any);
  };

  const schema = useMemo(() => createSchoolStep2Schema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolStep2Form>({
    resolver: zodResolver(schema),
  });

  const onContinue = (data: SchoolStep2Form) => {
    setStep2(data);
    router.push('/(auth)/verify-school-phone');
  };

  return (
    <ScreenWrapper scroll={false} padded={false}>
      <StatusBar style="dark" />
      <Header title={t('schoolSignup.title')} onBack={handleBack} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="caption" color="textSecondary" style={styles.subtitle}>
            {t('schoolSignup.step2Subtitle')}
          </Text>

          <Card variant="elevated" padded style={styles.card}>
            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>
              {t('schoolSignup.advisorPhone')}
            </Text>
            <Controller
              control={control}
              name="advisorPhone"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.phoneRow, isRTL && styles.rowReverse, errors.advisorPhone && styles.inputError]}>
                  <Text style={styles.prefix}>+962</Text>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={[styles.phoneInput, isRTL && styles.inputRTL]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="7X XXX XXXX"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={9}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
              )}
            />
            {errors.advisorPhone && (
              <Text style={[styles.error, isRTL && styles.textRight]}>{errors.advisorPhone.message}</Text>
            )}

            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>
              {t('schoolSignup.createPassword')}
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.passwordRow, isRTL && styles.rowReverse, errors.password && styles.inputError]}>
                  <TextInput
                    style={[styles.passwordInput, isRTL && styles.inputRTL]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                    <Image
                      source={
                        showPassword
                          ? require('@/assets/images/icons/hidden.png')
                          : require('@/assets/images/icons/eye.png')
                      }
                      style={styles.eyeIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={[styles.error, isRTL && styles.textRight]}>{errors.password.message}</Text>
            )}

            <Text variant="label" style={[styles.label, isRTL && styles.textRight]}>
              {t('schoolSignup.confirmPassword')}
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.passwordRow,
                    isRTL && styles.rowReverse,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={[styles.passwordInput, isRTL && styles.inputRTL]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirm}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                    <Image
                      source={
                        showConfirm
                          ? require('@/assets/images/icons/hidden.png')
                          : require('@/assets/images/icons/eye.png')
                      }
                      style={styles.eyeIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={[styles.error, isRTL && styles.textRight]}>{errors.confirmPassword.message}</Text>
            )}

            <Button label={t('common.continue')} onPress={handleSubmit(onContinue)} style={styles.btn} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="caption" color="textMuted">
                {t('common.or')}
              </Text>
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

          <Footer onPrivacyPress={() => {}} onTermsPress={() => {}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
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
    gap: spacing.xs,
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
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  prefix: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  inputRTL: {
    writingDirection: 'rtl',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: colors.textMuted,
    marginStart: spacing.sm,
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
  loginText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
});
