import type { ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * Elevation. On a dark UI, depth comes from a tonal step, a fine border, a top-edge highlight and
 * — only on floating things — a very soft shadow. No glow, no Material-style drop shadows.
 */
export const elevation = {
  /** Sits directly on the page. */
  flat: { backgroundColor: colors.surfacePrimary },
  /** Standard grouped surface: tonal step + hairline border. */
  raised: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  /** Emphasised surface (selected, focused, important). */
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  /** Floating layers only (sheets, toasts, menus): the single place a shadow is permitted. */
  overlay: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    shadowColor: colors.backgroundPrimary,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

export type ElevationToken = keyof typeof elevation;

/** 1px inner top-edge highlight, rendered as an absolutely positioned line by raised surfaces. */
export const topHighlight = {
  height: 1,
  backgroundColor: colors.highlightTop,
} as const satisfies ViewStyle;
