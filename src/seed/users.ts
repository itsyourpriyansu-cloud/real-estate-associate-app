import type { User } from '@/domain';

import { ASSOCIATE_ID, ASSOCIATE_NAME, CLIENT_ID, TEAM_LEAD_ID, memberId } from './ids';
import type { SeedTime } from './time';

export const TEAM_NAME = 'YHIPL2';

interface MemberBlueprint {
  n: number;
  fullName: string;
  /**
   * Same team: 0 = the demo associate, -1 = the team lead, otherwise another member's `n`.
   * Other team: 0 = no sponsor (the team's root), otherwise another member's `n`.
   */
  sponsor: number;
  designation: string;
  joinedDaysAgo: number;
  team: string;
  active?: false;
}

const SPONSOR_ME = 0;
const SPONSOR_LEAD = -1;

/**
 * The downline under the demo associate (members 1–9: four direct, four at level 2, one at
 * level 3), five more members of the same team under the team lead (10–14), and two members of a
 * different team (15–16). All names, numbers and addresses are synthetic.
 */
const MEMBERS: readonly MemberBlueprint[] = [
  {
    n: 1,
    fullName: 'Vikram Naidu',
    sponsor: SPONSOR_ME,
    designation: 'Senior Associate',
    joinedDaysAgo: 320,
    team: TEAM_NAME,
  },
  {
    n: 2,
    fullName: 'Deepa Krishnan',
    sponsor: SPONSOR_ME,
    designation: 'Associate',
    joinedDaysAgo: 290,
    team: TEAM_NAME,
  },
  {
    n: 3,
    fullName: 'Sanjay Mehta',
    sponsor: SPONSOR_ME,
    designation: 'Associate',
    joinedDaysAgo: 210,
    team: TEAM_NAME,
  },
  {
    n: 4,
    fullName: 'Lakshmi Prasad',
    sponsor: SPONSOR_ME,
    designation: 'Associate',
    joinedDaysAgo: 150,
    team: TEAM_NAME,
  },
  {
    n: 5,
    fullName: 'Rohit Chandra',
    sponsor: 1,
    designation: 'Associate',
    joinedDaysAgo: 240,
    team: TEAM_NAME,
  },
  {
    n: 6,
    fullName: 'Fatima Sheikh',
    sponsor: 1,
    designation: 'Associate',
    joinedDaysAgo: 120,
    team: TEAM_NAME,
  },
  {
    n: 7,
    fullName: 'Kiran Babu',
    sponsor: 2,
    designation: 'Associate',
    joinedDaysAgo: 95,
    team: TEAM_NAME,
  },
  {
    n: 8,
    fullName: 'Harsha Vardhan',
    sponsor: 5,
    designation: 'Associate',
    joinedDaysAgo: 60,
    team: TEAM_NAME,
  },
  {
    n: 9,
    fullName: 'Pallavi Joshi',
    sponsor: 4,
    designation: 'Associate',
    joinedDaysAgo: 45,
    team: TEAM_NAME,
    active: false,
  },
  {
    n: 10,
    fullName: 'Naveen Kumar',
    sponsor: SPONSOR_LEAD,
    designation: 'Senior Associate',
    joinedDaysAgo: 340,
    team: TEAM_NAME,
  },
  {
    n: 11,
    fullName: 'Swetha Pillai',
    sponsor: SPONSOR_LEAD,
    designation: 'Associate',
    joinedDaysAgo: 260,
    team: TEAM_NAME,
  },
  {
    n: 12,
    fullName: 'Imran Qureshi',
    sponsor: 10,
    designation: 'Associate',
    joinedDaysAgo: 180,
    team: TEAM_NAME,
  },
  {
    n: 13,
    fullName: 'Divya Narayan',
    sponsor: 10,
    designation: 'Associate',
    joinedDaysAgo: 100,
    team: TEAM_NAME,
  },
  {
    n: 14,
    fullName: 'Prakash Rao',
    sponsor: 11,
    designation: 'Associate',
    joinedDaysAgo: 70,
    team: TEAM_NAME,
  },
  {
    n: 15,
    fullName: 'Gopal Verma',
    sponsor: 0,
    designation: 'Senior Associate',
    joinedDaysAgo: 380,
    team: 'YHIPL1',
  },
  {
    n: 16,
    fullName: 'Rekha Bansal',
    sponsor: 15,
    designation: 'Associate',
    joinedDaysAgo: 200,
    team: 'YHIPL1',
  },
];

/** Ids of users who can hold a sale, in a fixed rotation (see `buildSales`). */
export const SELLING_USER_IDS: readonly string[] = [
  ASSOCIATE_ID,
  memberId(1),
  ASSOCIATE_ID,
  memberId(5),
  memberId(2),
  memberId(10),
  ASSOCIATE_ID,
  memberId(6),
  memberId(11),
  memberId(3),
  ASSOCIATE_ID,
  memberId(15),
  memberId(4),
  memberId(7),
  memberId(12),
  ASSOCIATE_ID,
  memberId(16),
  memberId(9),
  memberId(8),
  memberId(13),
];

function memberUser(t: SeedTime, bp: MemberBlueprint): User {
  const isOtherTeam = bp.team !== TEAM_NAME;
  const sponsorId = isOtherTeam
    ? bp.sponsor === 0
      ? undefined
      : memberId(bp.sponsor)
    : bp.sponsor === SPONSOR_ME
      ? ASSOCIATE_ID
      : bp.sponsor === SPONSOR_LEAD
        ? TEAM_LEAD_ID
        : memberId(bp.sponsor);
  const slug = bp.fullName.toLowerCase().replace(/[^a-z]+/g, '.');
  return {
    id: memberId(bp.n),
    role: 'ASSOCIATE',
    fullName: bp.fullName,
    phone: `+9198765${String(bp.n * 7 + 10).padStart(5, '0')}`,
    email: `${slug}@example.com`,
    associateCode: `${bp.team === TEAM_NAME ? 'YH-APL2' : 'YH-APL1'}-${String(1050 + bp.n).padStart(4, '0')}`,
    designation: bp.designation,
    teamName: bp.team,
    ...(sponsorId ? { sponsorId } : {}),
    joinedAt: t.at(-bp.joinedDaysAgo, '10:00'),
    status: bp.active === false ? 'INACTIVE' : 'ACTIVE',
  };
}

/**
 * The prototype login (+91 9876543210) resolves to the associate; Simple Login uses the client
 * (+91 9876500100). All phone numbers and emails in the seed are synthetic (example.com addresses,
 * sequential numbers) — no real customer data. `PROTOTYPE_ACCOUNTS` (constants) lists the same
 * numbers and a test keeps the two in step.
 *
 * Order matters: the mock's `currentAssociate` is the first ASSOCIATE, so the demo associate stays first.
 */
export function buildUsers(t: SeedTime): User[] {
  return [
    {
      id: ASSOCIATE_ID,
      role: 'ASSOCIATE',
      fullName: ASSOCIATE_NAME,
      phone: '+919876543210',
      email: 'raghunath.reddy@example.com',
      associateCode: 'YH-APL2-1048',
      designation: 'Senior Associate',
      teamName: TEAM_NAME,
      sponsorId: TEAM_LEAD_ID,
      joinedAt: t.at(-540, '10:00'),
      status: 'ACTIVE',
      reraRegistration: 'DEMO-RERA-ASSOC-1048',
    },
    {
      id: TEAM_LEAD_ID,
      role: 'TEAM_LEAD',
      fullName: 'Meenakshi Sundaram',
      phone: '+919876500001',
      email: 'meenakshi.sundaram@example.com',
      associateCode: 'YH-APL2-0007',
      designation: 'Team Lead',
      teamName: TEAM_NAME,
      joinedAt: t.at(-900, '10:00'),
      status: 'ACTIVE',
      reraRegistration: 'DEMO-RERA-ASSOC-0007',
    },
    {
      id: CLIENT_ID,
      role: 'CLIENT',
      fullName: 'Suresh Nair',
      phone: '+919876500100',
      email: 'suresh.nair@example.com',
      associateCode: 'CLIENT-0001',
      designation: 'Client',
      joinedAt: t.at(-30, '10:00'),
      status: 'ACTIVE',
    },
    ...MEMBERS.map((bp) => memberUser(t, bp)),
  ];
}
