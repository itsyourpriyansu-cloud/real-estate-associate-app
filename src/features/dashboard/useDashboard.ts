import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { salesRepository, summaryRepository, userRepository } from '@/repositories';

/** The signed-in associate, the two summary containers, and their incentive record. */
export function useDashboard() {
  const loader = useCallback(async () => {
    const [user, summary, incentive] = await Promise.all([
      userRepository.getCurrent(),
      summaryRepository.getAssociateSummary(),
      salesRepository.getIncentive(),
    ]);
    return { user, summary, incentive };
  }, []);
  return useAsyncResource(loader);
}
