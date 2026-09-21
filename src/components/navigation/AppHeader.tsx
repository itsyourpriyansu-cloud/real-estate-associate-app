import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, layout, space } from '@/design-system';

import { IconButton } from '../buttons/IconButton';
import { AppText } from '../primitives/AppText';
import { Avatar } from '../primitives/Avatar';
import { icons } from '../primitives/icons';
import { PressableScale } from '../primitives/PressableScale';

/**
 * The top bar of the associate area: a round menu button on the left, the screen name in the
 * middle, the profile avatar on the right. Both edges are white floating circles so the bar reads
 * as two controls and a title, not a toolbar.
 */
export function AppHeader({
  title,
  fullName,
  onMenu,
  onProfile,
  right,
}: {
  title: string;
  fullName: string;
  onMenu: () => void;
  onProfile: () => void;
  right?: ReactNode;
}) {
  return (
    <View
      style={{
        minHeight: layout.headerHeight + space[8],
        paddingHorizontal: layout.screenPaddingX,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
      }}
    >
      <IconButton
        icon={icons.menu}
        variant="filled"
        accessibilityLabel="Open menu"
        onPress={onMenu}
      />
      <AppText
        variant="headingSM"
        header
        numberOfLines={1}
        style={{ flex: 1, textAlign: 'center' }}
      >
        {title}
      </AppText>
      {right}
      <PressableScale
        onPress={onProfile}
        haptic="light"
        accessibilityLabel={`Profile, ${fullName}`}
        style={{
          width: layout.minTapTarget,
          height: layout.minTapTarget,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pressedStyle={{ backgroundColor: colors.transparent }}
      >
        <Avatar name={fullName} size="md" />
      </PressableScale>
    </View>
  );
}
