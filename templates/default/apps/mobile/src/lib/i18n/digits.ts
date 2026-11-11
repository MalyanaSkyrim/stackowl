import type { ReactNode } from 'react';
import type { IntlShape, PrimitiveType } from 'react-intl';

/** Arabic-Indic digits (٠ to ٩) as Western digits (0 to 9). */
export function toWesternDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

type MessageArgs = Parameters<IntlShape['formatMessage']>;

/**
 * The same intl, writing Western digits in everything it formats. The phone's Hermes ignores
 * the `-u-nu-latn` in `ar-u-nu-latn` and writes Arabic-Indic digits, so Arabic with Western
 * digits (as in the Maghreb) can't rely on the locale alone.
 */
export function withWesternDigits(intl: IntlShape): IntlShape {
  // The same two overloads as react-intl's: plain values give a string, rich ones a list.
  function formatMessage(
    descriptor: MessageArgs[0],
    values?: Record<string, PrimitiveType>,
    options?: MessageArgs[2]
  ): string;
  function formatMessage(
    descriptor: MessageArgs[0],
    values?: MessageArgs[1],
    options?: MessageArgs[2]
  ): ReactNode[];
  function formatMessage(
    descriptor: MessageArgs[0],
    values?: MessageArgs[1],
    options?: MessageArgs[2]
  ): string | ReactNode[] {
    const message: string | ReactNode[] = intl.formatMessage(descriptor, values, options);
    return typeof message === 'string'
      ? toWesternDigits(message)
      : message.map((part) => (typeof part === 'string' ? toWesternDigits(part) : part));
  }

  return {
    ...intl,
    formatMessage,
    formatNumber: (value, options) => toWesternDigits(intl.formatNumber(value, options)),
    formatDate: (value, options) => toWesternDigits(intl.formatDate(value, options)),
    formatTime: (value, options) => toWesternDigits(intl.formatTime(value, options)),
  };
}
