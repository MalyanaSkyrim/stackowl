import * as Clipboard from 'expo-clipboard';

/** Puts text on the clipboard. Resolves to false when it couldn't (an older build). */
export async function copyText(text: string): Promise<boolean> {
  try {
    return await Clipboard.setStringAsync(text);
  } catch {
    // The native module isn't in this build, or iOS refused.
    return false;
  }
}
