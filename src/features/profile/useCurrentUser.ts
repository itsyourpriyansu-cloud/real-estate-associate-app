import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { userRepository } from '@/repositories';

/**
 * Feature hook (view-model layer): the profile route consumes this and knows nothing about seeds,
 * mocks or storage. Replacing `MockUserRepository` with an API repository changes nothing here.
 */
export function useCurrentUser() {
  const loader = useCallback(() => userRepository.getCurrent(), []);
  return useAsyncResource(loader);
}
