import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, opacity, radius } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';
import { haptics } from '@/services/haptics';

const TRACK_W = 52;
const TRACK_H = 32;
const THUMB = 24;
const INSET = 4;
const BORDER = 1;

/**
 * Tokenised switch. Native switches differ per platform (and ignore our palette on web), so the
 * toggle is drawn once: a pill track that turns green when on, with a white thumb that slides. The state
 * is exposed as a real `switch` with a checked value, and the hit area is 44pt tall.
 */
export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
  disabled,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  const { ms } = useMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(value ? 1 : 0, { duration: ms('fast') }));
  }, [value, progress, ms]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_W - THUMB - INSET * 2) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      onPress={() => {
        haptics.selection();
        onValueChange(!value);
      }}
      style={{ opacity: disabled ? opacity.disabled : 1 }}
    >
      <View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: radius.pill,
          padding: INSET - BORDER,
          justifyContent: 'center',
          backgroundColor: value ? colors.brandStrong : colors.backgroundTertiary,
          borderWidth: BORDER,
          borderColor: value ? colors.brandStrong : colors.borderMedium,
        }}
      >
        <Animated.View
          style={[
            {
              width: THUMB,
              height: THUMB,
              borderRadius: radius.pill,
              backgroundColor: colors.surfacePrimary,
            },
            thumbStyle,
          ]}
        />
      </View>
    </Pressable>
  );
}
