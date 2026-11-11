import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@starter/common';
import { Button, Form, FormInput, FormOtpInput, Label, OTP_LENGTH, Text } from '@starter/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { useSaveSession } from '@/lib/hooks/useAuth';
import { deviceName } from '@/lib/native/device';
import { ResendCodeRow } from '@/src/components/auth/ResendCodeRow';
import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage } from '@/src/lib/auth/errors';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

type FormValues = { code: string; password: string; confirmPassword: string };

/**
 * Forgot password, step 2: the emailed code and the new password, twice. A correct code
 * saves the password and signs this phone in (the other devices are signed out).
 */
export function ResetPasswordForm({
  email,
  resendIn,
  onReset,
}: {
  email: string;
  resendIn: number;
  onReset: () => void;
}) {
  const { t } = useTranslation('auth');
  const trpc = useTRPC();
  const saveSession = useSaveSession();

  const schema = useMemo(
    () =>
      z
        .object({
          code: z
            .string()
            .trim()
            .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), t('validation.codeInvalid')),
          password: z
            .string()
            .min(
              PASSWORD_MIN_LENGTH,
              t('validation.passwordTooShort', { min: PASSWORD_MIN_LENGTH })
            )
            .max(
              PASSWORD_MAX_LENGTH,
              t('validation.passwordTooLong', { max: PASSWORD_MAX_LENGTH })
            ),
          confirmPassword: z.string(),
        })
        .refine((values) => values.password === values.confirmPassword, {
          path: ['confirmPassword'],
          message: t('validation.passwordsDontMatch'),
        }),
    [t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const reset = useMutation(
    trpc.auth.resetPassword.mutationOptions({
      onSuccess: (signedIn) => {
        saveSession(signedIn);
        onReset();
      },
      onError: (error) => {
        const message = authErrorMessage(error);
        if (message === 'INVALID_CODE' || message === 'TOO_MANY_ATTEMPTS') {
          form.setError('code', { message: t(`errors.${message}`) });
        } else {
          form.setError('root', { message: t(`errors.${message}`) });
        }
      },
    })
  );

  const resend = useMutation(trpc.auth.requestPasswordReset.mutationOptions());

  const resendCode = async () => {
    const sent = await resend.mutateAsync({ email });
    form.clearErrors('code');
    return sent;
  };

  const onSubmit = ({ code, password }: FormValues) =>
    reset.mutate({ email, code: code.trim(), password, deviceName });

  const values = useWatch({ control: form.control });
  const canSubmit = schema.safeParse(values).success;
  const rootError = form.formState.errors.root?.message;
  const isBusy = form.formState.isSubmitting || reset.isPending;

  return (
    <Form form={form}>
      <View className="flex-1 gap-4">
        <Text variant="lead">
          {t('forgotPassword.codeIntro')}{' '}
          <Text script="latin" className="font-sans-medium text-foreground">
            {email}
          </Text>
        </Text>
        <View className="gap-2">
          <Label>{t('forgotPassword.code')}</Label>
          <FormOtpInput name="code" control={form.control} />
          {/* The API sends nothing for an unknown email, or during the cooldown and the
              hourly cap, and says so to nobody: the copy can't promise a code. */}
          <ResendCodeRow
            resendIn={resendIn}
            resentMessage={t('forgotPassword.newCodeMaybeSent')}
            onResend={resendCode}
          />
        </View>
        <FormInput
          name="password"
          control={form.control}
          label={t('forgotPassword.newPassword')}
          placeholder={t('signIn.passwordPlaceholderSignUp')}
          secureTextEntry
          enablePasswordToggle
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormInput
          name="confirmPassword"
          control={form.control}
          label={t('forgotPassword.confirmPassword')}
          placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
          secureTextEntry
          enablePasswordToggle
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={form.handleSubmit(onSubmit)}
        />
        {rootError && <Text className="text-destructive">{rootError}</Text>}

        <View className="flex-1" />

        <Button
          size="lg"
          disabled={!canSubmit || isBusy}
          loading={isBusy}
          onPress={form.handleSubmit(onSubmit)}>
          <Text>{t('forgotPassword.save')}</Text>
        </Button>
      </View>
    </Form>
  );
}
