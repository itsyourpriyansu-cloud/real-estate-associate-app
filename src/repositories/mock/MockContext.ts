import type { RepositoryErrorCode } from '../contracts/errors';
import { RepositoryError } from '../contracts/errors';
import type { PrototypeDataset } from '@/seed';
import type { Clock } from '@/services/clock';
import type { SimulationController } from '@/services/simulation';

import type { MockDatabase } from './MockDatabase';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Plain-data deep copy so callers can never mutate the mock database through a returned value. */
export function clone<T>(value: T): T {
  // `void` operations (e.g. markAllRead) return undefined, which JSON cannot represent.
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Shorthand used by repositories to reject without repeating the class name. */
export function fail(code: RepositoryErrorCode, message: string): never {
  throw new RepositoryError(code, message);
}

/**
 * The shared "transport" of every mock repository. `read` / `write` apply the active simulation
 * (latency, offline, server errors), hydrate the database, run the operation, and return a copy.
 * An API-backed repository replaces all of this with an HTTP client.
 */
export class MockContext {
  /**
   * The phone number of the signed-in session, set by a bridge in the composition root
   * (`repositories/index.ts`'s `setCurrentSessionPhone`, called from `authStore` on sign-in/out) so
   * `effects.ts`'s `currentUserOrNull`/`currentAssociate` resolve "who is signed in" per-session
   * instead of a fixed seed row. Instance state (not module-level) so each independent
   * `MockContext` — e.g. one per test — has its own, never leaking across isolated repository sets.
   */
  private currentUserPhone: string | null = null;

  constructor(
    private readonly db: MockDatabase,
    private readonly clock: Clock,
    private readonly simulation: SimulationController,
  ) {}

  setCurrentPhone(phone: string | null): void {
    this.currentUserPhone = phone;
  }

  /** `null` means no session set this phone — repositories fall back to the seed's demo associate. */
  currentPhone(): string | null {
    return this.currentUserPhone;
  }

  private async gate(): Promise<void> {
    const latency = this.simulation.nextLatencyMs();
    if (latency > 0) await sleep(latency);

    const { network } = this.simulation.resolve();
    if (network === 'OFFLINE') fail('OFFLINE', 'Simulated offline: no connection');
    if (network === 'ERRORS') fail('SERVER_ERROR', 'Simulated 500: repository failure');
  }

  async read<T>(operation: (data: PrototypeDataset, now: Date) => T): Promise<T> {
    await this.gate();
    const data = await this.db.tables();
    return clone(operation(data, this.clock.now()));
  }

  /** Runs a mutation, commits it to storage, and returns a copy of the result. Validate before mutating. */
  async write<T>(operation: (data: PrototypeDataset, now: Date) => T): Promise<T> {
    await this.gate();
    const data = await this.db.tables();
    const result = operation(data, this.clock.now());
    await this.db.commit();
    return clone(result);
  }
}
