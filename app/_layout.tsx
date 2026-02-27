import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { useColorScheme } from 'react-native';

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

    // Request notification permissions
    import('../src/services/notificationService').then(({ NotificationService }) => {
      NotificationService.requestPermissions();
    });

    // Initialize RevenueCat
    import('../src/services/purchaseService').then(({ PurchaseService }) => {
      PurchaseService.initialize();
    });

    // Supabase Auth Listener
    import('../src/services/supabase').then(({ supabase }) => {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          useStore.getState().setUser({
            name: session.user.user_metadata.full_name || 'Kullanıcı',
            email: session.user.email!,
            isPro: false // Pro is OFF by default — only activated after real Play Store purchase
          });
          useStore.getState().syncData();

          // Identify user in RevenueCat & check real Pro status from Play Store
          try {
            const { PurchaseService } = await import('../src/services/purchaseService');
            await PurchaseService.identifyUser(session.user.id);
            const isPro = await PurchaseService.checkProStatus();
            if (isPro) {
              useStore.getState().setUser({
                name: session.user.user_metadata.full_name || 'Kullanıcı',
                email: session.user.email!,
                isPro: true,
              });
            }
          } catch (e) {
            console.log('[Luxtra] RevenueCat check skipped (not available):', e);
          }
        } else {
          useStore.getState().setUser(null);
        }
      });
    });
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const splashHidden = React.useRef(false);

  useEffect(() => {
    async function hideSplashScreen() {
      if (loaded && !splashHidden.current) {
        try {
          // Delaying hideAsync by 100ms often resolves "No native splash screen" errors 
          // that happen during rapid navigation or initialization.
          await new Promise(resolve => setTimeout(resolve, 100));
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore errors like "No native splash screen"
        } finally {
          splashHidden.current = true;
          setIsReady(true);
        }
      }
    }
    hideSplashScreen();
  }, [loaded]);

  useEffect(() => {
    if (!isReady) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'onboarding';

    if (!user && inTabsGroup) {
      // Giriş yapmamışsa Onboarding/Login ekranına gönder
      router.replace('/onboarding');
    } else if (user && inAuthGroup) {
      // Giriş yapmışsa ama login/register/onboarding ekranındaysa tabs'e gönder
      router.replace('/(tabs)');
    }
  }, [isReady, user, segments]);

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
            <Stack.Screen name="manage-categories" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="achievements" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        </BiometricAuth>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
