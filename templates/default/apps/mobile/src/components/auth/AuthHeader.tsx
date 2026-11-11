import { Button, cn, Icon, Text } from '@starter/ui';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { I18nManager, View } from 'react-native';

type AuthHeaderProps = {
  /** `close` dismisses the whole modal; `back` returns to the previous step. */
  action: 'close' | 'back';
  actionLabel: string;
  onAction: () => void;
  /** Left out when the screen shows its own headline (a success step). */
  title?: string;
  /** For screens with several steps: a bar per step next to the button. */
  steps?: { current: number; total: number; label: string };
  className?: string;
};

/**
 * The icon button and headline at the top of each sign-in screen. Screens that scroll render it
 * above their ScrollView, so it stays put.
 */
export function AuthHeader({
  action,
  actionLabel,
  onAction,
  title,
  steps,
  className,
}: AuthHeaderProps) {
  const BackIcon = I18nManager.isRTL ? ChevronRight : ChevronLeft;

  return (
    <View className={cn('gap-4', className)}>
      <View className="flex-row items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onPress={onAction}
          accessibilityLabel={actionLabel}
          hitSlop={8}
          className="-ms-3">
          {action === 'close' ? (
            <Icon as={X} size={20} className="text-foreground" />
          ) : (
            <Icon as={BackIcon} size={22} className="text-foreground" />
          )}
        </Button>
        {steps && (
          <View className="flex-1 flex-row gap-1.5" accessible accessibilityLabel={steps.label}>
            {Array.from({ length: steps.total }, (_, index) => (
              <View
                key={index}
                className={`h-1 flex-1 rounded-full ${index <= steps.current ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </View>
        )}
      </View>
      {title && <Text variant="h1">{title}</Text>}
    </View>
  );
}
