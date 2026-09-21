import { View } from 'react-native';

import { leadStageSchema, type LeadStage } from '@/domain';
import { colors, radius, space } from '@/design-system';
import { LEAD_STAGE_LABEL } from '@/utils/labels';

import { AppText } from '../../primitives/AppText';
import { PressableScale } from '../../primitives/PressableScale';
import { MetricBlock, ProgressMeter } from './Metrics';
import { formatInr } from '@/utils/format';

/** Active pipeline, in order. WON and LOST are outcomes, not pipeline. */
const PIPELINE: readonly LeadStage[] = leadStageSchema.options.filter(
  (stage) => stage !== 'WON' && stage !== 'LOST',
);

/**
 * Where the leads are. A single monochrome bar (brighter = further along) with a labelled count per
 * stage underneath — the numbers, not the shades, carry the information.
 */
export function PipelineSummary({
  counts,
  onStagePress,
}: {
  counts: Partial<Record<LeadStage, number>>;
  onStagePress?: (stage: LeadStage) => void;
}) {
  const total = PIPELINE.reduce((sum, stage) => sum + (counts[stage] ?? 0), 0);

  return (
    <View style={{ gap: space[16] }}>
      <View
        accessible
        accessibilityLabel={`Pipeline: ${total} active leads. ${PIPELINE.map((s) => `${LEAD_STAGE_LABEL[s]} ${counts[s] ?? 0}`).join(', ')}`}
        style={{
          flexDirection: 'row',
          height: 8,
          borderRadius: radius.pill,
          overflow: 'hidden',
          gap: space[2],
        }}
      >
        {total === 0 ? (
          <View style={{ flex: 1, backgroundColor: colors.surfaceElevated }} />
        ) : (
          PIPELINE.map((stage, index) => {
            const count = counts[stage] ?? 0;
            if (count === 0) return null;
            return (
              <View
                key={stage}
                style={{
                  flex: count,
                  backgroundColor: colors.inkPrimary,
                  opacity: 0.22 + (index / (PIPELINE.length - 1)) * 0.78,
                }}
              />
            );
          })
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space[4] }}>
        {PIPELINE.map((stage) => (
          <PressableScale
            key={stage}
            onPress={onStagePress ? () => onStagePress(stage) : undefined}
            disabled={!onStagePress}
            dimWhenDisabled={false}
            haptic="selection"
            scaleTo={1}
            accessibilityLabel={`${LEAD_STAGE_LABEL[stage]}, ${counts[stage] ?? 0} leads`}
            containerStyle={{ width: '25%' }}
            pressedStyle={{ backgroundColor: 'transparent' }}
            style={{ minHeight: 48, justifyContent: 'center', gap: space[2] }}
          >
            <AppText variant="metricMD" tone={(counts[stage] ?? 0) > 0 ? 'primary' : 'tertiary'}>
              {counts[stage] ?? 0}
            </AppText>
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {LEAD_STAGE_LABEL[stage]}
            </AppText>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

/** Monthly snapshot: bookings and their estimated value, plus what is close to booking. */
export function PerformanceSummary({
  monthLabel,
  bookings,
  bookingValue,
  inBooking,
  target,
}: {
  monthLabel: string;
  bookings: number;
  bookingValue: number;
  inBooking: number;
  /** Optional monthly booking target, shown as a progress meter. */
  target?: number;
}) {
  return (
    <View style={{ gap: space[20] }}>
      <View style={{ flexDirection: 'row', gap: space[24] }}>
        <View style={{ flex: 1 }}>
          <MetricBlock label={`Bookings · ${monthLabel}`} value={String(bookings)} size="xl" />
        </View>
        <View style={{ flex: 1 }}>
          <MetricBlock
            label="Estimated value"
            value={bookingValue > 0 ? formatInr(bookingValue) : '—'}
            size="xl"
          />
        </View>
      </View>
      {target ? <ProgressMeter value={bookings} max={target} label="Monthly target" /> : null}
      <AppText variant="bodySM" tone="secondary">
        {inBooking > 0
          ? `${inBooking} ${inBooking === 1 ? 'lead is' : 'leads are'} at the booking stage.`
          : 'No leads at the booking stage yet.'}
      </AppText>
    </View>
  );
}
