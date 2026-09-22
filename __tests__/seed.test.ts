import { plotSchema, type PlotStatus } from '@/domain';
import { buildSeedDataset, prototypeDatasetSchema, type PrototypeDataset } from '@/seed';
import { AppClock, demoDayStart } from '@/services/clock';
import type { DatasetScenario } from '@/services/simulation';

const build = (scenario: DatasetScenario = 'NORMAL'): PrototypeDataset =>
  buildSeedDataset({ anchor: demoDayStart(), scenario });

const demoNow = () => new AppClock('DEMO').now();
const ids = (items: readonly { id: string }[]) => new Set(items.map((i) => i.id));

describe.each<DatasetScenario>(['NORMAL', 'BUSY_DAY', 'EMPTY_CRM'])(
  'seed integrity · %s',
  (scenario) => {
    const data = build(scenario);

    it('validates against the Zod dataset schema', () => {
      expect(() => prototypeDatasetSchema.parse(data)).not.toThrow();
    });

    it('has unique ids in every table', () => {
      for (const [table, rows] of Object.entries(data)) {
        const all = (rows as { id: string }[]).map((r) => r.id);
        expect({ table, duplicates: all.length - new Set(all).size }).toEqual({
          table,
          duplicates: 0,
        });
      }
    });

    it('resolves every plot.projectId', () => {
      const projects = ids(data.projects);
      expect(data.plots.filter((p) => !projects.has(p.projectId))).toEqual([]);
    });

    it('resolves every visit to a lead, project, associate and same-project shortlisted plots', () => {
      const leads = ids(data.leads);
      const projects = ids(data.projects);
      const users = ids(data.users);
      const plotProject = new Map(data.plots.map((p) => [p.id, p.projectId]));
      for (const visit of data.visits) {
        expect(leads.has(visit.leadId)).toBe(true);
        expect(projects.has(visit.projectId)).toBe(true);
        expect(users.has(visit.associateId)).toBe(true);
        for (const plotId of visit.shortlistedPlotIds) {
          expect(plotProject.get(plotId)).toBe(visit.projectId);
        }
      }
    });

    it('resolves every task to its related lead and project', () => {
      const leads = ids(data.leads);
      const projects = ids(data.projects);
      for (const task of data.tasks) {
        if (task.leadId) expect(leads.has(task.leadId)).toBe(true);
        if (task.projectId) expect(projects.has(task.projectId)).toBe(true);
      }
    });

    it('resolves every conversation to a lead', () => {
      const leads = ids(data.leads);
      expect(data.conversations.filter((c) => !leads.has(c.leadId))).toEqual([]);
    });

    it('resolves every timeline event and its metadata references', () => {
      const leads = ids(data.leads);
      const projects = ids(data.projects);
      const plots = ids(data.plots);
      const visits = ids(data.visits);
      for (const event of data.timeline) {
        expect(leads.has(event.leadId)).toBe(true);
        const meta = event.metadata ?? {};
        if (typeof meta.projectId === 'string') expect(projects.has(meta.projectId)).toBe(true);
        if (typeof meta.plotId === 'string') expect(plots.has(meta.plotId)).toBe(true);
        if (typeof meta.visitId === 'string') expect(visits.has(meta.visitId)).toBe(true);
      }
    });

    it('resolves every lead reference (assignee, shortlist, booked plot)', () => {
      const users = ids(data.users);
      const plots = ids(data.plots);
      for (const lead of data.leads) {
        expect(users.has(lead.assignedUserId)).toBe(true);
        lead.shortlistedPlotIds.forEach((id) => expect(plots.has(id)).toBe(true));
        if (lead.bookedPlotId) expect(plots.has(lead.bookedPlotId)).toBe(true);
      }
    });

    it('keeps project unit counts and ranges consistent with the inventory', () => {
      for (const project of data.projects) {
        const own = data.plots.filter((p) => p.projectId === project.id);
        expect(project.totalUnits).toBe(own.length);
        expect(project.availableUnits).toBe(own.filter((p) => p.status === 'AVAILABLE').length);
        expect(project.startingPrice).toBe(Math.min(...own.map((p) => p.estimatedTotal)));
        expect(project.minPlotAreaSqYd).toBe(Math.min(...own.map((p) => p.areaSqYd)));
      }
    });

    it('computes every plot estimatedTotal as area × rate + premium', () => {
      for (const plot of data.plots) {
        expect(plot.estimatedTotal).toBe(
          plot.areaSqYd * plot.baseRatePerSqYd + (plot.premiumAmount ?? 0),
        );
      }
    });

    it('only holds ON_HOLD plots with an expiry', () => {
      for (const plot of data.plots) {
        expect(plot.holdExpiresAt !== undefined).toBe(plot.status === 'ON_HOLD');
      }
    });
  },
);

describe('seed volume and content (Normal)', () => {
  const data = build('NORMAL');

  it('meets the minimum volumes from the spec', () => {
    expect(data.users.find((u) => u.role === 'ASSOCIATE')?.id).toBe('usr_raghunath');
    expect(
      data.users.filter((u) => u.sponsorId === undefined && u.role === 'ASSOCIATE'),
    ).toHaveLength(1); // the other team's root
    expect(data.leads).toHaveLength(18);
    expect(data.projects).toHaveLength(4);
    expect(data.plots).toHaveLength(120);
    expect(data.tasks.length).toBeGreaterThanOrEqual(16);
    expect(data.visits).toHaveLength(7);
    expect(data.conversations).toHaveLength(8);
    expect(data.notifications).toHaveLength(14);
    expect(data.timeline.length).toBeGreaterThanOrEqual(40);
  });

  it('seeds the suggested associate exactly', () => {
    const associate = data.users.find((u) => u.role === 'ASSOCIATE');
    expect(associate).toMatchObject({
      fullName: 'K. V. Raghunath Reddy',
      designation: 'Senior Associate',
      associateCode: 'YH-APL2-1048',
      teamName: 'YHIPL2',
      phone: '+919876543210',
    });
  });

  it('contains the four suggested projects', () => {
    expect(data.projects.map((p) => p.name).sort()).toEqual([
      'Emerald Hills',
      'Maple Ridge',
      'Silver Creek',
      'Sunrise Meadows',
    ]);
  });

  it('represents every plot status, in every project', () => {
    const statuses: PlotStatus[] = ['AVAILABLE', 'ON_HOLD', 'BOOKED', 'BLOCKED', 'NOT_FOR_SALE'];
    for (const project of data.projects) {
      const present = new Set(
        data.plots.filter((p) => p.projectId === project.id).map((p) => p.status),
      );
      expect([...present].sort()).toEqual([...statuses].sort());
    }
  });

  it('gives the walkthrough its anchor: Sunrise Meadows · Plot 26 · 240 sq yd · Available', () => {
    const realRise = data.projects.find((p) => p.name === 'Sunrise Meadows');
    const plot = data.plots.find((p) => p.projectId === realRise?.id && p.plotNumber === '26');
    expect(plot).toMatchObject({ status: 'AVAILABLE', areaSqYd: 240 });
    expect(() => plotSchema.parse(plot)).not.toThrow();
  });

  it('spans every stage, priority and source with realistic variety', () => {
    const stages = new Set(data.leads.map((l) => l.stage));
    const priorities = new Set(data.leads.map((l) => l.priority));
    const sources = new Set(data.leads.map((l) => l.source));
    expect(stages.size).toBe(9);
    expect(priorities.size).toBe(4);
    expect(sources.size).toBe(8);
  });

  it('includes a lost lead with a reason and a won lead with a booked plot', () => {
    const lost = data.leads.find((l) => l.stage === 'LOST');
    const won = data.leads.find((l) => l.stage === 'WON');
    expect(lost?.lostReason).toBeTruthy();
    const booked = data.plots.find((p) => p.id === won?.bookedPlotId);
    expect(booked?.status).toBe('BOOKED');
  });

  it('has leads with and without visits, unread messages, and no-next-action leads', () => {
    const withVisit = new Set(data.visits.map((v) => v.leadId));
    expect(data.leads.some((l) => withVisit.has(l.id))).toBe(true);
    expect(data.leads.some((l) => !withVisit.has(l.id))).toBe(true);
    expect(data.leads.some((l) => l.unreadMessages > 0)).toBe(true);
    expect(data.leads.some((l) => l.nextActionAt === undefined)).toBe(true);
  });

  it('derives each lead from its own timeline, tasks and conversation', () => {
    for (const lead of data.leads) {
      const events = data.timeline.filter((e) => e.leadId === lead.id);
      const created = events.find((e) => e.type === 'LEAD_CREATED');
      expect(created?.occurredAt).toBe(lead.createdAt);
      expect(lead.lastActivityAt).toBe(
        events
          .map((e) => e.occurredAt)
          .sort()
          .at(-1),
      );
      expect(lead.notesCount).toBe(events.filter((e) => e.type === 'NOTE').length);

      const open = data.tasks
        .filter((t) => t.leadId === lead.id && t.status !== 'DONE')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
      expect(lead.nextActionAt).toBe(open?.scheduledAt);

      const conversation = data.conversations.find((c) => c.leadId === lead.id);
      expect(lead.unreadMessages).toBe(conversation?.unreadCount ?? 0);
    }
  });

  it('keeps conversations self-consistent (last message time, trailing unread inbound)', () => {
    for (const conversation of data.conversations) {
      expect(conversation.lastMessageAt).toBe(conversation.messages.at(-1)?.sentAt);
      const trailingInbound = [...conversation.messages]
        .reverse()
        .findIndex((m) => m.direction === 'OUTBOUND');
      const inboundRun = trailingInbound === -1 ? conversation.messages.length : trailingInbound;
      expect(conversation.unreadCount).toBeLessThanOrEqual(inboundRun);
    }
  });

  it('never seeds activity in the future of demo "now"', () => {
    const now = demoNow().getTime();
    for (const e of data.timeline)
      expect(new Date(e.occurredAt).getTime()).toBeLessThanOrEqual(now);
    for (const m of data.conversations.flatMap((c) => c.messages)) {
      expect(new Date(m.sentAt).getTime()).toBeLessThanOrEqual(now);
    }
    for (const n of data.notifications)
      expect(new Date(n.createdAt).getTime()).toBeLessThanOrEqual(now);
  });

  it('makes today meaningful on the demo clock: visits today, an overdue task, a task due later today', () => {
    const now = demoNow();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    const today = (iso: string) =>
      new Date(iso).getTime() >= startOfDay && new Date(iso).getTime() < endOfDay;

    expect(data.visits.filter((v) => today(v.scheduledAt))).toHaveLength(2);
    expect(
      data.tasks.filter((t) => t.status === 'OPEN' && new Date(t.scheduledAt) < now).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      data.tasks.filter(
        (t) => t.status === 'OPEN' && today(t.scheduledAt) && new Date(t.scheduledAt) > now,
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('varies plot sizes, facings and road widths within every project', () => {
    for (const project of data.projects) {
      const own = data.plots.filter((p) => p.projectId === project.id);
      expect(new Set(own.map((p) => p.areaSqYd)).size).toBeGreaterThanOrEqual(4);
      expect(new Set(own.map((p) => p.facing)).size).toBeGreaterThanOrEqual(3);
      expect(new Set(own.map((p) => p.roadWidthFt)).size).toBeGreaterThanOrEqual(2);
      expect(own.some((p) => p.isCorner)).toBe(true);
    }
  });

  it('gives every shortlisted / booked plot a fit with its lead (budget, size, facing, location)', () => {
    const plotById = new Map(data.plots.map((p) => [p.id, p]));
    const projectById = new Map(data.projects.map((p) => [p.id, p]));
    const cases = data.leads.flatMap((lead) =>
      [
        ...new Set([...lead.shortlistedPlotIds, ...(lead.bookedPlotId ? [lead.bookedPlotId] : [])]),
      ].map((plotId) => ({ lead, plot: plotById.get(plotId) })),
    );
    expect(cases.length).toBeGreaterThanOrEqual(5);

    for (const { lead, plot } of cases) {
      const r = lead.requirement;
      const label = `${lead.fullName} ↔ ${plot?.id}`;
      expect({ label, plot: plot !== undefined }).toEqual({ label, plot: true });
      if (!plot) continue;
      expect({
        label,
        inBudget:
          plot.estimatedTotal >= (r.budgetMin ?? 0) &&
          plot.estimatedTotal <= (r.budgetMax ?? Infinity),
      }).toEqual({ label, inBudget: true });
      expect({
        label,
        sizeOk:
          plot.areaSqYd >= (r.areaMinSqYd ?? 0) && plot.areaSqYd <= (r.areaMaxSqYd ?? Infinity),
      }).toEqual({ label, sizeOk: true });
      expect({
        label,
        facingOk: !r.preferredFacing || r.preferredFacing.includes(plot.facing),
      }).toEqual({ label, facingOk: true });
      const location = projectById.get(plot.projectId)?.location ?? '';
      expect({ label, locationOk: r.preferredLocations.includes(location) }).toEqual({
        label,
        locationOk: true,
      });
    }
  });

  it('recommends Real Rise Plot 26 to Rahul: it fits his requirement', () => {
    const rahul = data.leads.find((l) => l.fullName === 'Rahul Sharma');
    const plot = data.plots.find((p) => p.id === 'plot_rr_026');
    expect(plot?.estimatedTotal).toBeGreaterThanOrEqual(rahul?.requirement.budgetMin ?? Infinity);
    expect(plot?.estimatedTotal).toBeLessThanOrEqual(rahul?.requirement.budgetMax ?? 0);
    expect(rahul?.requirement.preferredFacing).toContain(plot?.facing);
  });

  it('times demo holds so one ends today and Arjun’s ends tomorrow evening', () => {
    const expiry = (id: string) =>
      new Date(data.plots.find((p) => p.id === id)?.holdExpiresAt ?? '');
    const today = demoNow();
    const endsToday = expiry('plot_ag_019');
    expect([endsToday.getDate(), endsToday.getHours()]).toEqual([today.getDate(), 18]);
    const arjun = expiry('plot_ce_010');
    expect([arjun.getDate(), arjun.getHours()]).toEqual([today.getDate() + 1, 20]);
  });

  it('shows Rahul Sharma with a 10:30 follow-up as his next action', () => {
    const rahul = data.leads.find((l) => l.fullName === 'Rahul Sharma');
    expect(rahul?.requirement.budgetMin).toBe(4_000_000);
    expect(rahul?.requirement.budgetMax).toBe(5_500_000);
    expect(rahul?.nextActionLabel).toBe('Follow up on Real Rise shortlist');
    expect(new Date(rahul?.nextActionAt ?? '').getHours()).toBe(10);
    expect(new Date(rahul?.nextActionAt ?? '').getMinutes()).toBe(30);
  });

  it('never uses placeholder content', () => {
    const text = JSON.stringify(data);
    for (const banned of ['John Doe', 'Project A', 'Lorem', 'ipsum', 'TODO', 'undefined', 'NaN']) {
      expect(text).not.toContain(banned);
    }
  });

  it('uses only synthetic contact details', () => {
    for (const lead of data.leads) {
      expect(lead.phone).toMatch(/^\+919000\d{6}$/);
      if (lead.email) expect(lead.email.endsWith('@example.com')).toBe(true);
    }
  });

  it('only stores OPEN/DONE tasks (OVERDUE is derived from the clock)', () => {
    expect(data.tasks.every((t) => t.status === 'OPEN' || t.status === 'DONE')).toBe(true);
  });

  it('is deterministic: identical inputs give identical data', () => {
    expect(build('NORMAL')).toEqual(build('NORMAL'));
  });

  it('keeps notification deep links pointed at real routes and real entities', () => {
    const exists = {
      leads: ids(data.leads),
      projects: ids(data.projects),
      plots: ids(data.plots),
      visits: ids(data.visits),
      conversations: ids(data.conversations),
    };
    const entityRoutes: [RegExp, keyof typeof exists][] = [
      [/^\/leads\/([^/]+)$/, 'leads'],
      [/^\/projects\/([^/]+)$/, 'projects'],
      [/^\/plots\/([^/]+)$/, 'plots'],
      [/^\/visits\/([^/]+)$/, 'visits'],
      [/^\/conversations\/([^/]+)$/, 'conversations'],
    ];
    const staticRoutes = [
      '/home',
      '/leads',
      '/projects',
      '/tasks',
      '/inbox',
      '/notifications',
      '/search',
      '/profile',
      '/settings',
    ];

    for (const { deepLink } of data.notifications) {
      if (!deepLink) continue;
      const entity = entityRoutes.find(([pattern]) => pattern.test(deepLink));
      if (entity) {
        const id = entity[0].exec(deepLink)?.[1] ?? '';
        expect({ deepLink, resolves: exists[entity[1]].has(id) }).toEqual({
          deepLink,
          resolves: true,
        });
      } else {
        expect({ deepLink, known: staticRoutes.includes(deepLink) }).toEqual({
          deepLink,
          known: true,
        });
      }
    }
  });
});

describe('seed scenarios', () => {
  it('BUSY_DAY stacks more visits and tasks into today than NORMAL', () => {
    const normal = build('NORMAL');
    const busy = build('BUSY_DAY');
    expect(busy.visits.length).toBeGreaterThan(normal.visits.length);
    expect(busy.tasks.length).toBeGreaterThan(normal.tasks.length);
    expect(busy.notifications.length).toBeGreaterThan(normal.notifications.length);
    expect(busy.plots).toEqual(normal.plots);
  });

  it('EMPTY_CRM removes CRM data but keeps the inventory', () => {
    const empty = build('EMPTY_CRM');
    expect(empty.leads).toEqual([]);
    expect(empty.tasks).toEqual([]);
    expect(empty.visits).toEqual([]);
    expect(empty.conversations).toEqual([]);
    expect(empty.notifications).toEqual([]);
    expect(empty.timeline).toEqual([]);
    expect(empty.plots).toHaveLength(120);
    expect(empty.projects).toHaveLength(4);
    expect(empty.users).toEqual(build('NORMAL').users); // the team is not CRM data
    expect(empty.sales).toEqual([]);
    expect(empty.admins).toEqual(build('NORMAL').admins); // admin/org data is not CRM data
    expect(empty.associateIncentives).toEqual(build('NORMAL').associateIncentives);
  });

  it('re-anchors to a different day without changing shape (real-clock mode)', () => {
    const other = buildSeedDataset({ anchor: new Date(2027, 2, 4), scenario: 'NORMAL' });
    const demo = build('NORMAL');
    expect(other.leads).toHaveLength(demo.leads.length);
    expect(other.tasks.map((t) => t.id)).toEqual(demo.tasks.map((t) => t.id));
    const rahul = other.leads.find((l) => l.fullName === 'Rahul Sharma');
    const at = new Date(rahul?.nextActionAt ?? '');
    expect([at.getFullYear(), at.getMonth(), at.getDate()]).toEqual([2027, 2, 4]);
  });
});
