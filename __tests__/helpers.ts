import { createMockRepositories } from '@/repositories/mock';
import { AppClock, type ClockMode } from '@/services/clock';
import { SimulationController, type PrototypeScenario } from '@/services/simulation';
import { MemoryStorage } from '@/services/storage';

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
