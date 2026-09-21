import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, elevation, motion, radius, space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';

/** A quick action: an icon over a short label on a white tile. Sits in an `ActionTileRow`. */
export function ActionTile({
  icon,
  label,
  onPress,
  accessibilityHint,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={motion.pressScaleCard}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      containerStyle={{ flex: 1 }}
      style={{
        ...elevation.raised,
        borderRadius: radius.lg,
        paddingVertical: space[16],
        paddingHorizontal: space[8],
        alignItems: 'center',
        gap: space[8],
      }}
    >
      <View
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.pill,
          backgroundColor: colors.brandMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={icon} size="lg" color={colors.brandStrong} />
      </View>
      <AppText variant="labelMD" style={{ textAlign: 'center' }} numberOfLines={2}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export function ActionTileRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: space[12] }}>{children}</View>;
}
