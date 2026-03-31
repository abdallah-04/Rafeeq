import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, ColorKey } from '@/constants';

type BadgeVariant =  'blue' | 'purple'| 'green'| 'orange';

type Props = {
    label: string;         
    variant?: BadgeVariant;  }

export default function Badge({ label, variant = 'blue' }: Props) {
    const bgColorMap: Record<BadgeVariant, ColorKey> = {
    blue: 'badgeAdmin',
    purple: 'badgeTeacher',
    green: 'badgeCompleted',
    orange: 'badgeParent',
    };

    const textColorMap: Record<BadgeVariant, ColorKey> = {
    blue: 'primary',
    purple: 'primary',
    green: 'success',
    orange: 'warning',
    };
    return (
        <View style={[styles.container, { backgroundColor: colors[bgColorMap[variant]] }]}>
            <Text style={[styles.text, { color: colors[textColorMap[variant]] }]}>
                {label}
        </Text>
        </View> );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});