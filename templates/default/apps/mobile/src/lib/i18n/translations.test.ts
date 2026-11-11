import { describe, it, expect } from 'vitest';
import { compareTranslationKeys, type TranslationObject } from '@starter/common';
import enJson from './messages/en.json';
import frJson from './messages/fr.json';
import arJson from './messages/ar.json';
import { arabicWesternMessages, messages } from './index';

const en = enJson as TranslationObject;
const fr = frJson as TranslationObject;
const ar = arJson as TranslationObject;

describe('Mobile Translation Consistency', () => {
  it('should have the same keys in English and French', () => {
    const { missingInTarget: missingInFr, missingInReference: missingInEn } =
      compareTranslationKeys(en, fr);

    expect(missingInFr, 'Keys existing in English but missing in French (fr.json)').toEqual([]);
    expect(missingInEn, 'Keys existing in French but missing in English (en.json)').toEqual([]);
  });

  it('should have the same keys in English and Arabic', () => {
    const { missingInTarget: missingInAr, missingInReference: missingInEn } =
      compareTranslationKeys(en, ar);

    expect(missingInAr, 'Keys existing in English but missing in Arabic (ar.json)').toEqual([]);
    expect(missingInEn, 'Keys existing in Arabic but missing in English (en.json)').toEqual([]);
  });

  it('should have every Arabic message for Arabic with Western digits', () => {
    expect(Object.keys(arabicWesternMessages).sort()).toEqual(Object.keys(messages.ar).sort());
  });

  // react-intl treats "" as a missing message and shows the key instead. A line that has no
  // place in one language is left out by the code, not by an empty string.
  it.each(Object.entries(messages))('should have no empty strings in %s', (_locale, flat) => {
    const empty = Object.entries(flat)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key);

    expect(empty, 'Keys with an empty message').toEqual([]);
  });
});
