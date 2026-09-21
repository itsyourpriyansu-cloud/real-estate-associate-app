import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, motion, radius, space } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';

import { AppText } from '../primitives/AppText';
import { CountBadge } from '../primitives/CountBadge';
import { PressableScale } from '../primitives/PressableScale';

// Derived from expo-router so this file does not depend on a transitive @react-navigation import.
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * The bottom navigation: exactly the tabs the layout declares (Home, Leads, Projects, Tasks, Inbox).
 * Active = white icon + label with a short indicator; inactive = muted grey. No coloured pills, no
 * heavy motion: the indicator fades and the icon presses in. It owns the bottom safe-area inset.
 */
export function AppTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
        paddingBottom: insets.bottom,
        paddingHorizontal: space[4],
      }}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;
        const { options } = descriptor;
        const focused = state.index === index;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const badge = options.tabBarBadge;

        return (
          <TabItem
            key={route.key}
            label={label}
            focused={focused}
            badge={badge}
            renderIcon={(color) => options.tabBarIcon?.({ focused, color, size: 22 })}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented)
                navigation.navigate(route.name, route.params);
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  label,
  focused,
  badge,
  renderIcon,
  onPress,
  onLongPress,
}: {
  label: string;
  focused: boolean;
  badge?: number | string;
  renderIcon: (color: string) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { ms } = useMotion();
  const indicator = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    indicator.set(withTiming(focused ? 1 : 0, { duration: ms('fast') }));
  }, [focused, indicator, ms]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicator.value,
    transform: [{ scaleX: 0.4 + indicator.value * 0.6 }],
  }));

  const color = focused ? colors.textPrimary : colors.textSecondary;
  const hasBadge = badge !== undefined && badge !== 0 && badge !== '';

  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      haptic={focused ? 'none' : 'selection'}
      scaleTo={motion.pressScaleChip}
      accessibilityRole="tab"
      accessibilityLabel={hasBadge ? `${label}, ${badge} unread` : label}
      accessibilityState={{ selected: focused }}
      containerStyle={{ flex: 1 }}
      pressedStyle={{ backgroundColor: colors.transparent }}
      style={{
        minHeight: layout.tabBarHeight,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[4],
        paddingTop: space[4],
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            width: 24,
            height: 2,
            borderRadius: radius.pill,
            backgroundColor: colors.inkPrimary,
          },
          indicatorStyle,
        ]}
      />
      <View>
        {renderIcon(color)}
        {hasBadge ? (
          <View style={{ position: 'absolute', top: -space[6], right: -space[12] }}>
            <CountBadge count={badge} size="sm" />
          </View>
        ) : null}
      </View>
      <AppText variant="tabLabel" style={{ color }} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}
