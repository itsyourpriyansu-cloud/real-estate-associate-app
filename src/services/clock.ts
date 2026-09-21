import { startOfDay } from 'date-fns';

import { DEMO_NOW_OFFSET_MINUTES, DEMO_TODAY } from '@/constants/prototype';

export type ClockMode = 'DEMO' | 'REAL';

export interface Clock {
  readonly mode: ClockMode;
  /** The current instant according to the active mode. */
  now(): Date;
  /** Local midnight of the current day — the anchor the seed builder generates timestamps from. */
  startOfToday(): Date;
}

/** Local midnight of the fixed demo day. Built from local calendar parts so it reads the same in any timezone. */
export function demoDayStart(): Date {
  return new Date(DEMO_TODAY.year, DEMO_TODAY.month - 1, DEMO_TODAY.day, 0, 0, 0, 0);
}

/**
 * The single source of "now" for the whole app. Repositories and selectors must ask the clock —
 * never `new Date()` — so a demo opened weeks later still shows meaningful "today" data.
 *
 * DEMO: frozen at DEMO_TODAY 09:15 (plus an optional test/prototype offset).
 * REAL: the device clock; seed data is re-anchored to the real "today".
 */
export class AppClock implements Clock {
  private currentMode: ClockMode;
  private demoOffsetMs = 0;

  constructor(mode: ClockMode = 'DEMO') {
    this.currentMode = mode;
  }

  get mode(): ClockMode {
    return this.currentMode;
  }

  setMode(mode: ClockMode): void {
    this.currentMode = mode;
  }

  /** Move the demo clock forward (tests, and later a prototype-controls "next day" affordance). No effect in REAL mode. */
  advance(ms: number): void {
    this.demoOffsetMs += ms;
  }

  resetOffset(): void {
    this.demoOffsetMs = 0;
  }

  now(): Date {
    if (this.currentMode === 'REAL') return new Date();
    return new Date(
      demoDayStart().getTime() + DEMO_NOW_OFFSET_MINUTES * 60_000 + this.demoOffsetMs,
    );
  }

  startOfToday(): Date {
    return startOfDay(this.now());
  }
}

/** Application-wide clock. Demo mode is the default so a fresh install always opens on a rich day. */
export const clock = new AppClock('DEMO');
