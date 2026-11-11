import { Button, Icon, Text } from '@starter/ui';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCloseAuth } from '@/lib/hooks/useAuth';
import { AuthHeader } from '@/src/components/auth/AuthHeader';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

/**
 * 5.3 · Forgot password, step 3 of 3: the password is saved and the phone is signed in.
 * Going back makes no sense now, so swipe-back is off and both buttons close the modal.
 */
export default function PasswordUpdatedScreen() {
  const { t } = useTranslation('auth.forgotPassword');
  const closeAuth = useCloseAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View className="flex-1 gap-[18px] px-6 pb-6 pt-2">
        <AuthHeader
          action="close"
          actionLabel={t('close')}
          onAction={closeAuth}
          steps={{ current: 2, total: 3, label: t('stepLabel', { step: 3, total: 3 }) }}
        />
        <View className="items-center gap-4 pt-20">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Icon as={Check} size={36} className="text-primary" />
          </View>
          <Text variant="h1" className="text-center">
            {t('titleDone')}
          </Text>
          <Text variant="lead" className="text-center">
            {t('doneBody')}
          </Text>
        </View>
        <View className="flex-1" />
        <Button size="lg" onPress={closeAuth}>
          <Text>{t('done')}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
