import type { Admin, AssignIncentiveInput, AssociateIncentive, User } from '@/domain';

/** Maps to /api/v1/admin/*. Only reachable from an authenticated admin session. */
export interface AdminRepository {
  /** GET /admin/me — the signed-in admin. */
  getCurrentAdmin(): Promise<Admin>;
  /** GET /admin/associates — every ASSOCIATE-role user, any designation. */
  listAssociates(): Promise<User[]>;
  /** POST /admin/associates/{id}/promote — sets designation to Senior Associate. Idempotent. */
  promoteToSeniorAssociate(associateId: string): Promise<User>;
  /** GET /admin/associates/{id}/incentive — that associate's record, or null when unassigned. */
  getIncentiveFor(associateId: string): Promise<AssociateIncentive | null>;
  /**
   * POST /admin/associates/{id}/incentive — sets or replaces the associate's commission rate and
   * reward target. INVALID_INPUT unless the associate is already a Senior Associate; NOT_FOUND
   * for an unknown associate.
   */
  assignIncentive(input: AssignIncentiveInput): Promise<AssociateIncentive>;
}
