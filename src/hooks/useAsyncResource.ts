import { useCallback, useEffect, useState } from 'react';

import { usePrototypeStore } from '@/store/prototypeStore';

export type ResourceStatus = 'loading' | 'success' | 'error';

export interface Resource<T> {
  status: ResourceStatus;
  data: T | undefined;
  /** A `RepositoryError` for repository failures. Map to friendly copy; never render `.message`. */
  error: unknown;
  /** Re-run the loader (the "Try again" action). */
  reload: () => void;
}

/**
 * The single pattern feature hooks use to read from repositories:
 *
 *   const loader = useCallback(() => leadRepository.list(filters), [filters]);
 *   const leads = useAsyncResource(loader);
 *
 * It exposes loading / success / error, ignores results that arrive after unmount or after a newer
 * call, and re-runs whenever the prototype dataset changes (scenario switch, reset, clock mode).
 * `loader` must be memoised. Deliberately tiny — Phase 1 does not need a query cache.
 */
export function useAsyncResource<T>(loader: () => Promise<T>): Resource<T> {
  const datasetRevision = usePrototypeStore((s) => s.datasetRevision);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<Pick<Resource<T>, 'status' | 'data' | 'error'>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    let cancelled = false;
    loader().then(
      (data) => {
        if (!cancelled) setState({ status: 'success', data, error: undefined });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', data: undefined, error });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loader, datasetRevision, reloadKey]);

  const reload = useCallback(() => {
    setState((previous) =>
      previous.status === 'success'
        ? previous
        : { status: 'loading', data: undefined, error: undefined },
    );
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, reload };
}
