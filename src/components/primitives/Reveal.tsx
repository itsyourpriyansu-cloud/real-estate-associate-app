import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';

export interface RevealProps {
  children: ReactNode;
  /** Position in a staggered group; later items start slightly later (capped so lists stay quick). */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrance motion for content: a short fade and rise, staggered by `index`. Used for the sections
 * of a screen and the rows of a list so content settles in rather than popping. It never blocks
 * interaction, and with Reduce Motion on the content is simply there.
 */
export function Reveal({ children, index = 0, style }: RevealProps) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    const delay = Math.min(index, motion.staggerMax) * motion.staggerStep;
    progress.set(
      withDelay(
        delay,
        withTiming(1, { duration: motion.enterMs, easing: Easing.out(Easing.cubic) }),
      ),
    );
  }, [index, progress, reduced]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * motion.enterTranslate }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
