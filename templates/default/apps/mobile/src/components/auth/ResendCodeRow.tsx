import type { CodeSent } from '@starter/common';
import { Button, Text, toast } from '@starter/ui';
import { useState } from 'react';
import { View } from 'react-native';

import { useCountdown } from '@/lib/hooks/useCountdown';
import { authErrorMessage } from '@/src/lib/auth/errors';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

/**
 * "Didn't get it?" and the resend button under a code field, with its countdown. Each
 * code screen passes the call that sends a new code; a failure shows as a toast.
 */
export function ResendCodeRow({
  resendIn,
  resentMessage,
  onResend,
}: {
  /** Seconds before the first resend is allowed. */
  resendIn: number;
  /** Shown once a new code was asked for. */
  resentMessage: string;
  onResend: () => Promise<CodeSent>;
}) {
  const { t } = useTranslation('auth');
  const countdown = useCountdown(resendIn);
  const [resent, setResent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const resend = async () => {
    setIsSending(true);
    try {
      const { resendInSeconds } = await onResend();
      setResent(true);
      countdown.restart(resendInSeconds);
    } catch (error) {
      toast.error(t(`errors.${authErrorMessage(error)}`));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant="muted" className="shrink">
        {resent ? resentMessage : t('verifyEmail.checkSpam')}
      </Text>
      <Button
        variant="link"
        disabled={!countdown.isComplete || isSending}
        loading={isSending}
        onPress={resend}>
        <Text className="text-primary">
          {countdown.isComplete
            ? t('verifyEmail.resend')
            : t('verifyEmail.resendIn', { seconds: countdown.remaining })}
        </Text>
      </Button>
    </View>
  );
}
