import {
  CalendarPlus,
  MessageCircle,
  NotebookPen,
  Phone,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { colors, layout, space } from '@/design-system';

import { AppText } from '../../primitives/AppText';
import { IconContainer } from '../../primitives/IconContainer';
import { PressableScale } from '../../primitives/PressableScale';
import { UnreadBadge } from '../communication/UnreadBadge';

function Action({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  badge?: number;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
      containerStyle={{ flex: 1 }}
      pressedStyle={{ backgroundColor: colors.transparent }}
      style={{
        minHeight: layout.minTapTarget + space[12],
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[4],
      }}
    >
      <View>
        <IconContainer icon={icon} size="md" />
        {badge ? (
          <View style={{ position: 'absolute', top: -4, right: -6 }}>
            <UnreadBadge count={badge} />
          </View>
        ) : null}
      </View>
      <AppText variant="labelMD" tone="secondary">
        {label}
      </AppText>
    </PressableScale>
  );
}

/**
 * The four things an associate does to a lead, always one thumb away: Call · WhatsApp · Schedule ·
 * Note. Designed to sit in a screen's sticky-action slot.
 */
export function ContactActionBar({
  onCall,
  onWhatsApp,
  onSchedule,
  onNote,
  unreadMessages,
}: {
  onCall?: () => void;
  onWhatsApp?: () => void;
  onSchedule?: () => void;
  onNote?: () => void;
  unreadMessages?: number;
}) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Action icon={Phone} label="Call" onPress={onCall} />
      <Action icon={MessageCircle} label="WhatsApp" onPress={onWhatsApp} badge={unreadMessages} />
      <Action icon={CalendarPlus} label="Schedule" onPress={onSchedule} />
      <Action icon={NotebookPen} label="Note" onPress={onNote} />
    </View>
  );
}
