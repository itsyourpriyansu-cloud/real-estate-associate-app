import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from './common';

export const visitStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'EN_ROUTE',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED',
]);
export type VisitStatus = z.infer<typeof visitStatusSchema>;

export const visitOutcomeSchema = z.enum([
  'VERY_INTERESTED',
  'INTERESTED',
  'FOLLOW_UP',
  'NOT_INTERESTED',
]);
export type VisitOutcome = z.infer<typeof visitOutcomeSchema>;

export const siteVisitSchema = z.object({
  id: idSchema,
  leadId: idSchema,
  projectId: idSchema,
  associateId: idSchema,
  scheduledAt: isoDateTimeSchema,
  status: visitStatusSchema,
  shortlistedPlotIds: z.array(idSchema),
  outcome: visitOutcomeSchema.optional(),
  feedbackTags: z.array(z.string().min(1)),
  note: z.string().min(1).optional(),
});
export type SiteVisit = z.infer<typeof siteVisitSchema>;
