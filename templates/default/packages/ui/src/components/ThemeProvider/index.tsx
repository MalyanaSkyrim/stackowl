'use client'

import { nativeTheme } from '@starter/design-tokens/native'
import { useColorScheme } from 'nativewind'
import * as React from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import { ColorSchemeContext } from '../../lib/token-colors'

export type ThemeMode = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  /** `system` follows the device setting. */
  mode?: ThemeMode
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/**
 * Applies the design-token CSS variables (light or dark) to everything inside
 * it, so classes like `bg-background` resolve on native. Mount it at the app
 * root (it replaces the old GluestackUIProvider). On the web the same
 * variables also come from `tokens.css`.
 */
function ThemeProvider({
  mode = 'system',
  style,
  children,
}: ThemeProviderProps) {
  const { colorScheme } = useColorScheme()
  const active =
    mode === 'system' ? (colorScheme === 'dark' ? 'dark' : 'light') : mode
  return (
    <ColorSchemeContext.Provider value={active}>
      <View
        style={[
          nativeTheme[active],
          { flex: 1, width: '100%', height: '100%' },
          style,
        ]}>
        {children}
      </View>
    </ColorSchemeContext.Provider>
  )
}

export { ThemeProvider }
