import {
  deriveNextAction,
  type Lead,
  type SiteVisit,
  type TimelineEvent,
  type TimelineEventType,
  type User,
} from '@/domain';
import type { PrototypeDataset } from '@/seed';

import { fail } from './MockContext';
import { nextId } from './utils';

/**
 * Cross-entity side effects that a real backend performs server-side (e.g. completing a task
 * refreshes the lead's next action). Centralised so every repository applies them identically.
 */

export function currentAssociate(data: PrototypeDataset): User {
  const associate = data.users.find((u) => u.role === 'ASSOCIATE');
  if (!associate) fail('SERVER_ERROR', 'Prototype dataset has no associate');
  return associate;
}

export interface DownlineEntry {
  user: User;
  /** 1 = added directly by the root user. */
  level: number;
}

/** Everyone below `rootId` in the sponsor tree, direct members first. Safe against sponsor cycles. */
export function downlineOf(data: PrototypeDataset, rootId: string): DownlineEntry[] {
  const children = new Map<string, User[]>();
  for (const user of data.users) {
    if (!user.sponsorId) continue;
    children.set(user.sponsorId, [...(children.get(user.sponsorId) ?? []), user]);
  }

  const result: DownlineEntry[] = [];
  const seen = new Set([rootId]);
  let frontier = [rootId];
  for (let level = 1; frontier.length > 0; level += 1) {
    const next: string[] = [];
    for (const parentId of frontier) {
      for (const child of children.get(parentId) ?? []) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        result.push({ user: child, level });
        next.push(child.id);
      }
    }
    frontier = next;
  }
  return result;
}

/** Sales-role users on one team. */
export function teamUsers(data: PrototypeDataset, teamName: string | undefined): User[] {
  if (!teamName) return [];
  return data.users.filter((u) => u.teamName === teamName);
}

export function requireLead(data: PrototypeDataset, leadId: string): Lead {
  const lead = data.leads.find((l) => l.id === leadId);
  if (!lead) fail('NOT_FOUND', `Lead ${leadId} not found`);
  return lead;
}

export interface TimelineEventDraft {
  leadId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  metadata?: TimelineEvent['metadata'];
}

/** Appends a timeline event and keeps the lead's activity fields and note count in step. */
export function appendTimelineEvent(
  data: PrototypeDataset,
  draft: TimelineEventDraft,
  now: Date,
): TimelineEvent {
  const lead = requireLead(data, draft.leadId);
  const at = now.toISOString();
  const event: TimelineEvent = {
    id: nextId(
      'tl',
      data.timeline.map((e) => e.id),
    ),
    leadId: draft.leadId,
    type: draft.type,
    occurredAt: at,
    title: draft.title,
    actorName: currentAssociate(data).fullName,
    ...(draft.description ? { description: draft.description } : {}),
    ...(draft.metadata ? { metadata: draft.metadata } : {}),
  };
  data.timeline.push(event);

  lead.lastActivityAt = at;
  lead.updatedAt = at;
  if (draft.type === 'NOTE') lead.notesCount += 1;
  return event;
}

/** Recomputes a lead's next action from its open tasks (earliest wins; none clears it). */
export function syncLeadNextAction(data: PrototypeDataset, leadId: string | undefined): void {
  if (!leadId) return;
  const lead = data.leads.find((l) => l.id === leadId);
  if (!lead) return;
  const next = deriveNextAction(data.tasks, leadId);
  if (next.nextActionAt && next.nextActionLabel) {
    lead.nextActionAt = next.nextActionAt;
    lead.nextActionLabel = next.nextActionLabel;
  } else {
    delete lead.nextActionAt;
    delete lead.nextActionLabel;
  }
}

/** When a visit ends (completed / cancelled) its paired SITE_VISIT task is closed. */
export function closeVisitTask(data: PrototypeDataset, visit: SiteVisit): void {
  const task = data.tasks.find(
    (t) =>
      t.type === 'SITE_VISIT' &&
      t.status !== 'DONE' &&
      t.leadId === visit.leadId &&
      t.projectId === visit.projectId &&
      t.scheduledAt === visit.scheduledAt,
  );
  if (!task) return;
  task.status = 'DONE';
  syncLeadNextAction(data, task.leadId);
}
