import { PortalHost, ThemeProvider } from '@starter/ui'
import '@starter/ui/globals.css'
import type { Decorator, Preview } from '@storybook/react-native-web-vite'
import { useColorScheme } from 'nativewind'
import * as React from 'react'
import { View } from 'react-native'

import { loadFonts } from './fonts'

loadFonts()

type ColorScheme = 'light' | 'dark'

const isColorScheme = (value: unknown): value is ColorScheme =>
  value === 'light' || value === 'dark'

/**
 * Applies the toolbar's light/dark choice: the `dark` class drives the web CSS
 * variables from design-tokens, and ThemeProvider sets the same variables
 * through NativeWind `vars()`, as on native.
 */
const withTheme: Decorator = (Story, context) => {
  const scheme: ColorScheme = isColorScheme(context.globals.theme)
    ? context.globals.theme
    : 'light'

  const { setColorScheme } = useColorScheme()

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', scheme === 'dark')
    // Keeps NativeWind (and `useTokenColor`) on the toolbar scheme rather
    // than the OS one.
    setColorScheme(scheme)
  }, [scheme, setColorScheme])

  return (
    <ThemeProvider mode={scheme}>
      <View className="bg-background flex-1 p-4">
        <Story />
      </View>
      <PortalHost />
    </ThemeProvider>
  )
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withTheme],
}

export default preview
