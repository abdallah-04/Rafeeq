import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import { colors, ColorKey } from '@/constants';

type Props = {
    value: number; // 0 - 100
    color?: ColorKey;
    height?: number; 
    showLabel?: boolean;
};

export default function ProgressBar({value, color = 'primary', height = 10, showLabel = true,}: Props) {
    const progress = Math.min(100, Math.max(0, value));
    return (
    <View style={[styles.container, { height }]}>
        <View
            style={[
            styles.bar,
            {
                width: `${progress}%`,
                backgroundColor: colors[color],
                height,
                // RTL-aware fill direction
                alignSelf: I18nManager.isRTL ? 'flex-end' : 'flex-start',
            },
            ]}
        />
        {showLabel && (<Text style={styles.label}>{progress}%</Text>)}
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: colors.progressNotStarted,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    bar: {
        borderRadius: 10,
    },
    label: {
        position: 'absolute',
        top: -20,
        right: 0,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
});