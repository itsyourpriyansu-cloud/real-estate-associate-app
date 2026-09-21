import { AlertCircle, CheckCircle2, Info, type LucideIcon } from 'lucide-react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elevation, layout, motion, radius, space } from '@/design-system';
import { useMotion } from '@/hooks/useMotion';
import { haptics } from '@/services/haptics';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. */
  durationMs?: number;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => undefined });

/** Concise confirmation of a prototype mutation ("Visit marked complete."). */
export const useToast = (): ToastContextValue => useContext(ToastContext);

const toneMap: Record<ToastTone, { icon: LucideIcon; color: 'success' | 'danger' | 'info' }> = {
  success: { icon: CheckCircle2, color: 'success' },
  error: { icon: AlertCircle, color: 'danger' },
  info: { icon: Info, color: 'info' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      counter.current += 1;
      setToast({ ...options, id: counter.current });
      const tone = options.tone ?? 'success';
      if (tone === 'success') haptics.success();
      else if (tone === 'error') haptics.warning();
      AccessibilityInfo.announceForAccessibility(options.message);
      timer.current = setTimeout(dismiss, options.durationMs ?? 2800);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} {...toast} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ message, tone = 'success' }: ToastOptions) {
  const insets = useSafeAreaInsets();
  const { reduced, ms } = useMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  const { icon, color } = toneMap[tone];

  useEffect(() => {
    progress.set(withTiming(1, { duration: ms('standard') }));
  }, [progress, ms]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * motion.toastTranslate }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[styles.host, { bottom: insets.bottom + layout.tabBarHeight + space[16] }]}
    >
      <Animated.View
        accessible
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[elevation.overlay, styles.toast, animated]}
      >
        <Icon icon={icon} size="xl" tone={color} />
        <AppText variant="labelLG" style={styles.message} numberOfLines={2}>
          {message}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    paddingHorizontal: space[16],
    paddingVertical: space[12],
    borderRadius: radius.md,
    maxWidth: layout.maxContentWidth,
  },
  message: { flexShrink: 1 },
});
