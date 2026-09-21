import { deriveTaskStatus, type Task } from '@/domain';

import type { CreateTaskInput, TaskListInput, TaskRepository, TaskSegment } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { syncLeadNextAction } from './effects';
import { byIsoAsc, byIsoDesc, dayRange, matchesQuery, nextId } from './utils';

/** Tasks come back with their *derived* status (OPEN past its time → OVERDUE). */
const withDerivedStatus = (task: Task, now: Date): Task => ({
  ...task,
  status: deriveTaskStatus(task, now),
});

export class MockTaskRepository implements TaskRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: TaskListInput = {}): Promise<Task[]> {
    return this.ctx.read((data, now) => {
      const { segment, leadId, projectId } = input;
      const today = dayRange(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

      const inSegment: Record<TaskSegment, (t: Task) => boolean> = {
        TODAY: (t) => {
          const at = new Date(t.scheduledAt).getTime();
          return t.status !== 'DONE' && at >= today.start && at < today.end;
        },
        UPCOMING: (t) => t.status !== 'DONE' && new Date(t.scheduledAt).getTime() >= today.end,
        OVERDUE: (t) => t.status !== 'DONE' && new Date(t.scheduledAt).getTime() < today.start,
        COMPLETED: (t) => t.status === 'DONE',
      };

      const tasks = data.tasks
        .filter((t) => !leadId || t.leadId === leadId)
        .filter((t) => !projectId || t.projectId === projectId)
        .filter((t) => !segment || inSegment[segment](t))
        .sort(
          segment === 'COMPLETED'
            ? byIsoDesc((t) => t.scheduledAt)
            : byIsoAsc((t) => t.scheduledAt),
        );

      return tasks.map((t) => withDerivedStatus(t, now));
    });
  }

  getById(id: string): Promise<Task | null> {
    return this.ctx.read((data, now) => {
      const task = data.tasks.find((t) => t.id === id);
      return task ? withDerivedStatus(task, now) : null;
    });
  }

  create(input: CreateTaskInput): Promise<Task> {
    return this.ctx.write((data, now) => {
      if (!input.title.trim()) fail('INVALID_INPUT', 'Task needs a title');
      if (Number.isNaN(Date.parse(input.scheduledAt)))
        fail('INVALID_INPUT', 'Task needs a valid schedule');
      if (input.leadId && !data.leads.some((l) => l.id === input.leadId))
        fail('INVALID_INPUT', `Lead ${input.leadId} does not exist`);
      if (input.projectId && !data.projects.some((p) => p.id === input.projectId))
        fail('INVALID_INPUT', `Project ${input.projectId} does not exist`);

      const task: Task = {
        id: nextId(
          'task',
          data.tasks.map((t) => t.id),
        ),
        type: input.type,
        title: input.title.trim(),
        scheduledAt: input.scheduledAt,
        status: 'OPEN',
        priority: input.priority ?? 'NORMAL',
        ...(input.leadId ? { leadId: input.leadId } : {}),
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
      };
      data.tasks.push(task);
      syncLeadNextAction(data, task.leadId);
      return withDerivedStatus(task, now);
    });
  }

  complete(taskId: string): Promise<Task> {
    return this.ctx.write((data, now) => {
      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) fail('NOT_FOUND', `Task ${taskId} not found`);
      task.status = 'DONE';
      syncLeadNextAction(data, task.leadId);
      return withDerivedStatus(task, now);
    });
  }

  search(query: string): Promise<Task[]> {
    return this.ctx.read((data, now) => {
      const leadName = new Map(data.leads.map((l) => [l.id, l.fullName]));
      const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
      return data.tasks
        .filter((t) =>
          matchesQuery(query, [
            t.title,
            t.notes,
            t.type,
            t.leadId ? leadName.get(t.leadId) : undefined,
            t.projectId ? projectName.get(t.projectId) : undefined,
          ]),
        )
        .sort(byIsoAsc((t) => t.scheduledAt))
        .map((t) => withDerivedStatus(t, now));
    });
  }
}
