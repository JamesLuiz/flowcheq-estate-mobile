import { StyleSheet } from 'react-native';

/**
 * Flowcheq Estate — blue brand signal + neutral base, matching web `src/index.css`.
 * The legacy brand green is kept as a supporting/positive signal (`brandGreen` / `success`).
 */
export const colors = {
  primary: '#007AFF',
  primaryGlow: '#3393FF',
  primaryDark: '#0062CC',
  primaryForeground: '#FFFFFF',
  primaryMuted: '#E6F2FF',
  primaryBorder: '#B3D7FF',

  background: '#F8F9FA',
  foreground: '#1A1A1A',
  muted: '#F1F3F5',
  mutedForeground: '#6A727D',
  card: '#FFFFFF',
  cardElevated: '#F1F3F5',
  border: '#DEE2E6',

  accent: '#007AFF',
  accentForeground: '#FFFFFF',

  /** Legacy brand green, kept as a supporting/positive accent */
  brandGreen: '#2C9B6A',
  brandGreenForeground: '#FFFFFF',

  destructive: '#E03131',
  destructiveMuted: '#FFE3E3',
  warning: '#D97706',
  warningMuted: '#FEF3C7',
  success: '#2C9B6A',
  successMuted: '#DCFCE7',

  /** Camera overlay stays dark for contrast */
  cameraOverlay: 'rgba(15, 18, 22, 0.72)',
  cameraBackground: '#111418',
} as const;

/**
 * Dark palette for Flowcheq Estate mobile (neutral #1A1A1A base, cyan brand signal).
 * Wire via a theme context/`useColorScheme` when enabling dark mode across screens.
 */
export const darkColors = {
  ...colors,
  primary: '#00D1FF',
  primaryGlow: '#33DBFF',
  primaryDark: '#00A8CC',
  primaryForeground: '#1A1A1A',
  primaryMuted: '#0A2A33',
  primaryBorder: '#0E3A45',

  background: '#1A1A1A',
  foreground: '#F8F9FA',
  muted: '#2C2E33',
  mutedForeground: '#A0A6AD',
  card: '#222428',
  cardElevated: '#2C2E33',
  border: '#33363B',

  accent: '#00D1FF',
  accentForeground: '#1A1A1A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 32, fontWeight: '700' as const, color: colors.foreground },
  title: { fontSize: 24, fontWeight: '700' as const, color: colors.foreground },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.mutedForeground },
  body: { fontSize: 15, lineHeight: 22, color: colors.foreground },
  caption: { fontSize: 12, color: colors.mutedForeground },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.mutedForeground },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  heroBlock: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  brandMark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  btnSecondary: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: colors.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
  },
  btnTextSecondary: {
    color: colors.foreground,
    fontWeight: '600',
    fontSize: 16,
  },
  btnTextOutline: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  warnBanner: {
    backgroundColor: colors.warningMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.md,
  },
  warnText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: spacing.sm,
  },
  propertyChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  propertyChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
});
