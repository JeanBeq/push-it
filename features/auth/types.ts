/**
 * Types liés à l'authentification
 * Basé sur la documentation Expo Auth Session
 */

import { User } from '@/types/user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GoogleAuthResponse {
  type: 'success' | 'error' | 'cancel';
  accessToken?: string;
  idToken?: string;
  user?: GoogleUserInfo;
  error?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface SecureTokens {
  accessToken: string;
  idToken?: string;
}

