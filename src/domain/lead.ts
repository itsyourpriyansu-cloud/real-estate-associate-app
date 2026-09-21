import { z } from 'zod';

import { idSchema, inrAmountSchema, isoDateTimeSchema, phoneSchema } from './common';
import { facingSchema } from './plot';

/** Ordered as the sales pipeline; `.options` is the canonical stage order for the stage rail. */
export const leadStageSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'INTERESTED',
  'VISIT',
  'NEGOTIATION',
  'BOOKING',
  'WON',
  'LOST',
]);
export type LeadStage = z.infer<typeof leadStageSchema>;

export const leadPrioritySchema = z.enum(['HOT', 'WARM', 'NORMAL', 'COLD']);
export type LeadPriority = z.infer<typeof leadPrioritySchema>;

export const leadSourceSchema = z.enum([
  'META_ADS',
  'GOOGLE_ADS',
  'WEBSITE',
  'WHATSAPP',
  'REFERRAL',
  'WALK_IN',
  'PORTAL',
  'MANUAL',
]);
export type LeadSource = z.infer<typeof leadSourceSchema>;

export const propertyTypeSchema = z.enum(['PLOT', 'VILLA', 'APARTMENT']);
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const purchasePurposeSchema = z.enum(['SELF_USE', 'INVESTMENT']);
export const purchaseTimelineSchema = z.enum([
  '0_30_DAYS',
  '1_3_MONTHS',
  '3_6_MONTHS',
  '6_PLUS_MONTHS',
]);

export const leadRequirementSchema = z
  .object({
    budgetMin: inrAmountSchema.optional(),
    budgetMax: inrAmountSchema.optional(),
    preferredLocations: z.array(z.string().min(1)),
    propertyTypes: z.array(propertyTypeSchema),
    areaMinSqYd: z.number().positive().optional(),
    areaMaxSqYd: z.number().positive().optional(),
    preferredFacing: z.array(facingSchema).optional(),
    purpose: purchasePurposeSchema.optional(),
    purchaseTimeline: purchaseTimelineSchema.optional(),
    loanRequired: z.boolean().optional(),
  })
  .refine(
    (r) => r.budgetMin === undefined || r.budgetMax === undefined || r.budgetMin <= r.budgetMax,
    {
      message: 'budgetMin cannot exceed budgetMax',
      path: ['budgetMin'],
    },
  )
  .refine(
    (r) =>
      r.areaMinSqYd === undefined || r.areaMaxSqYd === undefined || r.areaMinSqYd <= r.areaMaxSqYd,
    {
      message: 'areaMinSqYd cannot exceed areaMaxSqYd',
      path: ['areaMinSqYd'],
    },
  );
export type LeadRequirement = z.infer<typeof leadRequirementSchema>;

export const leadSchema = z.object({
  id: idSchema,
  fullName: z.string().min(1),
  phone: phoneSchema,
  email: z.email().optional(),
  source: leadSourceSchema,
  sourceLabel: z.string().min(1).optional(),
  stage: leadStageSchema,
  priority: leadPrioritySchema,
  assignedUserId: idSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  lastActivityAt: isoDateTimeSchema.optional(),
  nextActionAt: isoDateTimeSchema.optional(),
  nextActionLabel: z.string().min(1).optional(),
  requirement: leadRequirementSchema,
  tags: z.array(z.string().min(1)),
  notesCount: z.number().int().nonnegative(),
  unreadMessages: z.number().int().nonnegative(),

  // --- Spec extensions (additive; see docs/DOMAIN_SCHEMA.md "Deviations from the spec") ---
  /** Plots shortlisted for this lead. Needed because "Shortlist for Lead" (spec §14.9) can occur without a visit. */
  shortlistedPlotIds: z.array(idSchema),
  /** Required context when stage is LOST (spec §12 asks for a lost-lead reason). */
  lostReason: z.string().min(1).optional(),
  /** Booked plot for WON / BOOKING leads; feeds the monthly booking snapshot (spec §16). */
  bookedPlotId: idSchema.optional(),
});
export type Lead = z.infer<typeof leadSchema>;

export const timelineEventTypeSchema = z.enum([
  'LEAD_CREATED',
  'CALL',
  'WHATSAPP_SENT',
  'WHATSAPP_RECEIVED',
  'NOTE',
  'STAGE_CHANGED',
  'VISIT_SCHEDULED',
  'VISIT_COMPLETED',
  'PROJECT_SHARED',
  'PLOT_SHORTLISTED',
]);
export type TimelineEventType = z.infer<typeof timelineEventTypeSchema>;

export const timelineEventSchema = z.object({
  id: idSchema,
  leadId: idSchema,
  type: timelineEventTypeSchema,
  occurredAt: isoDateTimeSchema,
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  actorName: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
