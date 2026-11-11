import { Button, OtpInput, OTP_LENGTH, Text } from '@starter/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import { useCloseAuth, useSaveSession } from '@/lib/hooks/useAuth';
import { deviceName } from '@/lib/native/device';
import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage, type AuthErrorMessage } from '@/src/lib/auth/errors';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

import { ResendCodeRow } from '@/src/components/auth/ResendCodeRow';

/**
 * The 6-digit code that confirms the email. A full code is checked right away; a correct
 * one signs the user in and closes the modal.
 */
export function VerifyEmailForm({ email, resendIn }: { email: string; resendIn: number }) {
  const { t } = useTranslation('auth');
  const trpc = useTRPC();
  const saveSession = useSaveSession();
  const closeAuth = useCloseAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<AuthErrorMessage | null>(null);

  const verify = useMutation(
    trpc.auth.verifyOtp.mutationOptions({
      onSuccess: (signedIn) => {
        saveSession(signedIn);
        closeAuth();
      },
      onError: (failure) => {
        setError(authErrorMessage(failure));
        setCode('');
      },
    })
  );

  const resend = useMutation(trpc.auth.requestOtp.mutationOptions());

  const resendCode = async () => {
    const sent = await resend.mutateAsync({ email, purpose: 'SIGNUP' });
    setError(null);
    return sent;
  };

  const submit = (value: string) => {
    if (value.length !== OTP_LENGTH || verify.isPending) return;
    verify.mutate({ email, code: value, purpose: 'SIGNUP', deviceName });
  };

  const onChangeCode = (value: string) => {
    setCode(value);
    setError(null);
    submit(value);
  };

  return (
    <View className="flex-1 gap-[18px]">
      <OtpInput value={code} onChangeText={onChangeCode} invalid={error !== null} />
      {error && <Text className="text-destructive">{t(`errors.${error}`)}</Text>}

      <ResendCodeRow
        resendIn={resendIn}
        resentMessage={t('verifyEmail.newCodeSent')}
        onResend={resendCode}
      />

      <View className="flex-1" />

      <Button
        size="lg"
        disabled={code.length !== OTP_LENGTH || verify.isPending}
        loading={verify.isPending}
        onPress={() => submit(code)}>
        <Text>{t('verifyEmail.verify')}</Text>
      </Button>
    </View>
  );
}
