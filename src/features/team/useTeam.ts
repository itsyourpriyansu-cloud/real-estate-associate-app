import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { teamRepository, userRepository } from '@/repositories';

/** The associate's downline, direct members first. */
export function useTeam() {
  const loader = useCallback(() => teamRepository.listMyTeam(), []);
  return useAsyncResource(loader);
}

/** One member of the downline, and who added them. `member` is null outside the downline. */
export function useMember(memberId: string) {
  const loader = useCallback(async () => {
    const member = await teamRepository.getMember(memberId);
    const sponsor = member?.sponsorId ? await userRepository.getById(member.sponsorId) : null;
    return { member, sponsor };
  }, [memberId]);
  return useAsyncResource(loader);
}
