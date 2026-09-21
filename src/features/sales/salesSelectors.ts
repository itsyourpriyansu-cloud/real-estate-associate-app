import { format } from 'date-fns';

import { sumSales, type Sale, type SalesTarget, type SalesTotals } from '@/domain';

/** `2026-09` for a timestamp, in the device's calendar (the same rule the seed uses). */
export const periodOf = (iso: string): string => format(new Date(iso), 'yyyy-MM');

/** "Sep 2026" for a `YYYY-MM` period. */
export function periodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  return format(new Date(year ?? 1970, (month ?? 1) - 1, 1), 'MMM yyyy');
}

export interface MonthPerformance {
  period: string;
  totals: SalesTotals;
  /** Null when the team has no target for the month. */
  target: Pick<SalesTarget, 'targetAreaSqYd' | 'targetAmount'> | null;
  /** 0–∞ (1 = target met). Null without a target. */
  areaProgress: number | null;
  amountProgress: number | null;
}

/** Sales, target and progress for one calendar month. Pure: no clock, no I/O. */
export function performanceFor(
  period: string,
  sales: readonly Sale[],
  targets: readonly SalesTarget[],
): MonthPerformance {
  const totals = sumSales(sales.filter((s) => periodOf(s.bookedAt) === period));
  const target = targets.find((t) => t.period === period) ?? null;
  return {
    period,
    totals,
    target: target
      ? { targetAreaSqYd: target.targetAreaSqYd, targetAmount: target.targetAmount }
      : null,
    areaProgress: target ? totals.areaSqYd / target.targetAreaSqYd : null,
    amountProgress: target ? totals.amount / target.targetAmount : null,
  };
}

export interface SellerRank {
  associateId: string;
  totals: SalesTotals;
}

/** Sellers in a set of sales, best first (by value, then by area, then id for a stable order). */
export function rankSellers(sales: readonly Sale[]): SellerRank[] {
  const byAssociate = new Map<string, Sale[]>();
  for (const sale of sales) {
    byAssociate.set(sale.associateId, [...(byAssociate.get(sale.associateId) ?? []), sale]);
  }
  return [...byAssociate.entries()]
    .map(([associateId, own]) => ({ associateId, totals: sumSales(own) }))
    .filter((rank) => rank.totals.count > 0)
    .sort(
      (a, b) =>
        b.totals.amount - a.totals.amount ||
        b.totals.areaSqYd - a.totals.areaSqYd ||
        a.associateId.localeCompare(b.associateId),
    );
}

/** The months that have a target or a sale, newest first — the month selector's options. */
export function availablePeriods(
  sales: readonly Sale[],
  targets: readonly SalesTarget[],
): string[] {
  return [...new Set([...targets.map((t) => t.period), ...sales.map((s) => periodOf(s.bookedAt))])]
    .sort()
    .reverse();
}
