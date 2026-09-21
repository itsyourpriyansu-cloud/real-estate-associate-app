import { addHours } from 'date-fns';

import type { Plot } from '@/domain';

import type { PlotListInput, PlotRepository, PlotSort } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { matchesQuery } from './utils';

const PROTOTYPE_HOLD_HOURS = 24;

const comparators: Record<PlotSort, (a: Plot, b: Plot) => number> = {
  NUMBER: (a, b) =>
    a.projectId.localeCompare(b.projectId) || Number(a.plotNumber) - Number(b.plotNumber),
  PRICE_ASC: (a, b) => a.estimatedTotal - b.estimatedTotal,
  PRICE_DESC: (a, b) => b.estimatedTotal - a.estimatedTotal,
  AREA_ASC: (a, b) => a.areaSqYd - b.areaSqYd,
  AREA_DESC: (a, b) => b.areaSqYd - a.areaSqYd,
};

export class MockPlotRepository implements PlotRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: PlotListInput = {}): Promise<Plot[]> {
    return this.ctx.read((data) => {
      const {
        projectId,
        statuses,
        facing,
        cornerOnly,
        areaMinSqYd,
        areaMaxSqYd,
        maxTotalPrice,
        sort = 'NUMBER',
      } = input;
      return data.plots
        .filter((p) => !projectId || p.projectId === projectId)
        .filter((p) => !statuses?.length || statuses.includes(p.status))
        .filter((p) => !facing?.length || facing.includes(p.facing))
        .filter((p) => !cornerOnly || p.isCorner)
        .filter((p) => areaMinSqYd === undefined || p.areaSqYd >= areaMinSqYd)
        .filter((p) => areaMaxSqYd === undefined || p.areaSqYd <= areaMaxSqYd)
        .filter((p) => maxTotalPrice === undefined || p.estimatedTotal <= maxTotalPrice)
        .sort(comparators[sort]);
    });
  }

  getById(id: string): Promise<Plot | null> {
    return this.ctx.read((data) => data.plots.find((p) => p.id === id) ?? null);
  }

  placePrototypeHold(plotId: string): Promise<Plot> {
    return this.ctx.write((data, now) => {
      const plot = data.plots.find((p) => p.id === plotId);
      if (!plot) fail('NOT_FOUND', `Plot ${plotId} not found`);
      if (plot.status !== 'AVAILABLE')
        fail('INVALID_INPUT', `Plot ${plot.plotNumber} is not available to hold`);
      plot.status = 'ON_HOLD';
      plot.holdExpiresAt = addHours(now, PROTOTYPE_HOLD_HOURS).toISOString();
      return plot;
    });
  }

  releasePrototypeHold(plotId: string): Promise<Plot> {
    return this.ctx.write((data) => {
      const plot = data.plots.find((p) => p.id === plotId);
      if (!plot) fail('NOT_FOUND', `Plot ${plotId} not found`);
      if (plot.status !== 'ON_HOLD')
        fail('INVALID_INPUT', `Plot ${plot.plotNumber} is not on hold`);
      plot.status = 'AVAILABLE';
      delete plot.holdExpiresAt;
      return plot;
    });
  }

  search(query: string): Promise<Plot[]> {
    return this.ctx.read((data) => {
      const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
      return data.plots
        .filter((p) =>
          matchesQuery(query, [
            `plot ${p.plotNumber}`,
            projectName.get(p.projectId),
            p.block,
            p.phase,
            p.facing,
            p.status,
          ]),
        )
        .sort(comparators.NUMBER);
    });
  }
}
