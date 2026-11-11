import type { AppRouter } from '@starter/api';
import type { AuthErrorReason } from '@starter/common';
import { TRPCClientError } from '@trpc/client';

/** Every message the auth screens can show for a failed call. */
export type AuthErrorMessage = AuthErrorReason | 'NETWORK' | 'UNKNOWN';

/** Narrows to an error from our API, with its typed `data`. */
const isApiError = (error: unknown): error is TRPCClientError<AppRouter> =>
  error instanceof TRPCClientError;

/** Picks the message for a failed auth call: the API's reason, or why it never answered. */
export function authErrorMessage(error: unknown): AuthErrorMessage {
  if (!isApiError(error)) return 'UNKNOWN';
  if (error.data?.reason) return error.data.reason;

  // No response at all: offline, or the API is not running.
  return error.data === undefined ? 'NETWORK' : 'UNKNOWN';
}

/** For `EMAIL_NOT_VERIFIED`: seconds before the app may ask for another code. */
export function errorResendInSeconds(error: unknown): number | null {
  return isApiError(error) ? (error.data?.resendInSeconds ?? null) : null;
}
