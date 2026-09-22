import { z } from 'zod';

import {
  adminSchema,
  appNotificationSchema,
  associateIncentiveSchema,
  conversationSchema,
  leadSchema,
  plotSchema,
  projectSchema,
  saleSchema,
  salesTargetSchema,
  siteVisitSchema,
  taskSchema,
  timelineEventSchema,
  userSchema,
} from '@/domain';

/**
 * The complete prototype "database" as plain tables. It is the shape the mock database persists
 * to storage and the shape the seed builder returns. Validated with Zod both in tests and when
 * hydrating persisted data, so corrupt storage falls back to a fresh seed instead of crashing.
 */
export const prototypeDatasetSchema = z.object({
  users: z.array(userSchema),
  admins: z.array(adminSchema),
  leads: z.array(leadSchema),
  timeline: z.array(timelineEventSchema),
  projects: z.array(projectSchema),
  plots: z.array(plotSchema),
  tasks: z.array(taskSchema),
  visits: z.array(siteVisitSchema),
  conversations: z.array(conversationSchema),
  notifications: z.array(appNotificationSchema),
  sales: z.array(saleSchema),
  salesTargets: z.array(salesTargetSchema),
  associateIncentives: z.array(associateIncentiveSchema),
});

export type PrototypeDataset = z.infer<typeof prototypeDatasetSchema>;
