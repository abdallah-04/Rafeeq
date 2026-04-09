import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type BadgeVariant = 'blue' | 'purple' | 'green' | 'orange';

type Props = {
    label: string;
    variant?: BadgeVariant;
};

export default function Badge({ label, variant = 'blue' }: Props) {
    const bgColorMap: Record<BadgeVariant, string> = {
        blue: theme.colors.badgeAdmin,
        purple: theme.colors.badgeTeacher,
        green: theme.colors.badgeCompleted,
        orange: theme.colors.badgeParent,
    };

    const textColorMap: Record<BadgeVariant, string> = {
        blue: theme.colors.primary,
        purple: theme.colors.primary,
        green: theme.colors.success,
        orange: theme.colors.warning,
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColorMap[variant] }]}>
        <Text style={[styles.text, { color: textColorMap[variant] }]}>{label}</Text>
        </View>
    );
    }

const styles = StyleSheet.create({
    container: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        alignSelf: 'flex-start',
    },
    text: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    },
});