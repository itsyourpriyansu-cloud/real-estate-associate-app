import { SIMULATED_LATENCY_MS } from '@/constants/prototype';

/**
 * Prototype simulation (spec §20). One selector — "Seed scenario" — drives two independent things:
 *   - which DATASET the mock database is built from (Normal / Busy day / Empty CRM)
 *   - which NETWORK condition the mock repositories emulate (Online / Offline / Errors)
 * Offline and Repository-errors use the Normal dataset.
 */
export type PrototypeScenario =
  'NORMAL' | 'BUSY_DAY' | 'EMPTY_CRM' | 'OFFLINE' | 'REPOSITORY_ERRORS';
export type DatasetScenario = 'NORMAL' | 'BUSY_DAY' | 'EMPTY_CRM';
export type NetworkCondition = 'ONLINE' | 'OFFLINE' | 'ERRORS';

export interface ScenarioProfile {
  label: string;
  description: string;
  dataset: DatasetScenario;
  network: NetworkCondition;
}

export const SCENARIO_PROFILES: Record<PrototypeScenario, ScenarioProfile> = {
  NORMAL: {
    label: 'Normal',
    description: 'A typical day: a few visits, some overdue follow-ups.',
    dataset: 'NORMAL',
    network: 'ONLINE',
  },
  BUSY_DAY: {
    label: 'Busy day',
    description: 'Extra visits and follow-ups stacked into today.',
    dataset: 'BUSY_DAY',
    network: 'ONLINE',
  },
  EMPTY_CRM: {
    label: 'Empty CRM',
    description: 'No leads, tasks, visits, messages or notifications. Inventory remains.',
    dataset: 'EMPTY_CRM',
    network: 'ONLINE',
  },
  OFFLINE: {
    label: 'Offline',
    description: 'Every repository call fails as if the device had no connection.',
    dataset: 'NORMAL',
    network: 'OFFLINE',
  },
  REPOSITORY_ERRORS: {
    label: 'Repository errors',
    description: 'Every repository call fails as if the server returned a 500.',
    dataset: 'NORMAL',
    network: 'ERRORS',
  },
};

export interface SimulationConfig {
  scenario: PrototypeScenario;
  /** Adds a 250–700ms delay to every repository call. */
  latencyEnabled: boolean;
}

export interface ResolvedSimulation extends ScenarioProfile {
  scenario: PrototypeScenario;
  latencyEnabled: boolean;
}

export const DEFAULT_SIMULATION: SimulationConfig = { scenario: 'NORMAL', latencyEnabled: false };

type Listener = (config: SimulationConfig) => void;

/**
 * Framework-agnostic holder of the active simulation. The Zustand `prototypeStore` is the UI-facing
 * source of truth and pushes changes here; repositories only ever read from this controller, so the
 * data layer never depends on React or Zustand.
 */
export class SimulationController {
  private config: SimulationConfig;
  private readonly listeners = new Set<Listener>();
  private latencyCounter = 0;

  constructor(initial: SimulationConfig = DEFAULT_SIMULATION) {
    this.config = { ...initial };
  }

  getConfig(): SimulationConfig {
    return this.config;
  }

  setConfig(patch: Partial<SimulationConfig>): void {
    const next = { ...this.config, ...patch };
    if (
      next.scenario === this.config.scenario &&
      next.latencyEnabled === this.config.latencyEnabled
    )
      return;
    this.config = next;
    this.listeners.forEach((listener) => listener(next));
  }

  resolve(): ResolvedSimulation {
    return { ...SCENARIO_PROFILES[this.config.scenario], ...this.config };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Latency for the next call. Deterministic (a counter, not Math.random) so demos and QA runs
   * feel identical; it cycles through the 250–700ms window.
   */
  nextLatencyMs(): number {
    if (!this.config.latencyEnabled) return 0;
    const { min, max } = SIMULATED_LATENCY_MS;
    const span = max - min + 1;
    this.latencyCounter = (this.latencyCounter + 1) % span;
    return min + ((this.latencyCounter * 137) % span);
  }
}

export const simulation = new SimulationController();
