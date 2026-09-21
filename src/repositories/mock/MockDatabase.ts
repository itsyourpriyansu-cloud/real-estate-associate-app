import { STORAGE_KEYS } from '@/constants/prototype';
import {
  buildSeedDataset,
  datasetFingerprint,
  prototypeDatasetSchema,
  type PrototypeDataset,
} from '@/seed';
import type { Clock } from '@/services/clock';
import type { SimulationController } from '@/services/simulation';
import { readJson, writeJson, type KeyValueStorage } from '@/services/storage';

interface PersistedDatabase {
  fingerprint: string;
  dataset: unknown;
}

/**
 * In-memory tables backed by the storage abstraction. This — not Zustand — is the prototype's
 * database: mutations made by repositories are committed here and survive app restarts.
 *
 * The database is lazily hydrated and *self-invalidating*: every access compares the dataset
 * fingerprint (seed version + scenario + calendar day) with the one it holds. Switching scenario
 * or clock mode therefore rebuilds from the seed on the next repository call, with no explicit
 * "reload" plumbing. Corrupt or schema-invalid persisted data also falls back to a fresh seed.
 */
export class MockDatabase {
  private current: { fingerprint: string; dataset: PrototypeDataset } | null = null;
  private pending: { fingerprint: string; promise: Promise<PrototypeDataset> } | null = null;

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly clock: Clock,
    private readonly simulation: SimulationController,
  ) {}

  private expected() {
    const { dataset } = this.simulation.resolve();
    const anchor = this.clock.startOfToday();
    return { scenario: dataset, anchor, fingerprint: datasetFingerprint(dataset, anchor) };
  }

  /** The live tables. Callers may mutate them and must then `commit()`. */
  async tables(): Promise<PrototypeDataset> {
    const expected = this.expected();
    if (this.current?.fingerprint === expected.fingerprint) return this.current.dataset;
    if (this.pending?.fingerprint === expected.fingerprint) return this.pending.promise;

    const promise = this.hydrate(expected.fingerprint, expected.scenario, expected.anchor);
    this.pending = { fingerprint: expected.fingerprint, promise };
    try {
      return await promise;
    } finally {
      if (this.pending?.promise === promise) this.pending = null;
    }
  }

  private async hydrate(
    fingerprint: string,
    scenario: Parameters<typeof buildSeedDataset>[0]['scenario'],
    anchor: Date,
  ): Promise<PrototypeDataset> {
    const persisted = (await readJson(
      this.storage,
      STORAGE_KEYS.database,
    )) as PersistedDatabase | null;
    if (persisted?.fingerprint === fingerprint) {
      const parsed = prototypeDatasetSchema.safeParse(persisted.dataset);
      if (parsed.success) {
        this.current = { fingerprint, dataset: parsed.data };
        return parsed.data;
      }
    }
    const dataset = buildSeedDataset({ anchor, scenario });
    this.current = { fingerprint, dataset };
    await this.persist();
    return dataset;
  }

  private async persist(): Promise<void> {
    if (!this.current) return;
    const payload: PersistedDatabase = {
      fingerprint: this.current.fingerprint,
      dataset: this.current.dataset,
    };
    await writeJson(this.storage, STORAGE_KEYS.database, payload);
  }

  /** Persist in-place mutations made to `tables()`. */
  async commit(): Promise<void> {
    await this.persist();
  }

  /** Discard all local changes and rebuild from the seed for the current scenario and clock. */
  async reset(): Promise<void> {
    this.current = null;
    this.pending = null;
    await this.storage.removeItem(STORAGE_KEYS.database);
    await this.tables();
  }
}
