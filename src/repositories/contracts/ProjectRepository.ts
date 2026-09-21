import type { PlotStatus, Project } from '@/domain';

export interface ProjectListInput {
  query?: string;
  location?: string;
  /** Only projects whose starting price is at or below this many rupees. */
  maxStartingPrice?: number;
  /** Only projects that have a plot within this area range (sq yd). */
  plotAreaMinSqYd?: number;
  plotAreaMaxSqYd?: number;
  availableOnly?: boolean;
}

export type InventorySummary = { projectId: string; total: number } & Record<
  Lowercase<PlotStatus>,
  number
>;

/** Maps to /api/v1/projects/*. */
export interface ProjectRepository {
  /** GET /projects — `availableUnits` / `totalUnits` always reflect current inventory. */
  list(input?: ProjectListInput): Promise<Project[]>;
  /** GET /projects/{id} */
  getById(id: string): Promise<Project | null>;
  /** GET /projects/{id}/inventory-summary — counts per plot status. */
  getInventorySummary(projectId: string): Promise<InventorySummary>;
  /** GET /projects?q= */
  search(query: string): Promise<Project[]>;
}
