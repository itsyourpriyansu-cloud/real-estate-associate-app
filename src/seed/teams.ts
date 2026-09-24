import type { Team } from '@/domain';

import { MARKETING_HEAD_YHIPL1_ID, MARKETING_HEAD_YHIPL3_ID, TEAM_LEAD_ID } from './ids';
import type { SeedTime } from './time';

export const TEAM_ID = {
  yhipl2: 'team_yhipl2',
  yhipl1: 'team_yhipl1',
  yhipl3: 'team_yhipl3',
} as const;

/**
 * Three teams — enough to prove team-scoped queries (a Marketing Head sees only their team's
 * tickets; dashboards differ team to team) without hand-authoring the spec's ~15. Management can
 * create more later; nothing here hard-codes a team count.
 */
export function buildTeams(t: SeedTime): Team[] {
  return [
    {
      id: TEAM_ID.yhipl2,
      name: 'YHIPL2',
      marketingHeadId: TEAM_LEAD_ID,
      status: 'ACTIVE',
      createdAt: t.at(-900, '09:00'),
    },
    {
      id: TEAM_ID.yhipl1,
      name: 'YHIPL1',
      marketingHeadId: MARKETING_HEAD_YHIPL1_ID,
      status: 'ACTIVE',
      createdAt: t.at(-900, '09:00'),
    },
    {
      id: TEAM_ID.yhipl3,
      name: 'YHIPL3',
      marketingHeadId: MARKETING_HEAD_YHIPL3_ID,
      status: 'ACTIVE',
      createdAt: t.at(-400, '09:00'),
    },
  ];
}
