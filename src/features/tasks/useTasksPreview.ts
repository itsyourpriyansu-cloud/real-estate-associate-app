import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  leadRepository,
  projectRepository,
  taskRepository,
  type TaskSegment,
} from '@/repositories';
import { clock } from '@/services/clock';

/** Tasks in a segment with the names they belong to, resolved through repositories. */
export function useTasksPreview(segment: TaskSegment) {
  const loader = useCallback(async () => {
    const [tasks, leads, projects] = await Promise.all([
      taskRepository.list({ segment }),
      leadRepository.list(),
      projectRepository.list(),
    ]);
    return {
      tasks,
      leadName: new Map(leads.map((lead) => [lead.id, lead.fullName])),
      projectName: new Map(projects.map((project) => [project.id, project.name])),
      now: clock.now(),
    };
  }, [segment]);
  return useAsyncResource(loader);
}

/** Counts per segment, for the segment chips. */
export function useTaskCounts() {
  const loader = useCallback(async () => {
    const segments: TaskSegment[] = ['TODAY', 'UPCOMING', 'OVERDUE', 'COMPLETED'];
    const lists = await Promise.all(segments.map((segment) => taskRepository.list({ segment })));
    return Object.fromEntries(
      segments.map((segment, index) => [segment, lists[index]?.length ?? 0]),
    ) as Record<TaskSegment, number>;
  }, []);
  return useAsyncResource(loader);
}
