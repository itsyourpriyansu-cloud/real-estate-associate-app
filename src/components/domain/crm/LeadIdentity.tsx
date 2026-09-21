import { View } from 'react-native';

import type { Lead, LeadStage } from '@/domain';
import { colors, radius, space } from '@/design-system';
import { formatAreaRange, formatInrRange } from '@/utils/format';
import { LEAD_SOURCE_LABEL, LEAD_STAGE_LABEL } from '@/utils/labels';

import { LeadPriorityChip, LeadStageChip } from '../../chips/LeadChips';
import { AppText } from '../../primitives/AppText';

/** Pipeline order for the rail. LOST is an outcome shown as a chip, not a position on the rail. */
const RAIL: readonly LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'INTERESTED',
  'VISIT',
  'NEGOTIATION',
  'BOOKING',
  'WON',
];

/** Segmented progress through the pipeline: filled up to the current stage, with its name written out. */
export function LeadStageIndicator({ stage }: { stage: LeadStage }) {
  const position = RAIL.indexOf(stage);
  const lost = stage === 'LOST';
  const label = lost
    ? 'Lost'
    : `${LEAD_STAGE_LABEL[stage]} · stage ${position + 1} of ${RAIL.length}`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Pipeline stage: ${label}`}
      accessibilityValue={{ min: 1, max: RAIL.length, now: Math.max(position + 1, 0) }}
      style={{ gap: space[8] }}
    >
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        {RAIL.map((step, index) => (
          <View
            key={step}
            style={{
              flex: 1,
              height: 4,
              borderRadius: radius.pill,
              backgroundColor:
                !lost && index <= position ? colors.inkPrimary : colors.surfaceElevated,
            }}
          />
        ))}
      </View>
      <AppText variant="labelMD" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

/** Identity block for the top of a lead: name, priority, stage, what they want and where it came from. */
export function LeadSummary({ lead }: { lead: Lead }) {
  const { requirement: r } = lead;
  return (
    <View style={{ gap: space[12] }}>
      <AppText variant="headingLG" header>
        {lead.fullName}
      </AppText>
      <View style={{ flexDirection: 'row', gap: space[8], flexWrap: 'wrap' }}>
        <LeadPriorityChip priority={lead.priority} size="md" />
        <LeadStageChip stage={lead.stage} size="md" />
      </View>
      <View style={{ gap: space[2] }}>
        <AppText variant="labelLG">{formatInrRange(r.budgetMin, r.budgetMax)}</AppText>
        <AppText tone="secondary">{formatAreaRange(r.areaMinSqYd, r.areaMaxSqYd)}</AppText>
        {r.preferredLocations.length > 0 ? (
          <AppText tone="secondary">{r.preferredLocations.join(', ')}</AppText>
        ) : null}
      </View>
      <AppText variant="bodySM" tone="secondary">
        Source · {lead.sourceLabel ?? LEAD_SOURCE_LABEL[lead.source]}
      </AppText>
    </View>
  );
}
