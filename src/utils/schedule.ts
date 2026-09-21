import { isSameDay } from 'date-fns';

import type { Tone } from '@/design-system';

import { formatWhen } from './format';

export type Urgency = 'overdue' | 'today' | 'upcoming';

/**
 * How urgent a scheduled time is, relative to the Clock's "now":
 *   overdue  — before now                → danger (an icon and the word "Overdue" always accompany it)
 *   today    — later today               → warning (follow-up due)
 *   upcoming — any later day             → neutral
 */
export function urgencyOf(iso: string, now: Date): Urgency {
  const at = new Date(iso);
  if (at.getTime() < now.getTime()) return 'overdue';
  return isSameDay(at, now) ? 'today' : 'upcoming';
}

export const urgencyTone: Record<Urgency, Tone> = {
  overdue: 'danger',
  today: 'warning',
  upcoming: 'neutral',
};

/** "Overdue · Yesterday · 6:00 PM" · "Today · 10:30 AM" · "Tomorrow · 11:00 AM" */
export function describeWhen(iso: string, now: Date): { urgency: Urgency; text: string } {
  const urgency = urgencyOf(iso, now);
  const when = formatWhen(iso, now);
  return { urgency, text: urgency === 'overdue' ? `Overdue · ${when}` : when };
}
