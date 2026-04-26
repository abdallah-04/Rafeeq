import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';

type Props = {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default function Card({ children, variant = 'default', padded = true, style }: Props) {
    const variantStyles: Record<string, ViewStyle> = {
        default: {
            backgroundColor: theme.colors.surfaceCard,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
        },
        elevated: {
            backgroundColor: theme.colors.surfaceCard,
            shadowColor: theme.colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
        },
        outlined: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.border,
        },
    };

    return (
        <View
        style={[
            styles.base,
            variantStyles[variant],
            padded && styles.padded,
            style,
        ]}
        >
        {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
    },
    padded: {
        padding: theme.spacing.lg,
    },
});
