import type { Lead, TimelineEvent } from '@/domain';

import type {
  AddTimelineEventInput,
  LeadListFilter,
  LeadListInput,
  LeadRepository,
} from '../contracts';
import { fail, type MockContext } from './MockContext';
import { appendTimelineEvent, requireLead } from './effects';
import { byIsoDesc, dayRange, matchesQuery, nationalNumber } from './utils';

const searchFields = (lead: Lead) => [
  lead.fullName,
  lead.phone,
  nationalNumber(lead.phone),
  lead.sourceLabel,
  lead.source,
  lead.stage,
  lead.priority,
  ...lead.tags,
  ...lead.requirement.preferredLocations,
];

export class MockLeadRepository implements LeadRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: LeadListInput = {}): Promise<Lead[]> {
    return this.ctx.read((data, now) => {
      const { filter = 'ALL', query } = input;
      const endOfToday = dayRange(new Date(now.getFullYear(), now.getMonth(), now.getDate())).end;

      const matchesFilter: Record<LeadListFilter, (lead: Lead) => boolean> = {
        ALL: () => true,
        NEW: (l) => l.stage === 'NEW',
        HOT: (l) => l.priority === 'HOT',
        VISIT: (l) => l.stage === 'VISIT',
        NEGOTIATION: (l) => l.stage === 'NEGOTIATION',
        FOLLOW_UP: (l) =>
          l.nextActionAt !== undefined && new Date(l.nextActionAt).getTime() < endOfToday,
      };

      return data.leads
        .filter(matchesFilter[filter])
        .filter((l) => !query || matchesQuery(query, searchFields(l)))
        .sort(byIsoDesc((l) => l.updatedAt));
    });
  }

  getById(id: string): Promise<Lead | null> {
    return this.ctx.read((data) => data.leads.find((l) => l.id === id) ?? null);
  }

  getTimeline(leadId: string): Promise<TimelineEvent[]> {
    return this.ctx.read((data) =>
      data.timeline.filter((e) => e.leadId === leadId).sort(byIsoDesc((e) => e.occurredAt)),
    );
  }

  updateStage(leadId: string, stage: Lead['stage']): Promise<Lead> {
    const phone = this.ctx.currentPhone();
    return this.ctx.write((data, now) => {
      const lead = requireLead(data, leadId);
      if (lead.stage !== stage) {
        const from = lead.stage;
        lead.stage = stage;
        appendTimelineEvent(
          data,
          {
            leadId,
            type: 'STAGE_CHANGED',
            title: `Moved to ${stage.charAt(0)}${stage.slice(1).toLowerCase()}`,
            metadata: { fromStage: from, toStage: stage },
          },
          now,
          phone,
        );
      }
      return lead;
    });
  }

  addTimelineEvent(leadId: string, input: AddTimelineEventInput): Promise<TimelineEvent> {
    const phone = this.ctx.currentPhone();
    return this.ctx.write((data, now) => {
      requireLead(data, leadId);
      if (!input.title.trim()) fail('INVALID_INPUT', 'Timeline event needs a title');
      return appendTimelineEvent(data, { leadId, ...input }, now, phone);
    });
  }

  shortlistPlot(leadId: string, plotId: string): Promise<Lead> {
    const phone = this.ctx.currentPhone();
    return this.ctx.write((data, now) => {
      const lead = requireLead(data, leadId);
      const plot = data.plots.find((p) => p.id === plotId);
      if (!plot) fail('INVALID_INPUT', `Plot ${plotId} does not exist`);
      if (!lead.shortlistedPlotIds.includes(plotId)) {
        lead.shortlistedPlotIds.push(plotId);
        appendTimelineEvent(
          data,
          {
            leadId,
            type: 'PLOT_SHORTLISTED',
            title: `Shortlisted Plot ${plot.plotNumber}`,
            metadata: { plotId, projectId: plot.projectId },
          },
          now,
          phone,
        );
      }
      return lead;
    });
  }

  unshortlistPlot(leadId: string, plotId: string): Promise<Lead> {
    return this.ctx.write((data) => {
      const lead = requireLead(data, leadId);
      lead.shortlistedPlotIds = lead.shortlistedPlotIds.filter((id) => id !== plotId);
      return lead;
    });
  }

  search(query: string): Promise<Lead[]> {
    return this.list({ query });
  }
}
