import { fetchGoogleUserInfo, useGoogleAuth } from '@/services/auth/googleAuth';
import { upsertUser } from '@/services/database/userRepository';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLoading, setUser } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { request, response, promptAsync } = useGoogleAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  console.log('🔐 [Login] State:', { isAuthenticated, isLoading, hasRequest: !!request });
  console.log('🔐 [Login] Response:', response?.type);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ [Login] Déjà authentifié, redirect vers tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('📨 [Login] Response changed:', response?.type);
    
    if (response?.type === 'success') {
      console.log('🎉 [Login] Authentification réussie !');
      setErrorMessage(null);
      handleGoogleSignIn(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      console.error('❌ [Login] Erreur OAuth:', response.error);
      console.error('❌ [Login] Détails erreur:', JSON.stringify(response, null, 2));
      
      let errorMsg = 'Erreur de connexion';
      
      if (response.error?.message) {
        errorMsg = response.error.message;
      }
      
      setErrorMessage(errorMsg);
      
      Alert.alert(
        '❌ Erreur de connexion',
        'Vérifiez que l\'URI de redirection est configurée dans Google Cloud Console.\n\n' +
        'URI requise: https://auth.expo.io/@anonymous/push-it\n\n' +
        'Consultez FIX-GOOGLE-AUTH.md pour plus de détails.',
        [{ text: 'OK' }]
      );
    } else if (response?.type === 'cancel') {
      console.log('⚠️ [Login] Authentification annulée');
      setErrorMessage('Connexion annulée');
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken?: string) => {
    console.log('🔑 [Login] handleGoogleSignIn appelé, accessToken:', accessToken ? '✅' : '❌');
    
    if (!accessToken) {
      console.error('❌ [Login] Pas de access token !');
      return;
    }

    try {
      console.log('⏳ [Login] Début de l\'authentification...');
      dispatch(setLoading(true));

      // Récupérer les infos utilisateur de Google
      console.log('📞 [Login] Appel API Google pour récupérer les infos utilisateur...');
      const googleUser = await fetchGoogleUserInfo(accessToken);
      console.log('✅ [Login] Infos utilisateur reçues:', googleUser.email);

      // Sauvegarder ou mettre à jour dans SQLite
      console.log('💾 [Login] Sauvegarde dans SQLite...');
      const user = await upsertUser({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
      console.log('✅ [Login] Utilisateur sauvegardé dans SQLite, ID:', user.id);

      // Mettre à jour le store Redux
      console.log('🔄 [Login] Mise à jour du store Redux...');
      dispatch(setUser({ user, accessToken }));
      console.log('✅ [Login] Redux mis à jour');

      // Rediriger vers l'app
      console.log('🚀 [Login] Redirection vers les tabs...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ [Login] Erreur authentification:', error);
      dispatch(setLoading(false));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Push-It</Text>
        <Text style={styles.subtitle}>Gestion d'entraînement sportif</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.errorHelp}>Consultez FIX-GOOGLE-AUTH.md</Text>
          </View>
        )}

        <Pressable
          style={[styles.googleButton, !request && styles.googleButtonDisabled]}
          onPress={() => {
            console.log('👆 [Login] Bouton Google cliqué');
            console.log('🔍 [Login] Request status:', request ? 'ready' : 'not ready');
            setErrorMessage(null);
            promptAsync();
          }}
          disabled={!request}
        >
          <Image
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Se connecter avec Google</Text>
        </Pressable>

        {!request && (
          <Text style={styles.loadingText}>Chargement...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorHelp: {
    color: '#c00',
    fontSize: 12,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
  },
});
