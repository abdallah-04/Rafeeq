export const Colors = {
  // Primary
  primary:        '#4A8BF5',   // Blue — buttons, active states, headings
  primaryLight:   '#EDF4FE',   // Light blue — card backgrounds, highlights
  primaryDark:    '#2563EB',   // Dark blue — pressed states
 
  // Accents
  yellow:         '#FFB84C',   // Accent yellow — warnings, average progress
  purple:         '#BA6DE9',   // Purple — secondary accent, third stat card
  green:          '#22C55E',   // Green — success, completed
  greenLight:     '#DCFCE7',
  orange:         '#F97316',   // Orange — alerts, activities
  orangeLight:    '#FFF4ED',
  red:            '#EF4444',   // Error, notification badge
  redLight:       '#FEF2F2',
 
  // Text
  textDark:       '#334155',   // Main headings, labels
  textMedium:     '#475569',   // Body copy, descriptions
  textLight:      '#64748B',   // Captions, placeholders
  textMuted:      '#94A3B8',   // Footer links, tertiary text
 
  // UI
  border:         '#E2E8F0',   // Card borders, dividers, inputs
  background:     '#F8FAFC',   // Page background, input fills
  white:          '#FFFFFF',
  black:          '#0F172A',
  overlay:        'rgba(0, 0, 0, 0.40)',
 
  // Role colors (for stat mini-cards)
  statBlue:       '#4A8BF5',
  statYellow:     '#FFB84C',
  statPurple:     '#BA6DE9',
 
  // Transparent
  transparent:    'transparent',
} as const;
 
export type ColorKey = keyof typeof Colors;
 
// ── SPACING ─────────────────────────────────
// 8px base grid
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;
 
export type SpacingKey = keyof typeof Spacing;
 
export const Radius = {
  xs:     8,
  sm:     12,
  md:     16,   
  lg:     20,
  xl:     24,   
  full:   9999, 
} as const;
 
export type RadiusKey = keyof typeof Radius;
 
// ── SHADOWS ──────────────────────────────────
export const Shadows = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  16,
    elevation:     4,
  },
  cardStrong: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  26,
    elevation:     8,
  },
  primaryButton: {
    shadowColor:   '#4A8BF5',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     6,
  },
  none: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
} as const;
 
export type ShadowKey = keyof typeof Shadows;
 

export const FontFamily = {
  regular:    'Lexend_400Regular',
  medium:     'Lexend_500Medium',
  semiBold:   'Lexend_600SemiBold',
  bold:       'Lexend_700Bold',
} as const;
 
export const FontSize = {
  display:  30,   // App name / brand title
  h1:       24,   // Screen main headings
  h2:       20,   // Section labels, card headers
  h3:       16,   // Card titles, list item names
  body:     14,   // Body copy
  bodyLg:   16,   // Large body
  caption:  12,   // Footer, helper text, badges
  tiny:     10,   // Very small labels
} as const;
 
export type FontSizeKey = keyof typeof FontSize;
 

export const TouchTarget = {
  min: 49,   
} as const;
 
export const Frame = {
  width:  390,
  height: 844,
} as const;
 
export const IconSize = {
  sm:  16,
  md:  20,
  lg:  24,
  xl:  32,
} as const;
 
export const AvatarSize = {
  sm:  32,
  md:  44,
  lg:  56,
  xl:  80,
} as const;
 

export const TextStyle = {
  display: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.display,
    color:      Colors.textDark,
  },
  h1: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.h1,
    color:      Colors.textDark,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize:   FontSize.h2,
    color:      Colors.textDark,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize:   FontSize.h3,
    color:      Colors.textDark,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.body,
    color:      Colors.textMedium,
  },
  bodyLg: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.bodyLg,
    color:      Colors.textMedium,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize:   FontSize.caption,
    color:      Colors.textLight,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize:   FontSize.body,
    color:      Colors.textDark,
  },
} as const;
 
const theme = {
  Colors,
  Spacing,
  Radius,
  Shadows,
  FontFamily,
  FontSize,
  TextStyle,
  TouchTarget,
  Frame,
  IconSize,
  AvatarSize,
} as const;
 
export default theme;
 