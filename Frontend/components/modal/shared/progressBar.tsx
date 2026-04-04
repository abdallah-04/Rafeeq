import React from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { Text } from './Text';
import { theme } from '@/theme';

type Props = {
    value: number;
    height?: number;
    showLabel?: boolean;
    };

export default function ProgressBar({ value, height = 10, showLabel = true }: Props) {
    const progress = Math.min(100, Math.max(0, value));

    return (
        <View style={[styles.container, { height }]}>
        <View
            style={[
            styles.bar,
            {
                width: `${progress}%`,
                height,
                alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
            },
            ]}
        />
        {showLabel && <Text style={styles.label}>{progress}%</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: theme.colors.progressNotStarted,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
        position: 'relative',
    },
    bar: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
    },
    label: {
        position: 'absolute',
        top: -20,
        right: 0,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.fontSize.xs,
    },
});