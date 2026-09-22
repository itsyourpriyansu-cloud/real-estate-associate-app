import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from './common';
import { pending, ready } from './summary';

/**
 * One associate's admin-assigned sales incentive: their commission rate and the plot count that
 * unlocks the foreign-trip reward. Assigned per associate (not per team) so different senior
 * associates can have different deals. Only a Senior Associate may have one assigned
 * (`MockAdminRepository.assignIncentive`).
 */
export const associateIncentiveSchema = z.object({
  id: idSchema,
  associateId: idSchema,
  /** Fraction of total sale value, e.g. 0.05 = 5%. */
  commissionRate: z.number().min(0).max(1),
  /** Lifetime plots sold to unlock the foreign-trip reward. */
  rewardPlotTarget: z.number().int().positive(),
  assignedByAdminId: idSchema,
  assignedAt: isoDateTimeSchema,
});
export type AssociateIncentive = z.infer<typeof associateIncentiveSchema>;

/** The signed-in associate's own incentive: `PENDING` until an admin assigns one. */
export const pendingIncentiveSchema = z.discriminatedUnion('state', [
  ready(associateIncentiveSchema),
  pending,
]);
export type PendingIncentive = z.infer<typeof pendingIncentiveSchema>;

/** Admin's "assign incentive" form. */
export const assignIncentiveInputSchema = z.object({
  associateId: idSchema,
  commissionRate: z.number().min(0).max(1),
  rewardPlotTarget: z.number().int().positive(),
});
export type AssignIncentiveInput = z.infer<typeof assignIncentiveInputSchema>;
