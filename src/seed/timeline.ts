import type { TimelineEvent, TimelineEventType } from '@/domain';

import { ASSOCIATE_NAME, PROJECT_ID, leadId, timelineId, visitId } from './ids';
import type { SeedPicks } from './picks';
import type { SeedTime } from './time';

type Meta = NonNullable<TimelineEvent['metadata']>;

/**
 * Timeline events across all 18 leads (60+). Every lead has a LEAD_CREATED event (its `createdAt` is
 * derived from it). Metadata ids (projectId / plotId / visitId) are validated in the seed tests.
 */
export function buildTimeline(
  t: SeedTime,
  picks: SeedPicks,
  leadName: (n: number) => string,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const add = (
    lead: number,
    day: number,
    hhmm: string,
    type: TimelineEventType,
    title: string,
    description?: string,
    metadata?: Meta,
  ) => {
    // Customer-originated events are attributed to the customer; system creation has no actor.
    const actorName =
      type === 'WHATSAPP_RECEIVED'
        ? leadName(lead)
        : type === 'LEAD_CREATED'
          ? undefined
          : ASSOCIATE_NAME;
    events.push({
      id: timelineId(events.length + 1),
      leadId: leadId(lead),
      type,
      occurredAt: t.at(day, hhmm),
      title,
      ...(description ? { description } : {}),
      ...(actorName ? { actorName } : {}),
      ...(metadata ? { metadata } : {}),
    });
  };

  const stage = (
    lead: number,
    day: number,
    hhmm: string,
    from: string,
    to: string,
    title: string,
    description?: string,
  ) => add(lead, day, hhmm, 'STAGE_CHANGED', title, description, { fromStage: from, toStage: to });

  const { faizanPlots, arjunHeldPlot, kavithaBookedPlot, poojaPlot } = picks;

  // 1 · Rahul Sharma — the stakeholder walkthrough lead
  add(
    1,
    -9,
    '18:20',
    'LEAD_CREATED',
    'Lead created',
    'Enquired through the Meta Real Rise campaign.',
  );
  add(1, -9, '18:45', 'CALL', 'Call attempted', 'No answer. Sent a WhatsApp message instead.');
  add(
    1,
    -8,
    '10:05',
    'CALL',
    'Intro call · 6 min',
    'Budget ₹40–55L. Prefers an east-facing plot for self use.',
  );
  stage(1, -8, '10:10', 'NEW', 'CONTACTED', 'Moved to Contacted');
  add(1, -8, '10:20', 'PROJECT_SHARED', 'Shared Real Rise', 'Project details sent on WhatsApp.', {
    projectId: PROJECT_ID.rr,
  });
  add(1, -8, '10:45', 'WHATSAPP_RECEIVED', 'Asked for east-facing plots near 240 sq yd');
  add(
    1,
    -4,
    '12:15',
    'NOTE',
    'Wants to bring family',
    'Prefers a weekend. His father will approve the final plot.',
  );
  stage(1, -4, '12:20', 'CONTACTED', 'INTERESTED', 'Moved to Interested');
  add(1, -3, '17:40', 'WHATSAPP_RECEIVED', 'Asked about home loan tie-ups');
  add(1, -2, '11:30', 'CALL', 'Follow-up call · 9 min', 'Discussed budget and preferred facing.');
  stage(1, -2, '11:45', 'INTERESTED', 'VISIT', 'Moved to Visit');
  add(
    1,
    -2,
    '11:50',
    'VISIT_SCHEDULED',
    'Site visit scheduled',
    `Real Rise · ${t.dayLabel(0)}, ${t.timeLabel('15:30')}`,
    { visitId: visitId(1), projectId: PROJECT_ID.rr },
  );
  add(1, -1, '18:10', 'WHATSAPP_SENT', 'Visit confirmation sent', undefined, {
    visitId: visitId(1),
  });

  // 2 · Ananya Iyer
  add(2, 0, '08:10', 'LEAD_CREATED', 'Lead created', 'Submitted the website enquiry form.');
  add(2, 0, '08:12', 'WHATSAPP_RECEIVED', 'Asked for project details near Bangalore Highway');

  // 3 · Mohammed Faizan
  add(3, -21, '15:10', 'LEAD_CREATED', 'Lead created', 'Referred by Kavitha Menon.');
  add(
    3,
    -20,
    '11:00',
    'CALL',
    'Intro call · 12 min',
    'Investor profile. Wants Airport Corridor plots, budget ₹80L–1.1Cr.',
  );
  add(3, -18, '16:30', 'PROJECT_SHARED', 'Shared Aurelia Greens', 'Brochure and price list sent.', {
    projectId: PROJECT_ID.ag,
  });
  add(
    3,
    -6,
    '10:00',
    'VISIT_SCHEDULED',
    'Site visit scheduled',
    `Aurelia Greens · ${t.dayLabel(-3)}, ${t.timeLabel('15:00')}`,
    { visitId: visitId(4), projectId: PROJECT_ID.ag },
  );
  add(
    3,
    -3,
    '15:30',
    'VISIT_COMPLETED',
    'Site visit completed',
    'Very interested. Liked the corner plot.',
    { visitId: visitId(4), projectId: PROJECT_ID.ag },
  );
  add(
    3,
    -3,
    '17:00',
    'PLOT_SHORTLISTED',
    'Shortlisted 2 plots',
    `Plots ${faizanPlots[0].plotNumber} and ${faizanPlots[1].plotNumber} at Aurelia Greens.`,
    { plotId: faizanPlots[0].id, projectId: PROJECT_ID.ag },
  );
  stage(3, -2, '12:20', 'VISIT', 'NEGOTIATION', 'Moved to Negotiation');
  add(
    3,
    -1,
    '16:40',
    'WHATSAPP_SENT',
    'Cost sheet shared',
    `Estimate for Plot ${faizanPlots[0].plotNumber}.`,
    { plotId: faizanPlots[0].id },
  );

  // 4 · Sneha Reddy
  add(
    4,
    -4,
    '14:00',
    'LEAD_CREATED',
    'Lead created',
    'Came in through a Google Ads search campaign.',
  );
  add(4, -3, '12:00', 'WHATSAPP_SENT', 'Initial response sent');

  // 5 · Vikram Chowdary
  add(5, -6, '09:30', 'LEAD_CREATED', 'Lead created', 'Enquired on a property portal.');
  add(
    5,
    -5,
    '17:15',
    'CALL',
    'Intro call · 8 min',
    'Investor. Comparing Cedar Enclave and Real Rise.',
  );

  // 6 · Priya Nair
  add(6, -2, '19:20', 'LEAD_CREATED', 'Lead created', 'Messaged on WhatsApp asking about plots.');
  add(6, -1, '10:10', 'CALL', 'Call attempted', 'No answer.');

  // 7 · Arjun Patel
  add(7, -14, '12:00', 'LEAD_CREATED', 'Lead created', 'Referred by a channel partner.');
  add(
    7,
    -13,
    '16:00',
    'CALL',
    'Intro call · 15 min',
    'Investor. Wants a Cedar Enclave plot on the main road.',
  );
  add(7, -10, '11:00', 'PROJECT_SHARED', 'Shared Cedar Enclave', undefined, {
    projectId: PROJECT_ID.ce,
  });
  add(
    7,
    -5,
    '13:00',
    'VISIT_COMPLETED',
    'Site visit completed',
    'Very interested. Wants to hold the plot.',
    { visitId: visitId(5), projectId: PROJECT_ID.ce },
  );
  add(
    7,
    -5,
    '14:30',
    'PLOT_SHORTLISTED',
    `Shortlisted Plot ${arjunHeldPlot.plotNumber}`,
    'Prototype Hold placed while loan sanction is pending.',
    { plotId: arjunHeldPlot.id, projectId: PROJECT_ID.ce },
  );
  stage(7, -4, '10:00', 'VISIT', 'BOOKING', 'Moved to Booking');
  add(7, -1, '20:05', 'WHATSAPP_RECEIVED', 'Will send KYC documents tomorrow');

  // 8 · Kavitha Menon (won)
  add(8, -30, '11:00', 'LEAD_CREATED', 'Lead created', 'Referred by a past customer.');
  add(8, -28, '10:30', 'CALL', 'Intro call · 10 min', 'Self-use buyer. East facing preferred.');
  add(8, -24, '11:45', 'VISIT_COMPLETED', 'Site visit completed', 'Very interested.', {
    visitId: visitId(6),
    projectId: PROJECT_ID.rr,
  });
  add(
    8,
    -24,
    '12:30',
    'PLOT_SHORTLISTED',
    `Shortlisted Plot ${kavithaBookedPlot.plotNumber}`,
    undefined,
    { plotId: kavithaBookedPlot.id, projectId: PROJECT_ID.rr },
  );
  stage(
    8,
    -6,
    '16:00',
    'BOOKING',
    'WON',
    'Booking confirmed',
    `Plot ${kavithaBookedPlot.plotNumber} at Real Rise.`,
  );

  // 9 · Suresh Babu Naidu (lost)
  add(
    9,
    -20,
    '10:00',
    'LEAD_CREATED',
    'Lead created',
    'Came in through a Google Ads search campaign.',
  );
  add(
    9,
    -12,
    '17:30',
    'VISIT_COMPLETED',
    'Site visit completed',
    'Not interested. Location is too far from his workplace.',
    { visitId: visitId(7), projectId: PROJECT_ID.nc },
  );
  stage(
    9,
    -11,
    '11:00',
    'VISIT',
    'LOST',
    'Marked as lost',
    'Location too far from workplace; bought a plot elsewhere.',
  );

  // 10 · Deepika Rao
  add(10, -3, '12:00', 'LEAD_CREATED', 'Lead created', 'Walked in at the site office.');
  add(
    10,
    -2,
    '17:00',
    'VISIT_SCHEDULED',
    'Site visit scheduled',
    `Real Rise · ${t.dayLabel(1)}, ${t.timeLabel('11:00')}`,
    { visitId: visitId(3), projectId: PROJECT_ID.rr },
  );
  add(10, -2, '17:05', 'WHATSAPP_SENT', 'Visit confirmation sent', undefined, {
    visitId: visitId(3),
  });

  // 11 · Imran Qureshi
  add(
    11,
    -3,
    '20:00',
    'LEAD_CREATED',
    'Lead created',
    'Came in through the Meta investor campaign.',
  );
  add(
    11,
    -2,
    '11:15',
    'CALL',
    'Intro call · 7 min',
    'Investor. Budget around ₹60L, wants Airport Corridor.',
  );
  add(11, 0, '07:45', 'WHATSAPP_RECEIVED', 'Asked for a call after 5 PM');

  // 12 · Lakshmi Prasanna
  add(12, -7, '13:00', 'LEAD_CREATED', 'Lead created', 'Submitted the website enquiry form.');
  add(12, -6, '11:00', 'PROJECT_SHARED', 'Shared Northgate County', undefined, {
    projectId: PROJECT_ID.nc,
  });

  // 13 · Harish Goud
  add(13, -1, '17:30', 'LEAD_CREATED', 'Lead created', 'Added manually after a property expo.');

  // 14 · Nikhil Agarwal
  add(14, -16, '14:00', 'LEAD_CREATED', 'Lead created', 'Enquired on a property portal.');
  add(
    14,
    -9,
    '12:00',
    'CALL',
    'Intro call · 14 min',
    'Looking at large Airport Corridor plots as an investment.',
  );
  add(
    14,
    -2,
    '15:00',
    'NOTE',
    'Comparing with a villa project',
    'Wants a side-by-side cost sheet before deciding.',
  );
  stage(14, -2, '15:10', 'INTERESTED', 'NEGOTIATION', 'Moved to Negotiation');

  // 15 · Swathi Kumari
  add(15, -9, '18:40', 'LEAD_CREATED', 'Lead created', 'Enquired through a Meta ad.');
  add(15, -8, '11:00', 'CALL', 'Call attempted', 'No answer.');

  // 16 · Rohit Bansal
  add(16, -2, '13:00', 'LEAD_CREATED', 'Lead created', 'Came in through a Google search campaign.');
  add(16, -1, '11:30', 'CALL', 'Intro call · 10 min', 'Wants to buy this month. Loan required.');
  add(
    16,
    -1,
    '18:00',
    'VISIT_SCHEDULED',
    'Site visit scheduled',
    `Cedar Enclave · ${t.dayLabel(0)}, ${t.timeLabel('12:00')}`,
    { visitId: visitId(2), projectId: PROJECT_ID.ce },
  );
  add(16, -1, '18:30', 'WHATSAPP_RECEIVED', 'Confirmed he will attend the visit');

  // 17 · Pooja Deshmukh
  add(17, -8, '10:00', 'LEAD_CREATED', 'Lead created', 'Submitted the website enquiry form.');
  add(17, -5, '15:00', 'CALL', 'Intro call · 6 min', 'North or east facing. Budget ₹40–50L.');
  add(
    17,
    -1,
    '12:00',
    'PLOT_SHORTLISTED',
    `Shortlisted Plot ${poojaPlot.plotNumber}`,
    'Shortlist sent for feedback.',
    { plotId: poojaPlot.id, projectId: PROJECT_ID.rr },
  );

  // 18 · Sandeep Yadav
  add(18, -10, '16:00', 'LEAD_CREATED', 'Lead created', 'Walked in at the site office.');
  add(18, -6, '11:00', 'CALL', 'Intro call · 5 min', 'Asked for a brochure before deciding.');

  return events;
}
