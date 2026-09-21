import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from './common';

export const taskTypeSchema = z.enum(['CALL', 'WHATSAPP', 'FOLLOW_UP', 'SITE_VISIT', 'NOTE']);
export type TaskType = z.infer<typeof taskTypeSchema>;

/**
 * `OVERDUE` is a *derived* status: the mock repository computes it from the active Clock at read
 * time (an OPEN task scheduled before "now"). Seed data only ever stores OPEN or DONE, so a demo
 * opened weeks later is never stale. A real API is expected to do the same.
 */
export const taskStatusSchema = z.enum(['OPEN', 'DONE', 'OVERDUE']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['HIGH', 'NORMAL', 'LOW']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskSchema = z.object({
  id: idSchema,
  type: taskTypeSchema,
  title: z.string().min(1),
  leadId: idSchema.optional(),
  projectId: idSchema.optional(),
  scheduledAt: isoDateTimeSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  notes: z.string().min(1).optional(),
});
export type Task = z.infer<typeof taskSchema>;
