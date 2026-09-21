import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { leadRepository, type LeadListFilter } from '@/repositories';
import { clock } from '@/services/clock';

/** Leads for a filter chip, plus the Clock's "now" so the card labels ("Today · 10:30 AM") are consistent. */
export function useLeadsPreview(filter: LeadListFilter) {
  const loader = useCallback(async () => {
    const leads = await leadRepository.list({ filter });
    return { leads, now: clock.now() };
  }, [filter]);
  return useAsyncResource(loader);
}
