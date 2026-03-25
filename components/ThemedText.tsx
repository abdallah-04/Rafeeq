import React from 'react';
import { colors } from '@/constants/Colors';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';

type TextVariant =
  | 'h1'          // Screen titles — "Library", "profile"  → Inria Sans Bold 36px
  | 'h2'          // Book title on detail screen           → Inria Sans Regular 32px
  | 'h3'          // Section titles — "Currently Borrowing"→ Inria Sans Bold 17px
  | 'bookTitle'   // Book title in grid card               → Inria Sans Bold 15px
  | 'author'      // Author name                           → Inria Sans Regular 10px
  | 'body'        // Description / about text              → Inria Sans Bold 16px
  | 'caption'     // Small labels — borrow date            → Inria Sans Regular 10px
  | 'button'      // Button labels                         → Lexend Bold 20px
  | 'tabLabel'    // Bottom tab labels                     → Inria Sans Bold 12px
  | 'statLabel'   // Stats card labels — "Borrowed"        → Lexend Medium 12px
  | 'statValue'   // Stats card numbers — "45"             → Lexend Bold 24px
  | 'badge'       // AvailabilityBadge text                → Inria Sans Bold 10px
  | 'link'        // "Read more" links                     → Inria Sans Bold 15px
  | 'subtitle'    // Login subtitle                        → Indie Flower Regular 16px
  | 'byline'      // "By Matt Haig" on detail screen       → Indie Flower Regular 24px
  | 'appTitle'    // "42 Amman library" on login           → Inria Sans Bold 24px

type TextColor =
  | 'default'     // #1B293A  dark navy
  | 'primary'     // #C7644B  terracotta
  | 'muted'       // #4F6581  muted blue-gray
  | 'white'       // #FFFFFF
  | 'available'   // #2FA76F  green
  | 'borrowed'    // #E99E35  orange

interface ThemedTextProps {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  opacity?: number;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export default function ThemedText({
  children,
  variant = 'body',
  color = 'default',
  opacity,
  center = false,
  style,
  numberOfLines,
}: ThemedTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        styles[variant],
        colorStyles[color],
        center && styles.center,
        opacity !== undefined && { opacity },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  center: {
    textAlign: 'center',
  },

  h1: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 36,
    letterSpacing: -0.684,
    lineHeight: 54,
  },
  h2: {
    fontFamily: 'InriaSans_400Regular',
    fontSize: 32,
    letterSpacing: -0.608,
    lineHeight: 48,
  },
  h3: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 17,
    letterSpacing: -0.323,
    lineHeight: 25,
  },
  bookTitle: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 15,
    letterSpacing: -0.285,
    lineHeight: 22,
  },
  author: {
    fontFamily: 'InriaSans_400Regular',
    fontSize: 10,
    letterSpacing: -0.19,
    lineHeight: 15,
  },
  body: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 16,
    letterSpacing: -0.304,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'InriaSans_400Regular',
    fontSize: 10,
    letterSpacing: -0.19,
    lineHeight: 15,
  },
  button: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    lineHeight: 24,
  },
  tabLabel: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 12,
    letterSpacing: -0.228,
    lineHeight: 18,
  },
  statLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  statValue: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 20,
    lineHeight: 32,
  },
  badge: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 10,
    letterSpacing: -0.19,
    lineHeight: 15,
  },
  link: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 15,
    letterSpacing: -0.285,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16,
    letterSpacing: -0.304,
    lineHeight: 24,
  },
  byline: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 24,
    letterSpacing: -0.456,
    lineHeight: 36,
  },
  appTitle: {
    fontFamily: 'InriaSans_700Bold',
    fontSize: 24,
    letterSpacing: -0.456,
    lineHeight: 36,
  },
});

const colorStyles = StyleSheet.create({
  default:   { color: colors.textDark },
  primary:   { color: colors.primary },
  muted:     { color: colors.textMuted },
  white:     { color: colors.white },
  available: { color: colors.available },
  borrowed:  { color: colors.borrowed },
});