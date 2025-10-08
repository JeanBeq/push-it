/**
 * Point d'entrée du module d'authentification
 * Export de toutes les fonctionnalités publiques
 */

// Hooks
export { useAuth } from './hooks/useAuth';

// Types
export type { AuthState, GoogleAuthResponse, GoogleUserInfo, SecureTokens } from './types';

// Services (export si besoin d'utilisation directe)
export { googleAuthService } from './services/google-auth.service';

