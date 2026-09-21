import type { LucideIcon } from 'lucide-react-native';
import { createContext, useContext, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, layout, motion, radius, space, spring } from '@/design-system';
import { useReducedMotion } from '@/hooks/useMotion';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';

/** True while the dock is on screen, so screens can leave room beneath their content. */
export const DockContext = createContext(false);

/** Extra bottom padding a screen needs so its last content clears the floating dock. */
export function useDockClearance(): number {
  return useContext(DockContext) ? layout.dockHeight + layout.dockOffset : 0;
}

export interface DockItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const ITEM = 52;
const ACTIVE = 124;

function DockButton({
  item,
  active,
  onPress,
}: {
  item: DockItem;
  active: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.set(reduced ? (active ? 1 : 0) : withSpring(active ? 1 : 0, spring.settle));
  }, [active, reduced, progress]);

  const widthStyle = useAnimatedStyle(() => ({
    width: ITEM + (ACTIVE - ITEM) * progress.value,
    backgroundColor: active ? colors.surfaceInverseRaised : colors.transparent,
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={motion.pressScaleButton}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      pressedStyle={{ backgroundColor: colors.surfaceInverseRaised }}
      style={{ borderRadius: radius.pill }}
    >
      <Animated.View
        style={[
          {
            height: ITEM,
            borderRadius: radius.pill,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space[8],
            overflow: 'hidden',
          },
          widthStyle,
        ]}
      >
        <Icon icon={item.icon} size="xl" color={colors.textOnInverse} />
        {active ? (
          <Animated.View style={labelStyle}>
            <AppText variant="labelLG" tone="onInverse" numberOfLines={1}>
              {item.label}
            </AppText>
          </Animated.View>
        ) : null}
      </Animated.View>
    </PressableScale>
  );
}

/**
 * The floating dock: a charcoal pill hovering above the bottom edge with the four places an
 * associate goes between. The selected item widens to show its label (a spring), the rest are
 * icons. It floats over the content, so screens read `useDockClearance()` for their bottom space.
 */
export function AssociateDock({
  items,
  activeKey,
  onSelect,
}: {
  items: DockItem[];
  activeKey: string | undefined;
  onSelect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + layout.dockOffset,
        alignItems: 'center',
      }}
    >
      <View
        accessibilityRole="tablist"
        style={[
          elevation.inverse,
          {
            height: layout.dockHeight,
            borderRadius: radius.pill,
            paddingHorizontal: space[6],
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[2],
          },
        ]}
      >
        {items.map((item) => (
          <DockButton
            key={item.key}
            item={item}
            active={item.key === activeKey}
            onPress={() => onSelect(item.key)}
          />
        ))}
      </View>
    </View>
  );
}
