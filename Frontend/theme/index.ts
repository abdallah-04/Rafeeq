import { colors } from '@/constants';
import { spacing } from '@/constants';
import { borderRadius } from '@/constants';
import { typography } from '@/constants';


export const typographyStyles = {
  heading: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.normal * typography.fontSize['2xl'],
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
} as const;

// 🌟 Theme object مركزي
export const theme = {
  colors,
  spacing,
  radius: borderRadius,
  typography,
  typographyStyles,
} as const;

export type Theme = typeof theme;
export type ColorKey = keyof typeof colors;