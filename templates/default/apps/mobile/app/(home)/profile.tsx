import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@starter/ui';

import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { ProfileMenu } from '../../src/components/profile/ProfileMenu';

/** The Settings tab: account, language, theme and the legal pages. */
const Settings = () => {
  const { t } = useTranslation('nav');
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="px-5 pb-4 pt-4">
        <Text variant="h2">{t('settings')}</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5">
          <ProfileMenu />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
