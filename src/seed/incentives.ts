import type { AssociateIncentive, User } from '@/domain';
import {
  COMMISSION_RATE_SENIOR_ASSOCIATE,
  REWARD_PLOT_TARGET,
  SENIOR_ASSOCIATE_DESIGNATION,
} from '@/constants/prototype';

import { ADMIN_ID, incentiveId } from './ids';
import type { SeedTime } from './time';

/**
 * Every seeded Senior Associate gets a demo incentive record at the seed defaults, so the
 * dashboard's commission/reward numbers are identical to before the admin surface existed.
 */
export function buildAssociateIncentives(t: SeedTime, users: readonly User[]): AssociateIncentive[] {
  const seniors = users.filter((u) => u.designation === SENIOR_ASSOCIATE_DESIGNATION);
  return seniors.map((u, i) => ({
    id: incentiveId(i + 1),
    associateId: u.id,
    commissionRate: COMMISSION_RATE_SENIOR_ASSOCIATE,
    rewardPlotTarget: REWARD_PLOT_TARGET,
    assignedByAdminId: ADMIN_ID,
    assignedAt: t.at(-30, '10:00'),
  }));
}
