import { useEffect, useState } from 'react';

import { useAuthStore } from './authStore';
import { usePreferencesStore } from './preferencesStore';
import { usePrototypeStore } from './prototypeStore';

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
}

const persistedStores: readonly PersistedStore[] = [
  useAuthStore,
  usePreferencesStore,
  usePrototypeStore,
];

const allHydrated = () => persistedStores.every((store) => store.persist.hasHydrated());

/**
 * True once every persisted store has been read from storage. The root layout holds the splash
 * screen until then, so the app never flashes signed-out UI and repositories never run against the
 * default scenario/clock before the saved prototype settings are applied.
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    const check = () => setHydrated(allHydrated());
    check();
    const unsubscribe = persistedStores.map((store) => store.persist.onFinishHydration(check));
    return () => unsubscribe.forEach((off) => off());
  }, []);

  return hydrated;
}
