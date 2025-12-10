import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { ActiveWorkoutBanner } from '@/components/workout/active-workout-banner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/services/database';
import { store } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialiser la base de données au démarrage de l'app
  useEffect(() => {
    console.log('🚀 Starting database initialization...');
    initDatabase()
      .then(() => {
        console.log('✅ Database initialized successfully in _layout');
        setIsDbReady(true);
      })
      .catch((error) => {
        console.error('❌ Failed to initialize database:', error);
        alert('Erreur critique: Impossible d\'initialiser la base de données');
      });
  }, []);

  if (!isDbReady) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#fff' }}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#10b981' : '#0a7ea4'} />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="program/[id]" options={{ title: 'Programme' }} />
        <Stack.Screen name="session/[id]" options={{ title: 'Séance' }} />
        <Stack.Screen name="workout/[id]" options={{ title: 'Entraînement' }} />
      </Stack>
      <ActiveWorkoutBanner />
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
