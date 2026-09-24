import {
  addTeamMemberInputSchema,
  type AddTeamMemberInput,
  type TeamMember,
  type User,
} from '@/domain';

import { ROLE_ID } from '@/seed/roles';

import type { TeamRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { currentAssociate, downlineOf, requireValidHierarchy } from './effects';
import { byIsoAsc, nextId } from './utils';

/** "YH-APL2-1048" → next free "YH-APL2-1049" for the manager's code prefix. */
function nextAssociateCode(users: readonly User[], manager: User): string {
  const prefix = manager.associateCode.replace(/-\d+$/, '');
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const highest = users.reduce((max, u) => {
    const match = pattern.exec(u.associateCode);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(4, '0')}`;
}

export class MockTeamRepository implements TeamRepository {
  constructor(private readonly ctx: MockContext) {}

  listMyTeam(): Promise<TeamMember[]> {
    const phone = this.ctx.currentPhone();
    return this.ctx.read((data) =>
      downlineOf(data, currentAssociate(data, phone).id)
        .sort((a, b) => a.level - b.level || byIsoAsc((e: { user: User }) => e.user.joinedAt)(a, b))
        .map(({ user, level }) => ({ ...user, level })),
    );
  }

  getMember(id: string): Promise<TeamMember | null> {
    const phone = this.ctx.currentPhone();
    return this.ctx.read((data) => {
      const entry = downlineOf(data, currentAssociate(data, phone).id).find(
        (e) => e.user.id === id,
      );
      return entry ? { ...entry.user, level: entry.level } : null;
    });
  }

  getMyTeamName(): Promise<string | null> {
    const phone = this.ctx.currentPhone();
    return this.ctx.read((data) => {
      const me = currentAssociate(data, phone);
      if (!me.teamId) return null;
      return data.teams.find((t) => t.id === me.teamId)?.name ?? null;
    });
  }

  addMember(input: AddTeamMemberInput): Promise<TeamMember> {
    const parsed = addTeamMemberInputSchema.safeParse(input);
    if (!parsed.success) {
      return this.ctx.write(() =>
        fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid team member'),
      );
    }
    const { fullName, phone: memberPhone, email, reportingManagerId } = parsed.data;
    const callerPhone = this.ctx.currentPhone();

    return this.ctx.write((data, now) => {
      const me = currentAssociate(data, callerPhone);
      // TODO(sub-phase 3): replace with `requirePermission(data, 'EMPLOYEE_CREATE')`.
      if (me.orgLevel !== 'SENIOR_ASSOCIATE')
        fail('INVALID_INPUT', 'Only a Senior Associate can add a team member');
      const downline = downlineOf(data, me.id);

      if (data.users.some((u) => u.phone === memberPhone))
        fail('INVALID_INPUT', 'A user with this phone number already exists');

      const manager =
        !reportingManagerId || reportingManagerId === me.id
          ? me
          : (downline.find((e) => e.user.id === reportingManagerId)?.user ??
            fail('INVALID_INPUT', 'The manager must be you or someone in your team'));
      requireValidHierarchy('JUNIOR_ASSOCIATE', manager.orgLevel);
      const level =
        manager.id === me.id
          ? 1
          : (downline.find((e) => e.user.id === manager.id)?.level ?? 0) + 1;

      const joinedAt = now.toISOString();
      const member: User = {
        id: nextId(
          'usr_member',
          data.users.map((u) => u.id),
        ),
        fullName,
        phone: memberPhone,
        ...(email ? { email } : {}),
        associateCode: nextAssociateCode(data.users, manager),
        roleId: ROLE_ID.juniorAssociate,
        orgLevel: 'JUNIOR_ASSOCIATE',
        designation: 'Junior Associate',
        ...(me.teamId ? { teamId: me.teamId } : {}),
        reportingManagerId: manager.id,
        joinedAt,
        status: 'ACTIVE',
        statusHistory: [{ status: 'ACTIVE', changedAt: joinedAt, changedByUserId: me.id }],
      };
      data.users.push(member);
      return { ...member, level };
    });
  }
}
