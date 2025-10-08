/**
 * Configuration Google OAuth
 * 
 * IMPORTANT : Configurez vos Client IDs dans les variables d'environnement
 * ou directement ici pour le développement.
 * 
 * Pour obtenir vos Client IDs :
 * 1. Allez sur https://console.cloud.google.com/
 * 2. Créez un projet ou sélectionnez-en un existant
 * 3. Activez l'API Google Identity Services
 * 4. Créez des identifiants OAuth 2.0 pour iOS, Android et Web
 * 5. Consultez README.AUTH.md pour plus de détails
 */

export const GOOGLE_AUTH_CONFIG = {
  clientId: {
    // Remplacez par vos propres Client IDs ou utilisez les variables d'environnement
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  },
  scopes: ['profile', 'email'],
};

