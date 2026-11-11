import * as Haptics from 'expo-haptics';

/**
 * The few vibrations the app uses, so each one means the same thing everywhere. Failures are
 * ignored: a phone with haptics off (or the web) just doesn't vibrate.
 */
/** Runs a haptic call; a missing native module (an older build) or a refusal is ignored. */
function safely(play: () => Promise<void>) {
  try {
    void play().catch(() => undefined);
  } catch {
    // The native module isn't in this build.
  }
}

export const haptics = {
  /** A choice changed: a preset, an amount, a unit, a stepper tap. */
  select: () => safely(() => Haptics.selectionAsync()),
  /** A change was saved and applies now. */
  success: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** A change was saved but waits for tomorrow, or something risky is about to happen. */
  warning: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
