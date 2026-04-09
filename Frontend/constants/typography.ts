export const typography = {
  fontFamily: {
    regular: 'Lexend_400Regular',
    medium:  'Lexend_500Medium',
    semiBold:'Lexend_600SemiBold',
    bold:    'Lexend_700Bold',
  },

  fontSize: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 26,   // ← screen titles
    '3xl': 32,
    '4xl': 38,
  },

  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },

  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semiBold: '600' as const,
    bold:     '700' as const,
  },
} as const;