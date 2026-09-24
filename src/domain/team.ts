import { z } from 'zod';

import { idSchema, isoDateTimeSchema, phoneSchema } from './common';
import { userSchema } from './user';

export const teamStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type TeamStatus = z.infer<typeof teamStatusSchema>;

/** A marketing team ("Team Tiger", "Team Lion", …) — a real stored entity, not a free-text label. */
export const teamSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  /** The `User` (orgLevel MARKETING_HEAD) who leads this team, if assigned. */
  marketingHeadId: idSchema.optional(),
  status: teamStatusSchema,
  createdAt: isoDateTimeSchema,
});
export type Team = z.infer<typeof teamSchema>;

/** A member of the signed-in user's reporting downline. `level` 1 is a direct report. */
export const teamMemberSchema = userSchema.extend({
  level: z.number().int().positive(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

/** Add Team Member form. The manager defaults to the signed-in user. */
export const addTeamMemberInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the member’s full name'),
  phone: phoneSchema,
  email: z.email('Enter a valid email address').optional(),
  /** Must be the signed-in user or someone in their downline. */
  reportingManagerId: idSchema.optional(),
});
export type AddTeamMemberInput = z.infer<typeof addTeamMemberInputSchema>;
