import { toast } from '@starter/ui';
import * as Updates from 'expo-updates';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { DevSettings, I18nManager } from 'react-native';

import { useTranslation } from '@/src/lib/hooks/useTranslation';
import type { Locale } from '@/src/lib/i18n';
import {
  arabicNumeralsAtom,
  languageAtom,
  RTL_LOCALES,
  type ArabicNumerals,
} from '@/src/lib/store/language';

/**
 * Switches the app language, and for Arabic the digits it uses. Moving between a left-to-right and a right-to-left language
 * flips the layout, which React Native only applies after a reload, so the app reloads then.
 * Resolves to `reloading` in that case and `changed` otherwise. If the reload fails, the
 * language and direction go back to what they were, a toast says so, and it resolves to
 * `failed`; it never rejects.
 */
export function useChangeLanguage() {
  const { t } = useTranslation('profile.language');
  const [language, setLanguage] = useAtom(languageAtom);
  const [numerals, setNumerals] = useAtom(arabicNumeralsAtom);

  return useCallback(
    async (
      locale: Locale,
      nextNumerals: ArabicNumerals | null = null
    ): Promise<'changed' | 'reloading' | 'failed'> => {
      if (nextNumerals) setNumerals(nextNumerals);
      setLanguage(locale);
      const isRtl = RTL_LOCALES.includes(locale);
      if (isRtl === I18nManager.isRTL) return 'changed';

      I18nManager.forceRTL(isRtl);
      try {
        if (__DEV__) {
          DevSettings.reload();
        } else {
          await Updates.reloadAsync();
        }
        return 'reloading';
      } catch {
        // Without the reload the layout keeps its old direction: undo the switch rather than
        // leave the text in one direction and the layout in the other.
        I18nManager.forceRTL(!isRtl);
        setLanguage(language);
        setNumerals(numerals);
        toast.error(t('changeFailed'));
        return 'failed';
      }
    },
    [language, setLanguage, numerals, setNumerals, t]
  );
}
