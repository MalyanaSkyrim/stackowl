import { Text } from '@starter/ui';
import { Pressable } from 'react-native';

import { useTranslation } from '@/src/lib/hooks/useTranslation';

type NoteRowProps = {
  // Dates arrive from the API as ISO strings (no tRPC transformer).
  note: { title: string; body: string; updatedAt: string | Date };
  onPress: () => void;
};

/** One note in the Notes list: its title, the start of its text and when it last changed. */
export function NoteRow({ note, onPress }: NoteRowProps) {
  const { t, intl } = useTranslation('notes');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="gap-1 rounded-card border border-border bg-card p-4 active:opacity-80">
      <Text className="text-body-lg font-semibold" numberOfLines={1}>
        {note.title}
      </Text>
      {note.body ? (
        <Text variant="muted" numberOfLines={2}>
          {note.body}
        </Text>
      ) : null}
      <Text className="text-caption text-muted-foreground">
        {t('updated', { date: intl.formatDate(note.updatedAt, { dateStyle: 'medium' }) })}
      </Text>
    </Pressable>
  );
}
