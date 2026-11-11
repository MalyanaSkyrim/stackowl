import { Button, Icon, Skeleton, Text } from '@starter/ui';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { FileText, Plus } from 'lucide-react-native';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { NoteRow } from '@/src/components/notes/NoteRow';
import { useTRPC } from '@/src/lib/api/trpc';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { currentUserAtom } from '@/src/lib/store/session';

/**
 * The Notes tab: the example feature. Signed out, it asks to sign in; signed in, it lists the
 * user's notes from the API (`notes.list`) and opens one to edit. Copy it for your first real
 * screen, then delete it.
 */
export default function NotesScreen() {
  const { t } = useTranslation('notes');
  const router = useRouter();
  const trpc = useTRPC();
  const user = useAtomValue(currentUserAtom);
  const notes = useQuery({ ...trpc.notes.list.queryOptions(), enabled: user !== null });
  useRefreshOnFocus(notes.refetch);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-5 pb-4 pt-4">
        <Text variant="h2">{t('title')}</Text>
        {user ? (
          <Button
            size="icon"
            className="h-11 w-11 rounded-full"
            accessibilityLabel={t('new')}
            onPress={() => router.push({ pathname: '/notes/[id]', params: { id: 'new' } })}>
            <Icon as={Plus} size={22} className="text-primary-foreground" />
          </Button>
        ) : null}
      </View>

      {user === null ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Icon as={FileText} size={40} className="text-muted-foreground" />
          <Text className="text-center text-body-lg font-semibold">{t('signedOutTitle')}</Text>
          <Text variant="muted" className="text-center">
            {t('signedOutBody')}
          </Text>
          <Button size="lg" onPress={() => router.push('/auth/sign-in')}>
            <Text>{t('signIn')}</Text>
          </Button>
        </View>
      ) : notes.isPending ? (
        <View className="gap-3 px-5">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </View>
      ) : notes.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text variant="muted" className="text-center">
            {t('loadError')}
          </Text>
          <Button variant="outline" onPress={() => notes.refetch()}>
            <Text>{t('retry')}</Text>
          </Button>
        </View>
      ) : (
        <FlatList
          data={notes.data}
          keyExtractor={(note) => note.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          renderItem={({ item }) => (
            <NoteRow
              note={item}
              onPress={() => router.push({ pathname: '/notes/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <View className="items-center gap-2 px-8 pt-16">
              <Text className="text-center text-body-lg font-semibold">{t('emptyTitle')}</Text>
              <Text variant="muted" className="text-center">
                {t('emptyBody')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
