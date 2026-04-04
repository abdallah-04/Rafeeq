import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '@/theme';

type Props = {
    completed: number;
    total: number;
    unit: string;
    period: string;
};

export default function KeepGoingBanner({ completed, total, unit, period }: Props) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <View style={styles.container}>
        <Text style={styles.text}>
            Keep going! {completed}/{total} {unit} done {period} ({percentage}%)
        </Text>

        <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primaryLighter,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginVertical: theme.spacing.sm,
    },
    text: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    progressBar: {
        width: '100%',
        height: 10,
        backgroundColor: theme.colors.progressNotStarted,
        borderRadius: theme.radius.full,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.progressComplete,
        borderRadius: theme.radius.full,
    },
});