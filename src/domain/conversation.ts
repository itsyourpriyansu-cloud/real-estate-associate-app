import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from './common';

export const messageDirectionSchema = z.enum(['INBOUND', 'OUTBOUND']);
export const messageKindSchema = z.enum([
  'TEXT',
  'PROJECT_CARD',
  'COST_SHEET',
  'VISIT_CONFIRMATION',
]);
export const messageStatusSchema = z.enum(['SENT', 'DELIVERED', 'READ']);

export const messageSchema = z.object({
  id: idSchema,
  direction: messageDirectionSchema,
  kind: messageKindSchema,
  body: z.string().min(1),
  sentAt: isoDateTimeSchema,
  /** Delivery status applies to outbound messages only. */
  status: messageStatusSchema.optional(),
});
export type Message = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: idSchema,
  leadId: idSchema,
  unreadCount: z.number().int().nonnegative(),
  lastMessageAt: isoDateTimeSchema,
  messages: z.array(messageSchema),
});
export type Conversation = z.infer<typeof conversationSchema>;
