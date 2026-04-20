import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import OTPInput from '@/components/modal/shared/OTPInput';
import Footer from '@/components/modal/shared/Footer';
import { useAuthStore } from '@/store/authStore';
import { useSchoolSignupStore } from '@/store/schoolSignupStore';
import { apiRegisterSchool, apiVerifyOTP, apiResendOTP } from '@/services/api';
import type { UserRole } from '@/types';

const { colors, spacing, typography, radius } = theme;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

function ResendTimer({ onResend }: { onResend: () => void }) {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <View style={resendStyles.row}>
      <Text style={resendStyles.text}>{t('auth.otp.didntReceive')} </Text>
      {seconds > 0 ? (
        <Text style={resendStyles.timer}>{t('auth.otp.resendIn')} {mm}:{ss}</Text>
      ) : (
        <TouchableOpacity onPress={() => { setSeconds(RESEND_SECONDS); onResend(); }}>
          <Text style={resendStyles.link}>{t('auth.otp.resend')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const resendStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  text:  { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  timer: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semiBold, color: colors.primary },
  link:  { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.semiBold, color: colors.primary },
});

export default function VerifySchoolPhoneScreen() {
  const [otp, setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [registering, setRegistering] = useState(false);

  const { t, i18n } = useTranslation();
  const login       = useAuthStore((s) => s.login);
  const { step1, step2, clearSignup } = useSchoolSignupStore();

  const phone      = step2.advisorPhone ? `+962${step2.advisorPhone}` : '';
  const nationalId = step1.advisorNationalId ?? '';

  const isComplete = otp.every((d) => d !== '');

  // Step 1: Register the school (called once when this screen mounts, if not done)
  // We register on confirm so the OTP just sent is from the backend
  const handleConfirm = async () => {
    if (!isComplete) return;
    setError('');
    setLoading(true);
    try {
      const code = otp.join('');

      // If school not registered yet, register now then verify
      // Otherwise just verify
      if (!registering) {
        setRegistering(true);
        const res = await apiRegisterSchool({
          nationalId:  nationalId,
          phone:       phone,
          email:       `${nationalId}@rafeeq.app`,
          password:    step2.password ?? '',
          nameAr:      step1.schoolName ?? '',
          nameEn:      step1.schoolName ?? '',
          location:    'Jordan',
        });

        await AsyncStorage.setItem('rafeeq-refresh-token', res.refreshToken ?? '');
        const rawRole = res.role?.replace('ROLE_', '').toLowerCase() as UserRole;

        login(
          {
            id: '', name: step1.advisorName ?? '', nameAr: step1.advisorName ?? '',
            phone, nationalId, role: rawRole,
            language: i18n.language as 'en' | 'ar', createdAt: new Date().toISOString(),
          } as any,
          res.accessToken
        );
        clearSignup();
      }

      // Verify the OTP
      await apiVerifyOTP(nationalId, code, trustDevice);
      router.replace('/(school)/add-teacher-empty');
    } catch (err: any) {
      setError(err?.message ?? t('auth.otp.invalidCode', 'Invalid or expired code'));
      setRegistering(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    try {
      await apiResendOTP(nationalId);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err?.message ?? 'Could not resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('roleSelect.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.mascotWrap}>
          <Image
            source={require('@/assets/images/mascot/rafeeq_like.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.otp.subtitle')}</Text>
          <OTPInput
            length={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            onComplete={() => {}}
            error={!!error}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setTrustDevice((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, trustDevice && styles.checkboxChecked]}>
              {trustDevice && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>{t('auth.otp.trustDevice')}</Text>
          </TouchableOpacity>

          <ResendTimer onResend={handleResend} />

          <Button
            label={t('auth.otp.confirmButton')}
            onPress={handleConfirm}
            loading={loading}
            disabled={!isComplete}
            style={styles.btn}
          />
        </View>
        <Footer onPrivacyPress={() => {}} onTermsPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: colors.background },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:      { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.textPrimary },
  body:             { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  mascotWrap:       { alignItems: 'center', marginBottom: spacing.lg },
  mascot:           { width: 140, height: 140 },
  card:             { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: spacing.sm },
  cardTitle:        { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.textPrimary, textAlign: 'center', lineHeight: 28 },
  error:            { fontSize: typography.fontSize.xs, color: colors.error, textAlign: 'center' },
  checkRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox:         { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked:  { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark:        { color: colors.textWhite, fontSize: 12, fontFamily: typography.fontFamily.bold },
  checkLabel:       { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.regular, color: colors.textSecondary },
  btn:              { width: '100%', marginTop: spacing.xs },
});
