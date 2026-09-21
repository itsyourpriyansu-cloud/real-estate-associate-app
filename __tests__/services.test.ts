import { DEMO_NOW_OFFSET_MINUTES, PROTOTYPE_CREDENTIALS } from '@/constants/prototype';
import { prototypeAuth } from '@/services/auth';
import type {
  haptics as HapticsApi,
  setHapticsEnabled as SetHapticsEnabled,
} from '@/services/haptics';
import { AppClock, demoDayStart } from '@/services/clock';
import { SCENARIO_PROFILES, SimulationController } from '@/services/simulation';
import { MemoryStorage, asyncStorageAdapter, readJson, writeJson } from '@/services/storage';

describe('clock', () => {
  afterEach(() => jest.useRealTimers());

  it('demo clock is frozen at 09:15 on the demo day regardless of the real date', () => {
    jest.useFakeTimers({ now: new Date(2031, 0, 15, 22, 40) });
    const clock = new AppClock('DEMO');
    const now = clock.now();
    expect([now.getFullYear(), now.getMonth() + 1, now.getDate()]).toEqual([2026, 9, 21]);
    expect([now.getHours(), now.getMinutes()]).toEqual([9, 15]);
    expect(DEMO_NOW_OFFSET_MINUTES).toBe(555);

    jest.setSystemTime(new Date(2040, 5, 1));
    expect(clock.now().getTime()).toBe(now.getTime()); // still frozen "weeks later"
    expect(clock.startOfToday().getTime()).toBe(demoDayStart().getTime());
  });

  it('real clock follows the device clock', () => {
    jest.useFakeTimers({ now: new Date(2031, 0, 15, 22, 40) });
    const clock = new AppClock('REAL');
    expect(clock.now().getTime()).toBe(new Date(2031, 0, 15, 22, 40).getTime());
    expect(clock.startOfToday().getTime()).toBe(new Date(2031, 0, 15).getTime());
  });

  it('switches mode at runtime and can advance the demo clock (no effect in real mode)', () => {
    jest.useFakeTimers({ now: new Date(2031, 0, 15, 12, 0) });
    const clock = new AppClock('DEMO');
    const before = clock.now().getTime();
    clock.advance(60 * 60 * 1000);
    expect(clock.now().getTime()).toBe(before + 60 * 60 * 1000);
    clock.resetOffset();
    expect(clock.now().getTime()).toBe(before);

    clock.setMode('REAL');
    expect(clock.mode).toBe('REAL');
    clock.advance(999_999);
    expect(clock.now().getTime()).toBe(new Date(2031, 0, 15, 12, 0).getTime());
  });
});

describe('storage abstraction', () => {
  it('MemoryStorage round-trips and removes', async () => {
    const s = new MemoryStorage();
    expect(await s.getItem('k')).toBeNull();
    await s.setItem('k', 'v');
    expect(await s.getItem('k')).toBe('v');
    await s.removeItem('k');
    expect(await s.getItem('k')).toBeNull();
  });

  it('the AsyncStorage adapter satisfies the same contract', async () => {
    await asyncStorageAdapter.setItem('adapter-key', 'value');
    expect(await asyncStorageAdapter.getItem('adapter-key')).toBe('value');
    await asyncStorageAdapter.removeItem('adapter-key');
    expect(await asyncStorageAdapter.getItem('adapter-key')).toBeNull();
  });

  it('readJson / writeJson round-trip and treat corrupt content as absent', async () => {
    const s = new MemoryStorage();
    await writeJson(s, 'obj', { a: [1, 2, 3] });
    expect(await readJson(s, 'obj')).toEqual({ a: [1, 2, 3] });
    await s.setItem('bad', '{oops');
    expect(await readJson(s, 'bad')).toBeNull();
    expect(await readJson(s, 'missing')).toBeNull();
  });
});

describe('simulation controller', () => {
  it('maps the five scenarios onto a dataset and a network condition', () => {
    expect(Object.keys(SCENARIO_PROFILES).sort()).toEqual([
      'BUSY_DAY',
      'EMPTY_CRM',
      'NORMAL',
      'OFFLINE',
      'REPOSITORY_ERRORS',
    ]);
    expect(SCENARIO_PROFILES.OFFLINE).toMatchObject({ dataset: 'NORMAL', network: 'OFFLINE' });
    expect(SCENARIO_PROFILES.REPOSITORY_ERRORS).toMatchObject({
      dataset: 'NORMAL',
      network: 'ERRORS',
    });
    expect(SCENARIO_PROFILES.EMPTY_CRM).toMatchObject({ dataset: 'EMPTY_CRM', network: 'ONLINE' });
    expect(SCENARIO_PROFILES.BUSY_DAY).toMatchObject({ dataset: 'BUSY_DAY', network: 'ONLINE' });
  });

  it('notifies subscribers only on real changes and supports unsubscribe', () => {
    const controller = new SimulationController();
    const seen: string[] = [];
    const off = controller.subscribe((c) => seen.push(c.scenario));
    controller.setConfig({ scenario: 'OFFLINE' });
    controller.setConfig({ scenario: 'OFFLINE' }); // no change → no notification
    off();
    controller.setConfig({ scenario: 'NORMAL' });
    expect(seen).toEqual(['OFFLINE']);
    expect(controller.resolve()).toMatchObject({ scenario: 'NORMAL', network: 'ONLINE' });
  });

  it('latency is zero when disabled and deterministic within 250–700ms when enabled', () => {
    const off = new SimulationController({ scenario: 'NORMAL', latencyEnabled: false });
    expect(off.nextLatencyMs()).toBe(0);

    const run = () => {
      const c = new SimulationController({ scenario: 'NORMAL', latencyEnabled: true });
      return Array.from({ length: 200 }, () => c.nextLatencyMs());
    };
    const first = run();
    expect(first).toEqual(run()); // deterministic
    expect(Math.min(...first)).toBeGreaterThanOrEqual(250);
    expect(Math.max(...first)).toBeLessThanOrEqual(700);
    expect(new Set(first).size).toBeGreaterThan(50); // genuinely varies
  });
});

describe('prototype auth', () => {
  it('normalises valid 10-digit Indian mobiles to E.164 and rejects the rest', () => {
    expect(prototypeAuth.normalizePhone(PROTOTYPE_CREDENTIALS.phone)).toBe('+919876543210');
    expect(prototypeAuth.normalizePhone('98765 43210')).toBe('+919876543210');
    expect(prototypeAuth.normalizePhone('+91 98765-43210')).toBe('+919876543210');
    expect(prototypeAuth.normalizePhone('1234567890')).toBeNull(); // must start 6–9
    expect(prototypeAuth.normalizePhone('98765')).toBeNull();
    expect(prototypeAuth.normalizePhone('')).toBeNull();
  });

  it('accepts only the fixed prototype OTP', async () => {
    expect(await prototypeAuth.requestOtp('9876543210', 'associate')).toEqual({ ok: true });
    expect(await prototypeAuth.requestOtp('12', 'associate')).toEqual({
      ok: false,
      error: 'INVALID_PHONE',
    });
    expect(await prototypeAuth.verifyOtp(PROTOTYPE_CREDENTIALS.otp)).toEqual({ ok: true });
    expect(await prototypeAuth.verifyOtp('000000')).toEqual({ ok: false, error: 'INVALID_OTP' });
    expect(PROTOTYPE_CREDENTIALS).toEqual({
      phone: '9876543210',
      clientPhone: '9876500100',
      otp: '123456',
    });
  });

  it('rejects a known number on the wrong login, and accepts unknown numbers on either', async () => {
    expect(prototypeAuth.accountKind('+919876543210')).toBe('associate');
    expect(prototypeAuth.accountKind('+919876500100')).toBe('client');
    expect(prototypeAuth.accountKind('+919123456780')).toBeNull();

    expect(await prototypeAuth.requestOtp('9876500100', 'associate')).toEqual({
      ok: false,
      error: 'WRONG_ROLE',
    });
    expect(await prototypeAuth.requestOtp('9876543210', 'client')).toEqual({
      ok: false,
      error: 'WRONG_ROLE',
    });
    expect(await prototypeAuth.requestOtp('9876500100', 'client')).toEqual({ ok: true });
    expect(await prototypeAuth.requestOtp('9123456780', 'associate')).toEqual({ ok: true });
    expect(await prototypeAuth.requestOtp('9123456780', 'client')).toEqual({ ok: true });
  });
});

describe('haptics wrapper', () => {
  it('is silent when disabled and never throws when the device rejects', async () => {
    const impactAsync = jest.fn().mockResolvedValue(undefined);
    const selectionAsync = jest.fn().mockRejectedValue(new Error('unsupported'));

    // Load the wrapper against a mocked expo-haptics in an isolated module registry.
    let wrapper:
      { haptics: typeof HapticsApi; setHapticsEnabled: typeof SetHapticsEnabled } | undefined;
    jest.isolateModules(() => {
      jest.doMock('expo-haptics', () => ({
        impactAsync,
        selectionAsync,
        notificationAsync: jest.fn().mockResolvedValue(undefined),
        ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
        NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
      }));
      // jest.isolateModules is synchronous, so an ES import cannot be used here.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      wrapper = require('@/services/haptics');
    });
    if (!wrapper) throw new Error('haptics wrapper failed to load');
    const { haptics, setHapticsEnabled } = wrapper;

    haptics.light();
    expect(impactAsync).toHaveBeenCalledTimes(1);

    setHapticsEnabled(false);
    haptics.light();
    expect(impactAsync).toHaveBeenCalledTimes(1);

    setHapticsEnabled(true);
    expect(() => haptics.selection()).not.toThrow(); // rejection is swallowed
    await Promise.resolve();
    expect(selectionAsync).toHaveBeenCalledTimes(1);
    jest.dontMock('expo-haptics');
  });
});
