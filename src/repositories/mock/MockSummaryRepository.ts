import { sumSales, type AssociateSummary, type PublicSummary } from '@/domain';

import type { SummaryRepository } from '../contracts';
import type { MockContext } from './MockContext';
import { currentAssociate, downlineOf, teamUsers } from './effects';

/** Registered square yards = the area of every booked plot. */
function registeredSqYd(plots: readonly { status: string; areaSqYd: number }[]): number {
  return plots.filter((p) => p.status === 'BOOKED').reduce((sum, p) => sum + p.areaSqYd, 0);
}

export class MockSummaryRepository implements SummaryRepository {
  constructor(private readonly ctx: MockContext) {}

  getPublicSummary(): Promise<PublicSummary> {
    return this.ctx.read((data) => ({
      totalRegisteredSqYd: registeredSqYd(data.plots),
      completedProjects: data.projects.filter((p) => p.status === 'COMPLETED').length,
      ongoingProjects: data.projects.filter((p) => p.status === 'ONGOING').length,
      availablePlots: data.plots.filter((p) => p.status === 'AVAILABLE').length,
    }));
  }

  getAssociateSummary(): Promise<AssociateSummary> {
    const phone = this.ctx.currentPhone();
    return this.ctx.read((data) => {
      const me = currentAssociate(data, phone);
      const team = teamUsers(data, me.teamId);
      const teamIds = new Set(team.map((u) => u.id));
      const teamName = data.teams.find((t) => t.id === me.teamId)?.name ?? '';

      const mySales = data.sales.filter((s) => s.associateId === me.id);
      const teamSales = data.sales.filter((s) => teamIds.has(s.associateId));
      const teamVisits = data.visits.filter((v) => teamIds.has(v.associateId));

      return {
        teamName,
        totalRegisteredSqYd: registeredSqYd(data.plots),
        teamTotalSales: sumSales(teamSales),
        teamMembers: team.length,
        myTeam: downlineOf(data, me.id).length,
        mySales:
          mySales.length > 0 ? { state: 'READY', value: sumSales(mySales) } : { state: 'PENDING' },
        teamSiteVisits:
          teamVisits.length > 0
            ? { state: 'READY', value: teamVisits.length }
            : { state: 'PENDING' },
      };
    });
  }
}
