import { brand } from './brand'

/**
 * Converts a currency amount to cents.
 * e.g., 10.50 -> 1050
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Converts cents back to a currency amount.
 * e.g., 1050 -> 10.50
 */
export function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Formats a given amount in a specified currency and locale.
 * Defaults to the brand currency and locale.
 */
export function formatCurrency(
  amount: number,
  currency: string = brand.defaultCurrency,
  locale: string = brand.defaultLocale,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
