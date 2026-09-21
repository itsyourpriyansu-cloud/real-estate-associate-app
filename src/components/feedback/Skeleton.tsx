import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii, space, type RadiusToken } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';

import { Surface } from '../primitives/Surface';

/** A quiet pulsing block. With Reduce Motion it is static. */
export function Skeleton({
  width = '100%',
  height = 14,
  rounded = 'xs',
}: {
  width?: DimensionValue;
  height?: number;
  rounded?: RadiusToken;
}) {
  const { reduced, ms } = useMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(pulse);
      pulse.set(1);
      return;
    }
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: ms('slow') * 2 }),
          withTiming(1, { duration: ms('slow') * 2 }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(pulse);
  }, [reduced, ms, pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      aria-hidden
      style={[
        { width, height, borderRadius: radii[rounded], backgroundColor: colors.surfaceElevated },
        style,
      ]}
    />
  );
}

/* Skeleton patterns mirror the real layouts so nothing jumps when data arrives. */

export function SkeletonLeadCard() {
  return (
    <Surface padding={16} style={{ gap: space[12] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width="48%" height={18} />
        <Skeleton width={48} height={20} rounded="pill" />
      </View>
      <Skeleton width="70%" />
      <Skeleton width="55%" />
      <View style={{ flexDirection: 'row', gap: space[8] }}>
        <Skeleton width={44} height={44} rounded="pill" />
        <Skeleton width={44} height={44} rounded="pill" />
      </View>
    </Surface>
  );
}

export function SkeletonRow() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingVertical: space[12],
      }}
    >
      <Skeleton width={40} height={40} rounded="pill" />
      <View style={{ flex: 1, gap: space[8] }}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonProjectCard() {
  return (
    <Surface style={{ gap: space[12] }}>
      <Skeleton height={140} rounded="xs" />
      <View style={{ padding: space[16], paddingTop: 0, gap: space[8] }}>
        <Skeleton width="50%" height={18} />
        <Skeleton width="35%" />
        <Skeleton width="65%" />
      </View>
    </Surface>
  );
}

export function SkeletonMetricStrip() {
  return (
    <View style={{ flexDirection: 'row', gap: space[24] }}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={{ flex: 1, gap: space[8] }}>
          <Skeleton width="60%" height={28} />
          <Skeleton width="80%" height={12} />
        </View>
      ))}
    </View>
  );
}

const variants = {
  cards: SkeletonLeadCard,
  rows: SkeletonRow,
  projects: SkeletonProjectCard,
  metrics: SkeletonMetricStrip,
} as const;

/** Full-area loading state: skeletons in the shape of the content, never a lone spinner. */
export function LoadingState({
  variant = 'rows',
  count = 3,
  label = 'Loading',
}: {
  variant?: keyof typeof variants;
  count?: number;
  label?: string;
}) {
  const Item = variants[variant];
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={{ gap: space[12] }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Item key={index} />
      ))}
    </View>
  );
}
