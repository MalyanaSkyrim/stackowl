import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeStringParam } from '@/lib/utils/params';
import { AuthHeader } from '@/src/components/auth/AuthHeader';
import { ResetRequestForm } from '@/src/components/auth/ResetRequestForm';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

/**
 * 5.3 · Forgot password, step 1 of 3: the email to send a reset code to. Each step is
 * its own screen, so the back button and the swipe-back gesture do the same thing.
 */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth.forgotPassword');
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();

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
          title={t('titleEmail')}
          steps={{ current: 0, total: 3, label: t('stepLabel', { step: 1, total: 3 }) }}
        />
        <ScrollView
          contentContainerClassName="flex-grow gap-[18px] px-6 pb-6"
          keyboardShouldPersistTaps="handled">
          <ResetRequestForm
            defaultEmail={normalizeStringParam(params.email) ?? ''}
            onSent={({ email, resendInSeconds }) =>
              router.push({
                pathname: '/auth/reset-password',
                params: { email, resendIn: String(resendInSeconds) },
              })
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
