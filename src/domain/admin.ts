import { z } from 'zod';

import { idSchema, phoneSchema } from './common';

/**
 * The platform administrator. Deliberately not a `User`: an admin has no `associateCode`,
 * `sponsorId`, `teamName` or `designation` — none of the sales-org fields apply. Structurally
 * closer to `guest` (a session kind with no backing `User` row) than to an associate.
 */
export const adminSchema = z.object({
  id: idSchema,
  fullName: z.string().min(1),
  phone: phoneSchema,
  email: z.email().optional(),
});
export type Admin = z.infer<typeof adminSchema>;
