import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { teamRepository, userRepository } from '@/repositories';

/** The associate's downline, direct members first. */
export function useTeam() {
  const loader = useCallback(() => teamRepository.listMyTeam(), []);
  return useAsyncResource(loader);
}

/** One member of the downline, and who they report to. `member` is null outside the downline. */
export function useMember(memberId: string) {
  const loader = useCallback(async () => {
    const member = await teamRepository.getMember(memberId);
    const sponsor = member?.reportingManagerId
      ? await userRepository.getById(member.reportingManagerId)
      : null;
    return { member, sponsor };
  }, [memberId]);
  return useAsyncResource(loader);
}

/** The signed-in associate — used where a screen needs to check `designation` before rendering. */
export function useCurrentAssociate() {
  const loader = useCallback(() => userRepository.getCurrent(), []);
  return useAsyncResource(loader);
}
