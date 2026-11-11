import type { SignInMethod } from '@starter/common';
import { Avatar, Button, Icon, MenuList, Skeleton, Text, toast } from '@starter/ui';
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { I18nManager, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteAccount, useSignOut } from '@/lib/hooks/useAuth';
import { DeleteAccountSheet } from '@/src/components/profile/DeleteAccountSheet';
import { useTRPC } from '@/src/lib/api/trpc';
import { authErrorMessage } from '@/src/lib/auth/errors';
import type { TranslationKey } from '@/src/lib/hooks/useTranslation';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { currentUserAtom } from '@/src/lib/store/session';

// A Record, so a method added to `signInMethodSchema` is a type error here until it has a name.
const METHOD_NAMES: Record<SignInMethod, TranslationKey> = {
  PASSWORD: 'profile.account.methodPassword',
  APPLE: 'profile.account.methodApple',
  GOOGLE: 'profile.account.methodGoogle',
};

// Back points toward the start of the screen: left, or right in Arabic.
const BackArrow = I18nManager.isRTL ? ArrowRight : ArrowLeft;

/** Account (signed in only): who is signed in, sign out and delete account. */
export default function AccountScreen() {
  const { t } = useTranslation('profile.account');
  const { t: tFull } = useTranslation();
  const router = useRouter();
  const trpc = useTRPC();
  const user = useAtomValue(currentUserAtom);
  const signOut = useSignOut();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The sign-in methods only come from the API; offline, their rows stay out.
  const account = useQuery({ ...trpc.auth.account.queryOptions(), enabled: user !== null });
  const deleteAccount = useDeleteAccount({
    onError: (error) => toast.error(tFull(`auth.errors.${authErrorMessage(error)}`)),
  });

  // Signed out (sign out, deleted account, expired session): back to Settings.
  const signedOut = user === null;
  useEffect(() => {
    if (signedOut && router.canGoBack()) router.back();
  }, [router, signedOut]);
  if (user === null) return null;

  const methods = account.data?.signInMethods ?? [];
  const methodNames = methods.map((method) => tFull(METHOD_NAMES[method])).join(', ');

  const details = [
    { title: t('email'), value: user.email, showChevron: false },
    ...(methods.length > 0
      ? [{ title: t('signInMethod'), value: methodNames, showChevron: false }]
      : []),
    ...(methods.includes('PASSWORD')
      ? [
          {
            title: t('changePassword'),
            onPress: () =>
              router.push({ pathname: '/auth/forgot-password', params: { email: user.email } }),
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-6 py-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          accessibilityLabel={t('back')}
          onPress={() => router.back()}>
          <Icon as={BackArrow} size={24} className="text-foreground" />
        </Button>
        <Text className="flex-1 text-center text-lg font-bold text-foreground" numberOfLines={1}>
          {t('title')}
        </Text>
        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-4 px-5 pb-6 pt-2"
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3.5 rounded-card border border-border bg-card p-[18px]">
          <Avatar name={user.name ?? user.email} size="lg" />
          <View className="flex-1 gap-0.5">
            <Text className="text-body-lg font-semibold" numberOfLines={1}>
              {user.name ?? user.email}
            </Text>
            {account.isPending ? (
              <Skeleton className="h-4 w-36" />
            ) : methods.length > 0 ? (
              <Text variant="muted">{t('signedInWith', { methods: methodNames })}</Text>
            ) : null}
          </View>
        </View>

        <MenuList items={details} />

        <Button size="lg" variant="outline" disabled={deleteAccount.isPending} onPress={signOut}>
          <Text>{t('signOut')}</Text>
        </Button>

        <View className="flex-1" />

        <View className="items-center gap-1">
          <Button
            variant="ghost"
            disabled={deleteAccount.isPending}
            onPress={() => setConfirmDelete(true)}>
            <Text className="text-destructive">{t('delete')}</Text>
          </Button>
          <Text variant="muted" className="text-center">
            {t('signOutNote')}
          </Text>
        </View>
      </ScrollView>

      <DeleteAccountSheet
        open={confirmDelete}
        deleting={deleteAccount.isPending}
        onDelete={() =>
          deleteAccount.mutate(undefined, { onSuccess: () => toast.success(t('deleted')) })
        }
        onDismiss={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}
