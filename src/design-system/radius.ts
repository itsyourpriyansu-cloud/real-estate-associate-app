/**
 * Radius tokens. Generous and consistent: cards are `xl`, tiles and rows `lg`, controls `md`,
 * chips and the dock are pills. Smaller radii are for small marks (badges, hatches).
 */
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
