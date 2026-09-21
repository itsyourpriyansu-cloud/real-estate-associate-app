import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns';

/** Pure presentation formatters. `now` is always passed in (from the Clock) — never read here. */

const LAKH = 100_000;
const CRORE = 10_000_000;

/** 1,25,000 — Indian digit grouping without depending on Intl support in the JS engine. */
export function groupIndian(value: number): string {
  const digits = Math.round(Math.abs(value)).toString();
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return value < 0 ? `-${grouped}` : grouped;
}

const trim = (value: number, digits: number) => Number(value.toFixed(digits)).toString();

type Unit = 'Cr' | 'L' | 'raw';

function unitOf(amount: number): Unit {
  // Round to one decimal lakh first so 99.96L reads as 1Cr, not "100L".
  const lakhs = Math.round((amount / LAKH) * 10) / 10;
  if (lakhs >= 100) return 'Cr';
  if (amount >= LAKH) return 'L';
  return 'raw';
}

function magnitude(amount: number, unit: Unit): string {
  if (unit === 'Cr') return trim(amount / CRORE, 2);
  if (unit === 'L') return trim(amount / LAKH, 1);
  return groupIndian(amount);
}

/** ₹42.8L · ₹40L · ₹1.2Cr · ₹75,000 */
export function formatInr(amount: number): string {
  const unit = unitOf(amount);
  return `₹${magnitude(amount, unit)}${unit === 'raw' ? '' : unit}`;
}

/** ₹40–55L (shared unit is written once) · ₹95L–1.2Cr · ₹40L+ · Up to ₹55L · Budget not set */
export function formatInrRange(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return 'Budget not set';
  if (min === undefined && max !== undefined) return `Up to ${formatInr(max)}`;
  if (min !== undefined && max === undefined) return `${formatInr(min)}+`;
  if (min === undefined || max === undefined) return 'Budget not set';
  const [minUnit, maxUnit] = [unitOf(min), unitOf(max)];
  if (minUnit === maxUnit && minUnit !== 'raw') {
    return `₹${magnitude(min, minUnit)}–${magnitude(max, maxUnit)}${minUnit}`;
  }
  return `${formatInr(min)}–${formatInr(max)}`;
}

export const formatArea = (sqYd: number) => `${trim(sqYd, 1)} sq yd`;

/** 200–300 sq yd · 240 sq yd · 200+ sq yd · Up to 300 sq yd · Size not set */
export function formatAreaRange(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return 'Size not set';
  if (min === undefined && max !== undefined) return `Up to ${formatArea(max)}`;
  if (min !== undefined && max === undefined) return `${trim(min, 1)}+ sq yd`;
  if (min === undefined || max === undefined) return 'Size not set';
  return min === max ? formatArea(min) : `${trim(min, 1)}–${trim(max, 1)} sq yd`;
}

/** 4:30 PM */
export const formatTime = (iso: string | Date) => format(new Date(iso), 'h:mm a');

/** Today · Tomorrow · Yesterday · Wed (within a week) · 12 Oct */
export function formatDayLabel(iso: string | Date, now: Date): string {
  const target = new Date(iso);
  const diff = differenceInCalendarDays(startOfDay(target), startOfDay(now));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return format(target, 'EEE');
  return format(target, 'd MMM');
}

/** Today · 4:30 PM */
export const formatWhen = (iso: string | Date, now: Date) =>
  `${formatDayLabel(iso, now)} · ${formatTime(iso)}`;

/** Monday 21 September */
export const formatLongDate = (date: Date) => format(date, 'EEEE d MMMM');

/** 5 min ago · 3h ago · Yesterday · 4d ago · 12 Oct */
export function formatRelativePast(iso: string | Date, now: Date): string {
  const target = new Date(iso);
  const minutes = Math.round((now.getTime() - target.getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const days = differenceInCalendarDays(startOfDay(now), startOfDay(target));
  if (days === 0) return `${Math.floor(minutes / 60)}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return format(target, 'd MMM');
}

/** True when `iso` is strictly before `now`. */
export const isPast = (iso: string, now: Date) => new Date(iso).getTime() < now.getTime();

/** Greeting for the hour: Good morning / afternoon / evening. */
export function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "K. V. Raghunath Reddy" → "KR" ; "Rahul Sharma" → "RS" */
export function initials(fullName: string): string {
  const words = fullName
    .replace(/[^\p{L}\s.]/gu, '')
    .split(/[\s.]+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** "K. V. Raghunath Reddy" → "Raghunath" (first word longer than an initial). */
export function firstName(fullName: string): string {
  const words = fullName.split(/\s+/).filter(Boolean);
  return words.find((w) => w.replace('.', '').length > 1) ?? words[0] ?? fullName;
}

/** The next `count` calendar days starting today, at local midnight. */
export const nextDays = (now: Date, count: number): Date[] =>
  Array.from({ length: count }, (_, i) => startOfDay(addDays(now, i)));

/** Picks the singular or plural form for a count. The count itself is rendered separately. */
export const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural;
