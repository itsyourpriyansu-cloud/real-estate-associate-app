import type { SiteVisit, VisitOutcome, VisitStatus } from '@/domain';

export interface VisitListInput {
  status?: VisitStatus[];
  leadId?: string;
  projectId?: string;
  /** Only visits led by one of these associates — used for "my visits" and the team total. */
  associateIds?: string[];
  /** Only visits scheduled on the same calendar day as this ISO timestamp (per the active Clock's local day). */
  onDate?: string;
}

export interface ScheduleVisitInput {
  leadId: string;
  projectId: string;
  scheduledAt: string;
}

export interface SaveVisitOutcomeInput {
  outcome: VisitOutcome;
  feedbackTags?: string[];
  note?: string;
}

/** Maps to /api/v1/visits/*. */
export interface VisitRepository {
  /** GET /visits — soonest first. */
  list(input?: VisitListInput): Promise<SiteVisit[]>;
  /** GET /visits/{id} */
  getById(id: string): Promise<SiteVisit | null>;
  /** POST /visits — records VISIT_SCHEDULED on the lead's timeline. */
  schedule(input: ScheduleVisitInput): Promise<SiteVisit>;
  /** PATCH /visits/{id}/status — COMPLETED records VISIT_COMPLETED on the lead's timeline. */
  updateStatus(visitId: string, status: VisitStatus): Promise<SiteVisit>;
  /** PUT /visits/{id}/outcome */
  saveOutcome(visitId: string, input: SaveVisitOutcomeInput): Promise<SiteVisit>;
  /** PUT /visits/{id}/shortlist — replaces the shortlisted plots for this visit. */
  setShortlistedPlots(visitId: string, plotIds: string[]): Promise<SiteVisit>;
  /** GET /visits?q= — matches customer name or project name. */
  search(query: string): Promise<SiteVisit[]>;
}
