import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeStringParam } from '@/lib/utils/params';
import { AuthHeader } from '@/src/components/auth/AuthHeader';
import { ResetPasswordForm } from '@/src/components/auth/ResetPasswordForm';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

/**
 * 5.3 · Forgot password, step 2 of 3: the emailed code and a new password. Going back
 * returns to the email, as typed. Once saved, the done screen replaces this one.
 */
export default function ResetPasswordScreen() {
  const { t } = useTranslation('auth.forgotPassword');
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; resendIn: string }>();

  const email = normalizeStringParam(params.email) ?? '';
  const resendIn = Number(normalizeStringParam(params.resendIn) ?? 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthHeader
          className="px-6 pb-[18px] pt-2"
          action="back"
          actionLabel={t('back')}
          onAction={() => router.back()}
          title={t('titleReset')}
          steps={{ current: 1, total: 3, label: t('stepLabel', { step: 2, total: 3 }) }}
        />
        <ScrollView
          contentContainerClassName="flex-grow gap-[18px] px-6 pb-6"
          keyboardShouldPersistTaps="handled">
          <ResetPasswordForm
            email={email}
            resendIn={Number.isFinite(resendIn) ? resendIn : 0}
            onReset={() => router.replace('/auth/password-updated')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
