/**
 * Drop-in replacement for React Native's Text component.
 * Automatically maps Lexend font families → Tajawal when the app language is Arabic,
 * so files with hardcoded Lexend fontFamily in their StyleSheets render correctly in RTL.
 *
 * Usage:
 *   import { Text } from '@/components/RNText';
 * instead of:
 *   import { Text } from 'react-native';
 */
import React from 'react';
import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { typography } from '@/constants/typography';

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

export function Text({ style, ...props }: TextProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!isAr) return <RNText style={style} {...props} />;

  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const current = flat?.fontFamily;

  const fontFamily = current
    ? (current.startsWith('Tajawal')
        ? current
        : LEXEND_TO_TAJAWAL[current] ?? typography.fontFamilyAr.regular)
    : typography.fontFamilyAr.regular;

  return <RNText style={[flat, { fontFamily }]} {...props} />;
}
