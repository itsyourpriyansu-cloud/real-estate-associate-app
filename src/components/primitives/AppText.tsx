import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyToken } from '@/design-system';

/** Semantic text colours. `success`/`warning`/`danger`/`info` are for status text only. */
export const textColors = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  disabled: colors.textDisabled,
  inverse: colors.textInverse,
  onInverse: colors.textOnInverse,
  onInverseMuted: colors.textOnInverseMuted,
  brand: colors.brandStrong,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
} as const;

export type TextTone = keyof typeof textColors;

export interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  tone?: TextTone;
  /** Uppercase is for micro-labels and status only — never paragraphs. */
  uppercase?: boolean;
  /** Marks the text as a heading for screen readers. */
  header?: boolean;
}

/**
 * The only text component. Type style and colour both come from tokens. Font scaling is allowed
 * (Dynamic Type) but capped so dense rows stay intact at the largest accessibility sizes.
 */
export function AppText({
  variant = 'bodyMD',
  tone = 'primary',
  uppercase,
  header,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      accessibilityRole={header ? 'header' : undefined}
      {...rest}
      style={[
        typography[variant],
        { color: textColors[tone] },
        uppercase ? { textTransform: 'uppercase' } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
