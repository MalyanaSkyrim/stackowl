import { NOTE_BODY_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '@starter/common';
import { Button, Icon, Input, Skeleton, Text, Textarea, toast } from '@starter/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, I18nManager, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTRPC } from '@/src/lib/api/trpc';
import { useTranslation } from '@/src/lib/hooks/useTranslation';

// Back points toward the start of the screen: left, or right in Arabic.
const BackArrow = I18nManager.isRTL ? ArrowRight : ArrowLeft;

/**
 * One note, to read and edit; `id` is `new` for a note not saved yet. Saving calls
 * `notes.create` or `notes.update`, then refreshes the list.
 */
export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { t } = useTranslation('notes.editor');
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const note = useQuery({ ...trpc.notes.get.queryOptions({ id }), enabled: !isNew });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Fill the fields once the saved note arrives.
  useEffect(() => {
    if (note.data) {
      setTitle(note.data.title);
      setBody(note.data.body);
    }
  }, [note.data]);

  const done = () => {
    void queryClient.invalidateQueries({ queryKey: trpc.notes.list.queryKey() });
    router.back();
  };
  const onError = () => toast.error(t('saveError'));

  const create = useMutation(trpc.notes.create.mutationOptions({ onSuccess: done, onError }));
  const update = useMutation(trpc.notes.update.mutationOptions({ onSuccess: done, onError }));
  const remove = useMutation(trpc.notes.delete.mutationOptions({ onSuccess: done, onError }));
  const saving = create.isPending || update.isPending || remove.isPending;

  const save = () => {
    if (isNew) create.mutate({ title, body });
    else update.mutate({ id, title, body });
  };

  const confirmDelete = () =>
    Alert.alert(t('deleteTitle'), t('deleteBody'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => remove.mutate({ id }) },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between gap-3 px-5 py-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          accessibilityLabel={t('back')}
          onPress={() => router.back()}>
          <Icon as={BackArrow} size={24} className="text-foreground" />
        </Button>
        <Text className="flex-1 text-center text-lg font-bold" numberOfLines={1}>
          {isNew ? t('newTitle') : t('editTitle')}
        </Text>
        {isNew ? (
          <View className="h-12 w-12" />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            accessibilityLabel={t('delete')}
            disabled={saving}
            onPress={confirmDelete}>
            <Icon as={Trash2} size={22} className="text-destructive" />
          </Button>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!isNew && note.isPending ? (
          <View className="gap-3 px-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-40 w-full" />
          </View>
        ) : (
          <ScrollView
            contentContainerClassName="flex-grow gap-3 px-5 pb-6"
            keyboardShouldPersistTaps="handled">
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder={t('titlePlaceholder')}
              maxLength={NOTE_TITLE_MAX_LENGTH}
              accessibilityLabel={t('titlePlaceholder')}
              autoFocus={isNew}
            />
            <Textarea
              value={body}
              onChangeText={setBody}
              placeholder={t('bodyPlaceholder')}
              maxLength={NOTE_BODY_MAX_LENGTH}
              accessibilityLabel={t('bodyPlaceholder')}
              className="min-h-48"
            />
            <View className="flex-1" />
            <Button size="lg" disabled={saving || title.trim() === ''} loading={saving} onPress={save}>
              <Text>{t('save')}</Text>
            </Button>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
