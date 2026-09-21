import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, motion, spring } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';
import { haptics } from '@/services/haptics';

interface CardPress {
  pressIn: () => void;
  pressOut: () => void;
}

const CardPressContext = createContext<CardPress>({
  pressIn: () => undefined,
  pressOut: () => undefined,
});

/**
 * A card that opens something AND contains its own action buttons (Call, WhatsApp, Share).
 *
 * Interactive elements must never nest (a button inside a button is invalid HTML, confuses screen
 * readers and fights over touches). So the card is a plain surface; the tappable parts are
 * `CardPressRegion`s — siblings of the action buttons — and any region being pressed makes the
 * whole card spring in and darken, so it still feels like one tactile object.
 */
export function PressableCard({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const { reduced } = useMotion();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const controls = useMemo<CardPress>(
    () => ({
      pressIn: () => {
        setPressed(true);
        if (!reduced) scale.set(withSpring(motion.pressScaleCard, spring.press));
      },
      pressOut: () => {
        setPressed(false);
        scale.set(reduced ? 1 : withSpring(1, spring.press));
      },
    }),
    [reduced, scale],
  );

  return (
    <CardPressContext.Provider value={controls}>
      <Animated.View
        style={[style, animated, pressed ? { backgroundColor: colors.surfacePressed } : null]}
      >
        {children}
      </Animated.View>
    </CardPressContext.Provider>
  );
}

/** A tappable region of a `PressableCard`. Give exactly one region per card an accessibility label. */
export function CardPressRegion({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  children,
}: {
  onPress?: () => void;
  /** Omit on secondary regions so a screen reader announces the card once. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const { pressIn, pressOut } = useContext(CardPressContext);
  const primary = accessibilityLabel !== undefined;
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessible={primary}
      accessibilityRole={primary ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={style}
    >
      {children}
    </Pressable>
  );
}
