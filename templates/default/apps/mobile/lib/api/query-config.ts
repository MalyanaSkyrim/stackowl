import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export const defaultStaleTime = 2 * 60 * 1000; // 2 minutes - optimized for mobile
export const defaultGcTime = 5 * 60 * 1000; // 5 minutes (formerly cacheTime in v4)

/**
 * Extracts the HTTP status code from a BetterFetchError, Axios-like error, or custom
 * response object. Returns undefined for network errors, which carry no status.
 */
const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
    return (error as { status: number }).status;
  }

  if (
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    (error as { response: object | null }).response !== null &&
    'status' in (error as { response: { status?: unknown } }).response &&
    typeof (error as { response: { status: unknown } }).response.status === 'number'
  ) {
    return (error as { response: { status: number } }).response.status;
  }

  return undefined;
};

/**
 * Checks if an error represents an unauthorized (401) or forbidden (403) error
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  const status = getErrorStatus(error);

  if (status === 401 || status === 403) {
    return true;
  }

  // Check error message and statusText for unauthorized/forbidden keywords
  const message = error instanceof Error ? error.message : String(error);
  const statusText =
    typeof error === 'object' &&
    error !== null &&
    'statusText' in error &&
    typeof (error as { statusText: unknown }).statusText === 'string'
      ? (error as { statusText: string }).statusText
      : '';

  const combined = `${message} ${statusText}`.toLowerCase();
  return (
    combined.includes('401') ||
    combined.includes('403') ||
    combined.includes('unauthorized') ||
    combined.includes('forbidden')
  );
};

/**
 * Checks if an error means the current session can never succeed again, so the only
 * correct response is to sign the user out:
 * - 401 Unauthorized / 403 Forbidden (invalid or expired token)
 * - 404 USER_NOT_FOUND (the token verifies, but its account no longer exists)
 *
 * Deliberately narrower than "any 404" so a stray route-level 404 never logs users out.
 */
export const isInvalidSessionError = (error: unknown): boolean => {
  if (isUnauthorizedError(error)) {
    return true;
  }

  if (getErrorStatus(error) !== 404) {
    return false;
  }

  // BetterFetchError carries the parsed response body on `.error` → { message, code }
  const body = (error as { error?: { code?: unknown } | null })?.error;
  return typeof body === 'object' && body !== null && body.code === 'USER_NOT_FOUND';
};

/**
 * Smart retry function for queries:
 * - Never retries on 4xx client errors (401 Unauthorized, 403 Forbidden, 404 Not Found, etc.)
 * - Only retries up to 2 times on transient network errors or 5xx server errors
 */
export const defaultQueryRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 2) {
    return false;
  }

  const status = getErrorStatus(error);

  // Never retry client errors (400-499: 401 Unauthorized, 403 Forbidden, 404 Not Found, etc.)
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }

  // Also inspect error message and statusText for unauthorized/forbidden keywords
  if (isUnauthorizedError(error)) {
    return false;
  }

  return true;
};

export const defaultRetry = defaultQueryRetry;

export const createQueryOptions = <TData = unknown, TError = Error>(
  overrides?: Partial<UseQueryOptions<TData, TError>>
): Partial<UseQueryOptions<TData, TError>> => ({
  staleTime: defaultStaleTime,
  gcTime: defaultGcTime,
  retry: defaultRetry,
  ...overrides,
});

/**
 * Creates a retry function for mutations that only retries on network errors,
 * not on HTTP error responses (401, 409, 500, etc.)
 *
 * Network errors (DNS failures, connection timeouts) don't have a status code
 * HTTP errors (from better-fetch) have a status property
 */
export const createMutationRetry = <TError = Error>(): UseMutationOptions<
  unknown,
  TError,
  unknown
>['retry'] => {
  return (failureCount: number, error: TError) => {
    // Don't retry on HTTP errors (they have a status code)
    const statusValue =
      typeof error === 'object' && error !== null
        ? Object.getOwnPropertyDescriptor(error, 'status')?.value
        : undefined;
    if (typeof statusValue === 'number') {
      return false; // HTTP error (401, 409, 500, etc.) - don't retry
    }
    // Retry on network errors (DNS, connection failures, timeouts)
    return failureCount < 3;
  };
};
