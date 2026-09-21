import type { Task, TaskPriority, TaskType } from '@/domain';

export type TaskSegment = 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED';

export interface TaskListInput {
  /**
   * The four segments from spec §14.10, evaluated against the active Clock's calendar day:
   *   TODAY      not done, scheduled today (a task whose time already passed today stays here,
   *              but its returned `status` is OVERDUE)
   *   UPCOMING   not done, scheduled after today
   *   OVERDUE    not done, scheduled before today
   *   COMPLETED  done (most recent first)
   */
  segment?: TaskSegment;
  leadId?: string;
  projectId?: string;
}

export interface CreateTaskInput {
  type: TaskType;
  title: string;
  leadId?: string;
  projectId?: string;
  scheduledAt: string;
  priority?: TaskPriority;
  notes?: string;
}

/** Maps to /api/v1/tasks/*. */
export interface TaskRepository {
  /**
   * GET /tasks — soonest first. Returned `status` is derived: an OPEN task scheduled before "now"
   * comes back as OVERDUE.
   */
  list(input?: TaskListInput): Promise<Task[]>;
  /** GET /tasks/{id} */
  getById(id: string): Promise<Task | null>;
  /** POST /tasks — e.g. "Create follow-up". Refreshes the lead's next action. */
  create(input: CreateTaskInput): Promise<Task>;
  /** POST /tasks/{id}/complete — refreshes the lead's next action. */
  complete(taskId: string): Promise<Task>;
  /** GET /tasks?q= */
  search(query: string): Promise<Task[]>;
}
