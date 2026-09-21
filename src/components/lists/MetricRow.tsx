import { View } from 'react-native';

import { space } from '@/design-system';

import { AppText, type TextTone } from '../primitives/AppText';

/** label ........ value. Numbers are tabular so columns of rows align (prices, counts). */
export function MetricRow({
  label,
  value,
  tone = 'primary',
  emphasis,
}: {
  label: string;
  value: string;
  tone?: TextTone;
  /** Larger value for a total. */
  emphasis?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: space[16],
      }}
    >
      <AppText
        variant={emphasis ? 'labelLG' : 'bodyMD'}
        tone={emphasis ? 'primary' : 'secondary'}
        style={{ flexShrink: 1 }}
      >
        {label}
      </AppText>
      <AppText
        variant={emphasis ? 'metricMD' : 'labelLG'}
        tone={tone}
        style={{ ...(emphasis ? {} : { fontVariant: ['tabular-nums'] }) }}
      >
        {value}
      </AppText>
    </View>
  );
}
