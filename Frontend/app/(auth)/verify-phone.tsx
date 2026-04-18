import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import OTPInput from '@/components/modal/shared/OTPInput';
import Footer from '@/components/modal/shared/Footer';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

const { colors, spacing, typography, radius } = theme;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

/* ── Resend Timer ── */
function ResendTimer({ onResend }: { onResend: () => void }) {
    const [seconds, setSeconds] = useState(RESEND_SECONDS);

    React.useEffect(() => {
        if (seconds <= 0) return;
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);

    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');

    return (
        <View style={resendStyles.row}>
        <Text style={resendStyles.text}>Didn't receive ? </Text>
        {seconds > 0 ? (
            <Text style={resendStyles.timer}>Resend in {mm}:{ss}</Text>
        ) : (
            <TouchableOpacity onPress={() => { setSeconds(RESEND_SECONDS); onResend(); }}>
            <Text style={resendStyles.link}>Resend code</Text>
            </TouchableOpacity>
        )}
        </View>
    );
    }

    const resendStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    timer: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
    link: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
    });

    /* ── Main Screen ── */
    export default function VerifyPhoneScreen() {
    const { i18n } = useTranslation();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);

    const login = useAuthStore((s) => s.login);

    const isComplete = otp.every((d) => d !== '');

    const handleConfirm = () => {
        if (!isComplete) return;
        setError('');
        setLoading(true);
        setTimeout(() => {
        setLoading(false);
        login({ role: 'parent', language: 'en' } as any, 'mock-token');
        router.replace('/(parent)/' as any);
        }, 1200);
    };

    const handleResend = () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        setError('');
        // TODO: call resend API
    };

    const handleOTPComplete = (completeOtp: string) => {
        console.log('OTP completed:', completeOtp);
        // Optional: auto-submit when OTP is complete
        // handleConfirm();
    };

    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
            <BackButton />
            <Text style={styles.headerTitle}>Welcome to RAFEEQ</Text>
            <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
            {/* Mascot */}
            <View style={styles.mascotWrap}>
            <Image
                source={require('@/assets/images/mascot/rafeeq_like.png')}
                style={styles.mascot}
                resizeMode="contain"
            />
            </View>

            {/* Card */}
            <View style={styles.card}>
            <Text style={styles.cardTitle}>We sent you a code to{'\n'}verify your number</Text>
            <OTPInput
                length={OTP_LENGTH}
                value={otp}
                onChange={setOtp}
                onComplete={handleOTPComplete}
                error={!!error}
            />

            {/* Error */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Trust device checkbox */}
            <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setTrustDevice((v) => !v)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, trustDevice && styles.checkboxChecked]}>
                {trustDevice && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Trust this device for a month</Text>
            </TouchableOpacity>

            {/* Resend */}
            <ResendTimer onResend={handleResend} />

            {/* Confirm button */}
            <Button
                label="Confirm"
                onPress={handleConfirm}
                loading={loading}
                disabled={!isComplete}
                style={styles.btn}
            />
            </View>
            <Footer
                onLanguagePress={() => {}}
                onPrivacyPress={() => {}}
                onTermsPress={() => {}}
                currentLanguage={i18n.language === 'ar' ? 'العربية' : 'English (US)'}
                />
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        paddingTop: spacing.lg,
    },

    mascotWrap: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },

    mascot: {
        width: 140,
        height: 140,
    },

    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        gap: spacing.sm,
    },

    cardTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        lineHeight: 28,
    },

    error: {
        fontSize: typography.fontSize.xs,
        color: colors.error,
        textAlign: 'center',
    },

    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    checkmark: {
        color: colors.textWhite,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
    },

    checkLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
    },

    btn: {
        width: '100%',
        marginTop: spacing.xs,
    },

    footer: {
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xl,
    },

    footerLinks: {
        flexDirection: 'row',
        gap: spacing.sm,
    },

    footerLink: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },

    footerDot: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
    },
});