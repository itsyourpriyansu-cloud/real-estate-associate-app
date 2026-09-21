import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { STORAGE_KEYS } from '@/constants/prototype';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { RepositoryError, resetPrototypeData } from '@/repositories';
import { clock } from '@/services/clock';
import { simulation } from '@/services/simulation';
import { storage } from '@/services/storage';
import { selectSessionKind, useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePrototypeStore } from '@/store/prototypeStore';

import ProfileScreen from '../app/(associate)/profile';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

afterEach(async () => {
  usePrototypeStore.getState().setScenario('NORMAL');
  usePrototypeStore.getState().setClockMode('DEMO');
  usePrototypeStore.getState().setLatencyEnabled(false);
  useAuthStore.getState().signOut();
  await resetPrototypeData();
});

describe('auth store (session only)', () => {
  it('walks phone → OTP → associate session, and signs out', async () => {
    const auth = useAuthStore.getState();
    expect(auth.session).toEqual({ kind: 'none' });

    expect(await auth.requestOtp('123', 'associate')).toEqual({
      ok: false,
      error: 'INVALID_PHONE',
    });
    expect(await useAuthStore.getState().verifyOtp('123456')).toEqual({
      ok: false,
      error: 'NO_PENDING_PHONE',
    });

    expect(await useAuthStore.getState().requestOtp('9876543210', 'associate')).toEqual({
      ok: true,
    });
    expect(useAuthStore.getState()).toMatchObject({
      pendingPhone: '+919876543210',
      pendingAs: 'associate',
    });
    expect(await useAuthStore.getState().verifyOtp('000000')).toEqual({
      ok: false,
      error: 'INVALID_OTP',
    });
    expect(useAuthStore.getState().session.kind).toBe('none');

    expect(await useAuthStore.getState().verifyOtp('123456')).toEqual({ ok: true });
    expect(useAuthStore.getState()).toMatchObject({
      session: { kind: 'associate', phone: '+919876543210' },
      pendingPhone: null,
      pendingAs: null,
    });

    useAuthStore.getState().signOut();
    expect(useAuthStore.getState().session).toEqual({ kind: 'none' });
  });

  it('gives a client number a client session, and a guest needs no credentials', async () => {
    await useAuthStore.getState().requestOtp('9876500100', 'client');
    await useAuthStore.getState().verifyOtp('123456');
    expect(useAuthStore.getState().session).toEqual({ kind: 'client', phone: '+919876500100' });

    useAuthStore.getState().signOut();
    useAuthStore.getState().continueAsGuest();
    expect(useAuthStore.getState().session).toEqual({ kind: 'guest' });
    expect(selectSessionKind(useAuthStore.getState())).toBe('guest');
  });

  it('refuses a number on the wrong login without leaving a pending phone', async () => {
    expect(await useAuthStore.getState().requestOtp('9876500100', 'associate')).toEqual({
      ok: false,
      error: 'WRONG_ROLE',
    });
    expect(useAuthStore.getState()).toMatchObject({ pendingPhone: null, pendingAs: null });
  });

  it('persists the session but not the pending phone, and stores no CRM data', async () => {
    await useAuthStore.getState().requestOtp('9876543210', 'associate');
    await useAuthStore.getState().verifyOtp('123456');
    await useAuthStore.getState().requestOtp('9123456780', 'associate');

    const persisted = JSON.parse((await storage.getItem(STORAGE_KEYS.auth)) ?? '{}') as {
      state: Record<string, unknown>;
    };
    expect(persisted.state).toEqual({ session: { kind: 'associate', phone: '+919876543210' } });
  });

  it('migrates a v1 persisted session ({ status, phone }) to a session kind', async () => {
    await storage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ state: { status: 'signedIn', phone: '+919876543210' }, version: 1 }),
    );
    await useAuthStore.persist.rehydrate();
    expect(useAuthStore.getState().session).toEqual({
      kind: 'associate',
      phone: '+919876543210',
    });

    await storage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ state: { status: 'signedOut', phone: null }, version: 1 }),
    );
    await useAuthStore.persist.rehydrate();
    expect(useAuthStore.getState().session).toEqual({ kind: 'none' });
  });
});

describe('prototype store (client state only)', () => {
  it('mirrors scenario, latency and clock mode into the services the data layer reads', () => {
    const store = usePrototypeStore.getState();
    store.setScenario('OFFLINE');
    store.setLatencyEnabled(true);
    store.setClockMode('REAL');
    expect(simulation.getConfig()).toEqual({ scenario: 'OFFLINE', latencyEnabled: true });
    expect(clock.mode).toBe('REAL');
  });

  it('bumps datasetRevision when the dataset changes, so feature hooks refetch', async () => {
    const start = usePrototypeStore.getState().datasetRevision;
    usePrototypeStore.getState().setScenario('BUSY_DAY');
    usePrototypeStore.getState().setClockMode('REAL');
    await usePrototypeStore.getState().resetData();
    expect(usePrototypeStore.getState().datasetRevision).toBe(start + 3);

    usePrototypeStore.getState().setLatencyEnabled(true); // does not change the dataset
    expect(usePrototypeStore.getState().datasetRevision).toBe(start + 3);
  });

  it('does not hold any application data', () => {
    const keys = Object.keys(usePrototypeStore.getState()).sort();
    expect(keys).toEqual([
      'clockMode',
      'datasetRevision',
      'latencyEnabled',
      'resetData',
      'scenario',
      'setClockMode',
      'setLatencyEnabled',
      'setScenario',
    ]);
  });
});

describe('preferences store', () => {
  it('defaults to notifications + haptics on, follows system reduce-motion, and has no appearance toggle', () => {
    const state = usePreferencesStore.getState();
    expect(state).toMatchObject({
      notificationsEnabled: true,
      hapticsEnabled: true,
      reduceMotion: 'system',
    });
    expect(state).not.toHaveProperty('appearance');
    state.setReduceMotion('on');
    expect(usePreferencesStore.getState().reduceMotion).toBe('on');
    state.setReduceMotion('system');
  });
});

describe('useAsyncResource', () => {
  it('goes loading → success', async () => {
    let resolve: (value: string[]) => void = () => undefined;
    const loader = jest.fn(() => new Promise<string[]>((r) => (resolve = r)));
    const { result } = await renderHook(() => useAsyncResource(loader));
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeUndefined();

    await act(async () => resolve(['a']));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toEqual(['a']);
  });

  it('surfaces errors and recovers on reload ("Try again")', async () => {
    const loader = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new RepositoryError('SERVER_ERROR', 'boom'))
      .mockResolvedValue('ok');
    const { result } = await renderHook(() => useAsyncResource(loader));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBeInstanceOf(RepositoryError);

    await act(async () => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe('ok');
  });

  it('refetches when the prototype dataset changes', async () => {
    const loader = jest.fn().mockResolvedValue('x');
    await renderHook(() => useAsyncResource(loader));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    await act(async () => usePrototypeStore.getState().setScenario('BUSY_DAY'));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });
});

describe('profile route wiring: screen → feature hook → repository → mock → seed', () => {
  const renderProfile = () =>
    render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ProfileScreen />
      </SafeAreaProvider>,
    );

  it('renders the seeded associate through the repository contract', async () => {
    await renderProfile();
    expect(
      await screen.findByText(/K\. V\. Raghunath Reddy · Senior Associate · YH-APL2-1048/),
    ).toBeTruthy();
  });

  it('shows a recoverable message (no raw error text) when the repository fails', async () => {
    usePrototypeStore.getState().setScenario('REPOSITORY_ERRORS');
    await renderProfile();
    expect(await screen.findByText('Couldn’t load your profile.')).toBeTruthy();
    expect(screen.queryByText(/Simulated/)).toBeNull();
  });

  it('signs out from the profile screen', async () => {
    await useAuthStore.getState().requestOtp('9876543210', 'associate');
    await useAuthStore.getState().verifyOtp('123456');
    await renderProfile();
    await screen.findByText(/Raghunath/);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(useAuthStore.getState().session.kind).toBe('none');
  });
});
