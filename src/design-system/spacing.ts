/** 4-point spacing scale. Keys are the pixel values: `space[16]` is 16. */
export const space = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
} as const;

export type SpaceToken = keyof typeof space;

export const layout = {
  /** Horizontal page gutter — identical on every screen. */
  screenPaddingX: space[20],
  /** Gap between major sections. */
  sectionGap: space[32],
  sectionGapLarge: space[40],
  /** Minimum interactive area (WCAG / spec §19). */
  minTapTarget: 44,
  headerHeight: 56,
  /** Tab bar content height, excluding the bottom safe-area inset. */
  tabBarHeight: 56,
  /** Max readable width on tablets / web previews. */
  maxContentWidth: 640,
} as const;

/** One icon style throughout (lucide). Typical sizes 18–22. */
export const iconSize = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 22,
  hero: 28,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
