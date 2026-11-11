import type { AppRouter } from '@starter/api';
import { createTRPCClient, httpBatchLink, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';

import { appStore } from '../store/appStore';
import { sessionAtom } from '../store/session';

/** Where the API runs. On a real iPhone, use the Mac's network address, not localhost. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const trpcUrl = `${API_URL}/trpc`;

/** Client without the refresh link, used to refresh itself. */
const plainClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: trpcUrl })],
});

let refreshing: Promise<boolean> | null = null;

/**
 * Swaps the refresh token for new tokens. Concurrent calls share one request, since a
 * refresh token works only once. Signs the user out when the session has ended.
 */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const session = appStore.get(sessionAtom);
    if (session === null) return false;

    try {
      const tokens = await plainClient.auth.refresh.mutate({
        refreshToken: session.tokens.refreshToken,
      });
      appStore.set(sessionAtom, { ...session, tokens });
      return true;
    } catch (error) {
      // Offline or server down: keep the session and try again on the next call.
      if (error instanceof TRPCClientError && error.data?.reason === 'SESSION_EXPIRED') {
        appStore.set(sessionAtom, null);
      }
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

/**
 * The access token lasts 15 minutes. When a call is refused for it, refresh the session
 * once and send the call again.
 */
const refreshOnUnauthorizedLink: TRPCLink<AppRouter> =
  () =>
  ({ op, next }) =>
    observable((observer) => {
      let retried = false;
      let subscription = next(op).subscribe({ next: forward, error: onError, complete });

      function forward(value: Parameters<typeof observer.next>[0]) {
        observer.next(value);
      }
      function complete() {
        observer.complete();
      }
      function onError(error: TRPCClientError<AppRouter>) {
        const canRetry =
          !retried &&
          error.data?.code === 'UNAUTHORIZED' &&
          // Sign-in calls answer UNAUTHORIZED for a wrong password, not an old token.
          !op.path.startsWith('auth.') &&
          appStore.get(sessionAtom) !== null;

        if (!canRetry) {
          observer.error(error);
          return;
        }

        retried = true;
        void refreshSession().then((refreshed) => {
          if (!refreshed) {
            observer.error(error);
            return;
          }
          subscription = next(op).subscribe({ next: forward, error: onError, complete });
        });
      }

      return () => subscription.unsubscribe();
    });

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    refreshOnUnauthorizedLink,
    httpBatchLink({
      url: trpcUrl,
      // Read at send time, so a retried call carries the refreshed token.
      headers: () => {
        const session = appStore.get(sessionAtom);
        return session === null ? {} : { Authorization: `Bearer ${session.tokens.accessToken}` };
      },
    }),
  ],
});
