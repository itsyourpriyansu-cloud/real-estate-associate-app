import { SEED_VERSION, STORAGE_KEYS } from '@/constants/prototype';
import type { DatasetScenario } from '@/services/simulation';
import type { KeyValueStorage } from '@/services/storage';

import { buildConversations } from './conversations';
import type { PrototypeDataset } from './dataset';
import { leadId } from './ids';
import { buildLeadBlueprints, finalizeLeads } from './leads';
import { buildNotifications } from './notifications';
import { buildPlots } from './plots';
import { pickSeedPlots } from './picks';
import { buildProjects } from './projects';
import { buildSales, buildSalesTargets } from './sales';
import { applyBusyDay } from './scenarios';
import { buildTasks } from './tasks';
import { createSeedTime } from './time';
import { buildTimeline } from './timeline';
import { buildUsers } from './users';
import { buildVisits } from './visits';

export interface SeedOptions {
  /** Local midnight of "today" — from the active Clock. Every seeded timestamp is relative to it. */
  anchor: Date;
  scenario: DatasetScenario;
}

/**
 * Builds the complete deterministic dataset. Pure: same options in, identical data out. The only
 * input that varies is the anchor day, which is what makes the demo stay "today" whenever it is opened.
 */
export function buildSeedDataset({ anchor, scenario }: SeedOptions): PrototypeDataset {
  const t = createSeedTime(anchor);
  const users = buildUsers(t);
  const plots = buildPlots(t);
  const projects = buildProjects(plots);

  // Empty CRM keeps inventory and the team (they are not CRM data) and removes everything
  // associate-specific — including sales, so the dashboard's "My Sales" reads as pending.
  if (scenario === 'EMPTY_CRM') {
    return {
      users,
      projects,
      plots,
      leads: [],
      timeline: [],
      tasks: [],
      visits: [],
      conversations: [],
      notifications: [],
      sales: [],
      salesTargets: buildSalesTargets(t),
    };
  }

  const picks = pickSeedPlots(plots);
  const blueprints = buildLeadBlueprints(picks);
  const leadName = (n: number) =>
    blueprints.find((b) => b.id === leadId(n))?.fullName ?? 'Customer';

  let crm = {
    tasks: buildTasks(t),
    visits: buildVisits(t, picks),
    timeline: buildTimeline(t, picks, leadName),
    notifications: buildNotifications(t, picks),
  };
  if (scenario === 'BUSY_DAY') crm = applyBusyDay(t, picks, crm);

  const conversations = buildConversations(t, picks);
  const leads = finalizeLeads(blueprints, {
    tasks: crm.tasks,
    timeline: crm.timeline,
    conversations,
  });

  return {
    users,
    leads,
    projects,
    plots,
    conversations,
    sales: buildSales(t, plots, picks),
    salesTargets: buildSalesTargets(t),
    ...crm,
  };
}

/** Identifies which dataset a persisted database was built from; a mismatch forces a rebuild. */
export function datasetFingerprint(scenario: DatasetScenario, anchor: Date): string {
  const day = `${anchor.getFullYear()}-${anchor.getMonth() + 1}-${anchor.getDate()}`;
  return `v${SEED_VERSION}:${scenario}:${day}`;
}

/** Removes the persisted prototype database. The next repository call re-seeds. */
export async function clearPersistedPrototypeData(storage: KeyValueStorage): Promise<void> {
  await storage.removeItem(STORAGE_KEYS.database);
}
