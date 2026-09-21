import type { Facing, Plot, PlotStatus } from '@/domain';

export type PlotSort = 'NUMBER' | 'PRICE_ASC' | 'PRICE_DESC' | 'AREA_ASC' | 'AREA_DESC';

export interface PlotListInput {
  projectId?: string;
  statuses?: PlotStatus[];
  facing?: Facing[];
  cornerOnly?: boolean;
  areaMinSqYd?: number;
  areaMaxSqYd?: number;
  maxTotalPrice?: number;
  sort?: PlotSort;
}

/** Maps to /api/v1/plots/*. */
export interface PlotRepository {
  /** GET /plots */
  list(input?: PlotListInput): Promise<Plot[]>;
  /** GET /plots/{id} */
  getById(id: string): Promise<Plot | null>;
  /**
   * POST /plots/{id}/hold — PROTOTYPE HOLD. In Phase 1 this only mutates local mock data; it is not
   * a real inventory lock. Rejects with INVALID_INPUT unless the plot is AVAILABLE.
   */
  placePrototypeHold(plotId: string): Promise<Plot>;
  /** DELETE /plots/{id}/hold — releases a prototype hold. Rejects unless the plot is ON_HOLD. */
  releasePrototypeHold(plotId: string): Promise<Plot>;
  /** GET /plots?q= — matches "Plot 26", "26", project name, block. */
  search(query: string): Promise<Plot[]>;
}
