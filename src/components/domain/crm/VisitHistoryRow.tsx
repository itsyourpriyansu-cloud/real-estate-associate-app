import { View } from 'react-native';

import type { SiteVisit } from '@/domain';
import { colors, radius, space } from '@/design-system';

import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';
import { icons } from '../../primitives/icons';
import { PressableScale } from '../../primitives/PressableScale';
import { VisitStatusChip } from './VisitCard';

/**
 * A row in the site-visit log: a small date block, who and where, the time, and the status. Rows
 * sit in a `NavPanel`. Dates arrive pre-formatted so the row never reads a clock.
 */
export function VisitHistoryRow({
  visit,
  customer,
  project,
  dayNumber,
  monthShort,
  timeText,
  onPress,
}: {
  visit: SiteVisit;
  customer: string;
  project: string;
  dayNumber: string;
  monthShort: string;
  timeText: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={1}
      accessibilityLabel={`${customer}, ${project}, ${monthShort} ${dayNumber}, ${timeText}`}
      accessibilityHint="Opens the site visit"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingVertical: space[12],
        paddingHorizontal: space[16],
      }}
    >
      <View
        aria-hidden
        style={{
          width: 48,
          height: 52,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText variant="metricMD">{dayNumber}</AppText>
        <AppText variant="labelSM" tone="secondary" uppercase>
          {monthShort}
        </AppText>
      </View>
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="labelLG" numberOfLines={1}>
          {customer}
        </AppText>
        <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
          {project} · {timeText}
        </AppText>
        <View style={{ alignSelf: 'flex-start', marginTop: space[4] }}>
          <VisitStatusChip status={visit.status} />
        </View>
      </View>
      <Icon icon={icons.forward} size="lg" tone="tertiary" />
    </PressableScale>
  );
}
