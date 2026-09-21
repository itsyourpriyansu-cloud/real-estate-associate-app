import type { Repositories } from '../contracts';
import type { Clock } from '@/services/clock';
import type { SimulationController } from '@/services/simulation';
import type { KeyValueStorage } from '@/services/storage';

import { MockContext } from './MockContext';
import { MockConversationRepository } from './MockConversationRepository';
import { MockDatabase } from './MockDatabase';
import { MockLeadRepository } from './MockLeadRepository';
import { MockNotificationRepository } from './MockNotificationRepository';
import { MockPlotRepository } from './MockPlotRepository';
import { MockProjectRepository } from './MockProjectRepository';
import { MockSalesRepository } from './MockSalesRepository';
import { MockSummaryRepository } from './MockSummaryRepository';
import { MockTaskRepository } from './MockTaskRepository';
import { MockTeamRepository } from './MockTeamRepository';
import { MockUserRepository } from './MockUserRepository';
import { MockVisitRepository } from './MockVisitRepository';

export interface MockRepositoryDeps {
  storage: KeyValueStorage;
  clock: Clock;
  simulation: SimulationController;
}

export interface MockRepositories {
  repositories: Repositories;
  /** Discards all local mutations and re-seeds for the current scenario and clock. */
  resetPrototypeData(): Promise<void>;
}

/** Wires the eleven mock repositories to one shared in-memory/persisted database. */
export function createMockRepositories({
  storage,
  clock,
  simulation,
}: MockRepositoryDeps): MockRepositories {
  const db = new MockDatabase(storage, clock, simulation);
  const ctx = new MockContext(db, clock, simulation);

  return {
    repositories: {
      leads: new MockLeadRepository(ctx),
      projects: new MockProjectRepository(ctx),
      plots: new MockPlotRepository(ctx),
      tasks: new MockTaskRepository(ctx),
      visits: new MockVisitRepository(ctx),
      conversations: new MockConversationRepository(ctx),
      notifications: new MockNotificationRepository(ctx),
      users: new MockUserRepository(ctx),
      summary: new MockSummaryRepository(ctx),
      team: new MockTeamRepository(ctx),
      sales: new MockSalesRepository(ctx),
    },
    resetPrototypeData: () => db.reset(),
  };
}
