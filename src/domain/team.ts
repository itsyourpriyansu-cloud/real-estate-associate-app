import { z } from 'zod';

import { idSchema, phoneSchema } from './common';
import { userSchema } from './user';

/** A member of the signed-in associate's downline. `level` 1 is a direct member. */
export const teamMemberSchema = userSchema.extend({
  level: z.number().int().positive(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

/** Add Team Member form. The sponsor defaults to the signed-in associate. */
export const addTeamMemberInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the member’s full name'),
  phone: phoneSchema,
  email: z.email('Enter a valid email address').optional(),
  /** Must be the signed-in associate or someone in their downline. */
  sponsorId: idSchema.optional(),
});
export type AddTeamMemberInput = z.infer<typeof addTeamMemberInputSchema>;
