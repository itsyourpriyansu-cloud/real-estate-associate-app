import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { conversationRepository } from '@/repositories';

/** Number of conversations with unread messages, for the Inbox tab badge. 0 while loading or on error. */
export function useInboxBadge(): number {
  const loader = useCallback(() => conversationRepository.list({ unreadOnly: true }), []);
  const { data } = useAsyncResource(loader);
  return data?.length ?? 0;
}
