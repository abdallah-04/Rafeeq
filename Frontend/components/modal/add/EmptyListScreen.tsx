import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import Footer from '@/components/modal/shared/Footer';
import { EmptySlot } from './EmptySlot';
import { router } from 'expo-router';

const { colors, spacing, typography } = theme;

interface EmptyListScreenProps {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    addLabel: string;
    continueRoute: string;
    mascot?: ImageSourcePropType;
    background?: ImageSourcePropType;
    slotCount?: number;
    onAdd: () => void;
    onContinue: () => void;
    onBack?: () => void;
}

export function EmptyListScreen({
    title,
    emptyTitle,
    emptyDesc,
    addLabel,
    mascot,
    background,
    slotCount = 2,
    onAdd,
    onContinue,
    onBack,
}: EmptyListScreenProps) {
    const { t } = useTranslation();
    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <BackButton onPress={router.back} />
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.body}>
                <View style={styles.imageContainer}>
                    {background && (
                        <Image
                            source={background}
                            style={styles.background}
                            resizeMode="cover"
                        />
                    )}
                    <Image
                        source={mascot ?? require('@/assets/images/mascot/rafeeq_clabbing.png')}
                        style={[styles.mascot, background ? styles.mascotOverlap : undefined]}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                <Text style={styles.emptyDesc}>{emptyDesc}</Text>

                <View style={styles.slots}>
                    {Array.from({ length: slotCount }).map((_, i) => (
                        <EmptySlot key={i} onPress={onAdd} />
                    ))}
                </View>

                <Button label={addLabel} onPress={onAdd} style={styles.btn} />
                <Button label={t('common.continue')} onPress={onContinue} variant="outline" style={styles.btn} />

                <Footer
                    onLanguagePress={() => {}}
                    onPrivacyPress={() => {}}
                    onTermsPress={() => {}}
                    currentLanguage="English (US)"
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
        paddingTop: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },

    imageContainer: {
        width: '100%',
        alignItems: 'center',
    },

    background: {
        width: '100%',
        height: 166,
        borderRadius: 16,
    },

    mascot: {
        width: 122,
        height: 122,
    },

    mascotOverlap: {
        marginTop: -122,
    },

    emptyTitle: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
        textAlign: 'center',
    },

    emptyDesc: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.md,
    },

    slots: {
        width: '100%',
        gap: spacing.md,
        marginTop: spacing.sm,
    },

    btn: {
        width: '100%',
        marginTop: spacing.sm,
    },
});
