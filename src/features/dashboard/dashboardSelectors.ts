import type { SalesTotals } from '@/domain';
import { SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';

export interface CommissionInfo {
  eligible: boolean;
  rate: number;
  amount: number;
}

/** `rate` (fraction) of total sale value for senior associates; everyone else earns none. */
export function commissionFor(
  designation: string | undefined,
  rate: number,
  sales: SalesTotals,
): CommissionInfo {
  const eligible = designation === SENIOR_ASSOCIATE_DESIGNATION;
  return { eligible, rate, amount: eligible ? Math.round(sales.amount * rate) : 0 };
}

export interface RewardProgress {
  plotsSold: number;
  target: number;
  remaining: number;
  achieved: boolean;
}

/** Progress toward the foreign-trip reward: sell `target` plots (the admin's assigned target). */
export function rewardProgressFor(sales: SalesTotals, target: number): RewardProgress {
  const plotsSold = sales.count;
  return {
    plotsSold,
    target,
    remaining: Math.max(0, target - plotsSold),
    achieved: plotsSold >= target,
  };
}
