import { useTranslation } from '@/src/lib/hooks/useTranslation';
import type { Locale } from '@/src/lib/i18n';
import { Avatar, MenuList, MenuListItemProps, Switch, Text, useTokenColor } from '@starter/ui';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAtom, useAtomValue } from 'jotai';
import { FileText, Globe, Info, Lock, Moon, UserRound } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { webUrls } from '@/src/lib/webUrls';
import { arabicNumeralsAtom, languageAtom, NUMERALS_SAMPLE } from '../../lib/store/language';
import { currentUserAtom } from '../../lib/store/session';
import { themeAtom } from '../../lib/store/theme';

const ICON_SIZE = 22;

type MenuSection = {
  id: 'account' | 'general' | 'legal';
  title: string;
  items: MenuListItemProps[];
};

/** Settings: the account, the general preferences and the legal pages. */
export const ProfileMenu = () => {
  const router = useRouter();
  const { t } = useTranslation('profile.menu');
  const { t: tLang } = useTranslation('profile.language');
  const currentLanguage = useAtomValue(languageAtom);
  const numerals = useAtomValue(arabicNumeralsAtom);
  const user = useAtomValue(currentUserAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const iconColor = useTokenColor()('primary');

  const sections: MenuSection[] = useMemo(() => {
    const isDark = theme === 'dark';
    const languageLabels: Record<Locale, string> = {
      en: tLang('english'),
      fr: tLang('french'),
      ar: `${tLang('arabic')} (${NUMERALS_SAMPLE[numerals]})`,
    };

    // Signed out, one row that opens sign-in; signed in, the account screen.
    const accountItems: MenuListItemProps[] =
      user === null
        ? [
            {
              icon: <UserRound size={ICON_SIZE} color={iconColor} />,
              title: t('signIn'),
              description: t('signInDescription'),
              onPress: () => router.push('/auth/sign-in'),
            },
          ]
        : [
            {
              icon: <Avatar name={user.name ?? user.email} />,
              title: user.name ?? user.email,
              description: t('signedInDescription'),
              onPress: () => router.push('/profile/account'),
            },
          ];

    return [
      { id: 'account', title: t('account'), items: accountItems },
      {
        id: 'general',
        title: t('general'),
        items: [
          {
            icon: <Globe size={ICON_SIZE} color={iconColor} />,
            title: t('language'),
            value: languageLabels[currentLanguage],
            onPress: () => router.push('/profile/language'),
          },
          {
            icon: <Moon size={ICON_SIZE} color={iconColor} />,
            title: t('darkMode'),
            value: (
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label={t('darkMode')}
              />
            ),
            showChevron: false,
            onPress: () => setTheme(isDark ? 'light' : 'dark'),
          },
        ],
      },
      {
        id: 'legal',
        title: t('legal'),
        items: [
          {
            icon: <Lock size={ICON_SIZE} color={iconColor} />,
            title: t('privacyPolicy'),
            onPress: () => void WebBrowser.openBrowserAsync(webUrls.privacy).catch(() => undefined),
          },
          {
            icon: <FileText size={ICON_SIZE} color={iconColor} />,
            title: t('termsConditions'),
            onPress: () => void WebBrowser.openBrowserAsync(webUrls.terms).catch(() => undefined),
          },
          {
            icon: <Info size={ICON_SIZE} color={iconColor} />,
            title: t('aboutApp'),
            onPress: () => router.push('/profile/about'),
          },
        ],
      },
    ];
  }, [currentLanguage, iconColor, numerals, router, setTheme, t, tLang, theme, user]);

  return (
    <View className="flex-1 gap-6 pb-2">
      {sections.map((section) => (
        <View key={section.id}>
          <Text className="mb-2 px-1 text-sm font-semibold uppercase text-muted-foreground">
            {section.title}
          </Text>
          <MenuList items={section.items} />
        </View>
      ))}
    </View>
  );
};
