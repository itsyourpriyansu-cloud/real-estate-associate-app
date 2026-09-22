import { z } from 'zod';

import { DEFAULT_COUNTRY_CODE, PROTOTYPE_CREDENTIALS } from '@/constants/prototype';

/** 10-digit Indian mobile number (starts 6–9). Exposed as a schema so forms can reuse it. */
export const indianMobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

export type AuthError = 'INVALID_PHONE' | 'INVALID_OTP' | 'NO_PENDING_PHONE';
export type AuthResult = { ok: true } | { ok: false; error: AuthError };

/**
 * Authentication seam (maps to /api/v1/auth/*). Phase 1 ships a PROTOTYPE implementation only:
 * any valid 10-digit number is accepted and the OTP is fixed. It is not secure and makes no
 * production claims. The real FastAPI implementation replaces `prototypeAuth` behind this interface.
 */
export interface AuthService {
  /** Normalises input to E.164, or null if it is not a valid number. */
  normalizePhone(input: string): string | null;
  requestOtp(input: string): Promise<AuthResult>;
  verifyOtp(code: string): Promise<AuthResult>;
}

export const prototypeAuth: AuthService = {
  normalizePhone(input) {
    const digits = input.replace(/\D/g, '').slice(-10);
    return indianMobileSchema.safeParse(digits).success ? `${DEFAULT_COUNTRY_CODE}${digits}` : null;
  },
  requestOtp(input) {
    const phone = prototypeAuth.normalizePhone(input);
    return Promise.resolve(phone === null ? { ok: false, error: 'INVALID_PHONE' } : { ok: true });
  },
  verifyOtp(code) {
    const ok = code === PROTOTYPE_CREDENTIALS.otp;
    return Promise.resolve(ok ? { ok: true } : { ok: false, error: 'INVALID_OTP' });
  },
};
