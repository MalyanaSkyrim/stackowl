import { useTokenColor } from '@starter/ui';
import { Stack } from 'expo-router';

/** Sign-in screens: their own stack, shown as one modal over the app. */
export default function AuthLayout() {
  const tokenColor = useTokenColor();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokenColor('background') },
      }}
    />
  );
}
