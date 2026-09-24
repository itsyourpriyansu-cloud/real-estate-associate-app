import type { User } from '@/domain';

import type { UserRepository } from '../contracts';
import type { MockContext } from './MockContext';
import { currentUserOrNull } from './effects';

export class MockUserRepository implements UserRepository {
  constructor(private readonly ctx: MockContext) {}

  /** Resolved by the session's phone; an API implementation resolves this from the auth token. */
  getCurrent(): Promise<User | null> {
    const phone = this.ctx.currentPhone();
    return this.ctx.read((data) => currentUserOrNull(data, phone));
  }

  getById(id: string): Promise<User | null> {
    return this.ctx.read((data) => data.users.find((u) => u.id === id) ?? null);
  }

  getByPhone(phone: string): Promise<User | null> {
    return this.ctx.read((data) => data.users.find((u) => u.phone === phone) ?? null);
  }
}
