import { Button, Text, toast } from '@starter/ui';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { View } from 'react-native';

import { useCloseAuth, useSaveSession } from '@/lib/hooks/useAuth';
import { deviceName } from '@/lib/native/device';
import {
  AppleSignInButton,
  signInWithApple,
  useAppleSignInAvailable,
} from '@/lib/native/AppleSignIn';
import { isGoogleSignInConfigured, signInWithGoogle } from '@/lib/native/googleSignIn';
import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage } from '@/src/lib/auth/errors';
import { pendingAppleNameAtom } from '@/src/lib/store/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

import { GoogleLogo } from './GoogleLogo';

type SocialSignInProps = {
  /** What happens once signed in: closing the sign-in modal, unless the screen says otherwise. */
  onSignedIn?: () => void;
};

/** "Continue with Apple" and "Continue with Google". Each signs in, then closes the modal. */
export function SocialSignIn({ onSignedIn }: SocialSignInProps) {
  const { t } = useTranslation('auth');
  const trpc = useTRPC();
  const saveSession = useSaveSession();
  const closeAuth = useCloseAuth();
  const appleAvailable = useAppleSignInAvailable();
  const [pendingAppleName, setPendingAppleName] = useAtom(pendingAppleNameAtom);

  const oauthSignIn = useMutation(
    trpc.auth.oauthSignIn.mutationOptions({
      onSuccess: (signedIn) => {
        setPendingAppleName(null);
        saveSession(signedIn);
        (onSignedIn ?? closeAuth)();
      },
      onError: (error) => toast.error(t(`errors.${authErrorMessage(error)}`)),
    })
  );

  const handleApple = async () => {
    try {
      const credential = await signInWithApple();
      if (credential === null) return;
      // Apple sends the name once: keep it until a sign-in succeeds, and send it again on retry.
      if (credential.name !== undefined) setPendingAppleName(credential.name);
      const name = credential.name ?? pendingAppleName ?? undefined;
      oauthSignIn.mutate({ provider: 'APPLE', idToken: credential.idToken, name, deviceName });
    } catch {
      toast.error(t('errors.UNKNOWN'));
    }
  };

  const handleGoogle = async () => {
    try {
      const idToken = await signInWithGoogle();
      if (idToken === null) return;
      oauthSignIn.mutate({ provider: 'GOOGLE', idToken, deviceName });
    } catch {
      toast.error(t('errors.UNKNOWN'));
    }
  };

  // One mutation serves both buttons; the spinner goes on the one that was tapped.
  const pendingProvider = oauthSignIn.isPending ? oauthSignIn.variables.provider : null;

  if (!appleAvailable && !isGoogleSignInConfigured) return null;

  return (
    <View className="gap-3">
      {appleAvailable && (
        <AppleSignInButton
          label={t('signIn.continueWithApple')}
          disabled={oauthSignIn.isPending}
          loading={pendingProvider === 'APPLE'}
          onPress={handleApple}
        />
      )}
      {isGoogleSignInConfigured && (
        <Button
          variant="outline"
          className="h-[52px] rounded-input"
          disabled={oauthSignIn.isPending}
          loading={pendingProvider === 'GOOGLE'}
          onPress={handleGoogle}>
          <GoogleLogo />
          <Text>{t('signIn.continueWithGoogle')}</Text>
        </Button>
      )}
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text variant="caption">{t('signIn.orWithEmail')}</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
    </View>
  );
}
