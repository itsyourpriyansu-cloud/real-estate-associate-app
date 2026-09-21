import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { plotRepository, projectRepository } from '@/repositories';

const PLOT_SAMPLE = 6;

/** Projects, plus an inventory sample for the first one so the plot components can be judged on real data. */
export function useProjectsPreview() {
  const loader = useCallback(async () => {
    const projects = await projectRepository.list();
    const featured = projects[0];
    if (!featured) return { projects, featured: undefined, summary: undefined, plots: [] };
    const [summary, plots] = await Promise.all([
      projectRepository.getInventorySummary(featured.id),
      plotRepository.list({ projectId: featured.id }),
    ]);
    return { projects, featured, summary, plots: plots.slice(0, PLOT_SAMPLE) };
  }, []);
  return useAsyncResource(loader);
}
