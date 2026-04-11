import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Text } from '@/components/modal/shared/Text';
import BottomNav from '@/components/modal/shared/BottomNav';
import ScreenWrapper from '@/components/modal/shared/ScreenWap';
import Avatar from '@/components/modal/shared/Avatar';
import { theme } from '@/theme';

const { colors, spacing, typography, radius } = theme;

const PARENT_NAME = 'Ayoub';

export default function ProfileScreen() {
    return (
        <ScreenWrapper padded={false}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text variant="heading" style={styles.title}>Profile</Text>
            </View>

            <View style={styles.body}>
                <Avatar name={PARENT_NAME} size="lg" />
                <Text variant="body" style={styles.name}>{PARENT_NAME}</Text>
                <Text variant="caption" style={styles.role}>Parent</Text>

                <View style={styles.divider} />

                <Image
                    source={require('@/assets/images/icons/account.png')}
                    style={styles.icon}
                />
                <Text variant="caption" style={styles.hint}>
                    Profile settings coming soon…
                </Text>
            </View>

            <BottomNav />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    name: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
        marginTop: spacing.sm,
    },
    role: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
    },
    divider: {
        width: '40%',
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    icon: {
        width: 48,
        height: 48,
        tintColor: colors.primary,
        opacity: 0.5,
    },
    hint: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        opacity: 0.6,
    },
});
