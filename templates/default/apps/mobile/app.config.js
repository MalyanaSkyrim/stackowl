// @ts-check
// cspell:ignore colour
// In deploy mode (MOBILE_DEPLOY=1), load tooling/.env with override to ensure
// production values take precedence over the symlinked apps/mobile/.env.
const isDeploy = process.env.MOBILE_DEPLOY === '1';
require('dotenv').config({
  path: isDeploy ? ['../../.env', '../../tooling/.env'] : '../../.env',
  override: isDeploy,
});

// Detect if building for staging environment
const isStaging = process.env.APP_ENV === 'staging' || process.env.ENVIRONMENT === 'staging';

// Staging and production builds share one bundle ID (one App Store Connect app).
const bundleId = process.env.APP_BUNDLE_ID || 'com.example.starterapp';
const appName = process.env.EXPO_PUBLIC_APP_NAME || 'Starter App';
// The name under the icon. The home screen shows about 12 characters, so the
// staging label is short enough to read in full.
const displayName = isStaging ? `${appName.slice(0, 4)} Staging` : appName;
const scheme = isStaging ? 'starter-app-staging' : 'starter-app';
// The brand primary (`primary` in packages/design-tokens/src/tokens.ts). Native
// config is read before the app's code, so it can't import the tokens.
const brandPrimary = '#4F46E5';
// The light `background` in the same file, behind the splash.
const brandBackground = '#FAFAFA';

// Google sign-in returns to the app through the reversed iOS client id
// (com.googleusercontent.apps.…). Without it, the Google button is hidden.
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

export default {
  /** @type {import("@expo/config").ExpoConfig} */
  expo: {
    name: appName,
    slug: 'starter-app',
    version: '1.0.0',
    scheme: scheme,
    platforms: ['ios', 'android'],
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-router',
      ['expo-build-properties', { ios: { deploymentTarget: '16.0' } }],
      'expo-apple-authentication',
      ...(googleIosUrlScheme
        ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]]
        : []),
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: bundleId,
      // Expo flattens the tinted icon onto white, so that file must stay opaque.
      icon: {
        light: './assets/icon.png',
        dark: './assets/icon-dark.png',
        tinted: './assets/icon-tinted.png',
      },
      // iPhone only: an iPad build needs 13" iPad screenshots on the App Store.
      supportsTablet: false,
      usesAppleSignIn: true,
      appleTeamId: process.env.APPLE_TEAM_ID,
      infoPlist: {
        CFBundleDisplayName: displayName,
        ITSAppUsesNonExemptEncryption: false,
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: bundleId,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundImage: './assets/adaptive-icon-background.png',
        // Single-colour silhouette for Android 13+ themed icons.
        monochromeImage: './assets/monochrome-icon.png',
        backgroundColor: brandPrimary,
      },
    },
    splash: {
      backgroundColor: brandBackground,
      image: './assets/splash.png',
      resizeMode: 'contain',
    },
  },
};
