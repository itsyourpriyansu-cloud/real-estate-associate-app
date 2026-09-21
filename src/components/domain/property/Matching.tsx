import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import type { Plot, Project } from '@/domain';
import { elevation, radius, space } from '@/design-system';
import { formatArea, formatInr, groupIndian } from '@/utils/format';

import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';
import { Divider } from '../../primitives/Layout';
import { PressableScale } from '../../primitives/PressableScale';
import { MetricRow } from '../../lists/MetricRow';
import { ProjectImage } from './ProjectImage';

/** A recommended project for a lead, with the reasons it fits. Matching itself is domain logic (Stage 5). */
export function PropertyMatchCard({
  project,
  matchingPlots,
  reasons,
  onPress,
}: {
  project: Project;
  matchingPlots: number;
  reasons: string[];
  onPress?: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityLabel={`${project.name}. ${matchingPlots} matching plots. ${reasons.join(', ')}`}
      style={[
        elevation.raised,
        { borderRadius: radius.md, padding: space[12], flexDirection: 'row', gap: space[12] },
      ]}
    >
      <View style={{ width: 72, height: 72, borderRadius: radius.sm, overflow: 'hidden' }}>
        <ProjectImage source={project.thumbnailUrl} height={72} />
      </View>
      <View style={{ flex: 1, gap: space[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[8] }}>
          <AppText variant="headingSM" numberOfLines={1} style={{ flex: 1 }}>
            {project.name}
          </AppText>
          <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
            {matchingPlots} {matchingPlots === 1 ? 'plot' : 'plots'}
          </AppText>
        </View>
        <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
          {project.location}
        </AppText>
        {reasons.slice(0, 3).map((reason) => (
          <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: space[6] }}>
            <Icon icon={Check} size="sm" tone="secondary" />
            <AppText variant="bodySM" tone="secondary" style={{ flex: 1 }}>
              {reason}
            </AppText>
          </View>
        ))}
      </View>
    </PressableScale>
  );
}

/**
 * Cost preview for a plot: size, base rate, premium and estimated total. Always labelled an
 * estimate — it is never presented as a quotation (spec §11.6).
 */
export function PriceSummary({ plot }: { plot: Plot }) {
  const baseCost = plot.areaSqYd * plot.baseRatePerSqYd;
  return (
    <View style={{ gap: space[12] }}>
      <MetricRow label="Plot size" value={formatArea(plot.areaSqYd)} />
      <MetricRow label="Base rate" value={`₹${groupIndian(plot.baseRatePerSqYd)} / sq yd`} />
      <MetricRow label="Base cost" value={formatInr(baseCost)} />
      {plot.premiumAmount ? (
        <MetricRow label="Premium" value={formatInr(plot.premiumAmount)} />
      ) : null}
      <Divider />
      <MetricRow label="Estimated total" value={formatInr(plot.estimatedTotal)} emphasis />
      <AppText variant="caption" tone="secondary">
        Estimate for preview only. This is not a quotation.
      </AppText>
    </View>
  );
}
