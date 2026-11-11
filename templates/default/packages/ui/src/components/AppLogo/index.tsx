'use client'

import { semanticColors } from '@starter/design-tokens'
import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

/**
 * The brand primary from the design tokens, as `rgb(r, g, b)`. SVG fills need
 * a real color (not a CSS variable), and Android applies `rgb()` reliably.
 */
export const APP_LOGO_DEFAULT_COLOR = `rgb(${semanticColors.light.primary.split(' ').join(', ')})`

/** The brand highlight from the design tokens: the check. */
export const APP_LOGO_DEFAULT_ACCENT_COLOR = `rgb(${semanticColors.light.gold.split(' ').join(', ')})`

export type AppLogoProps = {
  size?: number
  color?: string
  accentColor?: string
}

// A placeholder mark: a rounded square with a check. Replace it with your own logo, and the
// same shape in apps/web/public/svg/logo.svg and the app icons in apps/mobile/assets.
const LOGO_PATH =
  'M232 120h560c61.9 0 112 50.1 112 112v560c0 61.9-50.1 112-112 112H232c-61.9 0-112-50.1-112-112V232c0-61.9 50.1-112 112-112Z'
const LOGO_ACCENT_PATH =
  'M430 690 300 560l56-56 74 74 238-238 56 56-294 294Z'

/** The app mark, drawn with react-native-svg so it renders on native and web. */
export const AppLogo = ({
  size = 80,
  color = APP_LOGO_DEFAULT_COLOR,
  accentColor = APP_LOGO_DEFAULT_ACCENT_COLOR,
}: AppLogoProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="100 100 824 824"
    preserveAspectRatio="xMidYMid meet"
    accessibilityLabel="App logo">
    <Path d={LOGO_PATH} fill={color} />
    <Path d={LOGO_ACCENT_PATH} fill={accentColor} />
  </Svg>
)
