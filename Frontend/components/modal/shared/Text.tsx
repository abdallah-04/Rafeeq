import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';

type TextVariant = 'heading' | 'body' | 'caption' | 'label';

type TextProps = RNTextProps & {
    variant?: TextVariant;
    color?: keyof typeof theme.colors;
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
};

const variantFontWeight: Record<TextVariant, keyof typeof theme.typography.fontFamily> = {
    heading: 'bold',
    label:   'semiBold',
    body:    'regular',
    caption: 'regular',
};

export const Text = ({ variant = 'body', color = 'textPrimary', style, children, ...rest }: TextProps) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const fontFamilies = isAr
        ? theme.typography.fontFamilyAr
        : theme.typography.fontFamily;

    const fontFamily = fontFamilies[variantFontWeight[variant]];
    const variantStyle = theme.typographyStyles?.[variant] ?? {};
    const textColor = theme.colors[color] ?? theme.colors.textPrimary;

    return (
        <RNText
            style={[{ color: textColor, fontFamily }, variantStyle, style]}
            {...rest}
        >
            {children}
        </RNText>
    );
};
