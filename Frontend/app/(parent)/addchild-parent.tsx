import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';
import { Button } from '@/components/modal/shared/Button';
import BackButton from '@/components/modal/shared/BackButton';
import { useModal } from '@/components/modal/ModalProvider';
import Footer from '@/components/modal/shared/Footer';

const { colors, spacing, typography, radius } = theme;

/* ── Dashed placeholder slot ── */
function EmptySlot({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.slot} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.slotCircle}>
            <Text style={styles.slotPlus}>+</Text>
        </View>
        <View style={styles.slotLines}>
            <View style={styles.slotLine} />
            <View style={[styles.slotLine, { width: '55%' }]} />
        </View>
        </TouchableOpacity>
    );
    }

    /* ── Screen ── */
    export default function MyChildrenEmptyScreen() {
    const { show } = useModal();

    const handleAdd = () => show('addChild');

    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
            <BackButton />
            <Text style={styles.headerTitle}>My children</Text>
            <View style={{ width: 36 }} />
        </View>

        <View style={styles.body}>
            {/* Mascot */}
            <Image
            source={require('@/assets/images/mascot/rafeeq_clabbing.png')}
            style={styles.mascot}
            resizeMode="contain"
            />

            {/* Empty message */}
            <Text style={styles.emptyTitle}>Its a little quiet here !</Text>
            <Text style={styles.emptyDesc}>
            You haven't added any children yet add your first child to start learning journey with Rafeeq
            </Text>

            {/* Dashed slots */}
            <View style={styles.slots}>
            <EmptySlot onPress={handleAdd} />
            <EmptySlot onPress={handleAdd} />
            </View>

            {/* CTA */}
            <Button
            label="Add your first child"
            onPress={handleAdd}
            style={styles.btn}
            />
            <Button
                label="Continue"
                onPress={() => router.push('/(parent)/myChildren')}
                variant="outline"
                style={styles.btn}
            />

            {/* Footer */}
            <Footer
                onLanguagePress={() => {}}
                onPrivacyPress={() => {}}
                onTermsPress={() => {}}
                currentLanguage="English (US)"  />
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

    mascot: {
        width: 110,
        height: 110,
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

    slot: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: radius.xl,
        padding: spacing.md,
        gap: spacing.md,
    },

    slotCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },

    slotPlus: {
        fontSize: 22,
        color: colors.primary,
    },

    slotLines: {
        flex: 1,
        gap: spacing.xs,
    },

    slotLine: {
        height: 10,
        backgroundColor: colors.backgroundLight,
        borderRadius: radius.full,
        width: '75%',
    },

    btn: {
        width: '100%',
        marginTop: spacing.sm,
    },

    footer: {
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: 'auto',
        paddingBottom: spacing.lg,
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