import { useCallback } from 'react';

import type { Plot, PlotStatus } from '@/domain';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  conversationRepository,
  leadRepository,
  notificationRepository,
  plotRepository,
  projectRepository,
  taskRepository,
  visitRepository,
} from '@/repositories';
import { clock } from '@/services/clock';

const STATUSES: PlotStatus[] = ['AVAILABLE', 'ON_HOLD', 'BOOKED', 'BLOCKED', 'NOT_FOR_SALE'];

/**
 * Sample entities for the gallery, read through repositories like every other screen. Edge cases
 * (very long names, huge amounts) are produced in the gallery by spreading over these, so the
 * gallery contains no fixture data of its own.
 */
export function useShowcaseData() {
  const loader = useCallback(async () => {
    const [leads, projects, tasks, visits, notifications, conversations] = await Promise.all([
      leadRepository.list(),
      projectRepository.list(),
      taskRepository.list(),
      visitRepository.list(),
      notificationRepository.list(),
      conversationRepository.list(),
    ]);
    const lead = leads.find((l) => l.id === 'lead_001') ?? leads[0];
    const project = projects[0];
    if (!lead || !project) throw new Error('Showcase needs at least one lead and one project');

    const [plots, timeline, summary] = await Promise.all([
      plotRepository.list({ projectId: project.id }),
      leadRepository.getTimeline(lead.id),
      projectRepository.getInventorySummary(project.id),
    ]);
    const plotByStatus = Object.fromEntries(
      STATUSES.map((status) => [status, plots.find((p) => p.status === status)]),
    ) as Record<PlotStatus, Plot | undefined>;

    return {
      now: clock.now(),
      lead,
      leads,
      project,
      projects,
      tasks,
      visits,
      notifications,
      conversations,
      plots,
      plotByStatus,
      timeline: timeline.slice(0, 5),
      summary,
      conversationWithRichMessages: conversations.find((c) =>
        c.messages.some((m) => m.kind !== 'TEXT'),
      ),
    };
  }, []);
  return useAsyncResource(loader);
}

export type ShowcaseData = NonNullable<ReturnType<typeof useShowcaseData>['data']>;
