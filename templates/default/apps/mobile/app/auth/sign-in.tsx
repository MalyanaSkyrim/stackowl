import { Text, ToggleGroup, ToggleGroupItem } from '@starter/ui';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCloseAuth } from '@/lib/hooks/useAuth';
import { AuthHeader } from '@/src/components/auth/AuthHeader';
import { EmailAuthForm, type EmailAuthMode } from '@/src/components/auth/EmailAuthForm';
import { SocialSignIn } from '@/src/components/auth/SocialSignIn';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

/** 5.1 · Sign in or create an account, with Apple, Google or email. */
export default function SignInScreen() {
  const { t } = useTranslation('auth.signIn');
  const closeAuth = useCloseAuth();
  const [mode, setMode] = useState<EmailAuthMode>('signIn');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthHeader
          className="px-6 pb-4 pt-2"
          action="close"
          actionLabel={t('close')}
          onAction={closeAuth}
          title={t(mode === 'signUp' ? 'titleSignUp' : 'titleSignIn')}
        />
        <ScrollView
          contentContainerClassName="flex-grow gap-4 px-6 pb-6"
          keyboardShouldPersistTaps="handled">
          <ToggleGroup
            type="single"
            variant="segmented"
            value={mode}
            onValueChange={(value) => {
              if (value === 'signIn' || value === 'signUp') setMode(value);
            }}>
            <ToggleGroupItem value="signIn" aria-label={t('tabSignIn')}>
              <Text>{t('tabSignIn')}</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="signUp" aria-label={t('tabSignUp')}>
              <Text>{t('tabSignUp')}</Text>
            </ToggleGroupItem>
          </ToggleGroup>

          <SocialSignIn />
          <EmailAuthForm mode={mode} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
