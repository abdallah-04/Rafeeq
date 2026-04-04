import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Text } from '@/components/modal/shared/Text';
import { theme } from '@/theme';

const { colors, spacing, typography } = theme;

interface TabItem {
    label: string;
    icon: string;
    route: string;
}

const TABS: TabItem[] = [
    { label: 'Home',    icon: '⌂',  route: '/(parent)/home'    },
    { label: 'Explore', icon: '⊙',  route: '/(parent)/explore' },
    { label: 'Chatbot', icon: '💬', route: '/(parent)/chatbot' },
    { label: 'Profile', icon: '👤', route: '/(parent)/profile' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <View style={styles.container}>
        {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.route);
            return (
            <TouchableOpacity
                key={tab.route}
                style={styles.tab}
                onPress={() => router.push(tab.route as any)}
                activeOpacity={0.7}
            >
                <Text style={[styles.icon, isActive && styles.iconActive]}>
                {tab.icon}
                </Text>
                <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
                </Text>
                {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
            );
        })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: spacing.md,
        paddingTop: spacing.sm,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        position: 'relative',
    },

    icon: {
        fontSize: 20,
        color: colors.textMuted,
    },

    iconActive: {
        color: colors.primary,
    },

    label: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.textMuted,
    },

    labelActive: {
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
    },

    indicator: {
        position: 'absolute',
        top: -spacing.sm,
        width: 24,
        height: 3,
        borderRadius: theme.radius.full,
        backgroundColor: colors.primary,
    },
});