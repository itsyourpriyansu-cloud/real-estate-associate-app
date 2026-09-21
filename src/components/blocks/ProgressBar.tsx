import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { colors, motion, radius, space } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';

import { AppText } from '../primitives/AppText';

const TRACK = 14;
const KNOB = 22;
const HATCH_GAP = 7;

export interface ProgressBarProps {
  /** 0–1. Values above 1 fill the bar and the label reads over 100%. */
  value: number;
  label: string;
  /** Left and right captions under the bar, e.g. "Achieved ₹3.2Cr" and "Target ₹5Cr". */
  startCaption?: string;
  endCaption?: string;
}

/**
 * A progress bar in the hatched style: a green fill with diagonal stripes and a round knob at its
 * end, on a soft track. The fill animates to its value on arrival (instantly with Reduce Motion).
 * Exposed as a real `progressbar` with its percentage spoken.
 */
export function ProgressBar({ value, label, startCaption, endCaption }: ProgressBarProps) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useSharedValue(0);
  const percent = Math.round(value * 100);

  useEffect(() => {
    const target = trackWidth * clamped;
    width.set(
      reduced
        ? target
        : withTiming(target, { duration: motion.progressFillMs, easing: Easing.out(Easing.cubic) }),
    );
  }, [clamped, trackWidth, reduced, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: Math.max(width.value, TRACK) }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.max(width.value, TRACK) - KNOB / 2 - TRACK / 2 }],
  }));

  const stripes = trackWidth > 0 ? Math.ceil(trackWidth / HATCH_GAP) + 2 : 0;

  return (
    <View style={{ gap: space[8] }}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(percent, 100), text: `${percent}%` }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={{
          height: KNOB,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            height: TRACK,
            borderRadius: radius.pill,
            backgroundColor: colors.backgroundTertiary,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                height: TRACK,
                borderRadius: radius.pill,
                backgroundColor: colors.brand,
                overflow: 'hidden',
              },
              fillStyle,
            ]}
          >
            <Svg width={trackWidth} height={TRACK}>
              {Array.from({ length: stripes }, (_, i) => (
                <Line
                  key={i}
                  x1={i * HATCH_GAP}
                  y1={TRACK}
                  x2={i * HATCH_GAP + TRACK}
                  y2={0}
                  stroke={colors.surfacePrimary}
                  strokeOpacity={0.45}
                  strokeWidth={2}
                />
              ))}
            </Svg>
          </Animated.View>
        </View>
        <Animated.View
          aria-hidden
          style={[
            {
              position: 'absolute',
              left: TRACK / 2,
              width: KNOB,
              height: KNOB,
              borderRadius: radius.pill,
              backgroundColor: colors.surfacePrimary,
              borderWidth: 4,
              borderColor: colors.brandStrong,
            },
            knobStyle,
          ]}
        />
      </View>
      {startCaption || endCaption ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[8] }}>
          <AppText variant="bodySM" tone="secondary">
            {startCaption}
          </AppText>
          <AppText variant="bodySM" tone="secondary">
            {endCaption}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
