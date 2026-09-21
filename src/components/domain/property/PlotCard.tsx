import { View } from 'react-native';

import type { Plot } from '@/domain';
import { colors, elevation, motion, plotStatusTokens, radius, space } from '@/design-system';
import { formatArea, formatInr } from '@/utils/format';
import { FACING_LABEL } from '@/utils/labels';

import { AppText } from '../../primitives/AppText';
import { PressableScale } from '../../primitives/PressableScale';
import { PlotStatusBadge } from './PlotParts';

/**
 * One plot in the inventory grid: number, status (text + icon), size, facing, price. Unavailable
 * plots keep every fact readable (a sales person still needs to answer "what about plot 12?") —
 * only the price dims. `selected` lifts the tile with a stronger border and tonal step.
 */
export function PlotCard({
  plot,
  selected,
  onPress,
}: {
  plot: Plot;
  selected?: boolean;
  onPress?: () => void;
}) {
  const available = plot.status === 'AVAILABLE';
  const label = [
    `Plot ${plot.plotNumber}`,
    plotStatusTokens[plot.status].label,
    formatArea(plot.areaSqYd),
    FACING_LABEL[plot.facing],
    plot.isCorner ? 'Corner plot' : '',
    formatInr(plot.estimatedTotal),
    selected ? 'Selected' : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={motion.pressScaleCard}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={{
        ...elevation.raised,
        borderRadius: radius.lg,
        padding: space[12],
        gap: space[8],
        ...(selected ? { backgroundColor: colors.brandSoft, borderColor: colors.brand } : null),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: space[8],
        }}
      >
        <AppText variant="labelSM" tone="secondary" uppercase>
          Plot
        </AppText>
        {plot.isCorner ? (
          <AppText variant="labelSM" tone="secondary" uppercase>
            Corner
          </AppText>
        ) : null}
      </View>
      <AppText variant="metricLG">{plot.plotNumber}</AppText>
      <PlotStatusBadge status={plot.status} />
      <View style={{ gap: space[2] }}>
        <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
          {formatArea(plot.areaSqYd)}
        </AppText>
        <AppText variant="bodySM" tone="secondary">
          {FACING_LABEL[plot.facing]}
        </AppText>
      </View>
      <AppText
        variant="metricMD"
        tone={available ? 'primary' : 'secondary'}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {formatInr(plot.estimatedTotal)}
      </AppText>
    </PressableScale>
  );
}
