import type { Lead, TimelineEvent } from './lead';
import type { Sale } from './sale';
import type { SalesTotals } from './summary';
import type { Task, TaskStatus } from './task';

/**
 * Pure derivations shared by the seed builder and every repository implementation (mock today,
 * API-backed later where the server may do this instead). No I/O, no clock access — callers pass
 * `now` explicitly so results are deterministic and testable.
 */

/** OPEN tasks scheduled before `now` are OVERDUE; DONE stays DONE. */
export function deriveTaskStatus(
  task: Pick<Task, 'status' | 'scheduledAt'>,
  now: Date,
): TaskStatus {
  if (task.status === 'DONE') return 'DONE';
  return new Date(task.scheduledAt).getTime() < now.getTime() ? 'OVERDUE' : 'OPEN';
}

/** A lead's next action is its earliest not-done task. No open task → no next action. */
export function deriveNextAction(
  tasks: readonly Task[],
  leadId: string,
): Pick<Lead, 'nextActionAt' | 'nextActionLabel'> {
  const next = tasks
    .filter((t) => t.leadId === leadId && t.status !== 'DONE')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  return next ? { nextActionAt: next.scheduledAt, nextActionLabel: next.title } : {};
}

/** Latest timeline activity for a lead, if any. */
export function deriveLastActivityAt(
  timeline: readonly TimelineEvent[],
  leadId: string,
): string | undefined {
  return timeline
    .filter((e) => e.leadId === leadId)
    .map((e) => e.occurredAt)
    .sort()
    .at(-1);
}

/** Totals for a set of sales. Cancelled sales do not count. */
export function sumSales(sales: readonly Sale[]): SalesTotals {
  return sales
    .filter((sale) => sale.status !== 'CANCELLED')
    .reduce<SalesTotals>(
      (totals, sale) => ({
        count: totals.count + 1,
        areaSqYd: totals.areaSqYd + sale.areaSqYd,
        amount: totals.amount + sale.amount,
      }),
      { count: 0, areaSqYd: 0, amount: 0 },
    );
}
