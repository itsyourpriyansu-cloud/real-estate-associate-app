import { z } from 'zod';

import { idSchema, isoDateTimeSchema, phoneSchema } from './common';
import { organizationLevelSchema } from './role';

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export type UserStatus = z.infer<typeof userStatusSchema>;

/** One entry in a user's append-only status history. No hard deletes — see AGENTS.md rule 3/spec. */
export const userStatusChangeSchema = z.object({
  status: userStatusSchema,
  changedAt: isoDateTimeSchema,
  changedByUserId: idSchema,
  reason: z.string().min(1).optional(),
});
export type UserStatusChange = z.infer<typeof userStatusChangeSchema>;

export const userSchema = z.object({
  id: idSchema,
  fullName: z.string().min(1),
  phone: phoneSchema,
  email: z.email().optional(),
  avatarUrl: z.string().min(1).optional(),
  associateCode: z.string().min(1),
  /** FK → Role. Carries the permission set. */
  roleId: idSchema,
  /** Denormalised from `role.orgLevel`; kept in sync by `EmployeeRepository`, never edited directly. */
  orgLevel: organizationLevelSchema,
  /** Free-text *display* label only ("Zonal Head") — never permission-bearing. */
  designation: z.string().min(1).optional(),
  /** FK → Team. Optional: CEO/Management may belong to no team. */
  teamId: idSchema.optional(),
  /**
   * The formal org-chart parent (was `sponsorId`). Walking this chain is both "my team" (a
   * downline) and the hierarchy CEO → Management → Marketing Head → Senior Associate → Junior
   * Associate — see `ALLOWED_MANAGER_LEVELS` in `repositories/mock/effects.ts`.
   */
  reportingManagerId: idSchema.optional(),
  joinedAt: isoDateTimeSchema,
  status: userStatusSchema,
  /** Append-only. The current `status` is always `statusHistory.at(-1)?.status`. */
  statusHistory: z.array(userStatusChangeSchema),
  /** Demo-only registration label. Never a real RERA number. */
  reraRegistration: z.string().min(1).optional(),
});
export type User = z.infer<typeof userSchema>;
