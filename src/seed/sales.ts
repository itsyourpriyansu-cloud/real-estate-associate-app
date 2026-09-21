import type { Plot, Sale, SalesTarget } from '@/domain';

import { PROJECT_ID, saleId, salesTargetId } from './ids';
import type { SeedPicks } from './picks';
import type { SeedTime } from './time';
import { SELLING_USER_IDS, TEAM_NAME } from './users';

/** Synthetic customer names for sales that are not part of the CRM narrative. */
const CUSTOMER_NAMES: readonly string[] = [
  'Anand Kulkarni',
  'Bhavana Reddy',
  'Chetan Shah',
  'Dilip Varma',
  'Esha Malhotra',
  'Farhan Ali',
  'Geeta Subramanian',
  'Hemant Rao',
  'Indira Pillai',
  'Jayant Deshpande',
  'Kalpana Gupta',
  'Lokesh Yadav',
];

const PROJECT_ORDER = Object.values(PROJECT_ID);

/**
 * Every BOOKED plot has exactly one sale (so "registered sq yards" equals the sum of sales area).
 * Sellers rotate through `SELLING_USER_IDS` in a fixed order, and dates spread over ~60 days, so the
 * dashboard has personal, team and non-team sales to total. Kavitha Menon's plot (the WON lead in
 * the CRM narrative) is sold by the demo associate.
 */
export function buildSales(t: SeedTime, plots: readonly Plot[], picks: SeedPicks): Sale[] {
  const booked = plots
    .filter((p) => p.status === 'BOOKED')
    .sort(
      (a, b) =>
        PROJECT_ORDER.indexOf(a.projectId) - PROJECT_ORDER.indexOf(b.projectId) ||
        Number(a.plotNumber) - Number(b.plotNumber),
    );

  return booked.map((plot, index): Sale => {
    const isKavitha = plot.id === picks.kavithaBookedPlot.id;
    const associateId = isKavitha
      ? (SELLING_USER_IDS[0] ?? '')
      : (SELLING_USER_IDS[index % SELLING_USER_IDS.length] ?? '');
    return {
      id: saleId(index + 1),
      plotId: plot.id,
      projectId: plot.projectId,
      associateId,
      customerName: isKavitha
        ? 'Kavitha Menon'
        : (CUSTOMER_NAMES[index % CUSTOMER_NAMES.length] ?? 'Customer'),
      areaSqYd: plot.areaSqYd,
      amount: plot.estimatedTotal,
      bookedAt: isKavitha ? t.at(-18, '12:00') : t.at(-(4 + index * 3), '11:30'),
      status: index % 4 === 0 ? 'REGISTERED' : 'BOOKED',
    };
  });
}

/** Team targets for this month and the two before it. */
export function buildSalesTargets(t: SeedTime): SalesTarget[] {
  return [
    {
      id: salesTargetId(1),
      teamName: TEAM_NAME,
      period: t.monthKey(0),
      targetAreaSqYd: 2_000,
      targetAmount: 50_000_000,
    },
    {
      id: salesTargetId(2),
      teamName: TEAM_NAME,
      period: t.monthKey(-1),
      targetAreaSqYd: 1_800,
      targetAmount: 45_000_000,
    },
    {
      id: salesTargetId(3),
      teamName: TEAM_NAME,
      period: t.monthKey(-2),
      targetAreaSqYd: 1_800,
      targetAmount: 45_000_000,
    },
  ];
}
