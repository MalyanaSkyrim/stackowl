import type { CodeSent } from '@starter/common';
import { Button, Form, FormInput, Text } from '@starter/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage } from '@/src/lib/auth/errors';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

type FormValues = { email: string };

/**
 * Forgot password, step 1: the email to send a reset code to. The API answers the same
 * way whether or not the email has an account, so the next step always opens.
 */
export function ResetRequestForm({
  defaultEmail,
  onSent,
}: {
  defaultEmail: string;
  onSent: (sent: CodeSent) => void;
}) {
  const { t } = useTranslation('auth');
  const trpc = useTRPC();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .pipe(z.email(t('validation.emailInvalid'))),
      }),
    [t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail },
    mode: 'onTouched',
  });

  const request = useMutation(
    trpc.auth.requestPasswordReset.mutationOptions({
      onSuccess: onSent,
      onError: (error) =>
        form.setError('root', { message: t(`errors.${authErrorMessage(error)}`) }),
    })
  );

  const onSubmit = (values: FormValues) => request.mutate(values);

  const values = useWatch({ control: form.control });
  const canSubmit = schema.safeParse(values).success;
  const rootError = form.formState.errors.root?.message;
  const isBusy = form.formState.isSubmitting || request.isPending;

  return (
    <Form form={form}>
      <View className="flex-1 gap-[18px]">
        <Text variant="lead">{t('forgotPassword.emailIntro')}</Text>
        <FormInput
          name="email"
          control={form.control}
          label={t('signIn.email')}
          placeholder={t('signIn.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          onSubmitEditing={form.handleSubmit(onSubmit)}
        />
        {rootError && <Text className="text-destructive">{rootError}</Text>}

        <View className="flex-1" />

        <Button
          size="lg"
          disabled={!canSubmit || isBusy}
          loading={isBusy}
          onPress={form.handleSubmit(onSubmit)}>
          <Text>{t('forgotPassword.sendCode')}</Text>
        </Button>
      </View>
    </Form>
  );
}
