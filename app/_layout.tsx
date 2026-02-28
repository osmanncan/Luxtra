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

  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {

  initialRouteName: '(tabs)',
};
SplashScreen.preventAutoHideAsync();
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
    import('../src/services/notificationService').then(({ NotificationService }) => {
      NotificationService.requestPermissions();
    });
    import('../src/services/purchaseService').then(({ PurchaseService }) => {
      PurchaseService.initialize();
    });
    import('../src/services/supabase').then(({ supabase }) => {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          useStore.getState().setUser({
            name: session.user.user_metadata.full_name || 'Kullanıcı',
            email: session.user.email!,
            isPro: false
          });
          useStore.getState().syncData();
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
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const splashHidden = React.useRef(false);

  useEffect(() => {
    async function hideSplashScreen() {
      if (loaded && !splashHidden.current) {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          await SplashScreen.hideAsync();
        } catch (e) {

        } finally {
          splashHidden.current = true;
          setIsReady(true);
        }
      }
    }
    hideSplashScreen();
  }, [loaded]);

  // Deep Link handling for Supabase Auth (e.g. Email Confirmations / Magic Links)
  useEffect(() => {
    import('expo-linking').then((Linking) => {
      const handleDeepLink = async (event: { url: string }) => {
        if (!event.url) return;

        const urlObj = new URL(event.url.replace('#', '?'));
        const refreshToken = urlObj.searchParams.get('refresh_token');
        const accessToken = urlObj.searchParams.get('access_token');

        if (accessToken && refreshToken) {
          const { supabase } = await import('../src/services/supabase');
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
        }
      };

      const subscription = Linking.addEventListener('url', handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });

      return () => subscription.remove();
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'onboarding';

    if (!user && inTabsGroup) {

      router.replace('/onboarding');
    } else if (user && inAuthGroup) {

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
