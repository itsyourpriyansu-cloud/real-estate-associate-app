import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/prototype';
import { prototypeAuth, type AuthResult } from '@/services/auth';
import { storage } from '@/services/storage';

/**
 * Who is using the app. `none` sees only the public Home and the login screen; `guest` sees Our
 * Projects; `associate` sees the dashboard. It is session state only — a kind and a phone number,
 * never a user record. Profile data comes from `UserRepository`.
 */
export type Session =
  | { kind: 'none' }
  | { kind: 'guest' }
  | { kind: 'associate'; phone: string };

export type SessionKind = Session['kind'];

const SIGNED_OUT: Session = { kind: 'none' };

interface AuthState {
  session: Session;
  /** Phone awaiting OTP verification. Not persisted. */
  pendingPhone: string | null;
  requestOtp: (phoneInput: string) => Promise<AuthResult>;
  verifyOtp: (code: string) => Promise<AuthResult>;
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
          set({ session: { kind: 'associate', phone: pendingPhone }, pendingPhone: null });
        }
        return result;
      },

      continueAsGuest: () => set({ session: { kind: 'guest' }, pendingPhone: null }),

      signOut: () => set({ session: SIGNED_OUT, pendingPhone: null }),
    }),
    {
      name: STORAGE_KEYS.auth,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ session: state.session }),
      migrate: (persisted, version) =>
        version < PERSIST_VERSION ? migrateSession(persisted) : (persisted as AuthState),
    },
  ),
);
