'use client'

import { PortalHost } from '@starter/ui'
import { useColorScheme } from 'nativewind'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import * as React from 'react'

/**
 * Deliberately thin.
 *
 * Every provider mounted here lands in the first load of the landing page,
 * so the site carries only what it uses. Add toast, tooltip or query-state
 * providers here when a feature needs them.
 */
/**
 * NativeWind tracks its own light/dark scheme (the OS one by default). Keep it
 * on the page theme so components that read token colors in JS
 * (`useTokenColor`) match the CSS variables.
 */
function ColorSchemeSync() {
  const { resolvedTheme } = useTheme()
  const { setColorScheme } = useColorScheme()
  React.useEffect(() => {
    setColorScheme(resolvedTheme === 'dark' ? 'dark' : 'light')
  }, [resolvedTheme, setColorScheme])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      forcedTheme="light"
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableColorScheme>
      <ColorSchemeSync />
      {children}
      {/* Dialogs, popovers and selects from @starter/ui render here. */}
      <PortalHost />
    </NextThemesProvider>
  )
}
