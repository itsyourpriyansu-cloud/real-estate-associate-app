import { View } from 'react-native';

import { colors, radius, space } from '@/design-system';

import { AppText, type TextTone } from '../../primitives/AppText';
import { Divider } from '../../primitives/Layout';

export interface MetricBlockProps {
  label: string;
  value: string;
  caption?: string;
  tone?: TextTone;
  size?: 'md' | 'lg' | 'xl';
}

const valueVariant = { md: 'metricMD', lg: 'metricLG', xl: 'metricXL' } as const;

/**
 * A number with a label. The number leads (tabular, restrained weight); the label is small and
 * quiet. Deliberately not a box — metrics are typography on the page.
 */
export function MetricBlock({
  label,
  value,
  caption,
  tone = 'primary',
  size = 'lg',
}: MetricBlockProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${caption ? `, ${caption}` : ''}`}
      style={{ gap: space[4] }}
    >
      <AppText
        variant={valueVariant[size]}
        tone={tone}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </AppText>
      <AppText variant="labelMD" tone="secondary" numberOfLines={2}>
        {label}
      </AppText>
      {caption ? (
        <AppText variant="caption" tone="secondary">
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

/** Equal-width metrics separated by hairlines — one strip, not three cards. */
export function MetricStrip({ items }: { items: MetricBlockProps[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
      {items.map((item, index) => (
        <View key={item.label} style={{ flex: 1, flexDirection: 'row' }}>
          {index > 0 ? (
            <View style={{ marginRight: space[16] }}>
              <Divider vertical />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <MetricBlock {...item} size={item.size ?? 'lg'} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Thin progress line. Exposes value/min/max to assistive tech. */
export function ProgressMeter({
  value,
  max,
  label,
  valueLabel,
}: {
  value: number;
  max: number;
  label: string;
  valueLabel?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={{ gap: space[8] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="labelMD" tone="secondary">
          {label}
        </AppText>
        <AppText variant="labelMD" style={{ fontVariant: ['tabular-nums'] }}>
          {valueLabel ?? `${value} / ${max}`}
        </AppText>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: value }}
        style={{
          height: 6,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceElevated,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${ratio * 100}%`, height: 6, backgroundColor: colors.inkPrimary }} />
      </View>
    </View>
  );
}
