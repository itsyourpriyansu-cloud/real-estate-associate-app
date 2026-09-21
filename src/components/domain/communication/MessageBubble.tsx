import {
  Building2,
  Check,
  CheckCheck,
  FileText,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import type { Message } from '@/domain';
import { colors, radius, space } from '@/design-system';
import { formatTime } from '@/utils/format';

import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';

const kindMeta: Partial<Record<Message['kind'], { icon: LucideIcon; label: string }>> = {
  PROJECT_CARD: { icon: Building2, label: 'Project details' },
  COST_SHEET: { icon: FileText, label: 'Cost sheet' },
  VISIT_CONFIRMATION: { icon: CalendarCheck, label: 'Visit confirmation' },
};

const STATUS_LABEL = { SENT: 'Sent', DELIVERED: 'Delivered', READ: 'Read' } as const;

/**
 * A chat message. Inbound sits left on a quiet surface; outbound sits right on a lifted surface.
 * Rich messages (project card, cost sheet, visit confirmation) get a small labelled header.
 * Delivery state is an icon AND part of the accessible label ("Read").
 */
export function MessageBubble({ message }: { message: Message }) {
  const outbound = message.direction === 'OUTBOUND';
  const meta = kindMeta[message.kind];
  const time = formatTime(message.sentAt);
  const status = outbound && message.status ? STATUS_LABEL[message.status] : undefined;

  return (
    <View style={{ alignItems: outbound ? 'flex-end' : 'flex-start' }}>
      <View
        accessible
        accessibilityLabel={`${outbound ? 'You' : 'Customer'}${meta ? `, ${meta.label}` : ''}: ${message.body.replace(/\n/g, '. ')}. ${time}${status ? `, ${status}` : ''}`}
        style={{
          maxWidth: '84%',
          paddingHorizontal: space[12],
          paddingVertical: space[8],
          gap: space[4],
          borderRadius: radius.md,
          borderBottomRightRadius: outbound ? radius.xs : radius.md,
          borderBottomLeftRadius: outbound ? radius.md : radius.xs,
          backgroundColor: outbound ? colors.surfaceElevated : colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: outbound ? colors.borderMedium : colors.borderSubtle,
        }}
      >
        {meta ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[6] }}>
            <Icon icon={meta.icon} size="sm" tone="secondary" />
            <AppText variant="labelSM" uppercase tone="secondary">
              {meta.label}
            </AppText>
          </View>
        ) : null}
        <AppText>{message.body}</AppText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: space[4],
          }}
        >
          <AppText variant="caption" tone="secondary">
            {time}
          </AppText>
          {status ? (
            <Icon
              icon={message.status === 'SENT' ? Check : CheckCheck}
              size="sm"
              color={message.status === 'READ' ? colors.inkPrimary : colors.textTertiary}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
