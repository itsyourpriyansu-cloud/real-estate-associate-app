import { useMemo } from 'react';

import { clock } from '@/services/clock';
import { usePrototypeStore } from '@/store/prototypeStore';

/**
 * "Now" for presentation code, from the Clock service (never `new Date()`), so demo mode always
 * renders relative labels ("Today · 10:30 AM", "Overdue") against the frozen demo time. The value
 * is stable for the life of a screen and refreshes when the prototype dataset or clock mode changes.
 */
export function useNow(): Date {
  const datasetRevision = usePrototypeStore((state) => state.datasetRevision);
  // datasetRevision is the refresh signal (scenario / clock-mode switches); it is not read here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => clock.now(), [datasetRevision]);
}
