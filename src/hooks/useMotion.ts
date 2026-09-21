import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { duration, type DurationToken } from '@/design-system';
import { usePreferencesStore } from '@/store/preferencesStore';

/**
 * Reduce Motion: the OS accessibility setting, unless the user (or QA) forces it on/off in
 * preferences. Built on RN's AccessibilityInfo rather than Reanimated so it is testable and
 * works identically on web.
 */
export function useReducedMotion(): boolean {
  const preference = usePreferencesStore((state) => state.reduceMotion);
  const [system, setSystem] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setSystem(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return system;
}

/**
 * Motion helpers for components. When Reduce Motion is on, every duration is 0 and callers skip
 * springs/transforms — state changes still happen, they just don't animate.
 */
export function useMotion() {
  const reduced = useReducedMotion();
  return {
    reduced,
    ms: (token: DurationToken): number => (reduced ? 0 : duration[token]),
  };
}
