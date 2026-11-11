// apps/web/tailwind.config.ts
import { webFontFamily } from '@starter/design-tokens'
import uiConfig from '@starter/ui/tailwind.config'
import { createRequire } from 'node:module'
import type { Config } from 'tailwindcss'

// `nativewind/preset` ships a declaration file that is not a module, so it
// cannot be imported from TypeScript; load it through `require` instead.
const require = createRequire(import.meta.url)
const nativewindPreset: Config = require('nativewind/preset')

/**
 * The marketing site builds on the shared `@starter/ui` config, which brings
 * the `@starter/design-tokens` preset (colors, the 16px card / 12px control
 * radii and the section spacing). Only marketing-only extras live here.
 */
const config: Config = {
  ...uiConfig,
  // NativeWind's preset goes first so the shared presets after it restore
  // Tailwind's web theme (NativeWind swaps in native shadows, for example);
  // its plugins still apply, which is what `@starter/ui` needs on the web.
  presets: [nativewindPreset, ...(uiConfig.presets ?? [])],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: {
    ...uiConfig.theme,
    extend: {
      ...uiConfig.theme?.extend,
      // The type scale deliberately lives in `app/marketing.css` instead of
      // here — see the note in that file about tailwind-merge dropping
      // custom `text-*` tokens.
      maxWidth: {
        content: '1120px',
        prose: '720px',
      },
      // `next/font` serves the files under generated family names, exposed as
      // the variables `lib/fonts` declares; each goes first in its family.
      fontFamily: {
        ...webFontFamily,
        sans: ['var(--font-plex-sans)', ...webFontFamily.sans],
        'sans-medium': [
          'var(--font-plex-sans)',
          ...webFontFamily['sans-medium'],
        ],
        'sans-semibold': [
          'var(--font-plex-sans)',
          ...webFontFamily['sans-semibold'],
        ],
        arabic: ['var(--font-plex-arabic)', ...webFontFamily.arabic],
        'arabic-medium': [
          'var(--font-plex-arabic)',
          ...webFontFamily['arabic-medium'],
        ],
        'arabic-semibold': [
          'var(--font-plex-arabic)',
          ...webFontFamily['arabic-semibold'],
        ],
        display: ['var(--font-plex-sans)', ...webFontFamily.display],
        'display-ar': ['var(--font-plex-arabic)', ...webFontFamily['display-ar']],
      },
    },
  },
}
export default config
