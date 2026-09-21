/**
 * Motion tokens. Data only — no Reanimated import — so tokens stay testable and library-agnostic.
 * Motion is subtle, fast and functional. Every consumer must honour Reduce Motion (see
 * `useMotion`): when reduced, durations collapse to 0 and springs become instant.
 */
export const duration = {
  instant: 80,
  fast: 140,
  standard: 220,
  slow: 320,
} as const;

export type DurationToken = keyof typeof duration;

/** Cubic-bezier control points: [x1, y1, x2, y2]. */
export const easing = {
  standard: [0.2, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
  decelerate: [0, 0, 0, 1],
} as const;

/** Near-critically damped: tactile without bounce. */
export const spring = {
  press: { damping: 22, stiffness: 420, mass: 0.7 },
  sheet: { damping: 30, stiffness: 320, mass: 1 },
  settle: { damping: 26, stiffness: 260, mass: 0.9 },
} as const;

export const motion = {
  /** Press feedback scales, by control size. */
  pressScaleCard: 0.985,
  pressScaleButton: 0.98,
  pressScaleIcon: 0.9,
  pressScaleChip: 0.96,
  /** Subtle rise for entering content. */
  enterTranslate: 8,
  /** Toast / sheet entry offset. */
  toastTranslate: 16,
  metricTranslate: 6,
} as const;

export const opacity = {
  pressed: 0.86,
  disabled: 0.45,
} as const;
