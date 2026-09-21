import { AlertCircle, CalendarClock, MessageCircle, Phone } from 'lucide-react-native';
import { View } from 'react-native';

import type { Lead } from '@/domain';
import { elevation, radius, space } from '@/design-system';
import { formatAreaRange, formatInrRange } from '@/utils/format';
import { describeWhen, urgencyTone } from '@/utils/schedule';
import { LEAD_PRIORITY_LABEL, LEAD_SOURCE_LABEL, LEAD_STAGE_LABEL } from '@/utils/labels';

import { IconButton } from '../../buttons/IconButton';
import { LeadPriorityChip, LeadStageChip } from '../../chips/LeadChips';
import { AppText } from '../../primitives/AppText';
import { Divider } from '../../primitives/Layout';
import { Icon } from '../../primitives/Icon';
import { CardPressRegion, PressableCard } from '../../primitives/PressableCard';

export interface LeadCardProps {
  lead: Lead;
  now: Date;
  onPress?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

/**
 * One lead, scannable in a second: who, how hot, what they want, where they are in the pipeline,
 * and — most importantly — what happens next. One surface, no nested cards, no avatar (an avatar
 * carries no information here). Call and WhatsApp are 44pt targets and siblings of the press
 * regions that open the lead, so no interactive element is nested inside another.
 */
export function LeadCard({ lead, now, onPress, onCall, onWhatsApp }: LeadCardProps) {
  const { requirement: r } = lead;
  const next = lead.nextActionAt ? describeWhen(lead.nextActionAt, now) : undefined;
  const tone = next ? urgencyTone[next.urgency] : 'neutral';
  const locations = r.preferredLocations.join(', ');
  const textTone = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'secondary';

  const summary = [
    lead.fullName,
    `${LEAD_PRIORITY_LABEL[lead.priority]} priority`,
    LEAD_STAGE_LABEL[lead.stage],
    formatInrRange(r.budgetMin, r.budgetMax),
    next ? `Next: ${lead.nextActionLabel}, ${next.text}` : 'No next action scheduled',
  ].join('. ');

  return (
    <PressableCard
      style={[elevation.raised, { borderRadius: radius.md, padding: space[16], gap: space[12] }]}
    >
      <CardPressRegion
        onPress={onPress}
        accessibilityLabel={summary}
        accessibilityHint="Opens the lead"
        style={{ gap: space[12] }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space[12],
          }}
        >
          <AppText variant="headingSM" numberOfLines={1} style={{ flex: 1 }}>
            {lead.fullName}
          </AppText>
          <LeadPriorityChip priority={lead.priority} />
        </View>

        <View style={{ gap: space[2] }}>
          <AppText variant="bodyMD" tone="secondary">
            <AppText variant="labelLG">{formatInrRange(r.budgetMin, r.budgetMax)}</AppText>
            {`  ·  ${formatAreaRange(r.areaMinSqYd, r.areaMaxSqYd)}`}
          </AppText>
          {locations ? (
            <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
              {locations}
            </AppText>
          ) : null}
        </View>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: space[8], flexWrap: 'wrap' }}
        >
          <LeadStageChip stage={lead.stage} />
          <AppText variant="caption" tone="secondary">
            {lead.sourceLabel ?? LEAD_SOURCE_LABEL[lead.source]}
          </AppText>
        </View>
      </CardPressRegion>

      <Divider />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
        <CardPressRegion
          onPress={onPress}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[8] }}
        >
          <Icon
            icon={next?.urgency === 'overdue' ? AlertCircle : CalendarClock}
            size="lg"
            tone={textTone}
          />
          <View style={{ flex: 1 }}>
            {next ? (
              <>
                <AppText variant="labelLG" numberOfLines={2}>
                  {lead.nextActionLabel}
                </AppText>
                <AppText variant="bodySM" tone={textTone}>
                  {next.text}
                </AppText>
              </>
            ) : (
              <AppText variant="bodyMD" tone="secondary">
                No next action scheduled
              </AppText>
            )}
          </View>
        </CardPressRegion>
        <View style={{ flexDirection: 'row', gap: space[4] }}>
          <IconButton
            icon={Phone}
            accessibilityLabel={`Call ${lead.fullName}`}
            variant="outline"
            onPress={onCall}
          />
          <IconButton
            icon={MessageCircle}
            accessibilityLabel={`WhatsApp ${lead.fullName}`}
            variant="outline"
            badgeCount={lead.unreadMessages}
            onPress={onWhatsApp}
          />
        </View>
      </View>
    </PressableCard>
  );
}
