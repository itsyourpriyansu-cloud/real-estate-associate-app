import { z } from 'zod';

import { inrAmountSchema } from './common';

/** Price Calculator input. Validate user-typed values with this before calling `calculatePlotCost`. */
export const plotCostInputSchema = z.object({
  areaSqYd: z.number().positive('Enter the plot area'),
  ratePerSqYd: inrAmountSchema.refine((rate) => rate > 0, 'Enter the rate per sq yd'),
  premiumAmount: inrAmountSchema.optional(),
});
export type PlotCostInput = z.infer<typeof plotCostInputSchema>;

export interface PlotCostBreakdown {
  baseAmount: number;
  premiumAmount: number;
  total: number;
}

/**
 * area × rate + premium — the same formula the inventory uses for `Plot.estimatedTotal`. A cost
 * *preview*, never a legal quotation. Registration, GST and other charges are not modelled in
 * Phase 1; add them here so the calculator and the plot cards stay in step.
 */
export function calculatePlotCost({
  areaSqYd,
  ratePerSqYd,
  premiumAmount = 0,
}: PlotCostInput): PlotCostBreakdown {
  const baseAmount = Math.round(areaSqYd * ratePerSqYd);
  return { baseAmount, premiumAmount, total: baseAmount + premiumAmount };
}
