import { TextScriptProvider } from '@starter/ui';
import { useAtomValue } from 'jotai';
import React, { ReactNode, useMemo } from 'react';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import { arabicWesternMessages, messages } from '../i18n';
import { withWesternDigits } from '../i18n/digits';
import { arabicNumeralsAtom, arabicWesternAtom, intlLocale, languageAtom } from '../store/language';

const cache = createIntlCache();

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useAtomValue(languageAtom);
  const numerals = useAtomValue(arabicNumeralsAtom);
  const arabicWestern = useAtomValue(arabicWesternAtom);

  // Numbers, dates and times follow the digits picked for Arabic.
  const intl = useMemo(() => {
    const base = createIntl(
      {
        locale: intlLocale(locale, numerals),
        messages: arabicWestern ? arabicWesternMessages : messages[locale],
        defaultLocale: 'en',
      },
      cache
    );
    return arabicWestern ? withWesternDigits(base) : base;
  }, [arabicWestern, locale, numerals]);

  return (
    <RawIntlProvider value={intl}>
      {/* Arabic UI copy switches to IBM Plex Sans Arabic. */}
      <TextScriptProvider script={locale.startsWith('ar') ? 'arabic' : 'latin'}>
        {children}
      </TextScriptProvider>
    </RawIntlProvider>
  );
}
