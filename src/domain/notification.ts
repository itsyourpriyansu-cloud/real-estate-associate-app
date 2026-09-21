import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from './common';

export const notificationTypeSchema = z.enum([
  'ACTION_REQUIRED',
  'FOLLOW_UP',
  'INVENTORY',
  'UPDATE',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const appNotificationSchema = z.object({
  id: idSchema,
  type: notificationTypeSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  createdAt: isoDateTimeSchema,
  read: z.boolean(),
  /** In-app route, e.g. `/leads/lead_001`. Validated against real routes + entities in tests. */
  deepLink: z.string().startsWith('/').optional(),
});
export type AppNotification = z.infer<typeof appNotificationSchema>;
