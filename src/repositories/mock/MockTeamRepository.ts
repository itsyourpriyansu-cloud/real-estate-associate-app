import {
  addTeamMemberInputSchema,
  type AddTeamMemberInput,
  type TeamMember,
  type User,
} from '@/domain';

import type { TeamRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { currentAssociate, downlineOf } from './effects';
import { byIsoAsc, nextId } from './utils';

/** "YH-APL2-1048" → next free "YH-APL2-1049" for the sponsor's code prefix. */
function nextAssociateCode(users: readonly User[], sponsor: User): string {
  const prefix = sponsor.associateCode.replace(/-\d+$/, '');
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
    return this.ctx.read((data) =>
      downlineOf(data, currentAssociate(data).id)
        .sort((a, b) => a.level - b.level || byIsoAsc((e: { user: User }) => e.user.joinedAt)(a, b))
        .map(({ user, level }) => ({ ...user, level })),
    );
  }

  getMember(id: string): Promise<TeamMember | null> {
    return this.ctx.read((data) => {
      const entry = downlineOf(data, currentAssociate(data).id).find((e) => e.user.id === id);
      return entry ? { ...entry.user, level: entry.level } : null;
    });
  }

  addMember(input: AddTeamMemberInput): Promise<TeamMember> {
    const parsed = addTeamMemberInputSchema.safeParse(input);
    if (!parsed.success) {
      return this.ctx.write(() =>
        fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid team member'),
      );
    }
    const { fullName, phone, email, sponsorId } = parsed.data;

    return this.ctx.write((data, now) => {
      const me = currentAssociate(data);
      const downline = downlineOf(data, me.id);

      if (data.users.some((u) => u.phone === phone))
        fail('INVALID_INPUT', 'A user with this phone number already exists');

      const sponsor =
        !sponsorId || sponsorId === me.id
          ? me
          : (downline.find((e) => e.user.id === sponsorId)?.user ??
            fail('INVALID_INPUT', 'The sponsor must be you or someone in your team'));
      const level =
        sponsor.id === me.id ? 1 : (downline.find((e) => e.user.id === sponsor.id)?.level ?? 0) + 1;

      const member: User = {
        id: nextId(
          'usr_member',
          data.users.map((u) => u.id),
        ),
        role: 'ASSOCIATE',
        fullName,
        phone,
        ...(email ? { email } : {}),
        associateCode: nextAssociateCode(data.users, sponsor),
        designation: 'Associate',
        ...(me.teamName ? { teamName: me.teamName } : {}),
        sponsorId: sponsor.id,
        joinedAt: now.toISOString(),
        status: 'ACTIVE',
      };
      data.users.push(member);
      return { ...member, level };
    });
  }
}
