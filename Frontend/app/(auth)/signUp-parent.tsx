import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Footer from '@/components/modal/shared/Footer';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Input from '@/components/modal/shared/TextInput';
import BackButton from '@/components/modal/shared/BackButton';
import { useAuthStore } from '@/store/authStore';
import { apiRegisterParent, apiForgotPassword } from '@/services/api';
import type { UserRole } from '@/types';

const { colors, spacing, typography, radius } = theme;

const createSignupSchema = (t: TFunction) =>
  z
    .object({
      nationalId:      z.string().length(10, t('validation.nationalId10Digits')),
      phone:           z.string().min(9,  t('validation.validJordanianNumber')),
      fullNameAr:      z.string().min(2,  t('validation.fullNameRequired')),
      password:        z.string().min(8,  t('validation.passwordMin8')),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('validation.passwordsNoMatch'),
      path: ['confirmPassword'],
    });

export default function SignUpParentScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const signupSchema = useMemo(() => createSignupSchema(t), [t]);
  type FormData = z.infer<typeof signupSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nationalId: '', phone: '', fullNameAr: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiRegisterParent({
        nationalId: data.nationalId,
        phone:      `+962${data.phone}`,
        fullNameAr: data.fullNameAr,
        email:      `${data.nationalId}@rafeeq.app`, // placeholder — no email field in UI
        password:   data.password,
      });

      await AsyncStorage.setItem('rafeeq-refresh-token', res.refreshToken ?? '');

      const rawRole = res.role?.replace('ROLE_', '').toLowerCase() as UserRole;
      login(
        {
          id: '', name: '', nameAr: data.fullNameAr, phone: `+962${data.phone}`,
          nationalId: data.nationalId, role: rawRole,
          language: i18n.language as 'en' | 'ar', createdAt: new Date().toISOString(),
        } as any,
        res.accessToken
      );

      // Trigger OTP generation then navigate to verify screen
      try { await apiForgotPassword(data.nationalId); } catch { /* ignore */ }
      router.push('/(auth)/verify-phone');
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err?.message ?? t('auth.signup.failed', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton onPress={router.back} />
          <Text style={styles.title}>{t('auth.signup.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>

          <View style={styles.form}>
            {/* Full Name (Arabic) */}
            <Controller
              control={control}
              name="fullNameAr"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.signup.fullName', 'Full Name')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.signup.fullNamePlaceholder', 'Your full name')}
                  errorMsg={errors.fullNameAr?.message}
                />
              )}
            />

            {/* National ID */}
            <Controller
              control={control}
              name="nationalId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.signup.nationalId')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.signup.nationalIdPlaceholder')}
                  keyboardType="numeric"
                  errorMsg={errors.nationalId?.message}
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.signup.phone')}
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/^\+962\s?/, ''))}
                  placeholder={t('auth.signup.phonePlaceholder')}
                  keyboardType="phone-pad"
                  errorMsg={errors.phone?.message}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.signup.createPassword')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  secureEntry
                  errorMsg={errors.password?.message}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('auth.signup.confirmPassword')}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  secureEntry
                  errorMsg={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              label={t('common.continue')}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btn}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t('auth.signup.orContinueWith')}</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.sanad} activeOpacity={0.8}>
              <Image source={require('@/assets/images/Sanad.png')} style={styles.sanadLogo} resizeMode="contain" />
              <Text style={styles.sanadText}>{t('auth.signup.sanad')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t('auth.signup.haveAccount')}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>{t('common.login')}</Text>
            </TouchableOpacity>
          </View>

          <Footer onPrivacyPress={() => {}} onTermsPress={() => {}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.background },
  scroll:       { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  title:        { fontSize: typography.fontSize['2xl'], fontFamily: typography.fontFamily.bold, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  subtitle:     { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.regular, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  form:         { gap: spacing.sm },
  btn:          { width: '100%', marginTop: spacing.xs },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  line:         { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText:  { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.medium, color: colors.textMuted, letterSpacing: 0.5 },
  sanad:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, height: 52, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg },
  sanadLogo:    { width: 50, height: 50 },
  sanadText:    { fontSize: typography.fontSize.base, fontFamily: typography.fontFamily.medium, color: colors.textPrimary },
  loginRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  loginText:    { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  loginLink:    { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semiBold, color: colors.primary },
});
