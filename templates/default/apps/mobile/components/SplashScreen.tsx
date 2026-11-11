import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Animated, Image, Text } from 'react-native';

const { splash } = Constants.expoConfig ?? {};

interface SplashScreenProps {
  onFinish: () => void;
  isLoading?: boolean;
}

export default function SplashScreen({ onFinish, isLoading = false }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start at 1 (fully visible) to prevent native-to-JS splash screen flashing

  // Fade out and call onFinish cleanly when loading is complete
  useEffect(() => {
    if (isLoading) {
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  }, [fadeAnim, onFinish, isLoading]);

  return (
    <Animated.View
      style={{
        backgroundColor: splash?.backgroundColor || '#3f46f9',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeAnim,
      }}>
      <Image
        source={require('../assets/splash.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <Text
        style={{
          position: 'absolute',
          bottom: 92,
          color: '#ffffff',
          fontSize: 14,
          fontFamily: 'Inter',
          textAlign: 'center',
        }}>
        Version {Constants.expoConfig?.version || '1.0.0'}
      </Text>
    </Animated.View>
  );
}
