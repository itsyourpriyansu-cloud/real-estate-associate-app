import type { User } from '@/domain';

import type { UserRepository } from '../contracts';
import type { MockContext } from './MockContext';
import { currentAssociate } from './effects';

export class MockUserRepository implements UserRepository {
  constructor(private readonly ctx: MockContext) {}

  /** The mock dataset has a single associate; an API implementation resolves this from the auth token. */
  getCurrent(): Promise<User | null> {
    return this.ctx.read((data) => currentAssociate(data));
  }

  getById(id: string): Promise<User | null> {
    return this.ctx.read((data) => data.users.find((u) => u.id === id) ?? null);
  }

  getByPhone(phone: string): Promise<User | null> {
    return this.ctx.read((data) => data.users.find((u) => u.phone === phone) ?? null);
  }
}
