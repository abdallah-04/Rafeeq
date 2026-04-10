import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/modal/shared/Text';

const { colors, spacing, radius } = theme;

interface EmptySlotProps {
    onPress: () => void;
}

export function EmptySlot({ onPress }: EmptySlotProps) {
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

const styles = StyleSheet.create({
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
});
