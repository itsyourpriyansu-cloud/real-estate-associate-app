import { View } from 'react-native';

import { colors, radius, space } from '@/design-system';

import { AppText } from './AppText';

const dimension = { sm: 16, md: 20 } as const;

/**
 * The one count pill: white with dark digits, so it is the only bright mark on a row, icon or tab.
 * Used for unread counts (inbox, notifications, WhatsApp). Decorative — callers put the meaning in
 * their own accessibility label.
 */
export function CountBadge({
  count,
  size = 'md',
}: {
  count: number | string;
  size?: keyof typeof dimension;
}) {
  return (
    <View
      style={{
        minWidth: dimension[size],
        height: dimension[size],
        paddingHorizontal: space[4],
        borderRadius: radius.pill,
        backgroundColor: colors.whitePrimary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText
        variant={size === 'sm' ? 'caption' : 'labelMD'}
        tone="inverse"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {count}
      </AppText>
    </View>
  );
}
