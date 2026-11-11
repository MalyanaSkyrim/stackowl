import { describe, expect, it } from 'vitest';
import { defaultQueryRetry, isInvalidSessionError, isUnauthorizedError } from './query-config';

describe('query-config retry & unauthorized handling', () => {
  describe('isUnauthorizedError', () => {
    it('identifies 401 status from BetterFetchError style object', () => {
      expect(isUnauthorizedError({ status: 401, statusText: 'Unauthorized' })).toBe(true);
    });

    it('identifies 403 status from response object', () => {
      expect(isUnauthorizedError({ response: { status: 403 } })).toBe(true);
    });

    it('identifies unauthorized keywords in Error message', () => {
      expect(isUnauthorizedError(new Error('Unauthorized access token'))).toBe(true);
      expect(isUnauthorizedError(new Error('Request failed with status code 401'))).toBe(true);
      expect(isUnauthorizedError(new Error('Forbidden: Access denied'))).toBe(true);
    });

    it('identifies statusText unauthorized', () => {
      expect(isUnauthorizedError({ statusText: 'Unauthorized' })).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      expect(isUnauthorizedError({ status: 500 })).toBe(false);
      expect(isUnauthorizedError({ status: 404 })).toBe(false);
      expect(isUnauthorizedError(new Error('Network request failed'))).toBe(false);
      expect(isUnauthorizedError(null)).toBe(false);
      expect(isUnauthorizedError(undefined)).toBe(false);
    });
  });

  describe('isInvalidSessionError', () => {
    it('treats 401/403 as an invalid session', () => {
      expect(isInvalidSessionError({ status: 401, statusText: 'Unauthorized' })).toBe(true);
      expect(isInvalidSessionError({ response: { status: 403 } })).toBe(true);
    });

    it('treats 404 USER_NOT_FOUND as an invalid session', () => {
      // Shape of a BetterFetchError: status + parsed response body on `.error`
      expect(
        isInvalidSessionError({
          status: 404,
          statusText: 'Not Found',
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        })
      ).toBe(true);
    });

    it('does not sign the user out on an unrelated 404', () => {
      expect(isInvalidSessionError({ status: 404, statusText: 'Not Found' })).toBe(false);
      expect(
        isInvalidSessionError({
          status: 404,
          error: { message: 'Item not found', code: 'ITEM_NOT_FOUND' },
        })
      ).toBe(false);
      expect(isInvalidSessionError({ status: 404, error: null })).toBe(false);
    });

    it('does not sign the user out on offline or server errors', () => {
      expect(isInvalidSessionError(new Error('Network request failed'))).toBe(false);
      expect(isInvalidSessionError({ status: 500 })).toBe(false);
      expect(isInvalidSessionError(null)).toBe(false);
      expect(isInvalidSessionError(undefined)).toBe(false);
    });
  });

  describe('defaultQueryRetry', () => {
    it('never retries on 401 Unauthorized', () => {
      const error401 = { status: 401, statusText: 'Unauthorized' };
      expect(defaultQueryRetry(0, error401)).toBe(false);
      expect(defaultQueryRetry(1, error401)).toBe(false);
    });

    it('never retries on 403 Forbidden', () => {
      const error403 = { status: 403, statusText: 'Forbidden' };
      expect(defaultQueryRetry(0, error403)).toBe(false);
    });

    it('never retries on 400 Bad Request or 404 Not Found client errors', () => {
      expect(defaultQueryRetry(0, { status: 400 })).toBe(false);
      expect(defaultQueryRetry(0, { status: 404 })).toBe(false);
      expect(defaultQueryRetry(0, { status: 422 })).toBe(false);
    });

    it('retries on transient 500 server errors up to 2 times', () => {
      const serverError = { status: 500, statusText: 'Internal Server Error' };
      expect(defaultQueryRetry(0, serverError)).toBe(true);
      expect(defaultQueryRetry(1, serverError)).toBe(true);
      expect(defaultQueryRetry(2, serverError)).toBe(false);
    });

    it('retries on network failures up to 2 times', () => {
      const networkError = new Error('Network request failed');
      expect(defaultQueryRetry(0, networkError)).toBe(true);
      expect(defaultQueryRetry(1, networkError)).toBe(true);
      expect(defaultQueryRetry(2, networkError)).toBe(false);
    });
  });
});
