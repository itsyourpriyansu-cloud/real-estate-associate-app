import { z } from 'zod';

import { idSchema, inrAmountSchema, isoDateTimeSchema, phoneSchema } from './common';

export const saleStatusSchema = z.enum(['BOOKED', 'REGISTERED', 'CANCELLED']);
export type SaleStatus = z.infer<typeof saleStatusSchema>;

/**
 * One plot sold (or booked) by one associate. Powers "My Sales", "Team Total Sales", Live Booking
 * and the registered-square-yards figure. In Phase 1 this is a prototype record, not a legal
 * booking: no payment, no real inventory lock (spec §2).
 */
export const saleSchema = z.object({
  id: idSchema,
  plotId: idSchema,
  projectId: idSchema,
  associateId: idSchema,
  customerName: z.string().min(1),
  customerPhone: phoneSchema.optional(),
  /** Copied from the plot at booking time so later inventory edits cannot rewrite history. */
  areaSqYd: z.number().positive(),
  amount: inrAmountSchema,
  bookedAt: isoDateTimeSchema,
  status: saleStatusSchema,
});
export type Sale = z.infer<typeof saleSchema>;

/** A monthly target for one team ("Team performance, targets"). */
export const salesTargetSchema = z.object({
  id: idSchema,
  teamId: idSchema,
  /** Calendar month, `YYYY-MM`. */
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be YYYY-MM'),
  targetAreaSqYd: z.number().positive(),
  targetAmount: inrAmountSchema,
});
export type SalesTarget = z.infer<typeof salesTargetSchema>;

/** Live Booking input: the plot and who it is for. */
export const createBookingInputSchema = z.object({
  plotId: idSchema,
  customerName: z.string().trim().min(2, 'Enter the customer’s name'),
  customerPhone: phoneSchema.optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
