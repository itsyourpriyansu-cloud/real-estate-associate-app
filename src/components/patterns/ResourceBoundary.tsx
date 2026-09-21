import type { ReactNode } from 'react';

import type { Resource } from '@/hooks/useAsyncResource';

import { LoadingState } from '../feedback/Skeleton';
import { RepositoryErrorState } from '../feedback/States';

/**
 * Renders the four states of any repository-backed resource, so a screen never forgets one:
 * loading (skeleton in the shape of the content), error (recoverable, friendly copy), empty
 * (a human empty state) and success.
 */
export function ResourceBoundary<T>({
  resource,
  subject,
  loading,
  isEmpty,
  empty,
  children,
}: {
  resource: Resource<T>;
  /** Lower-case noun for error copy: "your leads", "this project". */
  subject: string;
  /** Skeleton to show while loading. Defaults to three rows. */
  loading?: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (resource.status === 'error') {
    return (
      <RepositoryErrorState error={resource.error} subject={subject} onRetry={resource.reload} />
    );
  }
  if (resource.status === 'loading' || resource.data === undefined) {
    return <>{loading ?? <LoadingState variant="rows" />}</>;
  }
  if (isEmpty?.(resource.data) && empty) return <>{empty}</>;
  return <>{children(resource.data)}</>;
}
