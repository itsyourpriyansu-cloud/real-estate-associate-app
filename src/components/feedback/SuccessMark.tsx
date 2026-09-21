import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spring } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';

import { Icon } from '../primitives/Icon';
import { icons } from '../primitives/icons';

const SIZE = 88;

/**
 * The confirmation mark: a green disc whose check springs in, with one soft ring that expands and
 * fades once. It plays a single time on arrival (it never loops) and is static with Reduce Motion.
 * Decorative: the screen around it carries the spoken message.
 */
export function SuccessMark() {
  const reduced = useReducedMotion();
  const pop = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      pop.set(1);
      ring.set(1);
      return;
    }
    pop.set(withSpring(1, spring.settle));
    ring.set(
      withDelay(
        120,
        withTiming(1, { duration: motion.successRingMs, easing: Easing.out(Easing.cubic) }),
      ),
    );
  }, [pop, ring, reduced]);

  const discStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: 0.5 + 0.5 * pop.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.5 * (1 - ring.value),
    transform: [{ scale: 1 + 0.6 * ring.value }],
  }));

  return (
    <View
      aria-hidden
      style={{
        width: SIZE * 1.6,
        height: SIZE * 1.6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.brand,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.brandStrong,
            alignItems: 'center',
            justifyContent: 'center',
          },
          discStyle,
        ]}
      >
        <Icon icon={icons.check} size="hero" color={colors.textInverse} />
      </Animated.View>
    </View>
  );
}
