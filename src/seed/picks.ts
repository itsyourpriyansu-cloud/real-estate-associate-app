import type { Plot, PlotStatus } from '@/domain';

import { PROJECT_ID } from './ids';
import { DEMO_PLOT_IDS } from './plots';

/**
 * Cross-entity references resolved ONCE from the generated inventory, so leads, visits, timeline
 * events, conversations and notifications all point at the same plots. Every pick asserts the
 * plot exists with the status the narrative needs, so a change to the inventory generator fails
 * loudly at build time instead of producing an inconsistent demo.
 */
export interface SeedPicks {
  /** Real Rise · Plot 26 — the plot used in the stakeholder walkthrough (Rahul Sharma). */
  rahulPlot: Plot;
  /** Mohammed Faizan's shortlist: an available corner plot and a held plot, both in Aurelia Greens. */
  faizanPlots: [Plot, Plot];
  /** Cedar Enclave plot on Prototype Hold for Arjun Patel. */
  arjunHeldPlot: Plot;
  /** Real Rise plot booked by Kavitha Menon (WON lead). */
  kavithaBookedPlot: Plot;
  /** A different booked Real Rise plot, referenced by an inventory notification. */
  otherBookedPlot: Plot;
  /** Aurelia Greens hold that ends today, referenced by an inventory notification. */
  expiringHoldPlot: Plot;
  /** Real Rise plot shortlisted for Pooja Deshmukh (a shortlist that exists without any visit). */
  poojaPlot: Plot;
}

function requirePlot(plots: readonly Plot[], id: string, status: PlotStatus): Plot {
  const plot = plots.find((p) => p.id === id);
  if (!plot) throw new Error(`Seed pick failed: plot ${id} does not exist`);
  if (plot.status !== status)
    throw new Error(`Seed pick failed: plot ${id} is ${plot.status}, expected ${status}`);
  return plot;
}

export function pickSeedPlots(plots: readonly Plot[]): SeedPicks {
  const kavithaBookedPlot = requirePlot(plots, DEMO_PLOT_IDS.kavithaBooked, 'BOOKED');
  const otherBookedPlot = plots.find(
    (p) => p.projectId === PROJECT_ID.rr && p.status === 'BOOKED' && p.id !== kavithaBookedPlot.id,
  );
  if (!otherBookedPlot) throw new Error('Seed pick failed: no second booked Real Rise plot');

  return {
    rahulPlot: requirePlot(plots, DEMO_PLOT_IDS.rahul, 'AVAILABLE'),
    faizanPlots: [
      requirePlot(plots, DEMO_PLOT_IDS.faizanCorner, 'AVAILABLE'),
      requirePlot(plots, DEMO_PLOT_IDS.faizanHeld, 'ON_HOLD'),
    ],
    arjunHeldPlot: requirePlot(plots, DEMO_PLOT_IDS.arjunHeld, 'ON_HOLD'),
    kavithaBookedPlot,
    otherBookedPlot,
    expiringHoldPlot: requirePlot(plots, DEMO_PLOT_IDS.expiringHold, 'ON_HOLD'),
    poojaPlot: requirePlot(plots, DEMO_PLOT_IDS.pooja, 'AVAILABLE'),
  };
}
