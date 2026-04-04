import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { theme } from '@/theme';

type TextVariant = 'heading' | 'body' | 'caption' | 'label';

type TextProps = RNTextProps & {
    variant?: TextVariant;
    color?: keyof typeof theme.colors;
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
};

export const Text = ({ variant = 'body', color = 'textPrimary', style, children, ...rest }: TextProps) => {
    const variantStyle = theme.typographyStyles?.[variant] ?? {};
    const textColor = theme.colors[color] ?? theme.colors.textPrimary;

    return (
        <RNText
        style={[{ color: textColor }, variantStyle, style]}
        {...rest}
        >
        {children}
        </RNText>
    );
};