import { Button, cn, Text, useThemeScheme } from '@starter/ui';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';

/** The only module that talks to expo-apple-authentication. */

export type AppleCredential = {
  idToken: string;
  /** Apple shares the name with the app on the first sign-in only. */
  name?: string;
};

/**
 * Sign in with Apple needs iOS 13 and the app targets 15.1, so assume it's there on iOS
 * until the check says otherwise. Starting from false made the button pop in, and push the
 * sign-in sheet down, just after the modal opened.
 */
let appleSignInAvailable = Platform.OS === 'ios';

/** True on an iPhone that offers Sign in with Apple. */
export function useAppleSignInAvailable() {
  const [available, setAvailable] = useState(appleSignInAvailable);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void AppleAuthentication.isAvailableAsync().then((result) => {
      appleSignInAvailable = result;
      setAvailable(result);
    });
  }, []);

  return available;
}

/** Shows Apple's sign-in sheet. Resolves to null when the user cancels it. */
export async function signInWithApple(): Promise<AppleCredential | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken === null) {
      throw new Error('Sign in with Apple returned no identity token');
    }

    const name =
      credential.fullName === null
        ? ''
        : AppleAuthentication.formatFullName(credential.fullName).trim();

    return { idToken: credential.identityToken, name: name === '' ? undefined : name };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ERR_REQUEST_CANCELED'
    ) {
      return null;
    }
    throw error;
  }
}

type AppleSignInButtonProps = {
  /** Apple's title in the app language, e.g. "Continue with Apple". */
  label: string;
  disabled?: boolean;
  /** Swaps the logo for a spinner and disables the button. */
  loading?: boolean;
  onPress: () => void;
};

/**
 * "Continue with Apple", drawn by us following Apple's guidelines for custom buttons:
 * its black style in light mode, its white style in dark mode, where a black button would
 * vanish into the background. Apple's native button takes its label from the phone's
 * language, so it stayed in English when only the app was set to Arabic. Black and white
 * are Apple's fixed colors, not theme tokens.
 */
export function AppleSignInButton({
  label,
  disabled,
  loading = false,
  onPress,
}: AppleSignInButtonProps) {
  const dark = useThemeScheme() === 'dark';
  const contentColor = dark ? 'black' : 'white';

  // The kit's `loading` spinner takes the theme's primary-foreground color, which vanishes
  // on Apple's white style, so the spinner is drawn here in Apple's color instead.
  return (
    <Button
      className={cn(
        'h-[52px] rounded-input active:opacity-80',
        dark ? 'bg-white active:bg-white' : 'bg-black active:bg-black',
        disabled && !loading && 'opacity-50'
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <Ionicons name="logo-apple" size={20} color={contentColor} />
      )}
      <Text className={dark ? 'text-black' : 'text-white'}>{label}</Text>
    </Button>
  );
}
