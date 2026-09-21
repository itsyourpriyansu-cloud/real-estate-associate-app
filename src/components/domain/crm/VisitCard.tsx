import {
  CalendarCheck,
  CalendarClock,
  Check,
  MapPinCheck,
  MessageCircle,
  Navigation,
  Phone,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import type { SiteVisit, VisitStatus } from '@/domain';
import { elevation, radius, space, type Tone } from '@/design-system';
import { formatDayLabel, formatTime } from '@/utils/format';
import { VISIT_STATUS_LABEL } from '@/utils/labels';

import { IconButton } from '../../buttons/IconButton';
import { StatusChip } from '../../chips/StatusChip';
import { AppText } from '../../primitives/AppText';
import { CardPressRegion, PressableCard } from '../../primitives/PressableCard';

const statusMap: Record<VisitStatus, { tone: Tone; icon: LucideIcon }> = {
  SCHEDULED: { tone: 'neutral', icon: CalendarClock },
  CONFIRMED: { tone: 'success', icon: CalendarCheck },
  EN_ROUTE: { tone: 'info', icon: Navigation },
  ARRIVED: { tone: 'success', icon: MapPinCheck },
  COMPLETED: { tone: 'success', icon: Check },
  CANCELLED: { tone: 'danger', icon: X },
};

export function VisitStatusChip({ status }: { status: VisitStatus }) {
  const { tone, icon } = statusMap[status];
  return <StatusChip label={VISIT_STATUS_LABEL[status]} tone={tone} icon={icon} />;
}

/** A site visit: when, who, where, its state and one-tap contact. The card opens the visit; the actions are siblings, not children, of that press region. */
export function VisitCard({
  visit,
  customerName,
  projectName,
  now,
  onPress,
  onCall,
  onWhatsApp,
}: {
  visit: SiteVisit;
  customerName: string;
  projectName: string;
  now: Date;
  onPress?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}) {
  const day = formatDayLabel(visit.scheduledAt, now);
  const time = formatTime(visit.scheduledAt);
  return (
    <PressableCard
      style={[elevation.raised, { borderRadius: radius.md, padding: space[16], gap: space[12] }]}
    >
      <CardPressRegion
        onPress={onPress}
        accessibilityLabel={`${customerName}, ${projectName}, ${day} ${time}, ${VISIT_STATUS_LABEL[visit.status]}`}
        accessibilityHint="Opens the site visit"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: space[12],
        }}
      >
        <View style={{ gap: space[2] }}>
          <AppText variant="metricMD">{time}</AppText>
          <AppText variant="caption" tone="secondary">
            {day}
          </AppText>
        </View>
        <VisitStatusChip status={visit.status} />
      </CardPressRegion>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
        <CardPressRegion onPress={onPress} style={{ flex: 1, gap: space[2] }}>
          <AppText variant="headingSM" numberOfLines={1}>
            {customerName}
          </AppText>
          <AppText variant="bodyMD" tone="secondary" numberOfLines={1}>
            {projectName}
          </AppText>
        </CardPressRegion>
        <View style={{ flexDirection: 'row', gap: space[4] }}>
          <IconButton
            icon={Phone}
            accessibilityLabel={`Call ${customerName}`}
            variant="outline"
            onPress={onCall}
          />
          <IconButton
            icon={MessageCircle}
            accessibilityLabel={`WhatsApp ${customerName}`}
            variant="outline"
            onPress={onWhatsApp}
          />
        </View>
      </View>
    </PressableCard>
  );
}
