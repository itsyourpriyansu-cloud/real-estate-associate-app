import { z } from 'zod';

import { idSchema, inrAmountSchema, isoDateTimeSchema } from './common';

/** Pipeline-independent inventory statuses (spec §11.6). */
export const plotStatusSchema = z.enum([
  'AVAILABLE',
  'ON_HOLD',
  'BOOKED',
  'BLOCKED',
  'NOT_FOR_SALE',
]);
export type PlotStatus = z.infer<typeof plotStatusSchema>;

export const facingSchema = z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST']);
export type Facing = z.infer<typeof facingSchema>;

export const plotSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  plotNumber: z.string().min(1),
  phase: z.string().min(1).optional(),
  block: z.string().min(1).optional(),
  status: plotStatusSchema,
  areaSqYd: z.number().positive(),
  facing: facingSchema,
  roadWidthFt: z.number().positive(),
  isCorner: z.boolean(),
  baseRatePerSqYd: inrAmountSchema,
  premiumAmount: inrAmountSchema.optional(),
  /** areaSqYd × baseRatePerSqYd + premiumAmount. A cost *preview*, never a legal quotation. */
  estimatedTotal: inrAmountSchema,
  /** Prototype Hold expiry. Present only when status is ON_HOLD. */
  holdExpiresAt: isoDateTimeSchema.optional(),
});
export type Plot = z.infer<typeof plotSchema>;
