import { ThemeProvider } from '@starter/ui';
import { StatusBar } from 'expo-status-bar';
import { useAtomValue } from 'jotai';
import { useColorScheme } from 'nativewind';
import React, { ReactNode, useEffect } from 'react';

import { themeAtom } from '../store/theme';

/**
 * Applies the theme picked in Settings. The kit `ThemeProvider` swaps the token variables under
 * every class and tells `useTokenColor()` the scheme. NativeWind's color scheme drives `dark:`
 * classes, but stays light on iOS while Info.plist pins `UIUserInterfaceStyle` to Light, so
 * use tokens rather than `dark:`.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAtomValue(themeAtom);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [setColorScheme, theme]);

  return (
    <ThemeProvider mode={theme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}
