/**
 * Single source of truth for product naming: change `displayName` here and every screen,
 * email and web page follows. `stackowl create` fills these in.
 *
 * Values in [BRACKETS] are placeholders until the support inbox and the publisher's legal
 * details exist. The website prints them as they are, so a missing one is visible on the page.
 */
const website = 'https://www.example.com'

export const brand = {
  displayName: 'Starter App',
  urls: {
    website,
    privacy: `${website}/privacy`,
    terms: `${website}/terms`,
    support: `${website}/support`,
    /** The App Store listing; null until the app is published. */
    appStore: null,
  },
  supportEmail: 'support@example.com',
  privacyEmail: 'privacy@example.com',
  /** Who publishes the app, as the privacy policy and terms name them. */
  legal: {
    name: '[LEGAL NAME]',
    address: '[ADDRESS]',
  },
  defaultCurrency: 'USD',
  defaultLocale: 'en-US',
} as const

export type Brand = typeof brand
