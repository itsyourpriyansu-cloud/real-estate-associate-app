import { z } from 'zod';

import { idSchema, isoDateTimeSchema, phoneSchema } from './common';

/** `ASSOCIATE` and `TEAM_LEAD` are the sales roles; both sign in through Associate Login. */
export const userRoleSchema = z.enum(['ASSOCIATE', 'TEAM_LEAD']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const userSchema = z.object({
  id: idSchema,
  role: userRoleSchema,
  fullName: z.string().min(1),
  phone: phoneSchema,
  email: z.email().optional(),
  avatarUrl: z.string().min(1).optional(),
  associateCode: z.string().min(1),
  designation: z.string().min(1),
  /** The team label shared by everyone in one organisation, e.g. "YHIPL2". */
  teamName: z.string().min(1).optional(),
  /**
   * The direct upline: the user who added this person. The chain of `sponsorId`s is the "My Team"
   * tree, so a team member is a User — there is no parallel team-member entity.
   */
  sponsorId: idSchema.optional(),
  joinedAt: isoDateTimeSchema,
  status: userStatusSchema,
  /** Demo-only registration label. Never a real RERA number. */
  reraRegistration: z.string().min(1).optional(),
});
export type User = z.infer<typeof userSchema>;
