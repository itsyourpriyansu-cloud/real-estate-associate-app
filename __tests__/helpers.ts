import type { User } from '@/domain';
import { createMockRepositories } from '@/repositories/mock';
import type { PrototypeDataset } from '@/seed';
import { buildSeedDataset, datasetFingerprint } from '@/seed';
import { AppClock, type ClockMode } from '@/services/clock';
import { SimulationController, type PrototypeScenario } from '@/services/simulation';
import { MemoryStorage, writeJson } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/prototype';

interface TestRepositoryOptions {
  scenario?: PrototypeScenario;
  latencyEnabled?: boolean;
  clockMode?: ClockMode;
  /** Share storage between two repository sets to test persistence across "app restarts". */
  storage?: MemoryStorage;
}

/** A fully isolated repository set: own storage, own clock, own simulation. No global state. */
export function createTestRepositories(options: TestRepositoryOptions = {}) {
  const storage = options.storage ?? new MemoryStorage();
  const clock = new AppClock(options.clockMode ?? 'DEMO');
  const simulation = new SimulationController({
    scenario: options.scenario ?? 'NORMAL',
    latencyEnabled: options.latencyEnabled ?? false,
  });
  const mock = createMockRepositories({ storage, clock, simulation });
  return { ...mock, storage, clock, simulation };
}

/**
 * A repository set backed by a NORMAL-scenario dataset that has been mutated before any
 * repository reads it — the only way to test a caller whose seed data differs from the default
 * (e.g. a different `designation`, or a stripped-out `AssociateIncentive`), since the mock has no
 * per-test way to choose who is signed in.
 */
export async function createTestRepositoriesWithSeed(mutate: (dataset: PrototypeDataset) => void) {
  const storage = new MemoryStorage();
  const clock = new AppClock('DEMO');
  const anchor = clock.startOfToday();
  const dataset = buildSeedDataset({ anchor, scenario: 'NORMAL' });
  mutate(dataset);
  await writeJson(storage, STORAGE_KEYS.database, {
    fingerprint: datasetFingerprint('NORMAL', anchor),
    dataset,
  });
  return createTestRepositories({ storage, clockMode: 'DEMO' });
}

/** One seeded user patched with `patch` before it is first read. */
export function createTestRepositoriesWithUser(userId: string, patch: Partial<User>) {
  return createTestRepositoriesWithSeed((dataset) => {
    const user = dataset.users.find((u) => u.id === userId);
    if (!user) throw new Error(`seed user ${userId} missing`);
    Object.assign(user, patch);
  });
}

/** Real seeded entities for component tests, read through the repository contracts (no hand-written fixtures). */
export async function loadSamples() {
  const { repositories: r, clock } = createTestRepositories();
  const now = clock.now();
  const [leads, projects, tasks, visits, plots, conversations, notifications, timeline] =
    await Promise.all([
      r.leads.list(),
      r.projects.list(),
      r.tasks.list(),
      r.visits.list(),
      r.plots.list({ projectId: 'prj_real_rise' }),
      r.conversations.list(),
      r.notifications.list(),
      r.leads.getTimeline('lead_001'),
    ]);
  const byId = <T extends { id: string }>(items: T[], id: string): T => {
    const found = items.find((item) => item.id === id);
    if (!found) throw new Error(`sample ${id} missing`);
    return found;
  };
  return {
    now,
    rahul: byId(leads, 'lead_001'),
    faizan: byId(leads, 'lead_003'),
    harish: byId(leads, 'lead_013'),
    swathi: byId(leads, 'lead_015'),
    realRise: byId(projects, 'prj_real_rise'),
    openTask: byId(tasks, 'task_001'),
    overdueTask: byId(tasks, 'task_006'),
    doneTask: byId(tasks, 'task_015'),
    visit: byId(visits, 'visit_001'),
    plot26: byId(plots, 'plot_rr_026'),
    plots,
    conversation: byId(conversations, 'conv_001'),
    notification: byId(notifications, 'notif_001'),
    timeline,
  };
}
