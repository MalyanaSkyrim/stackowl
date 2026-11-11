import { MenuList, Text, useTokenColor } from '@starter/ui';
import { Stack, useRouter } from 'expo-router';

import { useAtomValue } from 'jotai';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import React from 'react';

import { useChangeLanguage } from '@/lib/hooks/useChangeLanguage';
import type { TranslationKey } from '@/src/lib/hooks/useTranslation';
import type { Locale } from '@/src/lib/i18n';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { I18nManager, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  arabicNumeralsAtom,
  isCurrentChoice,
  LANGUAGE_CHOICES,
  languageAtom,
  NUMERALS_SAMPLE,
  type LanguageChoice,
} from '../../src/lib/store/language';

type LanguageOption = {
  nameKey: TranslationKey;
  shortCode: string;
};

// A Record, so a language added to `localeSchema` is a type error here until it has a row.
const LANGUAGES: Record<Locale, LanguageOption> = {
  en: { nameKey: 'profile.language.english', shortCode: 'EN' },
  fr: { nameKey: 'profile.language.french', shortCode: 'FR' },
  ar: { nameKey: 'profile.language.arabic', shortCode: 'AR' },
};

// Back points toward the start of the screen: left, or right in Arabic.
const BackArrow = I18nManager.isRTL ? ArrowRight : ArrowLeft;

export default function LanguageScreen() {
  const currentLanguage = useAtomValue(languageAtom);
  const numerals = useAtomValue(arabicNumeralsAtom);
  const changeLanguage = useChangeLanguage();
  const { t } = useTranslation('profile.language');
  const { t: tFull } = useTranslation();
  const primaryColor = useTokenColor()('primary');
  const router = useRouter();
  const tokenColor = useTokenColor();

  const handleLanguageSelect = async ({ locale, numerals: nextNumerals }: LanguageChoice) => {
    const result = await changeLanguage(locale, nextNumerals);
    if (result === 'changed') router.back();
  };

  // Arabic comes twice: with Western digits (123) and with Arabic-Indic digits (١٢٣).
  const menuItems = LANGUAGE_CHOICES.map((choice) => ({
    icon: (
      <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
        <Text className="text-xs font-bold text-primary">{LANGUAGES[choice.locale].shortCode}</Text>
      </View>
    ),
    title: choice.numerals
      ? `${tFull(LANGUAGES[choice.locale].nameKey)} (${NUMERALS_SAMPLE[choice.numerals]})`
      : tFull(LANGUAGES[choice.locale].nameKey),
    value: isCurrentChoice(choice, currentLanguage, numerals) ? (
      <Check size={20} color={primaryColor} />
    ) : undefined,
    showChevron: false,
    onPress: () => handleLanguageSelect(choice),
  }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full border border-border">
          <BackArrow size={24} color={tokenColor('foreground')} pointerEvents="none" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-foreground" numberOfLines={1}>
          {t('title')}
        </Text>
        {/* Placeholder for symmetry */}
        <View className="h-12 w-12" />
      </View>

      <View className="flex-1 px-5 pt-2">
        <MenuList items={menuItems} />
      </View>
    </SafeAreaView>
  );
}
