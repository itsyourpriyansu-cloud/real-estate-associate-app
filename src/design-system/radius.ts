/** Radius tokens. Use larger radii only for major surfaces; controls stay tight. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
