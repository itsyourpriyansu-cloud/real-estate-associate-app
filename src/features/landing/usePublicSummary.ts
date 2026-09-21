import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { summaryRepository } from '@/repositories';

/** Home page numbers. Needs no session, so it works before anyone signs in. */
export function usePublicSummary() {
  const loader = useCallback(() => summaryRepository.getPublicSummary(), []);
  return useAsyncResource(loader);
}
