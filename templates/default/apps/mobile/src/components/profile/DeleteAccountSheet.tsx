import { BottomSheet, Button, Text } from '@starter/ui';
import { View } from 'react-native';

import { useTranslation } from '@/src/lib/hooks/useTranslation';

type DeleteAccountSheetProps = {
  open: boolean;
  deleting: boolean;
  onDelete: () => void;
  onDismiss: () => void;
};

/** Account: "Delete your account?" before anything is erased. */
export function DeleteAccountSheet({
  open,
  deleting,
  onDelete,
  onDismiss,
}: DeleteAccountSheetProps) {
  const { t } = useTranslation('profile.account');
  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => !next && !deleting && onDismiss()}
      enableDynamicSizing
      className="gap-5 pb-10">
      <View className="gap-2">
        <Text variant="h4">{t('deleteTitle')}</Text>
        <Text variant="muted">{t('deleteBody')}</Text>
      </View>
      <View className="gap-3">
        <Button
          size="lg"
          variant="destructive"
          disabled={deleting}
          loading={deleting}
          onPress={onDelete}>
          <Text>{t('deleteConfirm')}</Text>
        </Button>
        <Button size="lg" variant="ghost" disabled={deleting} onPress={onDismiss}>
          <Text>{t('deleteCancel')}</Text>
        </Button>
      </View>
    </BottomSheet>
  );
}
