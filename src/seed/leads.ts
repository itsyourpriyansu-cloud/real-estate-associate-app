import {
  deriveLastActivityAt,
  deriveNextAction,
  type Conversation,
  type Lead,
  type Task,
  type TimelineEvent,
} from '@/domain';

import { ASSOCIATE_ID, leadId } from './ids';
import type { SeedPicks } from './picks';

const LAKH = 100_000;
const CRORE = 10_000_000;

/**
 * A lead as authored. Fields that are *derived* from other tables (createdAt, updatedAt,
 * lastActivityAt, next action, notesCount, unreadMessages) are omitted here and computed by
 * `finalizeLeads`, so a lead can never disagree with its timeline, tasks or conversation.
 */
export type LeadBlueprint = Omit<
  Lead,
  | 'createdAt'
  | 'updatedAt'
  | 'lastActivityAt'
  | 'nextActionAt'
  | 'nextActionLabel'
  | 'notesCount'
  | 'unreadMessages'
>;

/** Synthetic sequential numbers — 9000000001… — not real customers. */
const phoneOf = (n: number) => `+9190000${String(n).padStart(5, '0')}`;

export function buildLeadBlueprints(picks: SeedPicks): LeadBlueprint[] {
  const base = (n: number) => ({ id: leadId(n), phone: phoneOf(n), assignedUserId: ASSOCIATE_ID });

  return [
    {
      ...base(1),
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      source: 'META_ADS',
      sourceLabel: 'Meta · Real Rise campaign',
      stage: 'VISIT',
      priority: 'HOT',
      requirement: {
        budgetMin: 40 * LAKH,
        budgetMax: 55 * LAKH,
        preferredLocations: ['Bangalore Highway', 'Airport Corridor'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 200,
        areaMaxSqYd: 300,
        preferredFacing: ['EAST', 'NORTH'],
        purpose: 'SELF_USE',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: true,
      },
      tags: ['Vastu · east', 'Home loan', 'Family visit'],
      shortlistedPlotIds: [],
    },
    {
      ...base(2),
      fullName: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      source: 'WEBSITE',
      sourceLabel: 'Website enquiry form',
      stage: 'NEW',
      priority: 'NORMAL',
      requirement: {
        budgetMin: 35 * LAKH,
        budgetMax: 45 * LAKH,
        preferredLocations: ['Bangalore Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 150,
        areaMaxSqYd: 240,
        purpose: 'SELF_USE',
        purchaseTimeline: '3_6_MONTHS',
      },
      tags: ['New enquiry'],
      shortlistedPlotIds: [],
    },
    {
      ...base(3),
      fullName: 'Mohammed Faizan',
      email: 'mohammed.faizan@example.com',
      source: 'REFERRAL',
      sourceLabel: 'Referred by Kavitha Menon',
      stage: 'NEGOTIATION',
      priority: 'HOT',
      requirement: {
        budgetMin: 80 * LAKH,
        budgetMax: Math.round(1.1 * CRORE),
        preferredLocations: ['Airport Corridor'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 300,
        areaMaxSqYd: 500,
        preferredFacing: ['EAST', 'NORTH'],
        purpose: 'INVESTMENT',
        purchaseTimeline: '0_30_DAYS',
        loanRequired: false,
      },
      tags: ['Investor', 'Corner plot', 'Payment plan'],
      shortlistedPlotIds: picks.faizanPlots.map((p) => p.id),
    },
    {
      ...base(4),
      fullName: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      source: 'GOOGLE_ADS',
      sourceLabel: 'Google search · plots near highway',
      stage: 'QUALIFIED',
      priority: 'WARM',
      requirement: {
        budgetMin: 25 * LAKH,
        budgetMax: 35 * LAKH,
        preferredLocations: ['Hyderabad Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 167,
        areaMaxSqYd: 250,
        purpose: 'SELF_USE',
        purchaseTimeline: '3_6_MONTHS',
        loanRequired: true,
      },
      tags: ['First-time buyer'],
      shortlistedPlotIds: [],
    },
    {
      ...base(5),
      fullName: 'Vikram Chowdary',
      source: 'PORTAL',
      sourceLabel: 'Property portal enquiry',
      stage: 'INTERESTED',
      priority: 'WARM',
      requirement: {
        budgetMin: 50 * LAKH,
        budgetMax: 65 * LAKH,
        preferredLocations: ['Outer Ring Growth Zone', 'Bangalore Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 240,
        areaMaxSqYd: 360,
        purpose: 'INVESTMENT',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: false,
      },
      tags: ['Investor', 'Comparing projects'],
      shortlistedPlotIds: [],
    },
    {
      ...base(6),
      fullName: 'Priya Nair',
      email: 'priya.nair@example.com',
      source: 'WHATSAPP',
      sourceLabel: 'Inbound WhatsApp',
      stage: 'CONTACTED',
      priority: 'NORMAL',
      requirement: {
        budgetMin: 30 * LAKH,
        budgetMax: 40 * LAKH,
        preferredLocations: ['Bangalore Highway', 'Hyderabad Highway'],
        propertyTypes: ['PLOT'],
        purpose: 'SELF_USE',
        purchaseTimeline: '3_6_MONTHS',
      },
      tags: [],
      shortlistedPlotIds: [],
    },
    {
      ...base(7),
      fullName: 'Arjun Patel',
      email: 'arjun.patel@example.com',
      source: 'REFERRAL',
      sourceLabel: 'Referred by a channel partner',
      stage: 'BOOKING',
      priority: 'HOT',
      requirement: {
        budgetMin: 60 * LAKH,
        budgetMax: 75 * LAKH,
        preferredLocations: ['Outer Ring Growth Zone'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 300,
        areaMaxSqYd: 360,
        purpose: 'INVESTMENT',
        purchaseTimeline: '0_30_DAYS',
        loanRequired: true,
      },
      tags: ['Ready to book', 'Loan in process'],
      shortlistedPlotIds: [picks.arjunHeldPlot.id],
    },
    {
      ...base(8),
      fullName: 'Kavitha Menon',
      email: 'kavitha.menon@example.com',
      source: 'REFERRAL',
      sourceLabel: 'Referred by a past customer',
      stage: 'WON',
      priority: 'NORMAL',
      requirement: {
        budgetMin: 42 * LAKH,
        budgetMax: 50 * LAKH,
        preferredLocations: ['Bangalore Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 240,
        areaMaxSqYd: 267,
        preferredFacing: ['EAST'],
        purpose: 'SELF_USE',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: true,
      },
      tags: ['Booked'],
      shortlistedPlotIds: [picks.kavithaBookedPlot.id],
      bookedPlotId: picks.kavithaBookedPlot.id,
    },
    {
      ...base(9),
      fullName: 'Suresh Babu Naidu',
      source: 'GOOGLE_ADS',
      sourceLabel: 'Google search · open plots',
      stage: 'LOST',
      priority: 'COLD',
      requirement: {
        budgetMin: 20 * LAKH,
        budgetMax: 30 * LAKH,
        preferredLocations: ['Hyderabad Highway'],
        propertyTypes: ['PLOT'],
        purpose: 'SELF_USE',
        purchaseTimeline: '3_6_MONTHS',
      },
      tags: ['Lost'],
      shortlistedPlotIds: [],
      lostReason: 'Location too far from workplace; bought a plot elsewhere.',
    },
    {
      ...base(10),
      fullName: 'Deepika Rao',
      email: 'deepika.rao@example.com',
      source: 'WALK_IN',
      sourceLabel: 'Walk-in at site office',
      stage: 'VISIT',
      priority: 'WARM',
      requirement: {
        budgetMin: 45 * LAKH,
        budgetMax: 60 * LAKH,
        preferredLocations: ['Bangalore Highway', 'Outer Ring Growth Zone'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 200,
        areaMaxSqYd: 300,
        preferredFacing: ['EAST'],
        purpose: 'SELF_USE',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: true,
      },
      tags: ['East facing'],
      shortlistedPlotIds: [],
    },
    {
      ...base(11),
      fullName: 'Imran Qureshi',
      email: 'imran.qureshi@example.com',
      source: 'META_ADS',
      sourceLabel: 'Meta · Investor campaign',
      stage: 'QUALIFIED',
      priority: 'HOT',
      requirement: {
        budgetMin: 55 * LAKH,
        budgetMax: 70 * LAKH,
        preferredLocations: ['Airport Corridor'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 200,
        areaMaxSqYd: 260,
        purpose: 'INVESTMENT',
        purchaseTimeline: '0_30_DAYS',
        loanRequired: false,
      },
      tags: ['Investor', 'Prefers evening calls'],
      shortlistedPlotIds: [],
    },
    {
      ...base(12),
      fullName: 'Lakshmi Prasanna',
      email: 'lakshmi.prasanna@example.com',
      source: 'WEBSITE',
      sourceLabel: 'Website enquiry form',
      stage: 'INTERESTED',
      priority: 'NORMAL',
      requirement: {
        budgetMin: 20 * LAKH,
        budgetMax: 28 * LAKH,
        preferredLocations: ['Hyderabad Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 167,
        areaMaxSqYd: 200,
        purpose: 'SELF_USE',
        purchaseTimeline: '6_PLUS_MONTHS',
        loanRequired: true,
      },
      tags: ['Long horizon'],
      shortlistedPlotIds: [],
    },
    {
      ...base(13),
      fullName: 'Harish Goud',
      source: 'MANUAL',
      sourceLabel: 'Met at a property expo',
      stage: 'NEW',
      priority: 'WARM',
      // Deliberately sparse: budget and timeline not yet captured.
      requirement: { preferredLocations: ['Outer Ring Growth Zone'], propertyTypes: ['PLOT'] },
      tags: ['Expo lead'],
      shortlistedPlotIds: [],
    },
    {
      ...base(14),
      fullName: 'Nikhil Agarwal',
      email: 'nikhil.agarwal@example.com',
      source: 'PORTAL',
      sourceLabel: 'Property portal enquiry',
      stage: 'NEGOTIATION',
      priority: 'WARM',
      requirement: {
        budgetMin: 1 * CRORE,
        budgetMax: Math.round(1.3 * CRORE),
        preferredLocations: ['Airport Corridor'],
        propertyTypes: ['PLOT', 'VILLA'],
        areaMinSqYd: 400,
        areaMaxSqYd: 500,
        purpose: 'INVESTMENT',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: false,
      },
      tags: ['Comparing villa project'],
      shortlistedPlotIds: [],
    },
    {
      ...base(15),
      fullName: 'Swathi Kumari',
      email: 'swathi.kumari@example.com',
      source: 'META_ADS',
      sourceLabel: 'Meta · Highway plots campaign',
      stage: 'CONTACTED',
      priority: 'COLD',
      requirement: {
        budgetMin: 28 * LAKH,
        budgetMax: 38 * LAKH,
        preferredLocations: ['Bangalore Highway', 'Hyderabad Highway'],
        propertyTypes: ['PLOT'],
        purpose: 'SELF_USE',
        purchaseTimeline: '6_PLUS_MONTHS',
      },
      tags: ['Low response'],
      shortlistedPlotIds: [],
    },
    {
      ...base(16),
      fullName: 'Rohit Bansal',
      email: 'rohit.bansal@example.com',
      source: 'GOOGLE_ADS',
      sourceLabel: 'Google search · Cedar Enclave',
      stage: 'VISIT',
      priority: 'HOT',
      requirement: {
        budgetMin: 48 * LAKH,
        budgetMax: 58 * LAKH,
        preferredLocations: ['Outer Ring Growth Zone'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 240,
        areaMaxSqYd: 300,
        purpose: 'SELF_USE',
        purchaseTimeline: '0_30_DAYS',
        loanRequired: true,
      },
      tags: ['Ready this month'],
      shortlistedPlotIds: [],
    },
    {
      ...base(17),
      fullName: 'Pooja Deshmukh',
      email: 'pooja.deshmukh@example.com',
      source: 'WEBSITE',
      sourceLabel: 'Website enquiry form',
      stage: 'INTERESTED',
      priority: 'WARM',
      requirement: {
        budgetMin: 40 * LAKH,
        budgetMax: 50 * LAKH,
        preferredLocations: ['Bangalore Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 200,
        areaMaxSqYd: 240,
        preferredFacing: ['NORTH', 'EAST'],
        purpose: 'SELF_USE',
        purchaseTimeline: '1_3_MONTHS',
        loanRequired: true,
      },
      tags: ['Shortlist sent'],
      shortlistedPlotIds: [picks.poojaPlot.id],
    },
    {
      ...base(18),
      fullName: 'Sandeep Yadav',
      source: 'WALK_IN',
      sourceLabel: 'Walk-in at site office',
      stage: 'QUALIFIED',
      priority: 'NORMAL',
      requirement: {
        budgetMin: 32 * LAKH,
        budgetMax: 42 * LAKH,
        preferredLocations: ['Hyderabad Highway', 'Bangalore Highway'],
        propertyTypes: ['PLOT'],
        areaMinSqYd: 200,
        areaMaxSqYd: 267,
        purpose: 'SELF_USE',
        purchaseTimeline: '3_6_MONTHS',
      },
      tags: [],
      shortlistedPlotIds: [],
    },
  ];
}

/**
 * Completes each blueprint into a full Lead by deriving created/updated/last-activity from the
 * timeline, next action from open tasks, note count from NOTE events and unread count from the
 * conversation. Throws if a lead has no LEAD_CREATED event — that would be a seed bug.
 */
export function finalizeLeads(
  blueprints: readonly LeadBlueprint[],
  tables: {
    tasks: readonly Task[];
    timeline: readonly TimelineEvent[];
    conversations: readonly Conversation[];
  },
): Lead[] {
  return blueprints.map((bp) => {
    const created = tables.timeline.find((e) => e.leadId === bp.id && e.type === 'LEAD_CREATED');
    if (!created) throw new Error(`Seed lead ${bp.id} has no LEAD_CREATED timeline event`);

    const lastActivityAt = deriveLastActivityAt(tables.timeline, bp.id) ?? created.occurredAt;
    return {
      ...bp,
      createdAt: created.occurredAt,
      updatedAt: lastActivityAt,
      lastActivityAt,
      ...deriveNextAction(tables.tasks, bp.id),
      notesCount: tables.timeline.filter((e) => e.leadId === bp.id && e.type === 'NOTE').length,
      unreadMessages: tables.conversations.find((c) => c.leadId === bp.id)?.unreadCount ?? 0,
    };
  });
}
