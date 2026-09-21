import { z } from 'zod';

import {
  DEFAULT_COUNTRY_CODE,
  PROTOTYPE_ACCOUNTS,
  PROTOTYPE_CREDENTIALS,
} from '@/constants/prototype';

/** 10-digit Indian mobile number (starts 6–9). Exposed as a schema so forms can reuse it. */
export const indianMobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

/** Which login screen a phone number is being used on. Guests have no credentials. */
export type LoginAs = 'associate' | 'client';

export type AuthError = 'INVALID_PHONE' | 'INVALID_OTP' | 'NO_PENDING_PHONE' | 'WRONG_ROLE';
export type AuthResult = { ok: true } | { ok: false; error: AuthError };

/**
 * Authentication seam (maps to /api/v1/auth/*). Phase 1 ships a PROTOTYPE implementation only:
 * any valid 10-digit number is accepted and the OTP is fixed. It is not secure and makes no
 * production claims. The real FastAPI implementation replaces `prototypeAuth` behind this interface.
 */
export interface AuthService {
  /** Normalises input to E.164, or null if it is not a valid number. */
  normalizePhone(input: string): string | null;
  /** The login a known number belongs to, or null when the number is not in the directory. */
  accountKind(phone: string): LoginAs | null;
  /** Rejects a known number used on the wrong login (`WRONG_ROLE`) before any code is "sent". */
  requestOtp(input: string, as: LoginAs): Promise<AuthResult>;
  verifyOtp(code: string): Promise<AuthResult>;
}

export const prototypeAuth: AuthService = {
  normalizePhone(input) {
    const digits = input.replace(/\D/g, '').slice(-10);
    return indianMobileSchema.safeParse(digits).success ? `${DEFAULT_COUNTRY_CODE}${digits}` : null;
  },
  accountKind(phone) {
    return PROTOTYPE_ACCOUNTS.find((account) => account.phone === phone)?.kind ?? null;
  },
  requestOtp(input, as) {
    const phone = prototypeAuth.normalizePhone(input);
    if (phone === null) return Promise.resolve({ ok: false, error: 'INVALID_PHONE' });
    const known = prototypeAuth.accountKind(phone);
    if (known !== null && known !== as) return Promise.resolve({ ok: false, error: 'WRONG_ROLE' });
    return Promise.resolve({ ok: true });
  },
  verifyOtp(code) {
    const ok = code === PROTOTYPE_CREDENTIALS.otp;
    return Promise.resolve(ok ? { ok: true } : { ok: false, error: 'INVALID_OTP' });
  },
};
