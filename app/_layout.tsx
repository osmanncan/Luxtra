import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import "../global.css";
import BiometricAuth from '../src/components/BiometricAuth';
import { useStore } from '../src/store/useStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings/errors that are unavoidable in Expo Go SDK 54
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'expo-notifications: Android Push notifications',
]);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const user = useStore(s => s.user);
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = React.useState(false);

  useQuickActionRouting();

  useEffect(() => {
    QuickActions.setItems([
      {
        title: 'Add Subscription',
        subtitle: 'Track new payment',
        icon: 'compose',
        id: '0',
        params: { href: '/add-subscription' },
      },
      {
        title: 'Add Responsibility',
        subtitle: 'New task',
        icon: 'task',
        id: '1',
        params: { href: '/add-responsibility' },
      },
    ]);
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [loaded]);

  useEffect(() => {
    if (!isReady) return;

    // Check if user is in an authentication group or onboarding
    const segment = segments[0] as string;
    const inAuthGroup = segment === '(auth)' || segment === 'login' || segment === 'onboarding' || segment === 'register';

    if (!user && !inAuthGroup) {
      // Redirect to onboarding if not authenticated
      router.replace('/onboarding' as any);
    } else if (user && (segment === 'login' || segment === 'onboarding')) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isReady]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BiometricAuth>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="subscription/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="add-subscription" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="add-responsibility" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="ai-insights" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
          </Stack>
        </BiometricAuth>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
