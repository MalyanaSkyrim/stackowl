import { brand, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@starter/common';
import { Button, Form, FormInput, Text } from '@starter/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { useCloseAuth, useSaveSession } from '@/lib/hooks/useAuth';
import { deviceName } from '@/lib/native/device';
import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage, errorResendInSeconds } from '@/src/lib/auth/errors';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

export type EmailAuthMode = 'signIn' | 'signUp';

type FormValues = { email: string; password: string };

/**
 * Email and password. Creating an account, or signing in before the email is confirmed,
 * opens the code screen; a confirmed sign-in closes the modal.
 */
export function EmailAuthForm({ mode }: { mode: EmailAuthMode }) {
  const { t } = useTranslation('auth');
  const trpc = useTRPC();
  const router = useRouter();
  const saveSession = useSaveSession();
  const closeAuth = useCloseAuth();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .pipe(z.email(t('validation.emailInvalid'))),
        password:
          mode === 'signUp'
            ? z
                .string()
                .min(
                  PASSWORD_MIN_LENGTH,
                  t('validation.passwordTooShort', { min: PASSWORD_MIN_LENGTH })
                )
                .max(
                  PASSWORD_MAX_LENGTH,
                  t('validation.passwordTooLong', { max: PASSWORD_MAX_LENGTH })
                )
            : z.string().min(1, t('validation.passwordRequired')),
      }),
    [mode, t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    // The button stays disabled while the form is invalid, so a field shows its error
    // once the user leaves it instead of on submit.
    mode: 'onTouched',
  });

  const openCodeScreen = ({ email, resendInSeconds }: { email: string; resendInSeconds: number }) =>
    router.push({
      pathname: '/auth/verify-email',
      params: { email, resendIn: String(resendInSeconds) },
    });

  const showError = (error: unknown) => {
    const message = authErrorMessage(error);
    if (message === 'EMAIL_TAKEN') {
      form.setError('email', { message: t('errors.EMAIL_TAKEN') });
    } else {
      form.setError('root', { message: t(`errors.${message}`) });
    }
  };

  const signUp = useMutation(
    trpc.auth.signUp.mutationOptions({ onSuccess: openCodeScreen, onError: showError })
  );

  const logIn = useMutation(
    trpc.auth.logIn.mutationOptions({
      onSuccess: (signedIn) => {
        saveSession(signedIn);
        closeAuth();
      },
      onError: (error, { email }) => {
        // The email is not confirmed yet: the API sent a new code.
        const resendInSeconds = errorResendInSeconds(error);
        if (authErrorMessage(error) === 'EMAIL_NOT_VERIFIED' && resendInSeconds !== null) {
          openCodeScreen({ email, resendInSeconds });
          return;
        }
        showError(error);
      },
    })
  );

  const onSubmit = (values: FormValues) => {
    if (mode === 'signUp') {
      signUp.mutate(values);
    } else {
      logIn.mutate({ ...values, deviceName });
    }
  };

  // Checked against the current schema, so switching between sign-in and sign-up (whose
  // password rules differ) updates the button straight away.
  const values = useWatch({ control: form.control });
  const canSubmit = schema.safeParse(values).success;

  const rootError = form.formState.errors.root?.message;
  // Busy from the tap until the request ends: validating, then the request itself.
  const isBusy = form.formState.isSubmitting || signUp.isPending || logIn.isPending;

  return (
    <Form form={form}>
      <View className="flex-1 gap-4">
        <FormInput
          name="email"
          control={form.control}
          label={t('signIn.email')}
          placeholder={t('signIn.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormInput
          // A new field per mode, so the keychain suggests a new password on sign-up.
          key={mode}
          name="password"
          control={form.control}
          label={t('signIn.password')}
          placeholder={t(
            mode === 'signUp'
              ? 'signIn.passwordPlaceholderSignUp'
              : 'signIn.passwordPlaceholderSignIn'
          )}
          secureTextEntry
          enablePasswordToggle
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          onSubmitEditing={form.handleSubmit(onSubmit)}
        />
        {mode === 'signIn' && (
          <Button
            variant="link"
            className="-mt-2 self-end"
            onPress={() =>
              router.push({
                pathname: '/auth/forgot-password',
                params: { email: form.getValues('email').trim() },
              })
            }>
            <Text className="text-primary">{t('signIn.forgotPassword')}</Text>
          </Button>
        )}
        {rootError && <Text className="text-destructive">{rootError}</Text>}

        <View className="flex-1" />

        <Button
          size="lg"
          disabled={!canSubmit || isBusy}
          loading={isBusy}
          onPress={form.handleSubmit(onSubmit)}>
          <Text>{t(mode === 'signUp' ? 'signIn.submitSignUp' : 'signIn.submitSignIn')}</Text>
        </Button>
        <Text variant="caption" className="text-center">
          {mode === 'signUp'
            ? t('signIn.noteSignUp')
            : t('signIn.noteSignIn', { appName: brand.displayName })}
        </Text>
      </View>
    </Form>
  );
}
