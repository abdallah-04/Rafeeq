
export const colors = {
  background: '#FFFFFF',
  backgroundLight: '#F5F7FA',
  backgroundGray: '#F9FAFB',
  
  surface: '#FFFFFF',
  surfaceElevated: '#F5F7FA',
  surfaceCard: '#FFFFFF',
  
  primary: '#5B8DEF',
  primaryHover: '#4A7AD8',
  primaryLight: '#7BA3F3',
  primaryLighter: '#B8D4FF',
  primaryDark: '#3A6BC9',
  
  textPrimary: '#1A1F36',
  textSecondary: '#6B7A99',
  textMuted: '#9CA3AF',
  textWhite: '#FFFFFF',
  textDisabled: '#D1D5DB',
  
  progressComplete: '#34D399',
  progressInProgress: '#F59E0B',
  progressNotStarted: '#9CA3AF',
  progressLocked: '#E5E7EB',
  
  roleAdmin: '#A78BFA',
  roleTeacher: '#5B8DEF',
  roleParent: '#EC4899',
  roleStudent: '#34D399',
  
  success: '#34D399',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#5B8DEF',
  infoLight: '#DBEAFE',
  
  badgeCompleted: 'rgba(52,211,153,0.15)',
  badgeInProgress: 'rgba(245,158,11,0.15)',
  badgeAdmin: 'rgba(167,139,250,0.15)',
  badgeTeacher: 'rgba(91,141,239,0.15)',
  badgeParent: 'rgba(236,72,153,0.15)',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderMedium: '#D1D5DB',
  borderDark: '#9CA3AF',
  inputBorder: '#D1D5DB',
  inputBorderFocus: '#5B8DEF',
  inputBorderError: '#EF4444',
  
  buttonPrimary: '#5B8DEF',
  buttonPrimaryHover: '#4A7AD8',
  buttonPrimaryDisabled: '#B8D4FF',
  buttonSecondary: '#F5F7FA',
  buttonSecondaryHover: '#E5E7EB',
  buttonOutline: '#5B8DEF',
  buttonDisabled: '#E5E7EB',
  buttonTextDisabled: '#9CA3AF',
  
  mascotPrimary: '#7BA3F3',
  mascotLight: '#B8D4FF',
  mascotAccent: '#5B8DEF',
  mascotBelly: '#FFFFFF',
  mascotBeak: '#F59E0B',
  
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.06)',
  cardBorder: '#F3F4F6',
  
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.25)',
  overlayDark: 'rgba(0,0,0,0.7)',
  avatarRing: 'rgba(91,141,239,0.2)',
  shimmer: 'rgba(255,255,255,0.5)',
  
  inputBackground: '#FFFFFF',
  inputBackgroundDisabled: '#F9FAFB',
  inputPlaceholder: '#9CA3AF',
  
  otpBoxEmpty: '#F5F7FA',
  otpBoxFilled: '#5B8DEF',
  otpBoxBorder: '#E5E7EB',
  otpBoxFocused: '#5B8DEF',
  
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;