import { vars } from 'nativewind'

import { colorVars } from './css-vars'

/**
 * NativeWind theme: the same variables as `tokens.css`, as `vars()` style
 * objects. Apply one to a root `View` (see `GluestackUIProvider`).
 */
export const nativeTheme = {
  light: vars(colorVars('light')),
  dark: vars(colorVars('dark')),
}
