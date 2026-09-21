import { useCallback } from 'react';

import type { PlotStatus } from '@/domain';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { plotRepository, projectRepository } from '@/repositories';

/** Every project, with live availability. */
export function useProjects() {
  const loader = useCallback(() => projectRepository.list(), []);
  return useAsyncResource(loader);
}

/** One project and its inventory counts. `project` is null for an unknown id. */
export function useProjectDetail(projectId: string) {
  const loader = useCallback(async () => {
    const [project, summary] = await Promise.all([
      projectRepository.getById(projectId),
      projectRepository.getInventorySummary(projectId).catch(() => undefined),
    ]);
    return { project, summary };
  }, [projectId]);
  return useAsyncResource(loader);
}

/** A project's plots, optionally narrowed by status. */
export function usePlots(projectId: string, statuses?: PlotStatus[]) {
  const key = statuses?.join(',') ?? '';
  const loader = useCallback(
    () =>
      plotRepository.list({
        projectId,
        ...(key ? { statuses: key.split(',') as PlotStatus[] } : null),
        sort: 'NUMBER',
      }),
    [projectId, key],
  );
  return useAsyncResource(loader);
}

/** One plot with its project. `plot` is null for an unknown id. */
export function usePlot(plotId: string) {
  const loader = useCallback(async () => {
    const plot = await plotRepository.getById(plotId);
    const project = plot ? await projectRepository.getById(plot.projectId) : null;
    return { plot, project };
  }, [plotId]);
  return useAsyncResource(loader);
}
