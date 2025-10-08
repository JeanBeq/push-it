import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  console.log('🏠 [Home] User:', user?.email || 'null');

  const handleLogout = () => {
    console.log('👋 [Home] Déconnexion demandée');
    dispatch(clearAuth());
    router.replace('/(auth)/login');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        user?.picture ? (
          <Image
            source={{ uri: user.picture }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        )
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenue !</ThemedText>
      </ThemedView>

      {user && (
        <ThemedView style={styles.userContainer}>
          <ThemedText type="subtitle">Profil</ThemedText>
          <View style={styles.userInfo}>
            {user.picture && (
              <Image
                source={{ uri: user.picture }}
                style={styles.avatar}
              />
            )}
            <View>
              <ThemedText type="defaultSemiBold">{user.name || 'Utilisateur'}</ThemedText>
              <ThemedText style={styles.email}>{user.email}</ThemedText>
            </View>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Se déconnecter</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Push-It</ThemedText>
        <ThemedText>
          Application de gestion d'entraînement sportif
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  profileImage: {
    height: 200,
    width: 200,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 40,
  },
  userContainer: {
    gap: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
