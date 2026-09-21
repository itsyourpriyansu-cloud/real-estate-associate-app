import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  RepositoryError,
  leadRepository,
  notificationRepository,
  plotRepository,
  projectRepository,
  taskRepository,
  userRepository,
  visitRepository,
} from '@/repositories';
import { clock } from '@/services/clock';

import { buildHomeData, type HomeData } from './homeData';

const RECENT_LEADS = 6;

/**
 * Home's view-model hook: reads everything through repository contracts, then hands plain data to
 * the pure `buildHomeData` selector. The screen never sees a repository, a seed or a Date.now().
 */
export function useHomeData() {
  const loader = useCallback(async (): Promise<HomeData & { now: Date }> => {
    const now = clock.now();
    const [user, leads, tasks, visitsToday, projects, holds, unreadNotifications] =
      await Promise.all([
        userRepository.getCurrent(),
        leadRepository.list(),
        taskRepository.list(),
        visitRepository.list({ onDate: now.toISOString() }),
        projectRepository.list(),
        plotRepository.list({ statuses: ['ON_HOLD'] }),
        notificationRepository.getUnreadCount(),
      ]);
    if (!user) throw new RepositoryError('NOT_FOUND', 'No signed-in user');

    const bookedPlotIds = leads.flatMap((lead) =>
      lead.stage === 'WON' && lead.bookedPlotId ? [lead.bookedPlotId] : [],
    );
    const [bookedPlots, timelines] = await Promise.all([
      Promise.all(bookedPlotIds.map((id) => plotRepository.getById(id))),
      Promise.all(leads.slice(0, RECENT_LEADS).map((lead) => leadRepository.getTimeline(lead.id))),
    ]);

    const data = buildHomeData(
      {
        user,
        leads,
        tasks,
        visitsToday,
        projects,
        bookedPlots: bookedPlots.filter((plot) => plot !== null),
        recentEvents: timelines.flat(),
        onHoldPlots: holds.length,
        unreadNotifications,
      },
      now,
    );
    return { ...data, now };
  }, []);

  return useAsyncResource(loader);
}
