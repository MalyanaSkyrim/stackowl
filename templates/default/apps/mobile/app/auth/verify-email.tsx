import { Text } from '@starter/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '@/src/components/auth/AuthHeader';
import { VerifyEmailForm } from '@/src/components/auth/VerifyEmailForm';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { normalizeStringParam } from '@/lib/utils/params';

/** 5.2 · The code sent by email after creating an account. */
export default function VerifyEmailScreen() {
  const { t } = useTranslation('auth.verifyEmail');
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; resendIn: string }>();

  const email = normalizeStringParam(params.email) ?? '';
  const resendIn = Number(normalizeStringParam(params.resendIn) ?? 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <AuthHeader
        className="px-6 pb-[18px] pt-2"
        action="back"
        actionLabel={t('back')}
        onAction={() => router.back()}
        title={t('title')}
      />
      <ScrollView
        contentContainerClassName="flex-grow gap-[18px] px-6 pb-6"
        keyboardShouldPersistTaps="handled">
        <Text variant="lead">
          {t('sentTo')}{' '}
          <Text script="latin" className="font-sans-medium text-foreground">
            {email}
          </Text>{' '}
          <Text className="font-sans-medium text-primary" onPress={() => router.back()}>
            {t('change')}
          </Text>
        </Text>
        <VerifyEmailForm email={email} resendIn={Number.isFinite(resendIn) ? resendIn : 0} />
      </ScrollView>
    </SafeAreaView>
  );
}
