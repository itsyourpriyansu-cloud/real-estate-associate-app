import { View } from 'react-native';

import { colors, radius, space } from '@/design-system';

import { AppText } from '../../primitives/AppText';
import { CountBadge } from '../../primitives/CountBadge';
import { PressableScale } from '../../primitives/PressableScale';

/** White count pill — the only bright mark on a conversation row. Always readable as "N unread". */
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View accessible accessibilityLabel={`${count} unread`}>
      <CountBadge count={count > 99 ? '99+' : count} />
    </View>
  );
}

/** A preset reply the associate can send in one tap. */
export function QuickReplyChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityLabel={`Quick reply: ${label}`}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      style={{
        height: 36,
        paddingHorizontal: space[16],
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.borderMedium,
        justifyContent: 'center',
      }}
    >
      <AppText variant="labelLG" tone="secondary" numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}
