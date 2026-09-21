import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, layout, radius, space, spring } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';

import { AppText } from '../primitives/AppText';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const DISMISS_DISTANCE = 96;

/**
 * Short contextual choices live in sheets; workflows are full screens (spec §17.8). The sheet
 * springs up (no bounce), dims the page with a scrim, closes on scrim tap, Android back, or a
 * downward drag on the handle. With Reduce Motion it appears and disappears without movement.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { reduced, ms } = useMotion();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(height);

  // Derived during render (not in an effect): mount as soon as we are asked to show.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      translateY.set(reduced ? 0 : withSpring(0, spring.sheet));
    } else {
      // Slide out, then unmount when the animation reports it has finished (0ms with Reduce Motion).
      translateY.set(
        withTiming(height, { duration: ms('standard') }, (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }),
      );
    }
    // Only `visible` drives the sheet; motion preference and size are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const drag = Gesture.Pan()
    .onUpdate((event) => {
      translateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > 800) {
        runOnJS(onClose)();
      } else {
        translateY.set(withSpring(0, spring.sheet));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height], [1, 0], 'clamp'),
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            elevation.overlay,
            styles.sheet,
            { paddingBottom: insets.bottom + space[16], maxHeight: height * 0.85 },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={drag}>
            <View style={styles.handleArea} aria-hidden>
              <View style={styles.handle} />
            </View>
          </GestureDetector>
          {title ? (
            <AppText variant="headingMD" header style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: layout.screenPaddingX,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  handleArea: { alignItems: 'center', height: space[24], justifyContent: 'center' },
  handle: { width: 36, height: 4, borderRadius: radius.pill, backgroundColor: colors.borderStrong },
  title: { marginBottom: space[12] },
});
