import { AlertCircle, Clock } from 'lucide-react-native';
import { View } from 'react-native';

import type { Lead, Task } from '@/domain';
import { elevation, radius, space, topHighlight } from '@/design-system';
import { formatInrRange } from '@/utils/format';
import { describeWhen, urgencyTone } from '@/utils/schedule';

import { Button } from '../../buttons/Button';
import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';

/**
 * The single most important thing to do next, promoted above everything else on Home. It is the one
 * elevated surface on the screen: what to do, who for, when, and one tap to call, message or open.
 */
export function NextActionCard({
  task,
  lead,
  now,
  onCall,
  onWhatsApp,
  onOpen,
}: {
  task: Task;
  lead?: Lead;
  now: Date;
  onCall?: () => void;
  onWhatsApp?: () => void;
  onOpen?: () => void;
}) {
  const when = describeWhen(task.scheduledAt, now);
  const tone = urgencyTone[when.urgency];
  const budget = lead
    ? formatInrRange(lead.requirement.budgetMin, lead.requirement.budgetMax)
    : undefined;

  return (
    <View
      accessible={false}
      style={[
        elevation.elevated,
        { borderRadius: radius.lg, padding: space[20], gap: space[16], overflow: 'hidden' },
      ]}
    >
      <View
        pointerEvents="none"
        style={[topHighlight, { position: 'absolute', top: 0, left: 0, right: 0 }]}
      />
      <AppText variant="labelSM" tone="secondary" uppercase>
        Next action
      </AppText>
      <View style={{ gap: space[4] }}>
        {lead ? (
          <AppText variant="headingLG" numberOfLines={2} header>
            {lead.fullName}
          </AppText>
        ) : null}
        <AppText variant="bodyLG">{task.title}</AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8], flexWrap: 'wrap' }}>
        <Icon
          icon={when.urgency === 'overdue' ? AlertCircle : Clock}
          size="lg"
          tone={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'secondary'}
        />
        <AppText variant="labelLG" tone={tone === 'danger' ? 'danger' : 'primary'}>
          {when.text}
        </AppText>
        {budget ? <AppText tone="secondary">{`·  Budget ${budget}`}</AppText> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: space[8], flexWrap: 'wrap' }}>
        <Button
          label="Call"
          size="medium"
          onPress={onCall}
          accessibilityLabel={lead ? `Call ${lead.fullName}` : 'Call'}
        />
        <Button
          label="WhatsApp"
          accessibilityLabel={lead ? `WhatsApp ${lead.fullName}` : 'WhatsApp'}
          size="medium"
          variant="secondary"
          onPress={onWhatsApp}
        />
        <Button
          label="Open"
          accessibilityLabel={lead ? `Open ${lead.fullName}` : 'Open'}
          size="medium"
          variant="tertiary"
          onPress={onOpen}
        />
      </View>
    </View>
  );
}
