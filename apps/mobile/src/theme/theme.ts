/**
 * Meetopia mobile design tokens.
 * Dark, premium dating-app aesthetic with purple→blue brand gradient accents.
 */

export const colors = {
  // Backgrounds
  bg: '#0B0B12',
  bgElevated: '#14141F',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  surfacePressed: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.66)',
  textMuted: 'rgba(255,255,255,0.42)',

  // Brand + accents
  brandPurple: '#8B5CF6',
  brandBlue: '#3B82F6',
  brandBlueLight: '#60A5FA',
  accent: '#8B5CF6',

  // Status
  success: '#30D158',
  successSoft: 'rgba(48,209,88,0.18)',
  danger: '#FF453A',
  dangerSoft: 'rgba(255,69,58,0.16)',
  warning: '#FFD60A',
  warningSoft: 'rgba(255,214,10,0.16)',
} as const

/** Purple → blue brand gradient (use with expo-linear-gradient). */
export const brandGradient = ['#8B5CF6', '#3B82F6'] as const
export const brandGradientSoft = ['rgba(139,92,246,0.22)', 'rgba(59,130,246,0.22)'] as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

/** Max content width so layouts stay centered/usable on iPad. */
export const MAX_CONTENT_WIDTH = 520

export const font = {
  title: { fontSize: 30, fontWeight: '800' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  heading: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.textSecondary, lineHeight: 23 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
}
