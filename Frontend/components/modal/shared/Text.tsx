import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/theme';

// Maps every Lexend variant → corresponding Tajawal weight
const LEXEND_TO_TAJAWAL: Record<string, string> = {
  Lexend_400Regular:  'Tajawal-Regular',
  Lexend_500Medium:   'Tajawal-Medium',
  Lexend_600SemiBold: 'Tajawal-SemiBold',
  Lexend_700Bold:     'Tajawal-Bold',
  'Lexend-Regular':   'Tajawal-Regular',
  'Lexend-Medium':    'Tajawal-Medium',
  'Lexend-SemiBold':  'Tajawal-SemiBold',
  'Lexend-Bold':      'Tajawal-Bold',
};

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

    const variantFontFamily = fontFamilies[variantFontWeight[variant]];
    const variantStyle = theme.typographyStyles?.[variant] ?? {};
    const textColor = theme.colors[color] ?? theme.colors.textPrimary;

    // When Arabic, ensure the final fontFamily is always Tajawal — even if the
    // caller passed a style with an explicit Lexend fontFamily.
    const arFontOverride: TextStyle | null = isAr ? (() => {
      const flat = StyleSheet.flatten(style) as TextStyle | undefined;
      const current = flat?.fontFamily;
      if (!current) return { fontFamily: variantFontFamily };
      if (current.startsWith('Tajawal')) return null; // already correct
      return { fontFamily: LEXEND_TO_TAJAWAL[current] ?? variantFontFamily };
    })() : null;

    return (
        <RNText
            style={[
              { color: textColor, fontFamily: variantFontFamily },
              variantStyle,
              style,
              arFontOverride,
            ]}
            {...rest}
        >
            {children}
        </RNText>
    );
};
