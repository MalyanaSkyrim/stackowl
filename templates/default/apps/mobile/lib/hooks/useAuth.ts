import type { SignedIn } from '@starter/common';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { useTRPC } from '@/src/lib/api/trpc';
import { sessionAtom } from '@/src/lib/store/session';

/** Saves the session from a successful sign-in. */
export const useSaveSession = () => {
  const setSession = useSetAtom(sessionAtom);
  return useCallback(({ user, tokens }: SignedIn) => setSession({ user, tokens }), [setSession]);
};

/** Closes the sign-in screens and returns to wherever they were opened from. */
export const useCloseAuth = () => {
  const navigation = useNavigation();
  return useCallback(() => {
    // The auth screens are their own stack, shown as a modal: close the whole modal.
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);
};

/** Signs this phone out. */
export const useSignOut = () => {
  const trpc = useTRPC();
  const [session, setSession] = useAtom(sessionAtom);
  const logOut = useMutation(trpc.auth.logOut.mutationOptions());

  return useCallback(() => {
    if (session === null) return;
    // Signed out on the phone right away; if the API can't be reached the session simply
    // expires on the server.
    logOut.mutate({ refreshToken: session.tokens.refreshToken });
    setSession(null);
  }, [logOut, session, setSession]);
};

/**
 * Deletes the account and everything it owns on our servers, then signs this phone out.
 * The API ends every session of the account, so the other phones sign out on their next call.
 */
export const useDeleteAccount = (options: { onError: (error: unknown) => void }) => {
  const trpc = useTRPC();
  const setSession = useSetAtom(sessionAtom);
  return useMutation(
    trpc.auth.deleteAccount.mutationOptions({
      onSuccess: () => setSession(null),
      onError: options.onError,
    })
  );
};
