import { semanticColors, type RgbTriplet } from '@starter/design-tokens'

/** `'15 76 69'` → `'#0F4C45'`. */
const hex = (triplet: RgbTriplet): string =>
  `#${triplet
    .split(' ')
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`

const light = semanticColors.light

/**
 * Email design tokens. Email clients ignore CSS variables and stylesheets, so
 * the light theme from `@starter/design-tokens` is inlined here as hex.
 * Change colors in `tokens.ts`, never here.
 */
export const emailColors = {
  primary: hex(light.primary),
  primaryDeep: hex(light['primary-hover']),
  primaryTint: hex(light.secondary),
  heroSubtitle: hex(light.muted),
  panel: hex(light.muted),
  ink: hex(light.foreground),
  body: hex(light['foreground-soft']),
  muted: hex(light['muted-foreground']),
  border: hex(light.border),
  page: hex(light.background),
  white: hex(light.card),
} as const

export const emailFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/**
 * Public URL that serves the email images (`logo.png`, `hero.jpg`). Email
 * clients need absolute URLs, so host them on your deployed site.
 * TODO: replace with your own domain.
 */
const emailAssetsUrl = 'https://example.com/email'

/** Mirrors `brand.displayName` in `@starter/common`, which `@starter/ui` doesn't depend on. */
export const emailBrand = {
  name: 'Starter App',
  assetsUrl: emailAssetsUrl,
  /** PNG app icon; email clients block SVG. */
  logoUrl: `${emailAssetsUrl}/logo.png`,
  /** Hero photo with the brand overlay baked in, for the hero band. */
  heroImageUrl: `${emailAssetsUrl}/hero.jpg`,
} as const
