import {
  deriveNextAction,
  type Admin,
  type Lead,
  type OrganizationLevel,
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

/**
 * The signed-in user, resolved by the session's phone (each repository reads its own
 * `MockContext.currentPhone()` and passes it in — see `MockContext.ts`). `phone === null` means no
 * session has set one in this context (e.g. a test that never signs in), which falls back to the
 * seed's primary demo associate — the same effective default as the old "first associate" lookup.
 * `phone` set but matching no seeded user returns `null` (an unrecognised number is really signed
 * in to nobody) — `UserRepository.getCurrent()` returns this as-is.
 */
export function currentUserOrNull(data: PrototypeDataset, phone: string | null): User | null {
  if (phone === null) {
    return (
      data.users.find((u) => u.orgLevel === 'SENIOR_ASSOCIATE' || u.orgLevel === 'JUNIOR_ASSOCIATE') ??
      null
    );
  }
  return data.users.find((u) => u.phone === phone) ?? null;
}

/** Same as `currentUserOrNull`, but for repository methods that require a caller to exist. */
export function currentAssociate(data: PrototypeDataset, phone: string | null): User {
  const user = currentUserOrNull(data, phone);
  if (!user) fail('SERVER_ERROR', 'No signed-in user matches the current session');
  return user;
}

export function currentAdmin(data: PrototypeDataset): Admin {
  const admin = data.admins[0];
  if (!admin) fail('SERVER_ERROR', 'Prototype dataset has no admin');
  return admin;
}

/**
 * The only legal reporting shape: CEO → Management → Marketing Head → Senior Associate → Junior
 * Associate (spec §61). Management may report to the CEO or to a senior Management peer — spec §3's
 * "one organisational level, multiple functional roles" (finance/ops/HR/approvals, all MANAGEMENT).
 */
export const ALLOWED_MANAGER_LEVELS: Record<OrganizationLevel, OrganizationLevel[]> = {
  CEO: [],
  MANAGEMENT: ['CEO', 'MANAGEMENT'],
  MARKETING_HEAD: ['MANAGEMENT'],
  SENIOR_ASSOCIATE: ['MARKETING_HEAD'],
  JUNIOR_ASSOCIATE: ['MARKETING_HEAD', 'SENIOR_ASSOCIATE'],
};

/** True if `managerLevel` is an allowed manager for someone at `childLevel`. */
export function isValidManagerLevel(
  childLevel: OrganizationLevel,
  managerLevel: OrganizationLevel,
): boolean {
  return ALLOWED_MANAGER_LEVELS[childLevel].includes(managerLevel);
}

/** Throws INVALID_INPUT when `managerLevel` may not manage `childLevel` under the fixed hierarchy. */
export function requireValidHierarchy(
  childLevel: OrganizationLevel,
  managerLevel: OrganizationLevel,
): void {
  if (!isValidManagerLevel(childLevel, managerLevel)) {
    fail(
      'INVALID_INPUT',
      `A ${managerLevel} may not manage a ${childLevel} — the hierarchy runs CEO → Management → Marketing Head → Senior Associate → Junior Associate`,
    );
  }
}

export interface DownlineEntry {
  user: User;
  /** 1 = reports directly to the root user. */
  level: number;
}

/** Everyone below `rootId` in the reporting tree, direct reports first. Safe against cycles. */
export function downlineOf(data: PrototypeDataset, rootId: string): DownlineEntry[] {
  const children = new Map<string, User[]>();
  for (const user of data.users) {
    if (!user.reportingManagerId) continue;
    children.set(user.reportingManagerId, [...(children.get(user.reportingManagerId) ?? []), user]);
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

/** Every user on one team. */
export function teamUsers(data: PrototypeDataset, teamId: string | undefined): User[] {
  if (!teamId) return [];
  return data.users.filter((u) => u.teamId === teamId);
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
  phone: string | null,
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
    actorName: currentAssociate(data, phone).fullName,
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
