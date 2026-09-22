import { PROTOTYPE_ACCOUNTS } from '@/constants/prototype';
import { accessFor, landingFor, type SessionAccess } from '@/features/auth/sessionAccess';
import type { SessionKind } from '@/store/authStore';

const kinds: SessionKind[] = ['none', 'guest', 'associate'];

describe('session → route group access (guard matrix)', () => {
  const expected: Record<SessionKind, (keyof SessionAccess)[]> = {
    none: ['public'],
    guest: ['guest', 'shared'],
    associate: ['associate', 'shared'],
  };

  it.each(kinds)('%s sees exactly its own groups', (kind) => {
    const access = accessFor(kind);
    const allowed = (Object.keys(access) as (keyof SessionAccess)[]).filter((g) => access[g]);
    expect(allowed.sort()).toEqual([...expected[kind]].sort());
  });

  it('never lets a guest reach the associate dashboard', () => {
    expect(accessFor('guest').associate).toBe(false);
  });

  it('never shows the public Home to a signed-in session, or Our Projects to a signed-out one', () => {
    for (const kind of kinds.filter((k) => k !== 'none')) {
      expect(accessFor(kind).public).toBe(false);
      expect(accessFor(kind).shared).toBe(true);
    }
    expect(accessFor('none').shared).toBe(false);
  });
});

describe('landing screen per session', () => {
  it.each([
    ['none', '/home'],
    ['guest', '/guest-home'],
    ['associate', '/dashboard'],
  ] as const)('%s lands on %s', (kind, href) => {
    expect(landingFor(kind)).toBe(href);
  });

  it('lands each session on a group that session can see', () => {
    const groupOf = (href: string): keyof SessionAccess =>
      href === '/home' ? 'public' : href === '/guest-home' ? 'guest' : 'associate';
    for (const kind of kinds) {
      expect(accessFor(kind)[groupOf(String(landingFor(kind)))]).toBe(true);
    }
  });
});

describe('prototype account directory', () => {
  it('lists each associate number once, in E.164', () => {
    expect(new Set(PROTOTYPE_ACCOUNTS).size).toBe(PROTOTYPE_ACCOUNTS.length);
    for (const phone of PROTOTYPE_ACCOUNTS) {
      expect(phone).toMatch(/^\+91[6-9]\d{9}$/);
    }
  });
});
