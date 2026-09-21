import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors, elevation, layout, motion, radius, space } from '@/design-system';

import { CountBadge } from '../primitives/CountBadge';
import { Icon } from '../primitives/Icon';
import { PressableScale, type HapticKind } from '../primitives/PressableScale';

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required: icon-only controls must be nameable by a screen reader. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: 'plain' | 'filled' | 'outline';
  disabled?: boolean;
  haptic?: HapticKind;
  /** Small dot/number badge, e.g. unread notifications. */
  badgeCount?: number;
  testID?: string;
}

/** 44×44 icon control. `plain` for headers, `filled` for emphasis, `outline` for secondary actions. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  disabled,
  haptic = 'light',
  badgeCount,
  testID,
}: IconButtonProps) {
  const label =
    badgeCount && badgeCount > 0
      ? `${accessibilityLabel}, ${badgeCount} unread`
      : accessibilityLabel;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      scaleTo={motion.pressScaleIcon}
      accessibilityLabel={label}
      style={{
        width: layout.minTapTarget,
        height: layout.minTapTarget,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variant === 'filled' ? colors.surfacePrimary : colors.transparent,
        borderWidth: variant === 'plain' ? 0 : 1,
        borderColor: variant === 'outline' ? colors.borderMedium : colors.borderSubtle,
        ...(variant === 'filled'
          ? {
              shadowColor: elevation.raised.shadowColor,
              shadowOpacity: elevation.raised.shadowOpacity,
              shadowRadius: elevation.raised.shadowRadius,
              shadowOffset: elevation.raised.shadowOffset,
              elevation: elevation.raised.elevation,
            }
          : null),
      }}
      pressedStyle={variant === 'plain' ? { backgroundColor: colors.surfaceSecondary } : undefined}
    >
      <Icon icon={icon} size="xl" tone="primary" />
      {badgeCount && badgeCount > 0 ? (
        <View style={{ position: 'absolute', top: space[4], right: space[4] }}>
          <CountBadge count={badgeCount > 9 ? '9+' : badgeCount} size="sm" />
        </View>
      ) : null}
    </PressableScale>
  );
}
