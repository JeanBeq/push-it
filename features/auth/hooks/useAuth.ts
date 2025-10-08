/**
 * Hook personnalisé pour l'authentification
 * Encapsule la logique d'authentification et les sélecteurs Redux
 */

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    clearError,
    restoreSession,
    selectAuth,
    selectError,
    selectIsAuthenticated,
    selectIsLoading,
    selectUser,
    signInWithGoogle,
    signOut,
} from '@/store/slices/auth.slice';
import { useCallback } from 'react';

export function useAuth() {
  const dispatch = useAppDispatch();
  
  // Sélecteurs
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  /**
   * Connexion avec Google
   */
  const signIn = useCallback(async () => {
    const result = await dispatch(signInWithGoogle());
    return result;
  }, [dispatch]);

  /**
   * Déconnexion
   */
  const logout = useCallback(async () => {
    const result = await dispatch(signOut());
    return result;
  }, [dispatch]);

  /**
   * Restaurer la session au démarrage de l'app
   */
  const restore = useCallback(async () => {
    const result = await dispatch(restoreSession());
    return result;
  }, [dispatch]);

  /**
   * Effacer les erreurs
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // État
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    signIn,
    logout,
    restore,
    clearAuthError,
  };
}

