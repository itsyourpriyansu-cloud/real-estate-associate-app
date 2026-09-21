import { STORAGE_KEYS } from '@/constants/prototype';
import { RepositoryError, isRepositoryError } from '@/repositories/contracts';
import { MemoryStorage } from '@/services/storage';

import { createTestRepositories } from './helpers';

/** Asserts a promise rejects with a RepositoryError of the given code. */
async function expectRepositoryError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(isRepositoryError(error)).toBe(true);
  expect((error as RepositoryError).code).toBe(code);
}

describe('basic list / get operations', () => {
  const { repositories: r } = createTestRepositories();

  it('leads: lists 18 and gets by id (null when missing)', async () => {
    expect(await r.leads.list()).toHaveLength(18);
    expect((await r.leads.getById('lead_001'))?.fullName).toBe('Rahul Sharma');
    expect(await r.leads.getById('lead_999')).toBeNull();
  });

  it('projects: lists 4 and gets by id', async () => {
    expect(await r.projects.list()).toHaveLength(4);
    expect((await r.projects.getById('prj_real_rise'))?.name).toBe('Real Rise');
    expect(await r.projects.getById('nope')).toBeNull();
  });

  it('plots: lists 120 and gets by id', async () => {
    expect(await r.plots.list()).toHaveLength(120);
    expect((await r.plots.getById('plot_rr_026'))?.areaSqYd).toBe(240);
    expect(await r.plots.getById('nope')).toBeNull();
  });

  it('tasks, visits, conversations, notifications, users resolve', async () => {
    expect((await r.tasks.list()).length).toBeGreaterThanOrEqual(16);
    expect(await r.visits.list()).toHaveLength(7);
    expect(await r.conversations.list()).toHaveLength(8);
    expect(await r.notifications.list()).toHaveLength(14);
    expect((await r.users.getCurrent())?.associateCode).toBe('YH-APL2-1048');
    expect((await r.users.getByPhone('+919876543210'))?.role).toBe('ASSOCIATE');
    expect(await r.users.getByPhone('+910000000000')).toBeNull();
    expect((await r.tasks.getById('task_001'))?.title).toContain('Real Rise');
    expect((await r.visits.getById('visit_001'))?.leadId).toBe('lead_001');
    expect((await r.conversations.getById('conv_001'))?.messages.length).toBeGreaterThan(3);
  });

  it('never lets a returned object mutate the database', async () => {
    const lead = await r.leads.getById('lead_001');
    if (!lead) throw new Error('expected lead');
    lead.fullName = 'Tampered';
    lead.tags.push('tampered');
    expect((await r.leads.getById('lead_001'))?.fullName).toBe('Rahul Sharma');
  });
});

describe('leads', () => {
  it('filters by chip and searches by name, phone and source', async () => {
    const { repositories: r } = createTestRepositories();
    expect((await r.leads.list({ filter: 'HOT' })).every((l) => l.priority === 'HOT')).toBe(true);
    expect(await r.leads.list({ filter: 'NEW' })).toHaveLength(2);
    expect((await r.leads.list({ filter: 'VISIT' })).map((l) => l.id).sort()).toEqual([
      'lead_001',
      'lead_010',
      'lead_016',
    ]);
    expect((await r.leads.list({ filter: 'NEGOTIATION' })).map((l) => l.id).sort()).toEqual([
      'lead_003',
      'lead_014',
    ]);

    expect((await r.leads.search('rahul')).map((l) => l.fullName)).toEqual(['Rahul Sharma']);
    expect((await r.leads.search('9000000003')).map((l) => l.id)).toEqual(['lead_003']);
    expect((await r.leads.search('meta ads')).length).toBeGreaterThan(1);
    expect(await r.leads.search('zzzz')).toEqual([]);
  });

  it('FOLLOW_UP includes overdue and due-today leads but not future-only ones', async () => {
    const { repositories: r } = createTestRepositories();
    const ids = (await r.leads.list({ filter: 'FOLLOW_UP' })).map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining(['lead_001', 'lead_003', 'lead_018']));
    expect(ids).not.toContain('lead_010'); // next action tomorrow
    expect(ids).not.toContain('lead_008'); // won, no next action
  });

  it('returns the timeline newest-first', async () => {
    const { repositories: r } = createTestRepositories();
    const timeline = await r.leads.getTimeline('lead_001');
    expect(timeline.length).toBeGreaterThanOrEqual(10);
    const times = timeline.map((e) => e.occurredAt);
    expect(times).toEqual([...times].sort().reverse());
  });

  it('updateStage records a STAGE_CHANGED event and bumps activity', async () => {
    const { repositories: r } = createTestRepositories();
    const before = await r.leads.getById('lead_001');
    const updated = await r.leads.updateStage('lead_001', 'NEGOTIATION');
    expect(updated.stage).toBe('NEGOTIATION');
    const [latest] = await r.leads.getTimeline('lead_001');
    expect(latest).toMatchObject({
      type: 'STAGE_CHANGED',
      metadata: { fromStage: 'VISIT', toStage: 'NEGOTIATION' },
    });
    expect(
      updated.lastActivityAt &&
        before?.lastActivityAt &&
        updated.lastActivityAt > before.lastActivityAt,
    ).toBe(true);
    await expectRepositoryError(r.leads.updateStage('lead_999', 'WON'), 'NOT_FOUND');
  });

  it('shortlistPlot is idempotent, records one event, and rejects unknown plots', async () => {
    const { repositories: r } = createTestRepositories();
    await r.leads.shortlistPlot('lead_001', 'plot_rr_026');
    const again = await r.leads.shortlistPlot('lead_001', 'plot_rr_026');
    expect(again.shortlistedPlotIds).toEqual(['plot_rr_026']);
    const events = (await r.leads.getTimeline('lead_001')).filter(
      (e) => e.type === 'PLOT_SHORTLISTED',
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.metadata).toMatchObject({
      plotId: 'plot_rr_026',
      projectId: 'prj_real_rise',
    });

    await expectRepositoryError(r.leads.shortlistPlot('lead_001', 'plot_nope'), 'INVALID_INPUT');
    await expectRepositoryError(r.leads.shortlistPlot('lead_999', 'plot_rr_026'), 'NOT_FOUND');
    expect((await r.leads.unshortlistPlot('lead_001', 'plot_rr_026')).shortlistedPlotIds).toEqual(
      [],
    );
  });

  it('addTimelineEvent keeps notesCount in step and rejects blank titles', async () => {
    const { repositories: r } = createTestRepositories();
    const before = (await r.leads.getById('lead_002'))?.notesCount ?? 0;
    await r.leads.addTimelineEvent('lead_002', { type: 'NOTE', title: 'Prefers calls after 6 PM' });
    expect((await r.leads.getById('lead_002'))?.notesCount).toBe(before + 1);
    await expectRepositoryError(
      r.leads.addTimelineEvent('lead_002', { type: 'NOTE', title: '  ' }),
      'INVALID_INPUT',
    );
  });
});

describe('projects and plots', () => {
  it('filters projects and keeps unit counts live after a prototype hold', async () => {
    const { repositories: r } = createTestRepositories();
    expect((await r.projects.list({ query: 'aurelia' })).map((p) => p.name)).toEqual([
      'Aurelia Greens',
    ]);
    const cheap = await r.projects.list({ maxStartingPrice: 3_000_000 });
    expect(cheap.map((p) => p.name).sort()).toEqual(['Northgate County', 'Real Rise']);

    const before = await r.projects.getById('prj_real_rise');
    await r.plots.placePrototypeHold('plot_rr_026');
    const after = await r.projects.getById('prj_real_rise');
    expect(after?.availableUnits).toBe((before?.availableUnits ?? 0) - 1);
    expect(after?.totalUnits).toBe(before?.totalUnits);
  });

  it('summarises inventory by status', async () => {
    const { repositories: r } = createTestRepositories();
    const s = await r.projects.getInventorySummary('prj_real_rise');
    expect(s.total).toBe(36);
    expect(s.available + s.on_hold + s.booked + s.blocked + s.not_for_sale).toBe(s.total);
    await expectRepositoryError(r.projects.getInventorySummary('nope'), 'NOT_FOUND');
  });

  it('filters, sorts and searches plots ("Plot 26")', async () => {
    const { repositories: r } = createTestRepositories();
    const available = await r.plots.list({ projectId: 'prj_real_rise', statuses: ['AVAILABLE'] });
    expect(
      available.every((p) => p.status === 'AVAILABLE' && p.projectId === 'prj_real_rise'),
    ).toBe(true);

    const east = await r.plots.list({ facing: ['EAST'], cornerOnly: true });
    expect(east.every((p) => p.facing === 'EAST' && p.isCorner)).toBe(true);

    const cheapest = await r.plots.list({ projectId: 'prj_real_rise', sort: 'PRICE_ASC' });
    expect(cheapest.map((p) => p.estimatedTotal)).toEqual(
      [...cheapest.map((p) => p.estimatedTotal)].sort((a, b) => a - b),
    );

    const found = await r.plots.search('Plot 26');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found.every((p) => p.plotNumber === '26')).toBe(true);
    expect(found.map((p) => p.id)).toContain('plot_rr_026');
    expect((await r.plots.search('26')).every((p) => p.plotNumber === '26')).toBe(true); // "26" must not match "260"
  });

  it('places and releases a Prototype Hold, and refuses invalid transitions', async () => {
    const { repositories: r, clock } = createTestRepositories();
    const held = await r.plots.placePrototypeHold('plot_rr_026');
    expect(held.status).toBe('ON_HOLD');
    expect(new Date(held.holdExpiresAt ?? '').getTime() - clock.now().getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
    await expectRepositoryError(r.plots.placePrototypeHold('plot_rr_026'), 'INVALID_INPUT');

    const released = await r.plots.releasePrototypeHold('plot_rr_026');
    expect(released.status).toBe('AVAILABLE');
    expect(released.holdExpiresAt).toBeUndefined();
    await expectRepositoryError(r.plots.releasePrototypeHold('plot_rr_026'), 'INVALID_INPUT');
    await expectRepositoryError(r.plots.placePrototypeHold('plot_nope'), 'NOT_FOUND');
  });
});

describe('tasks', () => {
  it('derives OVERDUE from the clock and splits the four segments', async () => {
    const { repositories: r } = createTestRepositories();
    const overdue = await r.tasks.list({ segment: 'OVERDUE' });
    expect(overdue.map((t) => t.id).sort()).toEqual(['task_006', 'task_007', 'task_008']);
    expect(overdue.every((t) => t.status === 'OVERDUE')).toBe(true);

    const today = await r.tasks.list({ segment: 'TODAY' });
    expect(today).toHaveLength(6);
    expect(today.map((t) => t.scheduledAt)).toEqual([...today.map((t) => t.scheduledAt)].sort());

    expect((await r.tasks.list({ segment: 'UPCOMING' })).length).toBe(7);
    const done = await r.tasks.list({ segment: 'COMPLETED' });
    expect(done.map((t) => t.id).sort()).toEqual(['task_015', 'task_016']);
    expect(done.every((t) => t.status === 'DONE')).toBe(true);
  });

  it('completing a task advances the lead’s next action', async () => {
    const { repositories: r } = createTestRepositories();
    expect((await r.leads.getById('lead_001'))?.nextActionLabel).toBe(
      'Follow up on Real Rise shortlist',
    );
    const done = await r.tasks.complete('task_001');
    expect(done.status).toBe('DONE');
    expect((await r.leads.getById('lead_001'))?.nextActionLabel).toBe('Site visit · Real Rise'); // the 3:30 PM visit

    await r.tasks.complete('task_004');
    expect((await r.leads.getById('lead_001'))?.nextActionAt).toBeUndefined();
    await expectRepositoryError(r.tasks.complete('task_999'), 'NOT_FOUND');
  });

  it('creating a follow-up sets the lead’s next action when it is the earliest', async () => {
    const { repositories: r, clock } = createTestRepositories();
    const soon = new Date(clock.now().getTime() + 30 * 60 * 1000).toISOString();
    const task = await r.tasks.create({
      type: 'FOLLOW_UP',
      title: 'Call about loan pre-approval',
      leadId: 'lead_001',
      scheduledAt: soon,
    });
    expect(task).toMatchObject({ id: 'task_019', status: 'OPEN', priority: 'NORMAL' });
    expect((await r.leads.getById('lead_001'))?.nextActionLabel).toBe(
      'Call about loan pre-approval',
    );

    await expectRepositoryError(
      r.tasks.create({ type: 'CALL', title: 'x', leadId: 'lead_999', scheduledAt: soon }),
      'INVALID_INPUT',
    );
    await expectRepositoryError(
      r.tasks.create({ type: 'CALL', title: ' ', scheduledAt: soon }),
      'INVALID_INPUT',
    );
  });

  it('searches by title, lead and project', async () => {
    const { repositories: r } = createTestRepositories();
    expect((await r.tasks.search('faizan')).map((t) => t.id)).toEqual(
      expect.arrayContaining(['task_006', 'task_016']),
    );
    expect((await r.tasks.search('cedar')).length).toBeGreaterThan(0);
  });
});

describe('visits', () => {
  it('lists today’s visits and walks a visit through confirm → arrive → complete', async () => {
    const { repositories: r, clock } = createTestRepositories();
    const today = await r.visits.list({ onDate: clock.now().toISOString() });
    expect(today.map((v) => v.id)).toEqual(['visit_002', 'visit_001']); // 12:00 then 3:30 PM

    expect((await r.visits.updateStatus('visit_001', 'ARRIVED')).status).toBe('ARRIVED');
    await r.visits.updateStatus('visit_001', 'COMPLETED');
    const [latest] = await r.leads.getTimeline('lead_001');
    expect(latest).toMatchObject({ type: 'VISIT_COMPLETED', metadata: { visitId: 'visit_001' } });
    expect((await r.tasks.getById('task_004'))?.status).toBe('DONE'); // paired task closed
    await expectRepositoryError(r.visits.updateStatus('visit_001', 'SCHEDULED'), 'INVALID_INPUT');
  });

  it('captures outcome, shortlists plots from the visit’s project only, and schedules new visits', async () => {
    const { repositories: r } = createTestRepositories();
    const visit = await r.visits.saveOutcome('visit_001', {
      outcome: 'VERY_INTERESTED',
      feedbackTags: ['East facing'],
      note: 'Wants plot 26',
    });
    expect(visit).toMatchObject({ outcome: 'VERY_INTERESTED', note: 'Wants plot 26' });

    expect(
      (await r.visits.setShortlistedPlots('visit_001', ['plot_rr_026', 'plot_rr_026']))
        .shortlistedPlotIds,
    ).toEqual(['plot_rr_026']);
    await expectRepositoryError(
      r.visits.setShortlistedPlots('visit_001', ['plot_ag_012']),
      'INVALID_INPUT',
    );

    const scheduled = await r.visits.schedule({
      leadId: 'lead_002',
      projectId: 'prj_real_rise',
      scheduledAt: new Date(2026, 8, 24, 11).toISOString(),
    });
    expect(scheduled).toMatchObject({
      id: 'visit_008',
      status: 'SCHEDULED',
      associateId: 'usr_raghunath',
    });
    expect((await r.tasks.list({ leadId: 'lead_002' })).some((t) => t.type === 'SITE_VISIT')).toBe(
      true,
    );
    expect((await r.leads.getTimeline('lead_002'))[0]?.type).toBe('VISIT_SCHEDULED');
    await expectRepositoryError(
      r.visits.schedule({
        leadId: 'lead_002',
        projectId: 'nope',
        scheduledAt: new Date().toISOString(),
      }),
      'INVALID_INPUT',
    );
  });
});

describe('conversations and notifications', () => {
  it('orders by latest message and filters unread', async () => {
    const { repositories: r } = createTestRepositories();
    const all = await r.conversations.list();
    const times = all.map((c) => c.lastMessageAt);
    expect(times).toEqual([...times].sort().reverse());
    expect((await r.conversations.list({ unreadOnly: true })).map((c) => c.id).sort()).toEqual([
      'conv_001',
      'conv_002',
      'conv_003',
      'conv_006',
    ]);
    expect((await r.conversations.getByLeadId('lead_001'))?.id).toBe('conv_001');
    expect((await r.conversations.list({ query: 'imran' })).map((c) => c.id)).toEqual(['conv_003']);
  });

  it('sends an outbound message into local state and logs it on the lead timeline', async () => {
    const { repositories: r } = createTestRepositories();
    const message = await r.conversations.sendMessage('conv_001', {
      kind: 'TEXT',
      body: '  Plot 26 is available.  ',
    });
    expect(message).toMatchObject({
      id: 'msg_001_007',
      direction: 'OUTBOUND',
      status: 'SENT',
      body: 'Plot 26 is available.',
    });
    const conversation = await r.conversations.getById('conv_001');
    expect(conversation?.lastMessageAt).toBe(message.sentAt);
    expect((await r.leads.getTimeline('lead_001'))[0]).toMatchObject({ type: 'WHATSAPP_SENT' });
    await expectRepositoryError(
      r.conversations.sendMessage('conv_001', { kind: 'TEXT', body: '   ' }),
      'INVALID_INPUT',
    );
    await expectRepositoryError(
      r.conversations.sendMessage('conv_999', { kind: 'TEXT', body: 'hi' }),
      'NOT_FOUND',
    );
  });

  it('marking a conversation read clears the lead’s unread badge', async () => {
    const { repositories: r } = createTestRepositories();
    expect((await r.leads.getById('lead_001'))?.unreadMessages).toBe(2);
    expect((await r.conversations.markRead('conv_001')).unreadCount).toBe(0);
    expect((await r.leads.getById('lead_001'))?.unreadMessages).toBe(0);
  });

  it('counts, filters and clears notifications', async () => {
    const { repositories: r } = createTestRepositories();
    const unread = await r.notifications.getUnreadCount();
    expect(unread).toBeGreaterThan(0);
    expect((await r.notifications.list({ unreadOnly: true })).length).toBe(unread);
    expect(
      (await r.notifications.list({ type: 'INVENTORY' })).every((n) => n.type === 'INVENTORY'),
    ).toBe(true);

    await r.notifications.markRead('notif_001');
    expect(await r.notifications.getUnreadCount()).toBe(unread - 1);
    await r.notifications.markAllRead();
    expect(await r.notifications.getUnreadCount()).toBe(0);
    await expectRepositoryError(r.notifications.markRead('notif_999'), 'NOT_FOUND');
  });
});

describe('persistence and reset', () => {
  it('survives an "app restart": a second repository set on the same storage sees earlier mutations', async () => {
    const storage = new MemoryStorage();
    const first = createTestRepositories({ storage });
    await first.repositories.tasks.complete('task_001');

    const second = createTestRepositories({ storage });
    expect((await second.repositories.tasks.getById('task_001'))?.status).toBe('DONE');
  });

  it('resetPrototypeData restores the seed', async () => {
    const { repositories: r, resetPrototypeData } = createTestRepositories();
    await r.tasks.complete('task_001');
    await r.plots.placePrototypeHold('plot_rr_026');
    await resetPrototypeData();
    expect((await r.tasks.getById('task_001'))?.status).toBe('OPEN');
    expect((await r.plots.getById('plot_rr_026'))?.status).toBe('AVAILABLE');
  });

  it('falls back to a fresh seed when persisted data is corrupt or invalid', async () => {
    const storage = new MemoryStorage();
    await storage.setItem(STORAGE_KEYS.database, '{not json');
    expect(await createTestRepositories({ storage }).repositories.leads.list()).toHaveLength(18);

    const invalid = new MemoryStorage();
    await invalid.setItem(
      STORAGE_KEYS.database,
      JSON.stringify({ fingerprint: 'x', dataset: { leads: 'nope' } }),
    );
    expect(
      await createTestRepositories({ storage: invalid }).repositories.projects.list(),
    ).toHaveLength(4);
  });
});

describe('prototype simulation', () => {
  it('OFFLINE rejects every call with a retryable OFFLINE error, then recovers', async () => {
    const { repositories: r, simulation } = createTestRepositories({ scenario: 'OFFLINE' });
    await expectRepositoryError(r.leads.list(), 'OFFLINE');
    await expectRepositoryError(r.tasks.complete('task_001'), 'OFFLINE');
    const error = await r.projects.list().catch((e: unknown) => e);
    expect(error instanceof RepositoryError && error.retryable).toBe(true);

    simulation.setConfig({ scenario: 'NORMAL' });
    expect(await r.leads.list()).toHaveLength(18);
  });

  it('REPOSITORY_ERRORS rejects every call with SERVER_ERROR and never mutates data', async () => {
    const { repositories: r, simulation } = createTestRepositories({
      scenario: 'REPOSITORY_ERRORS',
    });
    await expectRepositoryError(r.leads.list(), 'SERVER_ERROR');
    await expectRepositoryError(r.plots.placePrototypeHold('plot_rr_026'), 'SERVER_ERROR');
    simulation.setConfig({ scenario: 'NORMAL' });
    expect((await r.plots.getById('plot_rr_026'))?.status).toBe('AVAILABLE');
  });

  it('EMPTY_CRM returns empty CRM lists but keeps inventory', async () => {
    const { repositories: r } = createTestRepositories({ scenario: 'EMPTY_CRM' });
    expect(await r.leads.list()).toEqual([]);
    expect(await r.tasks.list()).toEqual([]);
    expect(await r.visits.list()).toEqual([]);
    expect(await r.conversations.list()).toEqual([]);
    expect(await r.notifications.list()).toEqual([]);
    expect(await r.projects.list()).toHaveLength(4);
    expect(await r.plots.list()).toHaveLength(120);
    expect(await r.leads.getById('lead_001')).toBeNull();
  });

  it('rebuilds the dataset when the scenario changes at runtime (no manual reload)', async () => {
    const { repositories: r, simulation } = createTestRepositories();
    expect(await r.visits.list()).toHaveLength(7);
    simulation.setConfig({ scenario: 'BUSY_DAY' });
    expect(await r.visits.list()).toHaveLength(10);
    simulation.setConfig({ scenario: 'EMPTY_CRM' });
    expect(await r.visits.list()).toHaveLength(0);
    simulation.setConfig({ scenario: 'NORMAL' });
    expect(await r.visits.list()).toHaveLength(7);
  });

  describe('with fake timers', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('delays every call by 250–700ms when latency is enabled', async () => {
      const { repositories: r, simulation } = createTestRepositories({ latencyEnabled: true });
      const observed = new Set<number>();
      for (let i = 0; i < 5; i += 1) {
        const ms = simulation.nextLatencyMs();
        expect(ms).toBeGreaterThanOrEqual(250);
        expect(ms).toBeLessThanOrEqual(700);
        observed.add(ms);
      }
      expect(observed.size).toBeGreaterThan(1);

      let settled = false;
      const pending = r.leads.list().then((leads) => {
        settled = true;
        return leads;
      });
      await jest.advanceTimersByTimeAsync(100);
      expect(settled).toBe(false);
      await jest.advanceTimersByTimeAsync(700);
      expect(await pending).toHaveLength(18);
    });

    it('re-anchors seed data to the real day in REAL clock mode', async () => {
      jest.setSystemTime(new Date(2027, 2, 4, 8, 0, 0));
      const { repositories: r } = createTestRepositories({ clockMode: 'REAL' });
      const today = await r.tasks.list({ segment: 'TODAY' });
      expect(today).toHaveLength(6);
      expect(
        today.every(
          (t) =>
            new Date(t.scheduledAt).getDate() === 4 && new Date(t.scheduledAt).getMonth() === 2,
        ),
      ).toBe(true);
      expect((await r.tasks.list({ segment: 'OVERDUE' })).length).toBe(3);
    });
  });
});
