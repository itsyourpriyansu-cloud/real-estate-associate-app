import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { projectRepository, salesRepository, userRepository } from '@/repositories';

/** The team's sales and targets, with the names needed to show who sold what. */
export function useTeamSales() {
  const loader = useCallback(async () => {
    const [sales, targets, projects] = await Promise.all([
      salesRepository.listTeam(),
      salesRepository.getTargets(),
      projectRepository.list(),
    ]);
    const sellerIds = [...new Set(sales.map((s) => s.associateId))];
    const sellers = await Promise.all(sellerIds.map((id) => userRepository.getById(id)));
    const names: Record<string, string> = {};
    sellers.forEach((seller, index) => {
      const id = sellerIds[index];
      if (id) names[id] = seller?.fullName ?? 'Former member';
    });
    const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));
    return { sales, targets, names, projectNames };
  }, []);
  return useAsyncResource(loader);
}
