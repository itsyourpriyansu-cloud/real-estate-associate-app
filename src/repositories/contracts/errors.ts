/**
 * Errors every repository implementation (mock or API) must throw, so feature hooks and screens
 * can render recoverable states without knowing the transport.
 *
 *  OFFLINE        no connectivity            → "You're offline"
 *  SERVER_ERROR   5xx / unexpected failure    → "Couldn't load … Try again"
 *  NOT_FOUND      unknown id on a write       → navigate back / empty state
 *  INVALID_INPUT  rejected by validation      → inline form error
 *
 * `message` is for developers/logs only — UI copy is written per screen (spec §22). Raw messages
 * and stack traces are never shown to users.
 */
export type RepositoryErrorCode = 'OFFLINE' | 'SERVER_ERROR' | 'NOT_FOUND' | 'INVALID_INPUT';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }

  /** Offline and server errors are worth a "Try again"; the others are not. */
  get retryable(): boolean {
    return this.code === 'OFFLINE' || this.code === 'SERVER_ERROR';
  }
}

export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError;
}
