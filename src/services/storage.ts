import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage abstraction. Nothing outside this file imports AsyncStorage, so the persistence backend
 * (MMKV, SecureStore, an API-backed cache) can change without touching stores or repositories.
 *
 * The shape intentionally matches Zustand's `StateStorage`, so `createJSONStorage(() => storage)`
 * works without an adapter.
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const asyncStorageAdapter: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** In-memory implementation for tests and for environments without native storage. */
export class MemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.map.get(key) ?? null);
  }

  setItem(key: string, value: string): Promise<void> {
    this.map.set(key, value);
    return Promise.resolve();
  }

  removeItem(key: string): Promise<void> {
    this.map.delete(key);
    return Promise.resolve();
  }
}

export const storage: KeyValueStorage = asyncStorageAdapter;

/** Reads JSON, returning null for a missing key *or* unparseable content (corrupt data must never crash boot). */
export async function readJson(store: KeyValueStorage, key: string): Promise<unknown | null> {
  const raw = await store.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function writeJson(
  store: KeyValueStorage,
  key: string,
  value: unknown,
): Promise<void> {
  await store.setItem(key, JSON.stringify(value));
}
