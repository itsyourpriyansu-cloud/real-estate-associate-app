import { plotStatusSchema, type Plot, type Project } from '@/domain';

import type { InventorySummary, ProjectListInput, ProjectRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { matchesQuery } from './utils';

/** Unit counts are always recomputed from the plot table so holds/bookings can't leave them stale. */
function withLiveCounts(project: Project, plots: readonly Plot[]): Project {
  const own = plots.filter((p) => p.projectId === project.id);
  return {
    ...project,
    totalUnits: own.length,
    availableUnits: own.filter((p) => p.status === 'AVAILABLE').length,
  };
}

export class MockProjectRepository implements ProjectRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: ProjectListInput = {}): Promise<Project[]> {
    return this.ctx.read((data) => {
      const { query, location, maxStartingPrice, plotAreaMinSqYd, plotAreaMaxSqYd, availableOnly } =
        input;

      return data.projects
        .map((p) => withLiveCounts(p, data.plots))
        .filter((p) => !query || matchesQuery(query, [p.name, p.developerName, p.location, p.city]))
        .filter((p) => !location || p.location.toLowerCase().includes(location.toLowerCase()))
        .filter((p) => maxStartingPrice === undefined || p.startingPrice <= maxStartingPrice)
        .filter((p) => !availableOnly || p.availableUnits > 0)
        .filter((p) => {
          if (plotAreaMinSqYd === undefined && plotAreaMaxSqYd === undefined) return true;
          return data.plots.some(
            (plot) =>
              plot.projectId === p.id &&
              (plotAreaMinSqYd === undefined || plot.areaSqYd >= plotAreaMinSqYd) &&
              (plotAreaMaxSqYd === undefined || plot.areaSqYd <= plotAreaMaxSqYd),
          );
        });
    });
  }

  getById(id: string): Promise<Project | null> {
    return this.ctx.read((data) => {
      const project = data.projects.find((p) => p.id === id);
      return project ? withLiveCounts(project, data.plots) : null;
    });
  }

  getInventorySummary(projectId: string): Promise<InventorySummary> {
    return this.ctx.read((data) => {
      if (!data.projects.some((p) => p.id === projectId))
        fail('NOT_FOUND', `Project ${projectId} not found`);
      const own = data.plots.filter((p) => p.projectId === projectId);
      const summary: InventorySummary = {
        projectId,
        total: own.length,
        available: 0,
        on_hold: 0,
        booked: 0,
        blocked: 0,
        not_for_sale: 0,
      };
      for (const plot of own) {
        const key = plotStatusSchema.parse(plot.status).toLowerCase() as Lowercase<Plot['status']>;
        summary[key] += 1;
      }
      return summary;
    });
  }

  search(query: string): Promise<Project[]> {
    return this.list({ query });
  }
}
