import { useCountUp } from '@/hooks/useCountUp';

import { AppText, type AppTextProps } from './AppText';

export interface AnimatedNumberProps extends Omit<AppTextProps, 'children'> {
  value: number;
  /** Formats the in-flight and final value (grouping, currency, unit). */
  format?: (value: number) => string;
  /** Show this instead of the figure (the "hide figures" state). */
  masked?: string;
  animate?: boolean;
}

const plain = (value: number) => String(Math.round(value));

/**
 * A figure that counts up to its value. Screen readers get the final value straight away (never a
 * spoken count-up), and the visible text uses tabular numerals so it does not jitter as it climbs.
 */
export function AnimatedNumber({
  value,
  format = plain,
  masked,
  animate = true,
  variant = 'metricLG',
  style,
  ...text
}: AnimatedNumberProps) {
  const shown = useCountUp(value, { enabled: animate && masked === undefined });
  const finalText = masked ?? format(value);
  return (
    <AppText
      {...text}
      variant={variant}
      accessible
      accessibilityLabel={finalText}
      style={style}
      numberOfLines={1}
    >
      {masked ?? format(shown)}
    </AppText>
  );
}
