import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { fontFamily } from '@starter/design-tokens';
import { TextScriptContext, useTokenColor } from '@starter/ui';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { Platform } from 'react-native';

/** The tab bar: Notes (the example feature) and Settings. Add your own tabs here. */
export default function TabsLayout() {
  const { t } = useTranslation('nav');
  const tokenColor = useTokenColor();
  const script = useContext(TextScriptContext);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokenColor('primary'),
        tabBarInactiveTintColor: tokenColor('muted-foreground'),
        tabBarStyle: {
          backgroundColor: tokenColor('card'),
          borderTopWidth: 1,
          borderTopColor: tokenColor('border'),
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 74,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fontFamily[script === 'arabic' ? 'arabic-semibold' : 'sans-semibold'][0],
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('notes'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
