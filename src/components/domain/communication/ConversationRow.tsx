import { View } from 'react-native';

import type { Conversation, Message } from '@/domain';
import { radius, space } from '@/design-system';
import { formatRelativePast } from '@/utils/format';

import { AppText } from '../../primitives/AppText';
import { Avatar } from '../../primitives/Avatar';
import { PressableScale } from '../../primitives/PressableScale';
import { UnreadBadge } from './UnreadBadge';

const KIND_LABEL: Record<Message['kind'], string> = {
  TEXT: '',
  PROJECT_CARD: 'Project details',
  COST_SHEET: 'Cost sheet',
  VISIT_CONFIRMATION: 'Visit confirmation',
};

/** One-line preview: rich messages read as what they are; outbound ones are prefixed with "You". */
export function previewOf(message: Message): string {
  const kind = KIND_LABEL[message.kind];
  const body = kind || message.body.replace(/\s+/g, ' ');
  return message.direction === 'OUTBOUND' ? `You: ${body}` : body;
}

/**
 * A prototype-inbox row: who, the last message, when, and unread. Unread rows are brighter and carry
 * a count badge — weight alone is not the signal. (Seeded threads only; not live WhatsApp.)
 */
export function ConversationRow({
  conversation,
  customerName,
  projectName,
  now,
  onPress,
}: {
  conversation: Conversation;
  customerName: string;
  /** Project context, shown quietly under the name. */
  projectName?: string;
  now: Date;
  onPress?: () => void;
}) {
  const last = conversation.messages.at(-1);
  const unread = conversation.unreadCount;
  const time = formatRelativePast(conversation.lastMessageAt, now);
  const preview = last ? previewOf(last) : 'No messages yet';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={1}
      accessibilityLabel={`${customerName}${projectName ? `, ${projectName}` : ''}. ${unread > 0 ? `${unread} unread. ` : ''}${preview}. ${time}`}
      style={{ borderRadius: radius.sm }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: space[12],
          paddingVertical: space[12],
          alignItems: 'center',
        }}
      >
        <Avatar name={customerName} size="md" />
        <View style={{ flex: 1, gap: space[2] }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: space[8],
            }}
          >
            <AppText variant="labelLG" numberOfLines={1} style={{ flex: 1 }}>
              {customerName}
            </AppText>
            <AppText variant="caption" tone={unread > 0 ? 'primary' : 'secondary'}>
              {time}
            </AppText>
          </View>
          {projectName ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {projectName}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
            <AppText
              variant="bodySM"
              tone={unread > 0 ? 'primary' : 'secondary'}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {preview}
            </AppText>
            <UnreadBadge count={unread} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
