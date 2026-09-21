import type { PlotStatus } from '@/domain/plot';

/**
 * Colour tokens. This file is the ONLY place raw colour values may live — ESLint blocks hex
 * literals in app/, features/ and components/, and a test blocks them everywhere else in src/.
 *
 * Black / white / grey must remain >= 90% of any screen. Semantic colours are reserved for status,
 * warning, destructive, confirmation and inventory state — never decoration — and are used on
 * small marks (dot, icon, label) rather than large fills.
 */
export const colors = {
  // Backgrounds (page level)
  backgroundPrimary: '#070707',
  backgroundSecondary: '#0D0D0D',
  backgroundTertiary: '#121212',

  // Surfaces (things that sit on a background)
  surfacePrimary: '#111111',
  surfaceSecondary: '#171717',
  surfaceElevated: '#1D1D1D',
  surfacePressed: '#232323',

  // Emphasis whites (primary buttons, selected states)
  whitePrimary: '#F7F7F5',
  whiteSecondary: '#E8E8E5',

  // Text
  textPrimary: '#F5F5F3',
  textSecondary: '#A7A7A2',
  /** ~4.0:1 on backgrounds — supplementary text only (meta, timestamps beside a primary value). */
  textTertiary: '#72726E',
  textDisabled: '#51514E',
  /** Text on a white surface (primary button). */
  textInverse: '#070707',

  // Borders
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderMedium: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.22)',

  // Semantic (exceptions to the monochrome rule)
  success: '#70D7A0',
  warning: '#E8C26A',
  danger: '#F07A7A',
  info: '#8BAFE8',
  successMuted: 'rgba(112,215,160,0.12)',
  warningMuted: 'rgba(232,194,106,0.12)',
  dangerMuted: 'rgba(240,122,122,0.12)',
  infoMuted: 'rgba(139,175,232,0.12)',

  // Utility
  /** 1px top-edge highlight that gives raised dark surfaces tactility. */
  highlightTop: 'rgba(255,255,255,0.06)',
  /** Scrim behind sheets / modals. Not a gradient, not decorative. */
  scrim: 'rgba(0,0,0,0.64)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/** Semantic tone → the three colours a component may use. Neutral is the default. */
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export const toneColors: Record<Tone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: colors.textSecondary, bg: colors.surfaceSecondary, border: colors.borderMedium },
  success: { fg: colors.success, bg: colors.successMuted, border: colors.successMuted },
  warning: { fg: colors.warning, bg: colors.warningMuted, border: colors.warningMuted },
  danger: { fg: colors.danger, bg: colors.dangerMuted, border: colors.dangerMuted },
  info: { fg: colors.info, bg: colors.infoMuted, border: colors.infoMuted },
};

/**
 * Inventory status language. Status is never communicated by colour alone: every status carries a
 * label AND an icon *name* (resolved to a lucide icon by `StatusIcon`). Keyed by the domain
 * `PlotStatus`, so adding a status without a token is a compile error.
 */
export type StatusIconName = 'dot' | 'clock' | 'check' | 'lock' | 'minus';

export const plotStatusTokens: Record<
  PlotStatus,
  { label: string; tone: Tone; color: string; icon: StatusIconName }
> = {
  AVAILABLE: { label: 'Available', tone: 'success', color: colors.success, icon: 'dot' },
  ON_HOLD: { label: 'On hold', tone: 'warning', color: colors.warning, icon: 'clock' },
  BOOKED: { label: 'Booked', tone: 'neutral', color: colors.whiteSecondary, icon: 'check' },
  BLOCKED: { label: 'Blocked', tone: 'danger', color: colors.danger, icon: 'lock' },
  NOT_FOR_SALE: {
    label: 'Not for sale',
    tone: 'neutral',
    color: colors.textTertiary,
    icon: 'minus',
  },
};
