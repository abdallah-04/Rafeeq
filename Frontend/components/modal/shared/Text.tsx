import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
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

const EMOJI_RE = /[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u;
const TEXT_RE = /[0-9A-Za-z\u0600-\u06FF]/u;

function isEmojiOnly(children: React.ReactNode) {
    return typeof children === 'string' && EMOJI_RE.test(children) && !TEXT_RE.test(children);
}

export const Text = ({ variant = 'body', color = 'textPrimary', style, children, ...rest }: TextProps) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const emojiOnly = isEmojiOnly(children);

    const fontFamilies = isAr
        ? theme.typography.fontFamilyAr
        : theme.typography.fontFamily;

    const fontFamily = fontFamilies[variantFontWeight[variant]];
    const variantStyle = theme.typographyStyles?.[variant] ?? {};
    const textColor = theme.colors[color] ?? theme.colors.textPrimary;

    return (
        <RNText
            style={[
                { color: textColor },
                !emojiOnly && { fontFamily },
                emojiOnly && { includeFontPadding: true },
                !emojiOnly && variantStyle,
                style,
            ]}
            {...rest}
        >
            {children}
        </RNText>
    );
};
