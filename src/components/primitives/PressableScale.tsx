import { useState, type ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, motion, opacity, spring } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';
import { haptics } from '@/services/haptics';

export type HapticKind = 'none' | 'light' | 'medium' | 'selection' | 'success' | 'warning';

export interface PressableScaleProps extends Omit<
  PressableProps,
  'style' | 'children' | 'accessibilityRole'
> {
  children: ReactNode | ((state: { pressed: boolean }) => ReactNode);
  /** Visible surface (background, border, radius, padding). This is what scales. */
  style?: StyleProp<ViewStyle>;
  /** Applied while pressed, on top of `style`. Defaults to a subtle surface darken. */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Layout of the touch target itself (flex, alignSelf, margins). */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  /** Dim the surface when disabled. Turn off when the disabled look is drawn by the caller. */
  dimWhenDisabled?: boolean;
  /** Fired on a successful press. */
  haptic?: HapticKind;
  accessibilityRole?: AccessibilityRole;
}

/**
 * The tactile press primitive: a spring scale on press, a surface change, and an optional haptic.
 * Cards, buttons, chips and rows are all built on this so press feedback is uniform. With Reduce
 * Motion on, the scale is skipped (the surface change and haptic remain).
 */
export function PressableScale({
  children,
  style,
  pressedStyle,
  containerStyle,
  scaleTo = motion.pressScaleCard,
  dimWhenDisabled = true,
  haptic = 'none',
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  accessibilityRole = 'button',
  accessibilityState,
  ...rest
}: PressableScaleProps) {
  const { reduced } = useMotion();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={containerStyle}
      onPressIn={(event) => {
        setPressed(true);
        if (!reduced) scale.set(withSpring(scaleTo, spring.press));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        scale.set(reduced ? 1 : withSpring(1, spring.press));
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic !== 'none') haptics[haptic]();
        onPress?.(event);
      }}
    >
      <Animated.View
        style={[
          style,
          animatedStyle,
          pressed && !disabled ? [{ backgroundColor: colors.surfacePressed }, pressedStyle] : null,
          disabled && dimWhenDisabled ? { opacity: opacity.disabled } : null,
        ]}
      >
        {typeof children === 'function' ? children({ pressed }) : children}
      </Animated.View>
    </Pressable>
  );
}
