import { useEffect, useRef, useState } from 'react';

import { motion } from '@/design-system';

import { useReducedMotion } from './useMotion';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Counts a figure up to `target` (and between targets when it changes). Headline numbers that
 * arrive from a repository should settle rather than snap. With Reduce Motion on, or `enabled`
 * false, the value is the target immediately. Uses `requestAnimationFrame`, so it runs the same on
 * native, web and in tests.
 */
export function useCountUp(
  target: number,
  { enabled = true, ms = motion.countUpMs }: { enabled?: boolean; ms?: number } = {},
): number {
  const reduced = useReducedMotion();
  const instant = reduced || !enabled;
  const [value, setValue] = useState(instant ? target : 0);
  const shown = useRef(instant ? target : 0);

  useEffect(() => {
    if (instant) {
      shown.current = target;
      return;
    }
    const from = shown.current;
    if (from === target) return;
    let frame = 0;
    let start: number | undefined;
    const step = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / ms);
      const next = from + (target - from) * easeOutCubic(progress);
      shown.current = progress === 1 ? target : next;
      setValue(shown.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, instant, ms]);

  return instant ? target : value;
}
