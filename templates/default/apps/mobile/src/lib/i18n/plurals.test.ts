// First: take Intl down to what Hermes has, then load the polyfills the phone runs, with only
// the app languages' data. A missing polyfill, or a language missing from polyfills.ts, fails
// here as it would on the phone.
import './hermesIntl';
import './polyfills';

import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { messages } from './index';

const COUNTS = [0, 1, 2, 3, 11, 100];

// The device's own language tag reaches the plural rules too, and matching a regional tag
// needs more of Intl (Intl.Locale) than an exact one.
const REGIONAL_TAGS = [
  ['en-US', 'en'],
  ['fr-FR', 'fr'],
  ['fr-MA', 'fr'],
  ['ar-MA', 'ar'],
  ['ar-SA', 'ar'],
] as const;

describe('Plural messages', () => {
  // Without its locale data the polyfill falls back to English rules without an error, so
  // Arabic would lose its zero/two/few/many forms quietly.
  it.each(Object.keys(messages))('should have plural rules for %s', (locale) => {
    expect(new Intl.PluralRules(locale).resolvedOptions().locale).toBe(locale);
  });

  it.each(REGIONAL_TAGS)('should give %s the plural rules of %s', (tag, locale) => {
    const categories = (rules: Intl.PluralRules) =>
      [...rules.resolvedOptions().pluralCategories].sort();
    expect(categories(new Intl.PluralRules(tag))).toEqual(categories(new Intl.PluralRules(locale)));
  });

  it('should write Arabic numbers with the digits picked', () => {
    expect(createIntl({ locale: 'ar-u-nu-latn' }).formatNumber(123)).toBe('123');
    expect(createIntl({ locale: 'ar-u-nu-arab' }).formatNumber(123)).toBe('١٢٣');
    const categories = (rules: Intl.PluralRules) =>
      [...rules.resolvedOptions().pluralCategories].sort();
    for (const tag of ['ar-u-nu-latn', 'ar-u-nu-arab']) {
      expect(categories(new Intl.PluralRules(tag))).toEqual(categories(new Intl.PluralRules('ar')));
    }
  });

  it('should work with the default locale', () => {
    expect(() => new Intl.PluralRules().select(2)).not.toThrow();
  });

  it.each(Object.entries(messages))('should format every plural in %s', (locale, flat) => {
    const errors: string[] = [];
    const intl = createIntl({
      locale,
      messages: flat,
      onError: (error) => errors.push(error.message),
    });
    const plurals = Object.entries(flat).filter(([, message]) => message.includes(', plural,'));

    for (const [id, message] of plurals) {
      // Every `{name` gets the count; extra values are ignored.
      const names = [...message.matchAll(/\{(\w+)/g)].map(([, name]) => name);
      for (const count of COUNTS) {
        const values = Object.fromEntries(names.map((name) => [name, count]));
        expect(intl.formatMessage({ id }, values)).not.toBe(id);
      }
    }

    expect(errors).toEqual([]);
  });
});
