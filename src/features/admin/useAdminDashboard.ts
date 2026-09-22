import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { adminRepository } from '@/repositories';

/** The signed-in admin and every associate. */
export function useAdminDashboard() {
  const loader = useCallback(async () => {
    const [admin, associates] = await Promise.all([
      adminRepository.getCurrentAdmin(),
      adminRepository.listAssociates(),
    ]);
    return { admin, associates };
  }, []);
  return useAsyncResource(loader);
}
