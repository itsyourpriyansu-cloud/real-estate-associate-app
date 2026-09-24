import { useCallback } from 'react';

import type { User } from '@/domain';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { teamRepository, userRepository } from '@/repositories';

/**
 * Feature hook (view-model layer): the profile route consumes this and knows nothing about seeds,
 * mocks or storage. Replacing `MockUserRepository` with an API repository changes nothing here.
 */
export function useCurrentUser() {
  const loader = useCallback(() => userRepository.getCurrent(), []);
  return useAsyncResource(loader);
}

/** The signed-in user plus their team's display name (resolved separately — `User` only has `teamId`). */
export function useCurrentUserWithTeam() {
  const loader = useCallback(async () => {
    const user = await userRepository.getCurrent();
    const teamName = user ? await teamRepository.getMyTeamName() : null;
    return { user, teamName } satisfies { user: User | null; teamName: string | null };
  }, []);
  return useAsyncResource(loader);
}
