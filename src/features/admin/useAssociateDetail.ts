import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { adminRepository } from '@/repositories';

/** One associate and their incentive record (null when unassigned). `associate` is null if unknown. */
export function useAssociateDetail(associateId: string) {
  const loader = useCallback(async () => {
    const associates = await adminRepository.listAssociates();
    const associate = associates.find((a) => a.id === associateId) ?? null;
    const incentive = associate ? await adminRepository.getIncentiveFor(associateId) : null;
    return { associate, incentive };
  }, [associateId]);
  return useAsyncResource(loader);
}
