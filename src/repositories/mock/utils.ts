import { addDays } from 'date-fns';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Word-prefix search: every query token must be the start of some word in the haystack.
 * "plot 26" matches a plot whose text has the words "plot" and "26"; "26" does NOT match "260".
 */
export function matchesQuery(query: string, fields: readonly (string | undefined)[]): boolean {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const words = fields.flatMap((field) => (field ? normalize(field).split(' ') : []));
  return tokens.every((token) => words.some((word) => word.startsWith(token)));
}

/** "+919000000001" → "9000000001" so users can search by the number they see. */
export const nationalNumber = (phone: string) => phone.replace(/^\+91/, '');

/** Next deterministic id for `prefix_NNN`, one above the highest existing suffix. */
export function nextId(prefix: string, existingIds: readonly string[]): string {
  const pattern = new RegExp(`^${prefix}_(\\d+)$`);
  const max = existingIds.reduce((highest, id) => {
    const match = pattern.exec(id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}_${String(max + 1).padStart(3, '0')}`;
}

export const byIsoAsc =
  <T>(pick: (item: T) => string) =>
  (a: T, b: T) =>
    pick(a).localeCompare(pick(b));
export const byIsoDesc =
  <T>(pick: (item: T) => string) =>
  (a: T, b: T) =>
    pick(b).localeCompare(pick(a));

/** [start of `day`, start of the next day) as epoch millis. */
export function dayRange(day: Date): { start: number; end: number } {
  return { start: day.getTime(), end: addDays(day, 1).getTime() };
}
