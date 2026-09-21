import { addDays, addMinutes, addMonths, format } from 'date-fns';

/**
 * Seed time helper. Every seeded timestamp is expressed as (day offset from "today", HH:mm), so a
 * dataset generated from the demo anchor and one generated from the real anchor have identical
 * *shape* — only the calendar day differs.
 */
export interface SeedTime {
  readonly anchor: Date;
  /** ISO timestamp at `dayOffset` days from the anchor day, at local `HH:mm`. */
  at(dayOffset: number, hhmm: string): string;
  /** e.g. "Mon 21 Sep" — for message copy that mentions a date. */
  dayLabel(dayOffset: number): string;
  /** e.g. "3:30 PM" */
  timeLabel(hhmm: string): string;
  /** Calendar month `monthOffset` months from the anchor month, as `YYYY-MM`. */
  monthKey(monthOffset: number): string;
}

function minutesOf(hhmm: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) throw new Error(`Invalid seed time "${hhmm}" (expected HH:mm)`);
  return Number(match[1]) * 60 + Number(match[2]);
}

export function createSeedTime(anchor: Date): SeedTime {
  return {
    anchor,
    at: (dayOffset, hhmm) => addMinutes(addDays(anchor, dayOffset), minutesOf(hhmm)).toISOString(),
    dayLabel: (dayOffset) => format(addDays(anchor, dayOffset), 'EEE d MMM'),
    timeLabel: (hhmm) => format(addMinutes(anchor, minutesOf(hhmm)), 'h:mm a'),
    monthKey: (monthOffset) => format(addMonths(anchor, monthOffset), 'yyyy-MM'),
  };
}
