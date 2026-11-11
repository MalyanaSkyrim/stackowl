import 'react-native-get-random-values';

import { BottomSheetProvider, PortalHost, Toaster, useTokenColor } from '@starter/ui';
import '../global.css';

import { useAppFonts } from '@/lib/hooks/useAppFonts';
import { ApiProvider } from '@/lib/providers/ApiProvider';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import * as Updates from 'expo-updates';
import { Provider as JotaiProvider } from 'jotai';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from '../components/SplashScreen';
import { AppThemeProvider } from '../src/lib/providers/AppThemeProvider';
import { I18nProvider } from '../src/lib/providers/I18nProvider';
import { appStore } from '../src/lib/store/appStore';

Sentry.init({
  // Leave EXPO_PUBLIC_SENTRY_DSN empty to disable Sentry.
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  environment: __DEV__ ? 'development' : Updates.channel || 'production',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: __DEV__ ? [] : [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

// Longest the splash waits for the fonts. Past it the app opens anyway, in the system font
// until the fonts land.
const SPLASH_MAX_WAIT_MS = 3000;

function AppContent() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashTimedOut, setIsSplashTimedOut] = useState(false);
  const fontsReady = useAppFonts();
  const tokenColor = useTokenColor();

  useEffect(() => {
    if (fontsReady) return;
    const timeout = setTimeout(() => setIsSplashTimedOut(true), SPLASH_MAX_WAIT_MS);
    return () => clearTimeout(timeout);
  }, [fontsReady]);

  const isAppReady = fontsReady || isSplashTimedOut;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokenColor('background') },
        }}>
        {/* Main tabs */}
        <Stack.Screen name="(home)" />

        {/* One note, opened from the Notes tab */}
        <Stack.Screen name="notes/[id]" />

        {/* Sign in or create an account, opened from the Notes tab or Settings */}
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />

        {/* Register your own stack screens here as the app grows */}
      </Stack>
      {(isSplashVisible || !isAppReady) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <SplashScreen onFinish={() => setIsSplashVisible(false)} isLoading={!isAppReady} />
        </View>
      )}
    </View>
  );
}

export default Sentry.wrap(function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JotaiProvider store={appStore}>
        <I18nProvider>
          <AppThemeProvider>
            <QueryProvider>
              <ApiProvider>
                <BottomSheetProvider>
                  <AppContent />
                  <Toaster />
                  {/* Overlays from @starter/ui (dialogs, popovers) render here. */}
                  <PortalHost />
                </BottomSheetProvider>
              </ApiProvider>
            </QueryProvider>
          </AppThemeProvider>
        </I18nProvider>
      </JotaiProvider>
    </GestureHandlerRootView>
  );
});
