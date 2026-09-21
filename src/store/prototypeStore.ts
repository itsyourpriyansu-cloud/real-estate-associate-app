import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/prototype';
import { resetPrototypeData } from '@/repositories';
import { clock, type ClockMode } from '@/services/clock';
import { simulation, type PrototypeScenario } from '@/services/simulation';
import { storage } from '@/services/storage';

/**
 * Prototype-mode controls (spec §20). This store is the UI-facing source of truth and mirrors its
 * values into the framework-agnostic `simulation` and `clock` services, which is all the data layer
 * ever reads. `datasetRevision` increments whenever the underlying dataset changes so feature hooks
 * know to refetch — the data itself never lives here.
 */
interface PrototypeState {
  scenario: PrototypeScenario;
  latencyEnabled: boolean;
  clockMode: ClockMode;
  datasetRevision: number;
  setScenario: (scenario: PrototypeScenario) => void;
  setLatencyEnabled: (enabled: boolean) => void;
  setClockMode: (mode: ClockMode) => void;
  /** Discards local mutations and re-seeds. Resolves once the fresh dataset is ready. */
  resetData: () => Promise<void>;
}

type PersistedPrototype = Pick<PrototypeState, 'scenario' | 'latencyEnabled' | 'clockMode'>;

function applyToServices({ scenario, latencyEnabled, clockMode }: PersistedPrototype): void {
  simulation.setConfig({ scenario, latencyEnabled });
  clock.setMode(clockMode);
}

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      scenario: 'NORMAL',
      latencyEnabled: false,
      clockMode: 'DEMO',
      datasetRevision: 0,

      setScenario: (scenario) => {
        applyToServices({ ...get(), scenario });
        set((s) => ({ scenario, datasetRevision: s.datasetRevision + 1 }));
      },
      setLatencyEnabled: (latencyEnabled) => {
        applyToServices({ ...get(), latencyEnabled });
        set({ latencyEnabled });
      },
      setClockMode: (clockMode) => {
        applyToServices({ ...get(), clockMode });
        set((s) => ({ clockMode, datasetRevision: s.datasetRevision + 1 }));
      },
      resetData: async () => {
        await resetPrototypeData();
        set((s) => ({ datasetRevision: s.datasetRevision + 1 }));
      },
    }),
    {
      name: STORAGE_KEYS.prototype,
      storage: createJSONStorage(() => storage),
      partialize: (state): PersistedPrototype => ({
        scenario: state.scenario,
        latencyEnabled: state.latencyEnabled,
        clockMode: state.clockMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyToServices(state);
      },
    },
  ),
);
