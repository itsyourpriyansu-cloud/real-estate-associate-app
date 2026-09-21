/**
 * Prototype-mode constants. Nothing here is a secret or a production credential — these values
 * exist only so a stakeholder can walk the Phase 1 demo. Do not treat them as secure.
 */

export const APP_NAME = 'Vara Real Estates';
export const APP_SHORT_NAME = 'Vara';

/** Deterministic prototype credentials (spec §30). Not secure, not production-ready. */
export const PROTOTYPE_CREDENTIALS = {
  phone: '9876543210',
  /** Demo client number for Simple Login. */
  clientPhone: '9876500100',
  otp: '123456',
} as const;

/**
 * The prototype's account directory: which login each known number belongs to. A real backend
 * returns the role with the auth token. Numbers not listed here are accepted for whichever login
 * they were entered on (the prototype accepts any valid number); a listed number used on the wrong
 * login is rejected. `__tests__/session.test.ts` keeps this in step with the seeded users.
 */
export const PROTOTYPE_ACCOUNTS = [
  { phone: '+919876543210', kind: 'associate' },
  { phone: '+919876500001', kind: 'associate' },
  { phone: '+919876500100', kind: 'client' },
] as const;

/** Country calling code used when normalising a 10-digit prototype phone number to E.164. */
export const DEFAULT_COUNTRY_CODE = '+91';

/**
 * Demo clock anchor. "Today" in demo mode is always this local calendar day, so seeded tasks and
 * site visits stay meaningful no matter when the prototype is opened. Month is 1-based here.
 */
export const DEMO_TODAY = { year: 2026, month: 9, day: 21 } as const;

/** Demo "now" is this many minutes after local midnight of DEMO_TODAY (09:15). */
export const DEMO_NOW_OFFSET_MINUTES = 9 * 60 + 15;

/** Bump when seed content changes shape so persisted prototype databases are rebuilt. */
export const SEED_VERSION = 2;

/** Simulated latency window (spec §13: 250–700ms). */
export const SIMULATED_LATENCY_MS = { min: 250, max: 700 } as const;

/** Storage keys. All go through the storage abstraction in src/services/storage.ts. */
export const STORAGE_KEYS = {
  database: 'associate.proto.db.v1',
  auth: 'associate.auth.v1',
  preferences: 'associate.preferences.v1',
  prototype: 'associate.prototype.v1',
} as const;

/** Every prototype screen/state must say so; Phase 1 data must never look live (spec §17.17). */
export const PROTOTYPE_BADGE_LABEL = 'Prototype data';
