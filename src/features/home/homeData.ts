import { isSameDay, isSameMonth } from 'date-fns';

import type {
  Lead,
  LeadPriority,
  LeadStage,
  Plot,
  Project,
  SiteVisit,
  Task,
  TimelineEvent,
  User,
} from '@/domain';

/** Everything Home needs, gathered from repositories by `useHomeData`. */
export interface HomeInput {
  user: User;
  leads: Lead[];
  /** All tasks, with repository-derived status (OPEN / DONE / OVERDUE). */
  tasks: Task[];
  visitsToday: SiteVisit[];
  projects: Project[];
  /** Plots referenced by WON leads (`bookedPlotId`), for the monthly booking value. */
  bookedPlots: Plot[];
  /** Timeline events from the most recently active leads. */
  recentEvents: TimelineEvent[];
  onHoldPlots: number;
  unreadNotifications: number;
}

export interface HomeData {
  user: User;
  attention: { leadsNeedingAttention: number; visitsToday: number; overdueTasks: number };
  nextAction?: { task: Task; lead: Lead };
  /** The most urgent overdue task, for the attention banner. */
  topOverdue?: { task: Task; lead?: Lead };
  visitsToday: { visit: SiteVisit; lead?: Lead; project?: Project }[];
  pipeline: Partial<Record<LeadStage, number>>;
  inventory: { availablePlots: number; onHoldPlots: number; projects: number };
  performance: { bookings: number; bookingValue: number; inBooking: number };
  recent: { event: TimelineEvent; leadName: string }[];
  unreadNotifications: number;
}

const PRIORITY_RANK: Record<LeadPriority, number> = { HOT: 0, WARM: 1, NORMAL: 2, COLD: 3 };
const byTime = (a: Task, b: Task) => a.scheduledAt.localeCompare(b.scheduledAt);
const isActive = (lead: Lead) => lead.stage !== 'WON' && lead.stage !== 'LOST';

/**
 * "What should I do next?" — among tasks that are not yet due, prefer those scheduled for today,
 * hottest lead first, then earliest. Overdue work is surfaced separately (the attention banner),
 * so the next action is always something the associate can still do on time.
 */
export function pickNextAction(tasks: Task[], leads: Lead[], now: Date): HomeData['nextAction'] {
  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const candidates = tasks
    .filter(
      (task) => task.status === 'OPEN' && task.leadId !== undefined && leadById.has(task.leadId),
    )
    .map((task) => ({ task, lead: leadById.get(task.leadId ?? '') }))
    .filter((entry): entry is { task: Task; lead: Lead } => entry.lead !== undefined);

  const rank = (entry: { task: Task; lead: Lead }) => PRIORITY_RANK[entry.lead.priority];
  const today = candidates.filter((entry) => isSameDay(new Date(entry.task.scheduledAt), now));
  const pool = today.length > 0 ? today : candidates;
  return [...pool].sort((a, b) => rank(a) - rank(b) || byTime(a.task, b.task))[0];
}

export function buildHomeData(input: HomeInput, now: Date): HomeData {
  const { leads, tasks, projects } = input;
  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const projectById = new Map(projects.map((project) => [project.id, project]));

  const overdue = tasks.filter((task) => task.status === 'OVERDUE').sort(byTime);
  const topOverdue = overdue[0];

  // A lead needs attention when its next step has slipped or the customer has written and is waiting.
  const overdueLeadIds = new Set(
    overdue.map((task) => task.leadId).filter((id): id is string => !!id),
  );
  const leadsNeedingAttention = leads.filter(
    (lead) => isActive(lead) && (overdueLeadIds.has(lead.id) || lead.unreadMessages > 0),
  ).length;

  const pipeline: HomeData['pipeline'] = {};
  for (const lead of leads) pipeline[lead.stage] = (pipeline[lead.stage] ?? 0) + 1;

  const visitsToday = input.visitsToday
    .filter((visit) => visit.status !== 'CANCELLED')
    .map((visit) => ({
      visit,
      lead: leadById.get(visit.leadId),
      project: projectById.get(visit.projectId),
    }));

  const wonThisMonth = leads.filter(
    (lead) =>
      lead.stage === 'WON' && lead.bookedPlotId && isSameMonth(new Date(lead.updatedAt), now),
  );
  const bookedPlotById = new Map(input.bookedPlots.map((plot) => [plot.id, plot]));
  const bookingValue = wonThisMonth.reduce(
    (sum, lead) => sum + (bookedPlotById.get(lead.bookedPlotId ?? '')?.estimatedTotal ?? 0),
    0,
  );

  return {
    user: input.user,
    attention: {
      leadsNeedingAttention,
      visitsToday: visitsToday.length,
      overdueTasks: overdue.length,
    },
    nextAction: pickNextAction(tasks, leads, now),
    topOverdue: topOverdue
      ? { task: topOverdue, lead: topOverdue.leadId ? leadById.get(topOverdue.leadId) : undefined }
      : undefined,
    visitsToday,
    pipeline,
    inventory: {
      availablePlots: projects.reduce((sum, project) => sum + project.availableUnits, 0),
      onHoldPlots: input.onHoldPlots,
      projects: projects.length,
    },
    performance: {
      bookings: wonThisMonth.length,
      bookingValue,
      inBooking: leads.filter((lead) => lead.stage === 'BOOKING').length,
    },
    recent: [...input.recentEvents]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 5)
      .map((event) => ({ event, leadName: leadById.get(event.leadId)?.fullName ?? 'Lead' })),
    unreadNotifications: input.unreadNotifications,
  };
}
