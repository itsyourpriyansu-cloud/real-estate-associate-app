import {
  createBookingInputSchema,
  type CreateBookingInput,
  type PendingIncentive,
  type Sale,
  type SalesTarget,
} from '@/domain';

import type { SalesRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { currentAssociate, teamUsers } from './effects';
import { byIsoDesc, nextId } from './utils';

export class MockSalesRepository implements SalesRepository {
  constructor(private readonly ctx: MockContext) {}

  listMine(): Promise<Sale[]> {
    return this.ctx.read((data) => {
      const me = currentAssociate(data);
      return data.sales.filter((s) => s.associateId === me.id).sort(byIsoDesc((s) => s.bookedAt));
    });
  }

  listTeam(): Promise<Sale[]> {
    return this.ctx.read((data) => {
      const teamIds = new Set(teamUsers(data, currentAssociate(data).teamName).map((u) => u.id));
      return data.sales
        .filter((s) => teamIds.has(s.associateId))
        .sort(byIsoDesc((s) => s.bookedAt));
    });
  }

  createBooking(input: CreateBookingInput): Promise<Sale> {
    const parsed = createBookingInputSchema.safeParse(input);
    if (!parsed.success) {
      return this.ctx.write(() =>
        fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid booking'),
      );
    }
    const { plotId, customerName, customerPhone } = parsed.data;

    return this.ctx.write((data, now) => {
      const plot = data.plots.find((p) => p.id === plotId);
      if (!plot) fail('NOT_FOUND', `Plot ${plotId} not found`);
      if (plot.status !== 'AVAILABLE' && plot.status !== 'ON_HOLD')
        fail('INVALID_INPUT', `Plot ${plot.plotNumber} is not available to book`);

      // PROTOTYPE booking: flips the plot to BOOKED. Not a payment, not a real inventory lock.
      plot.status = 'BOOKED';
      delete plot.holdExpiresAt;

      const sale: Sale = {
        id: nextId(
          'sale',
          data.sales.map((s) => s.id),
        ),
        plotId: plot.id,
        projectId: plot.projectId,
        associateId: currentAssociate(data).id,
        customerName,
        ...(customerPhone ? { customerPhone } : {}),
        areaSqYd: plot.areaSqYd,
        amount: plot.estimatedTotal,
        bookedAt: now.toISOString(),
        status: 'BOOKED',
      };
      data.sales.push(sale);
      return sale;
    });
  }

  getTargets(): Promise<SalesTarget[]> {
    return this.ctx.read((data) => {
      const { teamName } = currentAssociate(data);
      return data.salesTargets
        .filter((t) => t.teamName === teamName)
        .sort((a, b) => b.period.localeCompare(a.period));
    });
  }

  getIncentive(): Promise<PendingIncentive> {
    return this.ctx.read((data) => {
      const me = currentAssociate(data);
      const record = data.associateIncentives.find((i) => i.associateId === me.id);
      return record ? { state: 'READY', value: record } : { state: 'PENDING' };
    });
  }
}
