import type { Lead, LeadStage, TimelineEvent, TimelineEventType } from '@/domain';

/** The lead-list filter chips from spec §14.4. */
export type LeadListFilter = 'ALL' | 'NEW' | 'HOT' | 'FOLLOW_UP' | 'VISIT' | 'NEGOTIATION';

export interface LeadListInput {
  filter?: LeadListFilter;
  /** Free-text over name, phone, requirement location, source, tags. */
  query?: string;
}

export interface AddTimelineEventInput {
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: TimelineEvent['metadata'];
}

/** Maps to /api/v1/leads/*. */
export interface LeadRepository {
  /** GET /leads — newest activity first. `FOLLOW_UP` = next action due today or earlier. */
  list(input?: LeadListInput): Promise<Lead[]>;
  /** GET /leads/{id} — null when the lead does not exist. */
  getById(id: string): Promise<Lead | null>;
  /** GET /leads/{id}/timeline — newest first. */
  getTimeline(leadId: string): Promise<TimelineEvent[]>;
  /** PATCH /leads/{id}/stage — also records a STAGE_CHANGED timeline event. */
  updateStage(leadId: string, stage: LeadStage): Promise<Lead>;
  /** POST /leads/{id}/timeline — notes, WhatsApp shares, shortlists. */
  addTimelineEvent(leadId: string, input: AddTimelineEventInput): Promise<TimelineEvent>;
  /** PUT /leads/{id}/shortlist/{plotId} — idempotent; also records PLOT_SHORTLISTED. */
  shortlistPlot(leadId: string, plotId: string): Promise<Lead>;
  /** DELETE /leads/{id}/shortlist/{plotId} */
  unshortlistPlot(leadId: string, plotId: string): Promise<Lead>;
  /** GET /leads?q= */
  search(query: string): Promise<Lead[]>;
}
