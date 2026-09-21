import type { User } from '@/domain';

/**
 * Maps to /api/v1/users/*. Authentication (OTP) is deliberately NOT here — it lives in
 * `src/services/auth.ts` and maps to /api/v1/auth/*.
 */
export interface UserRepository {
  /** GET /users/me — the signed-in associate, or null when signed out. */
  getCurrent(): Promise<User | null>;
  /** GET /users/{id} */
  getById(id: string): Promise<User | null>;
  /** Resolves a user by canonical E.164 phone. Used by the prototype sign-in only. */
  getByPhone(phone: string): Promise<User | null>;
}
