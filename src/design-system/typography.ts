import type { TextStyle } from 'react-native';

/**
 * Inter, three weights only (Regular / Medium / SemiBold). There is deliberately no Bold: hierarchy
 * comes from size, contrast and spacing, and "never more than three weights per screen" (spec §9.3)
 * holds structurally. React Native cannot render fractional weights of bundled fonts, so weights
 * are the shipped files.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

export type TypeStyle = Pick<
  TextStyle,
  'fontSize' | 'lineHeight' | 'fontFamily' | 'fontVariant' | 'letterSpacing'
>;

const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

function style(
  fontSize: number,
  lineHeight: number,
  weight: FontWeightToken,
  options: { tabular?: boolean; tracking?: number } = {},
): TypeStyle {
  return {
    fontSize,
    lineHeight,
    fontFamily: fontFamily[weight],
    ...(options.tracking !== undefined ? { letterSpacing: options.tracking } : {}),
    ...(options.tabular ? { fontVariant: TABULAR } : {}),
  };
}

/** size / line-height / weight. Larger sizes get slight negative tracking for a refined look. */
export const typography = {
  displayLarge: style(40, 44, 'semibold', { tracking: -1 }),
  displayMedium: style(32, 38, 'semibold', { tracking: -0.6 }),

  headingXL: style(26, 32, 'semibold', { tracking: -0.4 }),
  headingLG: style(22, 28, 'semibold', { tracking: -0.3 }),
  headingMD: style(18, 24, 'semibold', { tracking: -0.2 }),
  headingSM: style(16, 22, 'semibold', { tracking: -0.1 }),

  bodyLG: style(16, 24, 'regular'),
  bodyMD: style(14, 20, 'regular'),
  bodySM: style(13, 18, 'regular'),

  labelLG: style(14, 18, 'medium'),
  labelMD: style(12, 16, 'medium'),
  /** Micro-label. Uppercase is applied by `AppText` (`uppercase` prop). */
  labelSM: style(11, 14, 'medium', { tracking: 0.6 }),

  caption: style(11, 15, 'regular'),

  /** Numbers: tabular figures, generous size, restrained weight. */
  metricXL: style(36, 40, 'semibold', { tabular: true, tracking: -0.8 }),
  metricLG: style(28, 32, 'semibold', { tabular: true, tracking: -0.5 }),
  metricMD: style(20, 24, 'semibold', { tabular: true, tracking: -0.2 }),

  tabLabel: style(11, 14, 'medium'),
  buttonLG: style(16, 20, 'semibold'),
  buttonMD: style(14, 18, 'semibold'),
} as const;

export type TypographyToken = keyof typeof typography;

/** Tabular figures for prices, plot numbers and counts inside running text. */
export const tabularNumbers = { fontVariant: TABULAR } as const;
