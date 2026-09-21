import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import type { AppNotification, NotificationType } from '@/domain';
import { colors, radius, space } from '@/design-system';
import { formatRelativePast } from '@/utils/format';
import { NOTIFICATION_TYPE_LABEL } from '@/utils/labels';

import { AppText } from '../primitives/AppText';
import { IconContainer } from '../primitives/IconContainer';
import { PressableScale } from '../primitives/PressableScale';

const typeIcon: Record<NotificationType, LucideIcon> = {
  ACTION_REQUIRED: AlertTriangle,
  FOLLOW_UP: CalendarClock,
  INVENTORY: Building2,
  UPDATE: Bell,
};

/**
 * Compact, actionable notification. Unread is a dot AND part of the accessible name ("Unread"), and
 * the type is written out ("Action required") — never colour alone.
 */
export function NotificationRow({
  notification,
  now,
  onPress,
}: {
  notification: AppNotification;
  now: Date;
  onPress?: () => void;
}) {
  const { type, title, body, createdAt, read } = notification;
  const typeLabel = NOTIFICATION_TYPE_LABEL[type];
  const time = formatRelativePast(createdAt, now);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={1}
      accessibilityLabel={`${read ? '' : 'Unread. '}${typeLabel}. ${title}. ${body}. ${time}`}
      style={{ marginHorizontal: -space[8], paddingHorizontal: space[8], borderRadius: radius.sm }}
    >
      <View style={{ flexDirection: 'row', gap: space[12], paddingVertical: space[12] }}>
        <IconContainer
          icon={typeIcon[type]}
          size="md"
          tone={type === 'ACTION_REQUIRED' ? 'warning' : 'neutral'}
        />
        <View style={{ flex: 1, gap: space[2] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
            <AppText variant="labelSM" uppercase tone="secondary">
              {typeLabel}
            </AppText>
            {!read ? (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: colors.whitePrimary,
                }}
              />
            ) : null}
            <AppText variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>
              {time}
            </AppText>
          </View>
          <AppText variant="labelLG" tone={read ? 'secondary' : 'primary'} numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="bodySM" tone="secondary" numberOfLines={2}>
            {body}
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}
