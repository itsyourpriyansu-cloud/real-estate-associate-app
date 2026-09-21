import type { AssociateSummary, PublicSummary } from '@/domain';

/** Maps to /api/v1/summary/*. Read-only aggregates for the Home page and the dashboard. */
export interface SummaryRepository {
  /**
   * GET /summary/public — the Home page numbers. Needs no session: a real API serves it without
   * a token. Registered sq yards = the area of every booked plot.
   */
  getPublicSummary(): Promise<PublicSummary>;
  /**
   * GET /summary/associate — the dashboard's two summary containers for the signed-in associate.
   * `mySales` and `teamSiteVisits` are `PENDING` (not zero) when nothing has been recorded yet.
   */
  getAssociateSummary(): Promise<AssociateSummary>;
}
