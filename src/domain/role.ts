import { z } from 'zod';

import { idSchema } from './common';

/**
 * The fixed org-chart tier. Unlike `Role`/`Permission` (dynamic, see below), this is a closed enum:
 * the five-level chain CEO → Management → Marketing Head → Senior Associate → Junior Associate is
 * structural — dashboards, hierarchy walks and commission scope all key off it directly.
 */
export const organizationLevelSchema = z.enum([
  'CEO',
  'MANAGEMENT',
  'MARKETING_HEAD',
  'SENIOR_ASSOCIATE',
  'JUNIOR_ASSOCIATE',
]);
export type OrganizationLevel = z.infer<typeof organizationLevelSchema>;

/**
 * Every gated action in this phase. Screens and repositories check membership in a role's
 * `permissions` array — never `orgLevel === 'MANAGEMENT'` — so a new role can be introduced later
 * without a code change (spec §3: "do not hard-code role === management").
 */
export const permissionSchema = z.enum([
  // Org & people
  'EMPLOYEE_VIEW_ALL',
  'EMPLOYEE_VIEW_DOWNLINE',
  'EMPLOYEE_CREATE',
  'EMPLOYEE_EDIT',
  'EMPLOYEE_CHANGE_STATUS',
  'EMPLOYEE_ASSIGN_ROLE',
  'EMPLOYEE_ASSIGN_MANAGER',
  'TEAM_MANAGE',
  // Master data
  'PROJECT_MANAGE',
  'PROJECT_SITE_MANAGE',
  'PLOT_MANAGE_INVENTORY',
  'PLOT_MANAGE_PRICING',
  'VEHICLE_MANAGE',
  'COMMISSION_RULE_MANAGE',
  'COMMISSION_RULE_VIEW',
  // CRM
  'LEAD_VIEW_ALL',
  'LEAD_VIEW_TEAM',
  'LEAD_VIEW_OWN',
  'LEAD_ASSIGN',
  'LEAD_EDIT',
  'CUSTOMER_VIEW_ALL',
  'CUSTOMER_VIEW_TEAM',
  'CUSTOMER_VIEW_OWN',
  'CUSTOMER_MANAGE',
  'FOLLOW_UP_MANAGE',
  'TASK_MANAGE',
  'CONVERSATION_VIEW',
  'CONVERSATION_SEND',
  'NOTIFICATION_VIEW',
  // Site visit tickets
  'SITE_VISIT_TICKET_CREATE',
  'SITE_VISIT_TICKET_VIEW_OWN',
  'SITE_VISIT_TICKET_VIEW_TEAM',
  'SITE_VISIT_TICKET_VIEW_ALL',
  'SITE_VISIT_TICKET_REVIEW_MARKETING',
  'SITE_VISIT_TICKET_REVIEW_MANAGEMENT',
  'SITE_VISIT_TICKET_ASSIGN_VEHICLE',
  'SITE_VISIT_TICKET_MODIFY',
  'SITE_VISIT_TICKET_CANCEL',
  // Dashboards
  'DASHBOARD_VIEW_ORG',
  'DASHBOARD_VIEW_TEAM',
  'DASHBOARD_VIEW_OWN',
]);
export type Permission = z.infer<typeof permissionSchema>;

/**
 * A stored, dynamic entity — not a hard-coded enum. Five `isSystem: true` rows are seeded (one per
 * `OrganizationLevel`), but a Management user could create a sixth role at the same `orgLevel` with
 * a different `permissions` set (spec §3: Management "may have different permissions even though
 * they belong to the same organizational level").
 */
export const roleSchema = z.object({
  id: idSchema,
  key: z.string().min(1),
  label: z.string().min(1),
  orgLevel: organizationLevelSchema,
  permissions: z.array(permissionSchema),
  isSystem: z.boolean(),
});
export type Role = z.infer<typeof roleSchema>;
