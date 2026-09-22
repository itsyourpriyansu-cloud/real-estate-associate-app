import type { Href } from 'expo-router';

import type { SessionKind } from '@/store/authStore';

/** The route groups in `app/` and whether a session may see each (docs/SCREEN_MAP.md). */
export interface SessionAccess {
  /** `(public)`: Home and the login screen. Signed out only. */
  public: boolean;
  /** `(guest)`: the guest hub. Guests only. */
  guest: boolean;
  /** `(associate)`: the dashboard and its sections. Associates only. */
  associate: boolean;
  /** `projects/**`, `plots/**`, `prototype-controls` — every session except signed out. */
  shared: boolean;
}

const ACCESS: Record<SessionKind, SessionAccess> = {
  none: { public: true, guest: false, associate: false, shared: false },
  guest: { public: false, guest: true, associate: false, shared: true },
  associate: { public: false, guest: false, associate: true, shared: true },
};

/** Which groups exist for a session. Drives the `Stack.Protected` guards in the root layout. */
export const accessFor = (kind: SessionKind): SessionAccess => ACCESS[kind];

const LANDING: Record<SessionKind, Href> = {
  none: '/home',
  guest: '/guest-home',
  associate: '/dashboard',
};

/** Where each kind of session starts; the single place that maps a session to a landing screen. */
export const landingFor = (kind: SessionKind): Href => LANDING[kind];
