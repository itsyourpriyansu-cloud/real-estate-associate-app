import type { ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * Elevation. On the light theme, depth is a white surface, a hairline border and a very soft,
 * wide shadow — the "floating paper" look. Shadows are large-radius and low-opacity; there is no
 * hard drop shadow and no glow. Floating layers (sheets, toasts, the dock) get the deepest one.
 */
export const elevation = {
  /** Sits directly on the page. */
  flat: { backgroundColor: colors.surfacePrimary },
  /** A quiet tile inside a card: tonal step + hairline, no shadow. */
  tile: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  /** Standard card: white, hairline border, soft shadow. */
  raised: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadowInk,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  /** Emphasised surface (selected, focused, important). */
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    shadowColor: colors.shadowInk,
    shadowOpacity: 0.09,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  /** Floating layers (sheets, toasts, menus, the dock): the deepest shadow. */
  overlay: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    shadowColor: colors.shadowInk,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  /** The charcoal hero card and dock. */
  inverse: {
    backgroundColor: colors.surfaceInverse,
    borderWidth: 1,
    borderColor: colors.borderOnInverse,
    shadowColor: colors.shadowInk,
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

export type ElevationToken = keyof typeof elevation;

/** 1px inner top-edge highlight, rendered as an absolutely positioned line by quiet tiles. */
export const topHighlight = {
  height: 1,
  backgroundColor: colors.highlightTop,
} as const satisfies ViewStyle;
