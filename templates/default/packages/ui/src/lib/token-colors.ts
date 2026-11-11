import { semanticColors, type SemanticColor } from '@starter/design-tokens'
import { useColorScheme } from 'nativewind'
import * as React from 'react'

export type ColorScheme = 'light' | 'dark'

/**
 * The scheme `ThemeProvider` applies. NativeWind's own scheme can't be trusted
 * on iOS: with `UIUserInterfaceStyle` set to Light in Info.plist, React Native
 * always reports "light", so `setColorScheme('dark')` never reaches it.
 */
export const ColorSchemeContext = React.createContext<ColorScheme | undefined>(
  undefined,
)

/**
 * A design-token color as a CSS `rgb()` string, for APIs that need a real
 * color value instead of a class (SVG fills, third-party style props).
 */
export const tokenColor = (
  name: SemanticColor,
  scheme: ColorScheme = 'light',
): string => `rgb(${semanticColors[scheme][name].split(' ').join(', ')})`

/**
 * The current light/dark scheme: the one `ThemeProvider` applies, or
 * NativeWind's outside it. Use it instead of `dark:` classes when code must
 * branch on the scheme.
 */
export function useThemeScheme(): ColorScheme {
  const themeScheme = React.useContext(ColorSchemeContext)
  const { colorScheme } = useColorScheme()
  return themeScheme ?? (colorScheme === 'dark' ? 'dark' : 'light')
}

/** `tokenColor` bound to the current light/dark scheme. */
export function useTokenColor() {
  const scheme = useThemeScheme()
  return (name: SemanticColor) => tokenColor(name, scheme)
}
