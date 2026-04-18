import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Input from '@/components/modal/shared/TextInput';
import BackButton from '@/components/modal/shared/BackButton';
import { useAuthStore } from '@/store/authStore';
import Footer from '@/components/modal/shared/Footer';

const loginSchema = z.object({
  identifier: z.string().min(5),
  password:   z.string().min(6),
});

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    setTimeout(() => {
      login({ role: 'parent', language: 'en' } as any, 'token');
      setIsLoading(false);
      router.replace('/(parent)/' as any);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <BackButton onPress={() => router.back()} />

          {/* Mascot */}
          <View style={styles.mascotWrap}>
            <Image source={require('@/assets/images/mascot/rafeeq_like.png')} style={{ width: 120, height: 120 }} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.login.nationalId')}
                  keyboardType="numeric"
                  errorMsg={errors.identifier ? t(errors.identifier.message!) : undefined}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('auth.login.password')}
                  secureEntry
                  errorMsg={errors.password ? t(errors.password.message!) : undefined}
                />
              )}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgot}>{t('auth.login.forgotPassword')}</Text>
            </TouchableOpacity>

            <Button
              label={t('auth.login.loginButton')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.btn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t('common.orContinueWith')}</Text>
              <View style={styles.line} />
            </View>

            {/* Sanad */}
            {/* <TouchableOpacity style={styles.sanad}>
              <Text style={styles.sanadFlag}>🇯🇴</Text>
              <Text style={styles.sanadText}>{t('auth.login.sanad')}</Text>
            </TouchableOpacity> */}

            <TouchableOpacity 
              style={styles.sanad}
              activeOpacity={0.7}
              onPress={() => {
                // TODO: Implement Sanad login
                console.log('Sanad login pressed');
              }}
            >
              <Image 
                source={require('@/assets/images/Sanad.png')} 
                style={styles.sanadLogo} 
                resizeMode="contain"
              />
              <Text style={styles.sanadText}>{t('auth.login.sanad')}</Text>
            </TouchableOpacity>
          </View>

          {/* Signup link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>{t('auth.login.noAccount')} </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/role-select')}>
              <Text style={styles.signupLink}>{t('auth.login.signUp')}</Text>
            </TouchableOpacity>
          </View>

          <Footer
            onPrivacyPress={() => {}}
            onTermsPress={() => {}}
            />
        </ScrollView>
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

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  mascotWrap: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },

  // mascotEmoji: {
  //   fontSize: 72,
  // },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  form: {
    gap: 14,
  },

  forgot: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'right',
    fontFamily: typography.fontFamily.medium,
  },

  btn: {
    width: '100%',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },

  sanad: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  sanadLogo: {
      width: 55,
      height: 55,
    },


  sanadText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },

  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  signupLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
});