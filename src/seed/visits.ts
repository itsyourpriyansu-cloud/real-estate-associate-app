import type { SiteVisit } from '@/domain';

import { ASSOCIATE_ID, PROJECT_ID, leadId, visitId } from './ids';
import type { SeedPicks } from './picks';
import type { SeedTime } from './time';

export function buildVisits(t: SeedTime, picks: SeedPicks): SiteVisit[] {
  return [
    // --- Today ---
    {
      id: visitId(1),
      leadId: leadId(1),
      projectId: PROJECT_ID.rr,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(0, '15:30'),
      status: 'CONFIRMED',
      shortlistedPlotIds: [],
      feedbackTags: [],
    },
    {
      id: visitId(2),
      leadId: leadId(16),
      projectId: PROJECT_ID.ce,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(0, '12:00'),
      status: 'SCHEDULED',
      shortlistedPlotIds: [],
      feedbackTags: [],
    },

    // --- Upcoming ---
    {
      id: visitId(3),
      leadId: leadId(10),
      projectId: PROJECT_ID.rr,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(1, '11:00'),
      status: 'SCHEDULED',
      shortlistedPlotIds: [],
      feedbackTags: [],
    },

    // --- Completed ---
    {
      id: visitId(4),
      leadId: leadId(3),
      projectId: PROJECT_ID.ag,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(-3, '15:00'),
      status: 'COMPLETED',
      shortlistedPlotIds: picks.faizanPlots.map((p) => p.id),
      outcome: 'VERY_INTERESTED',
      feedbackTags: ['Liked corner plot', 'Wants payment plan'],
      note: 'Comparing with one more layout. Decision expected this week.',
    },
    {
      id: visitId(5),
      leadId: leadId(7),
      projectId: PROJECT_ID.ce,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(-5, '11:30'),
      status: 'COMPLETED',
      shortlistedPlotIds: [picks.arjunHeldPlot.id],
      outcome: 'VERY_INTERESTED',
      feedbackTags: ['Ready to book', 'Needs loan sanction'],
      note: 'Wants to hold the plot while the loan sanction letter arrives.',
    },
    {
      id: visitId(6),
      leadId: leadId(8),
      projectId: PROJECT_ID.rr,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(-24, '10:00'),
      status: 'COMPLETED',
      shortlistedPlotIds: [picks.kavithaBookedPlot.id],
      outcome: 'VERY_INTERESTED',
      feedbackTags: ['East facing', 'Good road width'],
    },
    {
      id: visitId(7),
      leadId: leadId(9),
      projectId: PROJECT_ID.nc,
      associateId: ASSOCIATE_ID,
      scheduledAt: t.at(-12, '16:00'),
      status: 'COMPLETED',
      shortlistedPlotIds: [],
      outcome: 'NOT_INTERESTED',
      feedbackTags: ['Too far from workplace'],
      note: 'Prefers a location closer to his workplace.',
    },
  ];
}
