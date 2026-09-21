import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  leadRepository,
  plotRepository,
  projectRepository,
  userRepository,
  visitRepository,
} from '@/repositories';

/** The signed-in associate's site visits, with the customer and project names to show. */
export function useVisitHistory() {
  const loader = useCallback(async () => {
    const me = await userRepository.getCurrent();
    const [visits, leads, projects] = await Promise.all([
      visitRepository.list(me ? { associateIds: [me.id] } : {}),
      leadRepository.list(),
      projectRepository.list(),
    ]);
    return {
      visits: [...visits].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
      customers: Object.fromEntries(leads.map((l) => [l.id, l.fullName])),
      projects: Object.fromEntries(projects.map((p) => [p.id, p.name])),
    };
  }, []);
  return useAsyncResource(loader);
}

/** One visit with its customer, project and shortlisted plots. `visit` is null for an unknown id. */
export function useVisitDetail(visitId: string) {
  const loader = useCallback(async () => {
    const visit = await visitRepository.getById(visitId);
    if (!visit) return { visit: null, lead: null, project: null, plots: [] };
    const [lead, project, plots] = await Promise.all([
      leadRepository.getById(visit.leadId),
      projectRepository.getById(visit.projectId),
      Promise.all(visit.shortlistedPlotIds.map((id) => plotRepository.getById(id))),
    ]);
    return { visit, lead, project, plots: plots.flatMap((p) => (p ? [p] : [])) };
  }, [visitId]);
  return useAsyncResource(loader);
}
