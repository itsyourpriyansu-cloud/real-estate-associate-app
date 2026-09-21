import type { AppNotification, SiteVisit, Task, TimelineEvent } from '@/domain';

import {
  ASSOCIATE_ID,
  ASSOCIATE_NAME,
  PROJECT_ID,
  leadId,
  notificationId,
  taskId,
  timelineId,
  visitId,
} from './ids';
import type { SeedPicks } from './picks';
import type { SeedTime } from './time';

export interface CrmTables {
  tasks: Task[];
  visits: SiteVisit[];
  timeline: TimelineEvent[];
  notifications: AppNotification[];
}

/**
 * "Busy day" overlay: three extra visits and several extra follow-ups stacked into today, plus two
 * more overdue items. Applied on top of the Normal dataset *before* leads are finalised, so lead
 * next-actions stay consistent with the extra tasks.
 */
export function applyBusyDay(t: SeedTime, picks: SeedPicks, tables: CrmTables): CrmTables {
  const extraTasks: Task[] = [
    {
      id: taskId(19),
      type: 'CALL',
      title: 'Confirm visit interest',
      leadId: leadId(4),
      projectId: PROJECT_ID.nc,
      scheduledAt: t.at(0, '09:45'),
      status: 'OPEN',
      priority: 'HIGH',
    },
    {
      id: taskId(20),
      type: 'WHATSAPP',
      title: 'Send cost sheet',
      leadId: leadId(5),
      projectId: PROJECT_ID.ce,
      scheduledAt: t.at(0, '13:00'),
      status: 'OPEN',
      priority: 'NORMAL',
    },
    {
      id: taskId(21),
      type: 'FOLLOW_UP',
      title: 'Check in on loan pre-approval',
      leadId: leadId(12),
      scheduledAt: t.at(0, '14:30'),
      status: 'OPEN',
      priority: 'NORMAL',
    },
    {
      id: taskId(22),
      type: 'CALL',
      title: 'Qualify budget and purchase timeline',
      leadId: leadId(6),
      scheduledAt: t.at(0, '16:30'),
      status: 'OPEN',
      priority: 'NORMAL',
    },
    {
      id: taskId(23),
      type: 'FOLLOW_UP',
      title: 'Re-engage after missed calls',
      leadId: leadId(15),
      scheduledAt: t.at(-2, '10:00'),
      status: 'OPEN',
      priority: 'LOW',
    },
    {
      id: taskId(24),
      type: 'WHATSAPP',
      title: 'Send comparison cost sheet',
      leadId: leadId(14),
      projectId: PROJECT_ID.ag,
      scheduledAt: t.at(-1, '12:00'),
      status: 'OPEN',
      priority: 'NORMAL',
    },
    {
      id: taskId(25),
      type: 'SITE_VISIT',
      title: 'Site visit · Northgate County',
      leadId: leadId(4),
      projectId: PROJECT_ID.nc,
      scheduledAt: t.at(0, '10:00'),
      status: 'OPEN',
      priority: 'HIGH',
    },
    {
      id: taskId(26),
      type: 'SITE_VISIT',
      title: 'Site visit · Cedar Enclave',
      leadId: leadId(5),
      projectId: PROJECT_ID.ce,
      scheduledAt: t.at(0, '13:30'),
      status: 'OPEN',
      priority: 'HIGH',
    },
    {
      id: taskId(27),
      type: 'SITE_VISIT',
      title: 'Site visit · Real Rise',
      leadId: leadId(17),
      projectId: PROJECT_ID.rr,
      scheduledAt: t.at(0, '17:00'),
      status: 'OPEN',
      priority: 'HIGH',
    },
  ];

  const extraVisits: SiteVisit[] = [
    {
      id: visitId(8),
      leadId: leadId(4),
      projectId: PROJECT_ID.nc,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(0, '10:00'),
      status: 'CONFIRMED',
      shortlistedPlotIds: [],
      feedbackTags: [],
    },
    {
      id: visitId(9),
      leadId: leadId(5),
      projectId: PROJECT_ID.ce,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(0, '13:30'),
      status: 'SCHEDULED',
      shortlistedPlotIds: [],
      feedbackTags: [],
    },
    {
      id: visitId(10),
      leadId: leadId(17),
      projectId: PROJECT_ID.rr,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(0, '17:00'),
      status: 'SCHEDULED',
      shortlistedPlotIds: [picks.poojaPlot.id],
      feedbackTags: [],
    },
  ];

  const scheduled = (
    n: number,
    lead: number,
    project: string,
    projectName: string,
    hhmm: string,
    visit: number,
  ): TimelineEvent => ({
    id: timelineId(tables.timeline.length + n),
    leadId: leadId(lead),
    type: 'VISIT_SCHEDULED',
    occurredAt: t.at(-1, '17:00'),
    title: 'Site visit scheduled',
    description: `${projectName} · ${t.dayLabel(0)}, ${t.timeLabel(hhmm)}`,
    actorName: ASSOCIATE_NAME,
    metadata: { visitId: visitId(visit), projectId: project },
  });

  const extraNotifications: AppNotification[] = [
    {
      id: notificationId(15),
      type: 'ACTION_REQUIRED',
      title: 'Busy day · 5 site visits today',
      body: 'Confirm each visit and plan your route.',
      createdAt: t.at(0, '07:30'),
      read: false,
      deepLink: '/tasks',
    },
    {
      id: notificationId(16),
      type: 'FOLLOW_UP',
      title: 'Site visit today · Sneha Reddy',
      body: `Northgate County at ${t.timeLabel('10:00')}.`,
      createdAt: t.at(0, '08:05'),
      read: false,
      deepLink: `/visits/${visitId(8)}`,
    },
  ];

  return {
    tasks: [...tables.tasks, ...extraTasks],
    visits: [...tables.visits, ...extraVisits],
    timeline: [
      ...tables.timeline,
      scheduled(1, 4, PROJECT_ID.nc, 'Northgate County', '10:00', 8),
      scheduled(2, 5, PROJECT_ID.ce, 'Cedar Enclave', '13:30', 9),
      scheduled(3, 17, PROJECT_ID.rr, 'Real Rise', '17:00', 10),
    ],
    notifications: [...tables.notifications, ...extraNotifications],
  };
}
