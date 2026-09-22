import {
  assignIncentiveInputSchema,
  type Admin,
  type AssignIncentiveInput,
  type AssociateIncentive,
  type User,
} from '@/domain';
import { SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';

import type { AdminRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { currentAdmin } from './effects';
import { nextId } from './utils';

export class MockAdminRepository implements AdminRepository {
  constructor(private readonly ctx: MockContext) {}

  getCurrentAdmin(): Promise<Admin> {
    return this.ctx.read((data) => currentAdmin(data));
  }

  listAssociates(): Promise<User[]> {
    return this.ctx.read((data) =>
      data.users
        .filter((u) => u.role === 'ASSOCIATE')
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)),
    );
  }

  promoteToSeniorAssociate(associateId: string): Promise<User> {
    return this.ctx.write((data) => {
      const user = data.users.find((u) => u.id === associateId && u.role === 'ASSOCIATE');
      if (!user) fail('NOT_FOUND', `Associate ${associateId} not found`);
      user.designation = SENIOR_ASSOCIATE_DESIGNATION;
      return user;
    });
  }

  getIncentiveFor(associateId: string): Promise<AssociateIncentive | null> {
    return this.ctx.read((data) => {
      if (!data.users.some((u) => u.id === associateId && u.role === 'ASSOCIATE'))
        fail('NOT_FOUND', `Associate ${associateId} not found`);
      return data.associateIncentives.find((i) => i.associateId === associateId) ?? null;
    });
  }

  assignIncentive(input: AssignIncentiveInput): Promise<AssociateIncentive> {
    const parsed = assignIncentiveInputSchema.safeParse(input);
    if (!parsed.success) {
      return this.ctx.write(() =>
        fail('INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Invalid incentive'),
      );
    }
    const { associateId, commissionRate, rewardPlotTarget } = parsed.data;

    return this.ctx.write((data, now) => {
      const associate = data.users.find((u) => u.id === associateId && u.role === 'ASSOCIATE');
      if (!associate) fail('NOT_FOUND', `Associate ${associateId} not found`);
      if (associate.designation !== SENIOR_ASSOCIATE_DESIGNATION)
        fail('INVALID_INPUT', 'Only a Senior Associate can have an incentive assigned');

      const admin = currentAdmin(data);
      const existing = data.associateIncentives.find((i) => i.associateId === associateId);
      const record: AssociateIncentive = {
        id: existing?.id ?? nextId('incentive', data.associateIncentives.map((i) => i.id)),
        associateId,
        commissionRate,
        rewardPlotTarget,
        assignedByAdminId: admin.id,
        assignedAt: now.toISOString(),
      };

      if (existing) {
        Object.assign(existing, record);
        return existing;
      }
      data.associateIncentives.push(record);
      return record;
    });
  }
}
