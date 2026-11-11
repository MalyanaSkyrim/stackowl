import { GoogleSignin } from '@react-native-google-signin/google-signin';

/** The only module that talks to @react-native-google-signin/google-signin. */

const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Google sign-in needs the iOS OAuth client id, and its reversed form as a URL scheme in
 * the build (see app.config.js). Without both, the button is hidden.
 */
export const isGoogleSignInConfigured =
  Boolean(iosClientId) && Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME);

let configured = false;

/** Shows Google's sign-in sheet. Resolves to the id token, or null when the user cancels. */
export async function signInWithGoogle(): Promise<string | null> {
  if (!configured) {
    GoogleSignin.configure({ iosClientId });
    configured = true;
  }

  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') return null;

  const { idToken } = response.data;
  if (idToken === null) {
    throw new Error('Google sign-in returned no id token');
  }

  // The app keeps its own session; Google's is not needed after this.
  await GoogleSignin.signOut();
  return idToken;
}
