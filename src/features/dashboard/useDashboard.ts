import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { summaryRepository, userRepository } from '@/repositories';

/** The signed-in associate and the two summary containers. */
export function useDashboard() {
  const loader = useCallback(async () => {
    const [user, summary] = await Promise.all([
      userRepository.getCurrent(),
      summaryRepository.getAssociateSummary(),
    ]);
    return { user, summary };
  }, []);
  return useAsyncResource(loader);
}
