import type { PlotStatus } from '@/domain/plot';

/**
 * Colour tokens for Vara Real Estates. This file is the ONLY place raw colour values may live —
 * ESLint blocks hex literals in app/, features/ and components/, and a test blocks them everywhere
 * else in src/.
 *
 * The look is a soft light theme: a pale grey page, white rounded cards, near-black ink for
 * primary actions, and one charcoal "inverse" surface (hero card, floating dock). Green is the
 * only accent and is used quietly — progress, selection, success, small marks — never as a wash.
 */
export const colors = {
  // Backgrounds (page level)
  backgroundPrimary: '#F1F2F4',
  backgroundSecondary: '#F7F8F9',
  backgroundTertiary: '#EAEBEE',

  // Surfaces (things that sit on a background)
  surfacePrimary: '#FFFFFF',
  /** A quiet tile inside a white card (stat tiles, inputs, icon tiles). */
  surfaceSecondary: '#F5F6F8',
  surfaceElevated: '#FFFFFF',
  surfacePressed: '#E9EAEE',

  // Ink: primary buttons and selected states on light surfaces
  inkPrimary: '#121316',
  inkSecondary: '#2B2C31',

  // Inverse (charcoal) surfaces: hero card and the floating dock
  surfaceInverse: '#17181B',
  surfaceInverseRaised: '#26272C',
  textOnInverse: '#F6F6F7',
  textOnInverseMuted: '#A9ABB3',
  borderOnInverse: 'rgba(255,255,255,0.12)',

  // Text
  textPrimary: '#121316',
  textSecondary: '#565860',
  /** >= 4.5:1 on every light surface. Meta and hints; not for the main figure of a card. */
  textTertiary: '#666870',
  /** Disabled controls only (exempt from contrast requirements). */
  textDisabled: '#A6A8B0',
  /** Text on ink (primary button) and on brand fills. */
  textInverse: '#FFFFFF',

  // Borders
  borderSubtle: 'rgba(18,19,22,0.06)',
  borderMedium: 'rgba(18,19,22,0.10)',
  borderStrong: 'rgba(18,19,22,0.18)',

  // Brand accent: a calm green
  brand: '#2E9B6A',
  /** Text and fills that must reach AA on white (links, selected labels, filled chips). */
  brandStrong: '#167547',
  brandMuted: 'rgba(46,155,106,0.12)',
  /** Solid tint for surfaces that cannot be translucent (a selected tile). */
  brandSoft: '#E4F3EB',

  // Semantic (status only, never decoration)
  success: '#167547',
  warning: '#946000',
  danger: '#C0392B',
  info: '#2A5FC0',
  successMuted: 'rgba(22,117,71,0.10)',
  warningMuted: 'rgba(148,96,0,0.10)',
  dangerMuted: 'rgba(192,57,43,0.10)',
  infoMuted: 'rgba(42,95,192,0.10)',

  // Utility
  /** 1px top-edge highlight on quiet tiles. */
  highlightTop: 'rgba(255,255,255,0.9)',
  /** Scrim behind sheets / modals. Not a gradient, not decorative. */
  scrim: 'rgba(18,19,22,0.45)',
  /** Shadow colour for soft card shadows. */
  shadowInk: '#0B0C10',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/** Semantic tone → the three colours a component may use. Neutral is the default. */
export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export const toneColors: Record<Tone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: colors.textSecondary, bg: colors.surfaceSecondary, border: colors.borderMedium },
  brand: { fg: colors.brandStrong, bg: colors.brandMuted, border: colors.brandMuted },
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
  BOOKED: { label: 'Booked', tone: 'neutral', color: colors.inkSecondary, icon: 'check' },
  BLOCKED: { label: 'Blocked', tone: 'danger', color: colors.danger, icon: 'lock' },
  NOT_FOR_SALE: {
    label: 'Not for sale',
    tone: 'neutral',
    color: colors.textTertiary,
    icon: 'minus',
  },
};
