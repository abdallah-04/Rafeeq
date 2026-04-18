import React, { useMemo, useState } from 'react';
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
import { TFunction } from 'i18next';
import { StatusBar } from 'expo-status-bar';
import Footer from '@/components/modal/shared/Footer';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import Input from '@/components/modal/shared/TextInput';
import BackButton from '@/components/modal/shared/BackButton';

const { colors, spacing, typography, radius } = theme;

/* ── Bilingual Validation schema ── */
const createSignupSchema = (t: TFunction) =>
    z
        .object({
            nationalId:      z.string().length(10, t('validation.nationalId10Digits')),
            phone:           z.string().min(9,  t('validation.validJordanianNumber')),
            password:        z.string().min(8,  t('validation.passwordMin8')),
            confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
            message: t('validation.passwordsNoMatch'),
            path: ['confirmPassword'],
        });

/* ── Main Screen ── */
export default function SignUpParentScreen() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);

    const signupSchema = useMemo(() => createSignupSchema(t), [t]);
    type FormData = z.infer<typeof signupSchema>;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { nationalId: '', phone: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        // TODO: call API
        setTimeout(() => {
        setLoading(false);
        router.push('/(auth)/verify-phone');
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            >
            {/* Header */}
            <BackButton onPress={router.back} />

            <Text style={styles.title}>{t('auth.signup.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>

            {/* Form */}
            <View style={styles.form}>
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
                    onChangeText={(text) => {
                        // strip +962 if user typed it
                        onChange(text.replace(/^\+962\s?/, ''));
                    }}
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

                {/* Continue button */}
                <Button
                label={t('common.continue')}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.btn}
                />

                {/* Divider */}
                <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>{t('auth.signup.orContinueWith')}</Text>
                <View style={styles.line} />
                </View>

                {/* Sanad */}
                <TouchableOpacity style={styles.sanad} activeOpacity={0.8}>
                <Image source={require('@/assets/images/Sanad.png')} style={styles.sanadLogo} resizeMode="contain" />
                <Text style={styles.sanadText}>{t('auth.signup.sanad')}</Text>
                </TouchableOpacity>
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
                <Text style={styles.loginText}>{t('auth.signup.haveAccount')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>{t('common.login')}</Text>
                </TouchableOpacity>
            </View>

            <Footer
                onLanguagePress={() => {}}
                onPrivacyPress={() => {}}
                onTermsPress={() => {}}
                currentLanguage={i18n.language === 'ar' ? 'العربية' : 'English (US)'}
            />

            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

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

    title: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },

    subtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },

    form: {
        gap: spacing.sm,
    },

    btn: {
        width: '100%',
        marginTop: spacing.xs,
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
        fontFamily: typography.fontFamily.medium,
        color: colors.textMuted,
        letterSpacing: 0.5,
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
        width: 50,
        height: 50,
        },

    sanadText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
    },

    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },

    loginText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },

    loginLink: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },

    footer: {
        alignItems: 'center',
        gap: spacing.xs,
    },

    langBtn: {
        paddingVertical: spacing.xs,
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
