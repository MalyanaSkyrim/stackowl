import uiConfig from '@starter/ui/tailwind.config'
import { createRequire } from 'node:module'
import type { Config } from 'tailwindcss'

// `nativewind/preset` ships a declaration file that is not a module, so it
// cannot be imported from TypeScript; load it through `require` instead.
const require = createRequire(import.meta.url)
const nativewindPreset: Config = require('nativewind/preset')

/**
 * One Tailwind build for every story: the kit's config with the shared
 * design-tokens preset (colors, type scale, shadows) and NativeWind's plugins.
 */
const config: Config = {
  ...uiConfig,
  // NativeWind first so the shared presets after it restore the web theme;
  // its plugins still apply. See apps/web/tailwind.config.ts.
  presets: [nativewindPreset, ...(uiConfig.presets ?? [])],
  content: ['.storybook/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
}

export default config
