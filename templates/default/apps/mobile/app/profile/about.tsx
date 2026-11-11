import { brand } from '@starter/common';
import { AppLogo, APP_LOGO_DEFAULT_COLOR, Button, Icon, MenuList, Text } from '@starter/ui';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, ArrowRight, FileText, Globe, Lock } from 'lucide-react-native';
import { I18nManager, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { webUrls } from '@/src/lib/webUrls';

const LOGO_SIZE = 72;

// Back points toward the start of the screen: left, or right in Arabic.
const BackArrow = I18nManager.isRTL ? ArrowRight : ArrowLeft;

const open = (url: string) => void WebBrowser.openBrowserAsync(url).catch(() => undefined);

/** Settings › About: the app's name and version, and the website, privacy policy and terms. */
export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile.about');
  const version = Constants.expoConfig?.version ?? '';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-6 py-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          accessibilityLabel={t('back')}
          onPress={() => router.back()}>
          <Icon as={BackArrow} size={24} className="text-foreground" />
        </Button>
        <Text className="flex-1 text-center text-lg font-bold text-foreground" numberOfLines={1}>
          {t('title')}
        </Text>
        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}>
        <View className="mb-8 mt-4 items-center">
          <AppLogo size={LOGO_SIZE} color={APP_LOGO_DEFAULT_COLOR} />
          <Text className="mt-4 text-center text-xl font-semibold text-primary">
            {brand.displayName}
          </Text>
          {version ? (
            <Text variant="muted" className="mt-1 text-center">
              {t('version', { version })}
            </Text>
          ) : null}
        </View>

        <MenuList
          items={[
            {
              icon: <Icon as={Globe} size={22} className="text-primary" />,
              title: t('website'),
              onPress: () => open(webUrls.website),
            },
            {
              icon: <Icon as={Lock} size={22} className="text-primary" />,
              title: t('privacyPolicy'),
              onPress: () => open(webUrls.privacy),
            },
            {
              icon: <Icon as={FileText} size={22} className="text-primary" />,
              title: t('termsConditions'),
              onPress: () => open(webUrls.terms),
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
