import { isSameDay } from 'date-fns';

import type { SiteVisit, VisitStatus } from '@/domain';

import type {
  SaveVisitOutcomeInput,
  ScheduleVisitInput,
  VisitListInput,
  VisitRepository,
} from '../contracts';
import { fail, type MockContext } from './MockContext';
import {
  appendTimelineEvent,
  closeVisitTask,
  currentAssociate,
  requireLead,
  syncLeadNextAction,
} from './effects';
import { byIsoAsc, matchesQuery, nextId } from './utils';

const FINAL_STATUSES: readonly VisitStatus[] = ['COMPLETED', 'CANCELLED'];

export class MockVisitRepository implements VisitRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: VisitListInput = {}): Promise<SiteVisit[]> {
    return this.ctx.read((data) => {
      const { status, leadId, projectId, associateIds, onDate } = input;
      return data.visits
        .filter((v) => !status?.length || status.includes(v.status))
        .filter((v) => !leadId || v.leadId === leadId)
        .filter((v) => !projectId || v.projectId === projectId)
        .filter((v) => !associateIds?.length || associateIds.includes(v.associateId))
        .filter((v) => !onDate || isSameDay(new Date(v.scheduledAt), new Date(onDate)))
        .sort(byIsoAsc((v) => v.scheduledAt));
    });
  }

  getById(id: string): Promise<SiteVisit | null> {
    return this.ctx.read((data) => data.visits.find((v) => v.id === id) ?? null);
  }

  schedule(input: ScheduleVisitInput): Promise<SiteVisit> {
    const phone = this.ctx.currentPhone();
    return this.ctx.write((data, now) => {
      const lead = requireLead(data, input.leadId);
      const project = data.projects.find((p) => p.id === input.projectId);
      if (!project) fail('INVALID_INPUT', `Project ${input.projectId} does not exist`);
      if (Number.isNaN(Date.parse(input.scheduledAt)))
        fail('INVALID_INPUT', 'Visit needs a valid schedule');

      const visit: SiteVisit = {
        id: nextId(
          'visit',
          data.visits.map((v) => v.id),
        ),
        leadId: lead.id,
        projectId: project.id,
        associateId: currentAssociate(data, phone).id,
        scheduledAt: input.scheduledAt,
        status: 'SCHEDULED',
        shortlistedPlotIds: [],
        feedbackTags: [],
      };
      data.visits.push(visit);

      // Pair the visit with a task so it shows up in Tasks and drives the lead's next action.
      data.tasks.push({
        id: nextId(
          'task',
          data.tasks.map((t) => t.id),
        ),
        type: 'SITE_VISIT',
        title: `Site visit · ${project.name}`,
        leadId: lead.id,
        projectId: project.id,
        scheduledAt: input.scheduledAt,
        status: 'OPEN',
        priority: 'HIGH',
      });
      syncLeadNextAction(data, lead.id);
      appendTimelineEvent(
        data,
        {
          leadId: lead.id,
          type: 'VISIT_SCHEDULED',
          title: 'Site visit scheduled',
          description: project.name,
          metadata: { visitId: visit.id, projectId: project.id },
        },
        now,
        phone,
      );
      return visit;
    });
  }

  updateStatus(visitId: string, status: VisitStatus): Promise<SiteVisit> {
    const phone = this.ctx.currentPhone();
    return this.ctx.write((data, now) => {
      const visit = data.visits.find((v) => v.id === visitId);
      if (!visit) fail('NOT_FOUND', `Visit ${visitId} not found`);
      if (visit.status === status) return visit;
      if (FINAL_STATUSES.includes(visit.status))
        fail('INVALID_INPUT', `Visit is already ${visit.status.toLowerCase()}`);

      visit.status = status;
      if (status === 'COMPLETED') {
        appendTimelineEvent(
          data,
          {
            leadId: visit.leadId,
            type: 'VISIT_COMPLETED',
            title: 'Site visit completed',
            metadata: { visitId: visit.id, projectId: visit.projectId },
          },
          now,
          phone,
        );
      }
      if (FINAL_STATUSES.includes(status)) closeVisitTask(data, visit);
      return visit;
    });
  }

  saveOutcome(visitId: string, input: SaveVisitOutcomeInput): Promise<SiteVisit> {
    return this.ctx.write((data) => {
      const visit = data.visits.find((v) => v.id === visitId);
      if (!visit) fail('NOT_FOUND', `Visit ${visitId} not found`);
      visit.outcome = input.outcome;
      visit.feedbackTags = input.feedbackTags ?? [];
      if (input.note?.trim()) visit.note = input.note.trim();
      else delete visit.note;
      return visit;
    });
  }

  setShortlistedPlots(visitId: string, plotIds: string[]): Promise<SiteVisit> {
    return this.ctx.write((data) => {
      const visit = data.visits.find((v) => v.id === visitId);
      if (!visit) fail('NOT_FOUND', `Visit ${visitId} not found`);
      for (const id of plotIds) {
        const plot = data.plots.find((p) => p.id === id);
        if (!plot || plot.projectId !== visit.projectId)
          fail('INVALID_INPUT', `Plot ${id} is not in this visit's project`);
      }
      visit.shortlistedPlotIds = [...new Set(plotIds)];
      return visit;
    });
  }

  search(query: string): Promise<SiteVisit[]> {
    return this.ctx.read((data) => {
      const leadName = new Map(data.leads.map((l) => [l.id, l.fullName]));
      const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
      return data.visits
        .filter((v) =>
          matchesQuery(query, [
            leadName.get(v.leadId),
            projectName.get(v.projectId),
            v.status,
            'site visit',
          ]),
        )
        .sort(byIsoAsc((v) => v.scheduledAt));
    });
  }
}
