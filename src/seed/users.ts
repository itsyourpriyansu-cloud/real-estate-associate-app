import type { OrganizationLevel, User, UserStatus } from '@/domain';

import {
  ASSOCIATE_ID,
  ASSOCIATE_NAME,
  CEO_ID,
  MANAGEMENT_ID,
  MARKETING_HEAD_YHIPL1_ID,
  MARKETING_HEAD_YHIPL3_ID,
  TEAM_LEAD_ID,
  memberId,
} from './ids';
import { ROLE_ID } from './roles';
import { TEAM_ID } from './teams';
import type { SeedTime } from './time';

const ROLE_BY_LEVEL: Record<OrganizationLevel, string> = {
  CEO: ROLE_ID.ceo,
  MANAGEMENT: ROLE_ID.management,
  MARKETING_HEAD: ROLE_ID.marketingHead,
  SENIOR_ASSOCIATE: ROLE_ID.seniorAssociate,
  JUNIOR_ASSOCIATE: ROLE_ID.juniorAssociate,
};

const DESIGNATION_BY_LEVEL: Record<OrganizationLevel, string> = {
  CEO: 'CEO',
  MANAGEMENT: 'Management',
  MARKETING_HEAD: 'Marketing Head',
  SENIOR_ASSOCIATE: 'Senior Associate',
  JUNIOR_ASSOCIATE: 'Junior Associate',
};

interface MemberBlueprint {
  n: number;
  fullName: string;
  orgLevel: 'SENIOR_ASSOCIATE' | 'JUNIOR_ASSOCIATE';
  /** Resolved manager id — must satisfy `ALLOWED_MANAGER_LEVELS` (effects.ts). */
  reportingManagerId: string;
  joinedDaysAgo: number;
  teamId: string;
  codePrefix: string;
  active?: false;
}

/**
 * The downline under the demo associate (members 1–9), five more members of the same team under
 * the Marketing Head (10–14), two members of team YHIPL1 (15–16), and two members of the new team
 * YHIPL3 (17–18). Every `reportingManagerId` satisfies the strict CEO → Management → Marketing
 * Head → Senior Associate → Junior Associate chain (`ALLOWED_MANAGER_LEVELS`). All names, numbers
 * and addresses are synthetic.
 */
const MEMBERS: readonly MemberBlueprint[] = [
  {
    n: 1,
    fullName: 'Vikram Naidu',
    orgLevel: 'SENIOR_ASSOCIATE',
    reportingManagerId: TEAM_LEAD_ID,
    joinedDaysAgo: 320,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 2,
    fullName: 'Deepa Krishnan',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: ASSOCIATE_ID,
    joinedDaysAgo: 290,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 3,
    fullName: 'Sanjay Mehta',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: ASSOCIATE_ID,
    joinedDaysAgo: 210,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 4,
    fullName: 'Lakshmi Prasad',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: ASSOCIATE_ID,
    joinedDaysAgo: 150,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 5,
    fullName: 'Rohit Chandra',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(1),
    joinedDaysAgo: 240,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 6,
    fullName: 'Fatima Sheikh',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(1),
    joinedDaysAgo: 120,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 7,
    fullName: 'Kiran Babu',
    orgLevel: 'JUNIOR_ASSOCIATE',
    // Was under member 2 (a Junior Associate) — moved to a Senior Associate to satisfy the
    // strict hierarchy (a Junior Associate may not manage another Junior Associate).
    reportingManagerId: memberId(1),
    joinedDaysAgo: 95,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 8,
    fullName: 'Harsha Vardhan',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(1),
    joinedDaysAgo: 60,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 9,
    fullName: 'Pallavi Joshi',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: ASSOCIATE_ID,
    joinedDaysAgo: 45,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
    active: false,
  },
  {
    n: 10,
    fullName: 'Naveen Kumar',
    orgLevel: 'SENIOR_ASSOCIATE',
    reportingManagerId: TEAM_LEAD_ID,
    joinedDaysAgo: 340,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 11,
    fullName: 'Swetha Pillai',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: TEAM_LEAD_ID,
    joinedDaysAgo: 260,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 12,
    fullName: 'Imran Qureshi',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(10),
    joinedDaysAgo: 180,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 13,
    fullName: 'Divya Narayan',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(10),
    joinedDaysAgo: 100,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 14,
    fullName: 'Prakash Rao',
    orgLevel: 'JUNIOR_ASSOCIATE',
    // Was under member 11 (a Junior Associate) — moved for the same reason as member 7.
    reportingManagerId: memberId(10),
    joinedDaysAgo: 70,
    teamId: TEAM_ID.yhipl2,
    codePrefix: 'YH-APL2',
  },
  {
    n: 15,
    fullName: 'Gopal Verma',
    orgLevel: 'SENIOR_ASSOCIATE',
    reportingManagerId: MARKETING_HEAD_YHIPL1_ID,
    joinedDaysAgo: 380,
    teamId: TEAM_ID.yhipl1,
    codePrefix: 'YH-APL1',
  },
  {
    n: 16,
    fullName: 'Rekha Bansal',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: memberId(15),
    joinedDaysAgo: 200,
    teamId: TEAM_ID.yhipl1,
    codePrefix: 'YH-APL1',
  },
  {
    n: 17,
    fullName: 'Ibrahim Sheikh',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: MARKETING_HEAD_YHIPL3_ID,
    joinedDaysAgo: 150,
    teamId: TEAM_ID.yhipl3,
    codePrefix: 'YH-APL3',
  },
  {
    n: 18,
    fullName: 'Nandini Rao',
    orgLevel: 'JUNIOR_ASSOCIATE',
    reportingManagerId: MARKETING_HEAD_YHIPL3_ID,
    joinedDaysAgo: 90,
    teamId: TEAM_ID.yhipl3,
    codePrefix: 'YH-APL3',
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

function statusOf(active: false | undefined): UserStatus {
  return active === false ? 'INACTIVE' : 'ACTIVE';
}

function withHierarchyFields(params: {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  associateCode: string;
  orgLevel: OrganizationLevel;
  teamId?: string;
  reportingManagerId?: string;
  joinedAt: string;
  active?: false;
  reraRegistration?: string;
}): User {
  const status = statusOf(params.active);
  return {
    id: params.id,
    fullName: params.fullName,
    phone: params.phone,
    email: params.email,
    associateCode: params.associateCode,
    roleId: ROLE_BY_LEVEL[params.orgLevel],
    orgLevel: params.orgLevel,
    designation: DESIGNATION_BY_LEVEL[params.orgLevel],
    ...(params.teamId ? { teamId: params.teamId } : {}),
    ...(params.reportingManagerId ? { reportingManagerId: params.reportingManagerId } : {}),
    joinedAt: params.joinedAt,
    status,
    statusHistory: [
      {
        status,
        changedAt: params.joinedAt,
        changedByUserId: params.reportingManagerId ?? params.id,
      },
    ],
    ...(params.reraRegistration ? { reraRegistration: params.reraRegistration } : {}),
  };
}

function memberUser(t: SeedTime, bp: MemberBlueprint): User {
  const slug = bp.fullName.toLowerCase().replace(/[^a-z]+/g, '.');
  return withHierarchyFields({
    id: memberId(bp.n),
    fullName: bp.fullName,
    phone: `+9198765${String(bp.n * 7 + 10).padStart(5, '0')}`,
    email: `${slug}@example.com`,
    associateCode: `${bp.codePrefix}-${String(1050 + bp.n).padStart(4, '0')}`,
    orgLevel: bp.orgLevel,
    teamId: bp.teamId,
    reportingManagerId: bp.reportingManagerId,
    joinedAt: t.at(-bp.joinedDaysAgo, '10:00'),
    active: bp.active,
  });
}

/**
 * The prototype login (+91 9876543210) resolves to the demo associate; the same phone directory
 * (`PROTOTYPE_ACCOUNTS`) plus the CEO's number resolve every seeded org level, so signing in as
 * each one shows a distinct dashboard. All phone numbers and emails are synthetic.
 */
export function buildUsers(t: SeedTime): User[] {
  return [
    withHierarchyFields({
      id: CEO_ID,
      fullName: 'Priya Narasimhan',
      phone: '+919000000001',
      email: 'priya.narasimhan@example.com',
      associateCode: 'YH-EXEC-0001',
      orgLevel: 'CEO',
      joinedAt: t.at(-1200, '09:00'),
    }),
    withHierarchyFields({
      id: MANAGEMENT_ID,
      fullName: 'Arvind Subramanian',
      phone: '+919000000002',
      email: 'arvind.subramanian@example.com',
      associateCode: 'YH-EXEC-0002',
      orgLevel: 'MANAGEMENT',
      reportingManagerId: CEO_ID,
      joinedAt: t.at(-1100, '09:00'),
    }),
    withHierarchyFields({
      id: TEAM_LEAD_ID,
      fullName: 'Meenakshi Sundaram',
      phone: '+919876500001',
      email: 'meenakshi.sundaram@example.com',
      associateCode: 'YH-APL2-0007',
      orgLevel: 'MARKETING_HEAD',
      teamId: TEAM_ID.yhipl2,
      reportingManagerId: MANAGEMENT_ID,
      joinedAt: t.at(-900, '10:00'),
      reraRegistration: 'DEMO-RERA-ASSOC-0007',
    }),
    withHierarchyFields({
      id: MARKETING_HEAD_YHIPL1_ID,
      fullName: 'Ananya Iyer',
      phone: '+919000000003',
      email: 'ananya.iyer@example.com',
      associateCode: 'YH-APL1-0001',
      orgLevel: 'MARKETING_HEAD',
      teamId: TEAM_ID.yhipl1,
      reportingManagerId: MANAGEMENT_ID,
      joinedAt: t.at(-850, '10:00'),
    }),
    withHierarchyFields({
      id: MARKETING_HEAD_YHIPL3_ID,
      fullName: 'Suresh Pillai',
      phone: '+919000000004',
      email: 'suresh.pillai@example.com',
      associateCode: 'YH-APL3-0001',
      orgLevel: 'MARKETING_HEAD',
      teamId: TEAM_ID.yhipl3,
      reportingManagerId: MANAGEMENT_ID,
      joinedAt: t.at(-400, '10:00'),
    }),
    withHierarchyFields({
      id: ASSOCIATE_ID,
      fullName: ASSOCIATE_NAME,
      phone: '+919876543210',
      email: 'raghunath.reddy@example.com',
      associateCode: 'YH-APL2-1048',
      orgLevel: 'SENIOR_ASSOCIATE',
      teamId: TEAM_ID.yhipl2,
      reportingManagerId: TEAM_LEAD_ID,
      joinedAt: t.at(-540, '10:00'),
      reraRegistration: 'DEMO-RERA-ASSOC-1048',
    }),
    ...MEMBERS.map((bp) => memberUser(t, bp)),
  ];
}
