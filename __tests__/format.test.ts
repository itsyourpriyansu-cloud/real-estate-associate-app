import type { Task } from '@/domain';
import { buildHomeData, pickNextAction } from '@/features/home/homeData';
import {
  firstName,
  formatArea,
  formatAreaRange,
  formatDayLabel,
  formatInr,
  formatInrRange,
  formatRelativePast,
  formatTime,
  formatWhen,
  greetingFor,
  groupIndian,
  initials,
  pluralize,
} from '@/utils/format';
import { describeWhen, urgencyOf } from '@/utils/schedule';

import { createTestRepositories } from './helpers';

const NOW = new Date(2026, 8, 21, 9, 15); // Mon 21 Sep 2026, 09:15 (local)
const at = (dayOffset: number, h: number, m = 0) =>
  new Date(2026, 8, 21 + dayOffset, h, m).toISOString();

describe('currency', () => {
  it.each([
    [4_280_000, '₹42.8L'],
    [4_000_000, '₹40L'],
    [12_000_000, '₹1.2Cr'],
    [1_234_567_890, '₹123.46Cr'],
    [75_000, '₹75,000'],
    [99_960, '₹99,960'],
    [9_996_000, '₹1Cr'], // 99.96L must not read as "₹100L"
    [0, '₹0'],
  ])('formatInr(%i) → %s', (amount, expected) => {
    expect(formatInr(amount)).toBe(expected);
  });

  it.each([
    [4_000_000, 5_500_000, '₹40–55L'],
    [9_500_000, 12_000_000, '₹95L–₹1.2Cr'],
    [10_000_000, 13_000_000, '₹1–1.3Cr'],
    [undefined, undefined, 'Budget not set'],
    [4_000_000, undefined, '₹40L+'],
    [undefined, 5_500_000, 'Up to ₹55L'],
  ])('formatInrRange(%s, %s) → %s', (min, max, expected) => {
    expect(formatInrRange(min, max)).toBe(expected);
  });

  it('groups digits the Indian way without relying on Intl', () => {
    expect(groupIndian(1_25_000)).toBe('1,25,000');
    expect(groupIndian(18_000)).toBe('18,000');
    expect(groupIndian(999)).toBe('999');
    expect(groupIndian(12_34_56_789)).toBe('12,34,56,789');
  });
});

describe('area', () => {
  it('formats single values and ranges', () => {
    expect(formatArea(240)).toBe('240 sq yd');
    expect(formatArea(266.7)).toBe('266.7 sq yd');
    expect(formatAreaRange(200, 300)).toBe('200–300 sq yd');
    expect(formatAreaRange(240, 240)).toBe('240 sq yd');
    expect(formatAreaRange(undefined, undefined)).toBe('Size not set');
    expect(formatAreaRange(200, undefined)).toBe('200+ sq yd');
  });
});

describe('time', () => {
  it('labels days relative to now', () => {
    expect(formatDayLabel(at(0, 10), NOW)).toBe('Today');
    expect(formatDayLabel(at(1, 10), NOW)).toBe('Tomorrow');
    expect(formatDayLabel(at(-1, 10), NOW)).toBe('Yesterday');
    expect(formatDayLabel(at(3, 10), NOW)).toBe('Thu');
    expect(formatDayLabel(at(12, 10), NOW)).toBe('3 Oct');
    expect(formatDayLabel(at(-9, 10), NOW)).toBe('12 Sep');
  });

  it('formats clock time and combined "when"', () => {
    expect(formatTime(at(0, 16, 30))).toBe('4:30 PM');
    expect(formatWhen(at(0, 10, 30), NOW)).toBe('Today · 10:30 AM');
  });

  it('formats relative past times', () => {
    expect(formatRelativePast(at(0, 9, 14), NOW)).toBe('1 min ago');
    expect(formatRelativePast(at(0, 9, 15), NOW)).toBe('Just now');
    expect(formatRelativePast(at(0, 7, 15), NOW)).toBe('2h ago');
    expect(formatRelativePast(at(-1, 18), NOW)).toBe('Yesterday');
    expect(formatRelativePast(at(-3, 18), NOW)).toBe('3d ago');
    expect(formatRelativePast(at(-20, 18), NOW)).toBe('1 Sep');
  });

  it('greets by hour', () => {
    expect(greetingFor(new Date(2026, 8, 21, 9))).toBe('Good morning');
    expect(greetingFor(new Date(2026, 8, 21, 14))).toBe('Good afternoon');
    expect(greetingFor(new Date(2026, 8, 21, 20))).toBe('Good evening');
  });
});

describe('names and plurals', () => {
  it('derives initials and a first name that skips initials like "K. V."', () => {
    expect(initials('Rahul Sharma')).toBe('RS');
    expect(initials('K. V. Raghunath Reddy')).toBe('KR');
    expect(initials('Madonna')).toBe('M');
    expect(initials('  ')).toBe('');
    expect(firstName('K. V. Raghunath Reddy')).toBe('Raghunath');
    expect(firstName('Rahul Sharma')).toBe('Rahul');
  });

  it('picks singular or plural', () => {
    expect(pluralize(1, 'visit', 'visits')).toBe('visit');
    expect(pluralize(0, 'visit', 'visits')).toBe('visits');
    expect(pluralize(2, 'visit', 'visits')).toBe('visits');
  });
});

describe('urgency (drives colour AND wording, never colour alone)', () => {
  it('classifies overdue, today and upcoming', () => {
    expect(urgencyOf(at(-1, 18), NOW)).toBe('overdue');
    expect(urgencyOf(at(0, 9, 14), NOW)).toBe('overdue');
    expect(urgencyOf(at(0, 9, 30), NOW)).toBe('today');
    expect(urgencyOf(at(1, 11), NOW)).toBe('upcoming');
  });

  it('spells overdue out in words', () => {
    expect(describeWhen(at(-1, 18), NOW)).toEqual({
      urgency: 'overdue',
      text: 'Overdue · Yesterday · 6:00 PM',
    });
    expect(describeWhen(at(0, 10, 30), NOW).text).toBe('Today · 10:30 AM');
  });
});

describe('Home selectors (pure, outside the component)', () => {
  it('picks the hottest lead’s task due today as the next action, ignoring overdue work', async () => {
    const { repositories: r, clock } = createTestRepositories();
    const [tasks, leads] = await Promise.all([r.tasks.list(), r.leads.list()]);
    const next = pickNextAction(tasks, leads, clock.now());
    expect(next?.lead.fullName).toBe('Rahul Sharma'); // HOT, 10:30 — before Ananya (NORMAL, 9:30)
    expect(next?.task.title).toBe('Follow up on Real Rise shortlist');
    expect(next?.task.status).toBe('OPEN');
  });

  it('falls back to the earliest upcoming task when nothing is due today', () => {
    const task = (id: string, leadId: string, scheduledAt: string): Task => ({
      id,
      type: 'CALL',
      title: id,
      leadId,
      scheduledAt,
      status: 'OPEN',
      priority: 'NORMAL',
    });
    const lead = (id: string, priority: 'HOT' | 'COLD') => ({ id, priority }) as never;
    const next = pickNextAction(
      [task('later', 'b', at(3, 9)), task('soon', 'a', at(2, 9))],
      [lead('a', 'COLD'), lead('b', 'COLD')],
      NOW,
    );
    expect(next?.task.id).toBe('soon');
    expect(pickNextAction([], [], NOW)).toBeUndefined();
  });

  it('builds the Home summary from repository data', async () => {
    const { repositories: r, clock } = createTestRepositories();
    const now = clock.now();
    const [user, leads, tasks, visitsToday, projects, holds] = await Promise.all([
      r.users.getCurrent(),
      r.leads.list(),
      r.tasks.list(),
      r.visits.list({ onDate: now.toISOString() }),
      r.projects.list(),
      r.plots.list({ statuses: ['ON_HOLD'] }),
    ]);
    const booked = await Promise.all(
      leads.flatMap((l) =>
        l.stage === 'WON' && l.bookedPlotId ? [r.plots.getById(l.bookedPlotId)] : [],
      ),
    );
    if (!user) throw new Error('no user');

    const data = buildHomeData(
      {
        user,
        leads,
        tasks,
        visitsToday,
        projects,
        bookedPlots: booked.filter((p) => p !== null),
        recentEvents: [],
        onHoldPlots: holds.length,
        unreadNotifications: 9,
      },
      now,
    );

    expect(data.attention).toEqual({ leadsNeedingAttention: 7, visitsToday: 2, overdueTasks: 3 });
    expect(data.visitsToday.map((v) => v.visit.id)).toEqual(['visit_002', 'visit_001']);
    expect(data.topOverdue?.task.title).toBe('Follow up after brochure'); // the oldest overdue
    expect(data.pipeline.VISIT).toBe(3);
    expect(data.inventory).toEqual({ availablePlots: 74, onHoldPlots: 9, projects: 4 });
    expect(data.performance).toEqual({ bookings: 1, bookingValue: 4_284_000, inBooking: 1 });
  });
});
