import { PROTOTYPE_ACCOUNTS, SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';
import {
  associateSummarySchema,
  calculatePlotCost,
  plotCostInputSchema,
  publicSummarySchema,
  sumSales,
  type Plot,
} from '@/domain';
import { RepositoryError } from '@/repositories';
import { ASSOCIATE_ID } from '@/seed/ids';
import { buildSeedDataset, type PrototypeDataset } from '@/seed';
import { demoDayStart } from '@/services/clock';
import type { DatasetScenario } from '@/services/simulation';
import { MemoryStorage } from '@/services/storage';

import {
  createTestRepositories,
  createTestRepositoriesWithDesignation,
  createTestRepositoriesWithSeed,
} from './helpers';

const build = (scenario: DatasetScenario = 'NORMAL'): PrototypeDataset =>
  buildSeedDataset({ anchor: demoDayStart(), scenario });

const ME = 'usr_raghunath';
const LEAD = 'usr_meenakshi';

async function rejectsWith(promise: Promise<unknown>, code: RepositoryError['code']) {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(RepositoryError);
  expect((error as RepositoryError).code).toBe(code);
}

describe('flow seed: team, sales, targets, project status', () => {
  const data = build('NORMAL');
  const users = new Map(data.users.map((u) => [u.id, u]));

  it('gives every sponsor an existing user on the same team, with no cycles', () => {
    for (const user of data.users) {
      if (!user.sponsorId) continue;
      const sponsor = users.get(user.sponsorId);
      expect({ id: user.id, sponsorExists: sponsor !== undefined }).toEqual({
        id: user.id,
        sponsorExists: true,
      });
      expect(sponsor?.teamName).toBe(user.teamName);

      const seen = new Set([user.id]);
      let cursor = sponsor;
      while (cursor) {
        expect(seen.has(cursor.id)).toBe(false);
        seen.add(cursor.id);
        cursor = cursor.sponsorId ? users.get(cursor.sponsorId) : undefined;
      }
    }
  });

  it('has unique phone numbers and associate codes', () => {
    const phones = data.users.map((u) => u.phone);
    const codes = data.users.map((u) => u.associateCode);
    expect(new Set(phones).size).toBe(phones.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('keeps PROTOTYPE_ACCOUNTS in step with the seeded users', () => {
    for (const phone of PROTOTYPE_ACCOUNTS) {
      expect(data.users.find((u) => u.phone === phone)).toBeDefined();
    }
  });

  it('seeds one sale for every booked plot, copied from the plot and sold by a real user', () => {
    const booked = data.plots.filter((p) => p.status === 'BOOKED');
    expect(data.sales).toHaveLength(booked.length);
    for (const plot of booked) {
      const sales = data.sales.filter((s) => s.plotId === plot.id);
      expect({ plot: plot.id, sales: sales.length }).toEqual({ plot: plot.id, sales: 1 });
      expect(sales[0]).toMatchObject({
        projectId: plot.projectId,
        areaSqYd: plot.areaSqYd,
        amount: plot.estimatedTotal,
      });
      expect(users.has(sales[0]?.associateId ?? '')).toBe(true);
    }
  });

  it('gives the demo associate, the team and other teams sales to total', () => {
    const team = new Set(data.users.filter((u) => u.teamName === 'YHIPL2').map((u) => u.id));
    const mine = data.sales.filter((s) => s.associateId === ME);
    const teamSales = data.sales.filter((s) => team.has(s.associateId));
    expect(mine.length).toBeGreaterThan(0);
    expect(teamSales.length).toBeGreaterThan(mine.length);
    expect(teamSales.length).toBeLessThan(data.sales.length);
    expect(data.sales.find((s) => s.customerName === 'Kavitha Menon')?.associateId).toBe(ME);
  });

  it('has YHIPL2 targets for three consecutive months', () => {
    expect(data.salesTargets.map((t) => t.period)).toEqual(['2026-09', '2026-08', '2026-07']);
    expect(data.salesTargets.every((t) => t.teamName === 'YHIPL2')).toBe(true);
  });

  it('marks two projects completed and two ongoing', () => {
    const statuses = data.projects.map((p) => p.status).sort();
    expect(statuses).toEqual(['COMPLETED', 'COMPLETED', 'ONGOING', 'ONGOING']);
  });

  it('EMPTY_CRM keeps the team and targets but has no sales', () => {
    const empty = build('EMPTY_CRM');
    expect(empty.sales).toEqual([]);
    expect(empty.salesTargets).toHaveLength(3);
  });
});

describe('SummaryRepository', () => {
  it('reports the public numbers from the inventory and project statuses', async () => {
    const { repositories: r } = createTestRepositories();
    const [summary, plots] = await Promise.all([r.summary.getPublicSummary(), r.plots.list()]);
    expect(() => publicSummarySchema.parse(summary)).not.toThrow();
    expect(summary).toEqual({
      totalRegisteredSqYd: plots
        .filter((p) => p.status === 'BOOKED')
        .reduce((sum, p) => sum + p.areaSqYd, 0),
      completedProjects: 2,
      ongoingProjects: 2,
      availablePlots: plots.filter((p) => p.status === 'AVAILABLE').length,
    });
  });

  it('builds the dashboard containers: team 16, my team 9, sales and visits ready', async () => {
    const { repositories: r } = createTestRepositories();
    const summary = await r.summary.getAssociateSummary();
    expect(() => associateSummarySchema.parse(summary)).not.toThrow();
    expect(summary).toMatchObject({ teamName: 'YHIPL2', teamMembers: 16, myTeam: 9 });
    expect(summary.mySales.state).toBe('READY');
    expect(summary.teamSiteVisits).toEqual({ state: 'READY', value: 7 });
    expect(summary.teamTotalSales.count).toBeGreaterThan(0);
  });

  it('reads "pending" — not zero — when nothing has been recorded (Empty CRM)', async () => {
    const { repositories: r } = createTestRepositories({ scenario: 'EMPTY_CRM' });
    const summary = await r.summary.getAssociateSummary();
    expect(summary.mySales).toEqual({ state: 'PENDING' });
    expect(summary.teamSiteVisits).toEqual({ state: 'PENDING' });
    expect(summary.myTeam).toBe(9);
  });

  it('fails like every other repository when offline', async () => {
    const { repositories: r } = createTestRepositories({ scenario: 'OFFLINE' });
    await rejectsWith(r.summary.getPublicSummary(), 'OFFLINE');
    await rejectsWith(r.summary.getAssociateSummary(), 'OFFLINE');
  });
});

describe('TeamRepository', () => {
  it('lists the downline by level: 4 direct, 4 at level 2, 1 at level 3', async () => {
    const { repositories: r } = createTestRepositories();
    const team = await r.team.listMyTeam();
    expect(team).toHaveLength(9);
    expect(team.map((m) => m.level)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(team.every((m) => m.teamName === 'YHIPL2' && m.id !== ME && m.id !== LEAD)).toBe(true);
    expect(team.filter((m) => m.level === 1).every((m) => m.sponsorId === ME)).toBe(true);
  });

  it('returns a member of the downline, and null for anyone outside it', async () => {
    const { repositories: r } = createTestRepositories();
    expect(await r.team.getMember('usr_member_008')).toMatchObject({ level: 3 });
    expect(await r.team.getMember(LEAD)).toBeNull(); // upline
    expect(await r.team.getMember('usr_member_010')).toBeNull(); // same team, other branch
    expect(await r.team.getMember('usr_member_015')).toBeNull(); // other team
    expect(await r.team.getMember('nope')).toBeNull();
  });

  it('adds a direct member with the next associate code and updates the summary', async () => {
    const { repositories: r } = createTestRepositories();
    const member = await r.team.addMember({ fullName: 'Asha Menon', phone: '+919811100001' });
    expect(member).toMatchObject({
      role: 'ASSOCIATE',
      status: 'ACTIVE',
      sponsorId: ME,
      level: 1,
      teamName: 'YHIPL2',
      associateCode: 'YH-APL2-1065',
    });

    expect(await r.team.listMyTeam()).toHaveLength(10);
    expect(await r.summary.getAssociateSummary()).toMatchObject({ teamMembers: 17, myTeam: 10 });
  });

  it('adds a member under someone in the downline, one level deeper', async () => {
    const { repositories: r } = createTestRepositories();
    const member = await r.team.addMember({
      fullName: 'Ravi Teja',
      phone: '+919811100002',
      email: 'ravi.teja@example.com',
      sponsorId: 'usr_member_008',
    });
    expect(member).toMatchObject({ sponsorId: 'usr_member_008', level: 4 });
  });

  it('rejects a duplicate number, a sponsor outside the downline, and a bad name', async () => {
    const { repositories: r } = createTestRepositories();
    await rejectsWith(
      r.team.addMember({ fullName: 'Copy Cat', phone: '+919876500017' }),
      'INVALID_INPUT',
    );
    await rejectsWith(
      r.team.addMember({ fullName: 'Out Sider', phone: '+919811100003', sponsorId: LEAD }),
      'INVALID_INPUT',
    );
    await rejectsWith(r.team.addMember({ fullName: 'A', phone: '+919811100004' }), 'INVALID_INPUT');
    expect(await r.team.listMyTeam()).toHaveLength(9);
  });

  it('rejects adding a member when the caller is not a Senior Associate', async () => {
    const { repositories: r } = await createTestRepositoriesWithDesignation(
      ASSOCIATE_ID,
      'Associate',
    );
    await rejectsWith(
      r.team.addMember({ fullName: 'Blocked Buyer', phone: '+919811100005' }),
      'INVALID_INPUT',
    );
  });

  it('persists a new member across an app restart', async () => {
    const storage = new MemoryStorage();
    await createTestRepositories({ storage }).repositories.team.addMember({
      fullName: 'Asha Menon',
      phone: '+919811100001',
    });
    const restarted = createTestRepositories({ storage }).repositories;
    expect(await restarted.team.listMyTeam()).toHaveLength(10);
  });
});

describe('SalesRepository', () => {
  it('lists my sales newest first, and the team list contains them', async () => {
    const { repositories: r } = createTestRepositories();
    const [mine, team] = await Promise.all([r.sales.listMine(), r.sales.listTeam()]);
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((s) => s.associateId === ME)).toBe(true);
    expect([...mine].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))).toEqual(mine);
    const teamIds = new Set(team.map((s) => s.id));
    expect(mine.every((s) => teamIds.has(s.id))).toBe(true);
    expect(team.length).toBeGreaterThan(mine.length);
  });

  it('returns the team targets, most recent month first', async () => {
    const { repositories: r } = createTestRepositories();
    const targets = await r.sales.getTargets();
    expect(targets.map((t) => t.period)).toEqual(['2026-09', '2026-08', '2026-07']);
  });

  it('books an available plot: sale recorded, plot booked, counts and totals move', async () => {
    const { repositories: r } = createTestRepositories();
    const [plot] = await r.plots.list({ projectId: 'prj_real_rise', statuses: ['AVAILABLE'] });
    if (!plot) throw new Error('no available plot');
    const before = await r.summary.getPublicSummary();
    const projectBefore = await r.projects.getById(plot.projectId);
    const salesBefore = sumSales(await r.sales.listMine());

    const sale = await r.sales.createBooking({ plotId: plot.id, customerName: 'Meera Kapoor' });
    expect(sale).toMatchObject({
      plotId: plot.id,
      associateId: ME,
      customerName: 'Meera Kapoor',
      areaSqYd: plot.areaSqYd,
      amount: plot.estimatedTotal,
      status: 'BOOKED',
    });

    expect((await r.plots.getById(plot.id))?.status).toBe('BOOKED');
    expect((await r.summary.getPublicSummary()).totalRegisteredSqYd).toBe(
      before.totalRegisteredSqYd + plot.areaSqYd,
    );
    expect((await r.projects.getById(plot.projectId))?.availableUnits).toBe(
      (projectBefore?.availableUnits ?? 0) - 1,
    );
    expect(sumSales(await r.sales.listMine())).toEqual({
      count: salesBefore.count + 1,
      areaSqYd: salesBefore.areaSqYd + plot.areaSqYd,
      amount: salesBefore.amount + plot.estimatedTotal,
    });
    expect((await r.sales.listMine())[0]?.id).toBe(sale.id);
  });

  it('can book a plot that is on prototype hold, and clears the hold', async () => {
    const { repositories: r } = createTestRepositories();
    const [held] = await r.plots.list({ statuses: ['ON_HOLD'] });
    if (!held) throw new Error('no held plot');
    await r.sales.createBooking({ plotId: held.id, customerName: 'Held Buyer' });
    const after = await r.plots.getById(held.id);
    expect(after?.status).toBe('BOOKED');
    expect(after?.holdExpiresAt).toBeUndefined();
  });

  it('refuses unavailable, unknown and badly-named bookings without changing anything', async () => {
    const { repositories: r } = createTestRepositories();
    const [booked] = await r.plots.list({ statuses: ['BOOKED'] });
    const [available] = await r.plots.list({ statuses: ['AVAILABLE'] });
    if (!booked || !available) throw new Error('missing samples');
    const salesBefore = (await r.sales.listMine()).length;

    await rejectsWith(
      r.sales.createBooking({ plotId: booked.id, customerName: 'Late Buyer' }),
      'INVALID_INPUT',
    );
    await rejectsWith(
      r.sales.createBooking({ plotId: 'plot_missing', customerName: 'Ghost Buyer' }),
      'NOT_FOUND',
    );
    await rejectsWith(
      r.sales.createBooking({ plotId: available.id, customerName: ' ' }),
      'INVALID_INPUT',
    );
    expect((await r.plots.getById(available.id))?.status).toBe('AVAILABLE');
    expect(await r.sales.listMine()).toHaveLength(salesBefore);
  });

  it('reads the caller’s own incentive, READY for the seeded senior associate', async () => {
    const { repositories: r } = createTestRepositories();
    expect(await r.sales.getIncentive()).toEqual({
      state: 'READY',
      value: expect.objectContaining({
        associateId: ME,
        commissionRate: 0.05,
        rewardPlotTarget: 5,
      }),
    });
  });

  it('reads PENDING once the caller has no incentive record', async () => {
    const { repositories: r } = await createTestRepositoriesWithSeed((dataset) => {
      dataset.associateIncentives = dataset.associateIncentives.filter(
        (i) => i.associateId !== ME,
      );
    });
    expect(await r.sales.getIncentive()).toEqual({ state: 'PENDING' });
  });
});

describe('AdminRepository', () => {
  it('lists only ASSOCIATE-role users', async () => {
    const { repositories: r } = createTestRepositories();
    const associates = await r.admin.listAssociates();
    expect(associates.length).toBeGreaterThan(0);
    expect(associates.every((a) => a.role === 'ASSOCIATE')).toBe(true);
    expect(associates.some((a) => a.id === LEAD)).toBe(false); // TEAM_LEAD excluded
  });

  it('promotes an associate to Senior Associate, and is idempotent', async () => {
    const { repositories: r } = createTestRepositories();
    const before = await r.admin.listAssociates();
    const junior = before.find((a) => a.designation !== SENIOR_ASSOCIATE_DESIGNATION);
    if (!junior) throw new Error('no junior associate in seed');

    const promoted = await r.admin.promoteToSeniorAssociate(junior.id);
    expect(promoted.designation).toBe(SENIOR_ASSOCIATE_DESIGNATION);

    const again = await r.admin.promoteToSeniorAssociate(junior.id);
    expect(again.designation).toBe(SENIOR_ASSOCIATE_DESIGNATION);
  });

  it('rejects promoting an unknown associate', async () => {
    const { repositories: r } = createTestRepositories();
    await rejectsWith(r.admin.promoteToSeniorAssociate('nope'), 'NOT_FOUND');
  });

  it('assigns an incentive to a senior associate, and upserts on a second call', async () => {
    const { repositories: r } = createTestRepositories();
    const assigned = await r.admin.assignIncentive({
      associateId: ME,
      commissionRate: 0.1,
      rewardPlotTarget: 8,
    });
    expect(assigned).toMatchObject({ associateId: ME, commissionRate: 0.1, rewardPlotTarget: 8 });
    expect(await r.admin.getIncentiveFor(ME)).toMatchObject({
      id: assigned.id,
      commissionRate: 0.1,
      rewardPlotTarget: 8,
    });

    const updated = await r.admin.assignIncentive({
      associateId: ME,
      commissionRate: 0.07,
      rewardPlotTarget: 6,
    });
    expect(updated.id).toBe(assigned.id); // same record, not a duplicate
    expect(await r.admin.getIncentiveFor(ME)).toMatchObject({
      commissionRate: 0.07,
      rewardPlotTarget: 6,
    });
  });

  it('rejects an incentive for an associate who is not yet senior, and for an unknown associate', async () => {
    const { repositories: r } = createTestRepositories();
    const before = await r.admin.listAssociates();
    const junior = before.find((a) => a.designation !== SENIOR_ASSOCIATE_DESIGNATION);
    if (!junior) throw new Error('no junior associate in seed');

    await rejectsWith(
      r.admin.assignIncentive({ associateId: junior.id, commissionRate: 0.05, rewardPlotTarget: 5 }),
      'INVALID_INPUT',
    );
    await rejectsWith(
      r.admin.assignIncentive({ associateId: 'nope', commissionRate: 0.05, rewardPlotTarget: 5 }),
      'NOT_FOUND',
    );
  });
});

describe('VisitRepository.list({ associateIds })', () => {
  it('filters by the associates who led the visit', async () => {
    const { repositories: r } = createTestRepositories();
    const all = await r.visits.list();
    expect(await r.visits.list({ associateIds: [ME] })).toHaveLength(all.length);
    expect(await r.visits.list({ associateIds: ['usr_member_001'] })).toEqual([]);
    expect(await r.visits.list({ associateIds: [] })).toHaveLength(all.length); // empty = no filter
  });
});

describe('calculatePlotCost', () => {
  it('matches Plot.estimatedTotal for every seeded plot', () => {
    const plots: Plot[] = build('NORMAL').plots;
    for (const plot of plots) {
      const cost = calculatePlotCost({
        areaSqYd: plot.areaSqYd,
        ratePerSqYd: plot.baseRatePerSqYd,
        ...(plot.premiumAmount !== undefined ? { premiumAmount: plot.premiumAmount } : {}),
      });
      expect({ plot: plot.id, total: cost.total }).toEqual({
        plot: plot.id,
        total: plot.estimatedTotal,
      });
    }
  });

  it('breaks the total into base and premium, rounding the base to whole rupees', () => {
    expect(calculatePlotCost({ areaSqYd: 240, ratePerSqYd: 17_500 })).toEqual({
      baseAmount: 4_200_000,
      premiumAmount: 0,
      total: 4_200_000,
    });
    expect(
      calculatePlotCost({ areaSqYd: 166.67, ratePerSqYd: 12_500, premiumAmount: 50_000 }),
    ).toEqual({
      baseAmount: 2_083_375,
      premiumAmount: 50_000,
      total: 2_133_375,
    });
  });

  it('validates typed input: area and rate must be positive', () => {
    expect(plotCostInputSchema.safeParse({ areaSqYd: 0, ratePerSqYd: 1 }).success).toBe(false);
    expect(plotCostInputSchema.safeParse({ areaSqYd: 200, ratePerSqYd: 0 }).success).toBe(false);
    expect(plotCostInputSchema.safeParse({ areaSqYd: 200, ratePerSqYd: 17_500 }).success).toBe(
      true,
    );
  });
});
