import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider, useDispatch } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/services/database/database';
import { useAppSelector } from '@/store/hooks';
import { setLoading } from '@/store/slices/authSlice';
import { store } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useDispatch();

  console.log('📱 [RootLayout] State:', { isAuthenticated, isLoading, segments });

  useEffect(() => {
    console.log('🚀 [RootLayout] Initialisation de la base de données...');
    // Initialiser la base de données
    initDatabase().then(() => {
      console.log('✅ [RootLayout] DB initialisée, arrêt du loading');
      // Une fois la DB initialisée, on peut arrêter le loading
      dispatch(setLoading(false));
    }).catch((error) => {
      console.error('❌ [RootLayout] Erreur init DB:', error);
      dispatch(setLoading(false));
    });
  }, []);

  useEffect(() => {
    console.log('🔄 [RootLayout] Navigation effect:', { isAuthenticated, isLoading, segments });
    
    if (isLoading) {
      console.log('⏳ [RootLayout] Loading en cours, pas de redirect');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('🔍 [RootLayout] inAuthGroup:', inAuthGroup);

    if (!isAuthenticated && !inAuthGroup) {
      console.log('🔓 [RootLayout] Non authentifié, redirect vers login');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('🔐 [RootLayout] Authentifié, redirect vers tabs');
      router.replace('/(tabs)');
    } else {
      console.log('✨ [RootLayout] Pas de redirect nécessaire');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
