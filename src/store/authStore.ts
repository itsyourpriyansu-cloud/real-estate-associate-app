import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_COUNTRY_CODE, PROTOTYPE_ADMIN_PHONE, STORAGE_KEYS } from '@/constants/prototype';
import { setCurrentSessionPhone } from '@/repositories';
import { prototypeAuth, type AuthResult } from '@/services/auth';
import { storage } from '@/services/storage';

/**
 * Who is using the app. `none` sees only the public Home and the login screens; `guest` sees Our
 * Projects; `associate` sees the dashboard; `admin` sees the admin dashboard (reached only via a
 * hidden route, never advertised on the public Home). It is session state only — a kind and a
 * phone number where relevant, never a user record. Profile data comes from `UserRepository`.
 */
export type Session =
  | { kind: 'none' }
  | { kind: 'guest' }
  | { kind: 'associate'; phone: string }
  | { kind: 'admin' };

export type SessionKind = Session['kind'];

const SIGNED_OUT: Session = { kind: 'none' };
const ADMIN_PHONE_E164 = `${DEFAULT_COUNTRY_CODE}${PROTOTYPE_ADMIN_PHONE}`;

interface AuthState {
  session: Session;
  /** Phone awaiting associate-login OTP verification. Not persisted. */
  pendingPhone: string | null;
  /** Phone awaiting admin-login OTP verification. Not persisted. */
  pendingAdminPhone: string | null;
  requestOtp: (phoneInput: string) => Promise<AuthResult>;
  verifyOtp: (code: string) => Promise<AuthResult>;
  /** Admin login: same fixed demo OTP, but only the exact demo admin number is accepted. */
  requestAdminOtp: (phoneInput: string) => Promise<AuthResult>;
  verifyAdminOtp: (code: string) => Promise<AuthResult>;
  /** Guest Login: no credentials, browse Our Projects. */
  continueAsGuest: () => void;
  signOut: () => void;
}

/** Selector helpers, so guards and redirects read one field instead of re-deriving it. */
export const selectSessionKind = (state: Pick<AuthState, 'session'>): SessionKind =>
  state.session.kind;

/** Persist version 2 replaced `{ status, phone }` with `{ session }`. */
const PERSIST_VERSION = 2;

function migrateSession(persisted: unknown): Pick<AuthState, 'session'> {
  const legacy = persisted as { status?: unknown; phone?: unknown } | null;
  if (legacy?.status === 'signedIn' && typeof legacy.phone === 'string') {
    return { session: { kind: 'associate', phone: legacy.phone } };
  }
  return { session: SIGNED_OUT };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: SIGNED_OUT,
      pendingPhone: null,
      pendingAdminPhone: null,

      async requestOtp(phoneInput) {
        const result = await prototypeAuth.requestOtp(phoneInput);
        if (result.ok) {
          set({ pendingPhone: prototypeAuth.normalizePhone(phoneInput) });
        }
        return result;
      },

      async verifyOtp(code) {
        const { pendingPhone } = get();
        if (!pendingPhone) return { ok: false, error: 'NO_PENDING_PHONE' };
        const result = await prototypeAuth.verifyOtp(code);
        if (result.ok) {
          setCurrentSessionPhone(pendingPhone);
          set({ session: { kind: 'associate', phone: pendingPhone }, pendingPhone: null });
        }
        return result;
      },

      async requestAdminOtp(phoneInput) {
        const normalized = prototypeAuth.normalizePhone(phoneInput);
        if (normalized !== ADMIN_PHONE_E164) return { ok: false, error: 'INVALID_PHONE' };
        const result = await prototypeAuth.requestOtp(phoneInput);
        if (result.ok) {
          set({ pendingAdminPhone: normalized });
        }
        return result;
      },

      async verifyAdminOtp(code) {
        const { pendingAdminPhone } = get();
        if (!pendingAdminPhone) return { ok: false, error: 'NO_PENDING_PHONE' };
        const result = await prototypeAuth.verifyOtp(code);
        if (result.ok) {
          // The admin session carries no phone (see `Session`'s doc comment), but the CEO's seeded
          // `User` shares this number, so the mock can still resolve "who is signed in" for it.
          setCurrentSessionPhone(pendingAdminPhone);
          set({ session: { kind: 'admin' }, pendingAdminPhone: null });
        }
        return result;
      },

      continueAsGuest: () => {
        setCurrentSessionPhone(null);
        set({ session: { kind: 'guest' }, pendingPhone: null });
      },

      signOut: () => {
        setCurrentSessionPhone(null);
        set({ session: SIGNED_OUT, pendingPhone: null, pendingAdminPhone: null });
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ session: state.session }),
      migrate: (persisted, version) =>
        version < PERSIST_VERSION ? migrateSession(persisted) : (persisted as AuthState),
      // The mock's "current phone" is in-memory only, so a session restored from storage on app
      // start must re-sync it — otherwise `getCurrent()` would not resolve after a restart.
      onRehydrateStorage: () => (state) => {
        if (state?.session.kind === 'associate') setCurrentSessionPhone(state.session.phone);
      },
    },
  ),
);
