import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, elevation, motion, radius, space, spring } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { icons } from '../primitives/icons';
import { PressableScale } from '../primitives/PressableScale';

export interface LoginOptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * One way in (Guest or Associate). A radio card: selecting it draws a green ring and a check
 * that springs in; the others stay quiet. The whole card is one radio for screen readers.
 */
export function LoginOptionCard({
  icon,
  title,
  description,
  selected,
  onPress,
}: LoginOptionCardProps) {
  const reduced = useReducedMotion();
  const check = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    check.set(reduced ? (selected ? 1 : 0) : withSpring(selected ? 1 : 0, spring.press));
  }, [selected, reduced, check]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.6 + 0.4 * check.value }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={motion.pressScaleCard}
      accessibilityRole="radio"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ selected, checked: selected }}
      style={{
        ...elevation.raised,
        borderRadius: radius.xl,
        padding: space[16],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[16],
        borderWidth: 1.5,
        borderColor: selected ? colors.brand : colors.borderSubtle,
        backgroundColor: selected ? colors.brandSoft : colors.surfacePrimary,
      }}
    >
      <View
        aria-hidden
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          backgroundColor: selected ? colors.surfacePrimary : colors.surfaceSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={icon} size="xl" color={selected ? colors.brandStrong : colors.textPrimary} />
      </View>
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="headingSM">{title}</AppText>
        <AppText variant="bodySM" tone="secondary" numberOfLines={2}>
          {description}
        </AppText>
      </View>
      <View
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: selected ? colors.brandStrong : colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              width: 26,
              height: 26,
              borderRadius: radius.pill,
              backgroundColor: colors.brandStrong,
              alignItems: 'center',
              justifyContent: 'center',
            },
            checkStyle,
          ]}
        >
          <Icon icon={icons.check} size="sm" color={colors.textInverse} />
        </Animated.View>
      </View>
    </PressableScale>
  );
}
