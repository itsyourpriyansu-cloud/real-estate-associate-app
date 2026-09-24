import { clock } from '@/services/clock';
import { simulation } from '@/services/simulation';
import { storage } from '@/services/storage';

import { createMockRepositories } from './mock';

/**
 * COMPOSITION ROOT — the only file that knows which repository implementation is in use.
 *
 * Phase 1 wires the mock repositories. To move to FastAPI, build an `Repositories` object from
 * `ApiLeadRepository`, `ApiProjectRepository`, … and export it here instead. No screen, hook or
 * component changes: they import the named repositories below and depend only on `./contracts`.
 */
const mock = createMockRepositories({ storage, clock, simulation });
const repositories = mock.repositories;

export const adminRepository = repositories.admin;
export const leadRepository = repositories.leads;
export const projectRepository = repositories.projects;
export const plotRepository = repositories.plots;
export const taskRepository = repositories.tasks;
export const visitRepository = repositories.visits;
export const conversationRepository = repositories.conversations;
export const notificationRepository = repositories.notifications;
export const userRepository = repositories.users;
export const summaryRepository = repositories.summary;
export const teamRepository = repositories.team;
export const salesRepository = repositories.sales;

/** Prototype-only: drop local mutations and re-seed. Not part of any repository contract. */
export const resetPrototypeData = mock.resetPrototypeData;

/** Prototype-only: tells the mock which phone is signed in. Called by `authStore`. */
export const setCurrentSessionPhone = mock.setCurrentPhone;

export * from './contracts';
