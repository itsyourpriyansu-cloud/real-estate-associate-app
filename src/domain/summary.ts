import { z } from 'zod';

import { inrAmountSchema } from './common';

/** Home page numbers. Readable without a session. */
export const publicSummarySchema = z.object({
  totalRegisteredSqYd: z.number().nonnegative(),
  completedProjects: z.number().int().nonnegative(),
  ongoingProjects: z.number().int().nonnegative(),
  availablePlots: z.number().int().nonnegative(),
});
export type PublicSummary = z.infer<typeof publicSummarySchema>;

export const salesTotalsSchema = z.object({
  count: z.number().int().nonnegative(),
  areaSqYd: z.number().nonnegative(),
  amount: inrAmountSchema,
});
export type SalesTotals = z.infer<typeof salesTotalsSchema>;

const ready = <T extends z.ZodType>(value: T) => z.object({ state: z.literal('READY'), value });
const pending = z.object({ state: z.literal('PENDING') });

/**
 * A dashboard figure that may not exist yet. The wireframe shows "Pending / Not yet added" for
 * My Sales and Team Site Visits, so the absence of data is a first-class state, not a zero.
 */
export const pendingSalesSchema = z.discriminatedUnion('state', [
  ready(salesTotalsSchema),
  pending,
]);
export type PendingSales = z.infer<typeof pendingSalesSchema>;

export const pendingCountSchema = z.discriminatedUnion('state', [
  ready(z.number().int().nonnegative()),
  pending,
]);
export type PendingCount = z.infer<typeof pendingCountSchema>;

/** The two summary containers on the associate dashboard. */
export const associateSummarySchema = z.object({
  teamName: z.string().min(1),
  // Summary container 1
  totalRegisteredSqYd: z.number().nonnegative(),
  teamTotalSales: salesTotalsSchema,
  /** Everyone in the associate's team (organisation-wide). */
  teamMembers: z.number().int().nonnegative(),
  /** The associate's own downline. */
  myTeam: z.number().int().nonnegative(),
  // Summary container 2
  mySales: pendingSalesSchema,
  teamSiteVisits: pendingCountSchema,
});
export type AssociateSummary = z.infer<typeof associateSummarySchema>;
