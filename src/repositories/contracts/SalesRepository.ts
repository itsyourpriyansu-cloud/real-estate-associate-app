import type { CreateBookingInput, PendingIncentive, Sale, SalesTarget } from '@/domain';

/** Maps to /api/v1/sales/*. */
export interface SalesRepository {
  /** GET /sales?scope=mine — the caller's own sales, newest first. */
  listMine(): Promise<Sale[]>;
  /** GET /sales?scope=team — every sale by anyone in the caller's team, newest first. */
  listTeam(): Promise<Sale[]>;
  /**
   * POST /sales — Live Booking. PROTOTYPE: marks the plot BOOKED and records a Sale; it is not a
   * payment and not a real inventory lock. Rejects with INVALID_INPUT unless the plot is AVAILABLE
   * or ON_HOLD, and with NOT_FOUND for an unknown plot.
   */
  createBooking(input: CreateBookingInput): Promise<Sale>;
  /** GET /sales/targets — the caller's team targets, most recent month first. */
  getTargets(): Promise<SalesTarget[]>;
  /** GET /sales/incentive — the caller's own commission/reward record, PENDING when unassigned. */
  getIncentive(): Promise<PendingIncentive>;
}
