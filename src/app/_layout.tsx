import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/lib/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useSubscriptionStore } from '@/lib/subscriptionStore';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' | null | undefined }) {
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerBackTitle: 'Home',
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="shorty-magic"
          options={{
            headerShown: true,
            title: 'Shorty Magic',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="chatterly"
          options={{
            headerShown: true,
            title: 'Chatterly',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="magna-hive"
          options={{
            headerShown: true,
            title: 'Magna Hive',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="connectify"
          options={{
            headerShown: true,
            title: 'Connectify',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="pricing"
          options={{
            headerShown: true,
            title: 'Pricing',
            headerBackTitle: 'Home',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);

  // Check subscription status on app load
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <RootLayoutNav colorScheme={colorScheme} />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}