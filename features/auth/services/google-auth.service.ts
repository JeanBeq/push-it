/**
 * Service d'authentification Google OAuth 2.0
 * Basé sur la documentation Expo AuthSession
 * https://docs.expo.dev/guides/authentication/#google
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { GoogleAuthResponse, GoogleUserInfo } from '../types';

// Nécessaire pour fermer correctement le navigateur sur iOS
WebBrowser.maybeCompleteAuthSession();

/**
 * Configuration Google OAuth
 * IMPORTANT: Ces valeurs doivent être configurées dans app.json
 * et provenir de Google Cloud Console
 */
const GOOGLE_CONFIG = {
  // Ces IDs doivent être configurés dans Google Cloud Console
  // et ajoutés dans app.json sous "expo.android.googleServicesFile" et "expo.ios.googleServicesFile"
  clientId: {
    // ID client pour les applications Expo Go et standalone
    // Format: YOUR_CLIENT_ID.apps.googleusercontent.com
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  },
  scopes: ['profile', 'email'],
  // Configuration de découverte Google OAuth
  discovery: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  },
};

class GoogleAuthService {
  /**
   * Obtient le client ID selon la plateforme
   */
  private getClientId(): string {
    // En développement avec Expo Go, toujours utiliser le Web Client ID
    // car les Client IDs natifs ne fonctionnent qu'avec des builds standalone
    const isExpoGo = !__DEV__ ? false : true;
    
    if (isExpoGo || !GOOGLE_CONFIG.clientId.ios) {
      // Utiliser le Web Client ID pour Expo Go ou si iOS n'est pas configuré
      return GOOGLE_CONFIG.clientId.web;
    }
    
    if (Platform.OS === 'ios') {
      return GOOGLE_CONFIG.clientId.ios;
    } else if (Platform.OS === 'android') {
      return GOOGLE_CONFIG.clientId.android;
    } else {
      return GOOGLE_CONFIG.clientId.web;
    }
  }

  /**
   * Configure la requête d'authentification
   */
  private getAuthRequestConfig() {
    // Pour Expo Go, utiliser le proxy auth.expo.io
    // Cela génère une URL https://auth.expo.io/@anonymous/push-it
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'push-it',
      preferLocalhost: false,
    });

    // En développement avec Expo Go, forcer l'utilisation du proxy
    const proxyRedirectUri = __DEV__ 
      ? 'https://auth.expo.io/@anonymous/push-it'
      : redirectUri;

    console.log('Using redirect URI:', proxyRedirectUri);

    return {
      clientId: this.getClientId(),
      scopes: GOOGLE_CONFIG.scopes,
      redirectUri: proxyRedirectUri,
    };
  }

  /**
   * Lance le flux d'authentification Google
   */
  async signIn(): Promise<GoogleAuthResponse> {
    try {
      const config = this.getAuthRequestConfig();

      if (!config.clientId) {
        throw new Error(
          'Google Client ID non configuré. Veuillez définir EXPO_PUBLIC_GOOGLE_CLIENT_ID dans vos variables d\'environnement.'
        );
      }

      console.log('Démarrage de l\'authentification Google...');
      console.log('Redirect URI:', config.redirectUri);

      // Configuration de la requête d'authentification avec PKCE
      const authRequestConfig: AuthSession.AuthRequestConfig = {
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
        // Utiliser le code flow avec PKCE pour mobile
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      };

      // Créer la requête d'authentification
      const request = new AuthSession.AuthRequest(authRequestConfig);

      // Lancer le flux d'authentification avec la configuration de découverte
      const result = await request.promptAsync(GOOGLE_CONFIG.discovery);

      if (result.type === 'success') {
        const { params } = result;

        // Avec le code flow, on reçoit un code qu'il faut échanger contre un token
        if (!params.code) {
          throw new Error('Aucun code d\'autorisation reçu');
        }

        // Échanger le code contre un access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: config.clientId,
            code: params.code,
            redirectUri: config.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          GOOGLE_CONFIG.discovery
        );

        if (!tokenResponse.accessToken) {
          throw new Error('Aucun access token reçu');
        }

        // Récupérer les informations utilisateur
        const userInfo = await this.fetchUserInfo(tokenResponse.accessToken);

        return {
          type: 'success',
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
          user: userInfo,
        };
      } else if (result.type === 'cancel') {
        console.log('Authentification annulée par l\'utilisateur');
        return {
          type: 'cancel',
        };
      } else {
        console.error('Erreur d\'authentification:', result);
        return {
          type: 'error',
          error: 'Une erreur est survenue lors de l\'authentification',
        };
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Récupère les informations de l'utilisateur depuis l'API Google
   */
  private async fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }

      const userInfo = await response.json();
      return userInfo as GoogleUserInfo;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw error;
    }
  }

  /**
   * Révoque l'accès Google (déconnexion complète)
   */
  async revokeAccess(accessToken: string): Promise<void> {
    try {
      await fetch(
        `https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`,
        {
          method: 'POST',
        }
      );
      console.log('Accès Google révoqué avec succès');
    } catch (error) {
      console.error('Erreur lors de la révocation de l\'accès Google:', error);
      throw error;
    }
  }
}

// Singleton
export const googleAuthService = new GoogleAuthService();

