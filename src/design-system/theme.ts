import { colors, plotStatusTokens, toneColors } from './colors';
import { elevation, topHighlight } from './elevation';
import { duration, easing, motion, opacity, spring } from './motion';
import { radius } from './radius';
import { hitSlop, iconSize, layout, space } from './spacing';
import { tabularNumbers, typography } from './typography';

/**
 * The single composed theme object. Components read from here; nothing outside `src/design-system`
 * defines colours, spacing, type, radius, elevation or motion. Light-only for Vara Real Estates:
 * a soft grey page, white cards, ink actions, a charcoal inverse surface and one green accent.
 */
export const theme = {
  colors,
  toneColors,
  space,
  layout,
  iconSize,
  hitSlop,
  typography,
  tabularNumbers,
  radius,
  elevation,
  topHighlight,
  opacity,
  motion: { ...motion, duration, easing, spring },
  status: { plot: plotStatusTokens },
} as const;

export type Theme = typeof theme;
