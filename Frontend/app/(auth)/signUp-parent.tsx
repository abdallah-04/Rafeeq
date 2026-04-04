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
//import Sanad from '@/assets/images/Sanad.png';

const { colors, spacing, typography, radius } = theme;

/* ── Validation ── */
const signupSchema = z
    .object({
        nationalId:      z.string().length(10, 'National ID must be 10 digits'),
        phone:           z.string().min(9, 'Enter a valid phone number'),
        password:        z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

    type FormData = z.infer<typeof signupSchema>;

/* ── Main Screen ── */
export default function SignUpParentScreen() {
    const { t }       = useTranslation();
    const [loading, setLoading] = useState(false);

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
            <BackButton />

            <Text style={styles.title}>Welcome to RAFEEQ</Text>
            <Text style={styles.subtitle}>
                Your child's developmental journey starts here. Log in or sign up to manage their progress.
            </Text>

            {/* Form */}
            <View style={styles.form}>
                {/* National ID */}
                <Controller
                control={control}
                name="nationalId"
                render={({ field: { onChange, value } }) => (
                    <Input
                    label="National ID"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your national ID"
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
                    label="Phone number"
                    value={value}
                    onChangeText={(text) => {
                        // strip +962 if user typed it
                        onChange(text.replace(/^\+962\s?/, ''));
                    }}
                    placeholder="+962  7X  XXX  XXXX"
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
                    label="Create password"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Min. 8 characters"
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
                    label="Confirm password"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Re-enter password"
                    secureEntry
                    errorMsg={errors.confirmPassword?.message}
                    />
                )}
                />

                {/* Continue button */}
                <Button
                label="Continue"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.btn}
                />

                {/* Divider */}
                <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.line} />
                </View>

                {/* Sanad */}
                <TouchableOpacity style={styles.sanad} activeOpacity={0.8}>
                <Image source={require('@/assets/images/Sanad.png')} style={styles.sanadLogo} resizeMode="contain" />
                <Text style={styles.sanadText}>Sign up with Sanad</Text>
                </TouchableOpacity>
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.langBtn}>
                <Text style={styles.footerLink}>🌐 English (US) ∨</Text>
                </TouchableOpacity>
                <View style={styles.footerLinks}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
                <Text style={styles.footerDot}>·</Text>
                <Text style={styles.footerLink}>Terms of Service</Text>
                </View>
            </View>
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