import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Configure la requête d'authentification Google
 */
export const useGoogleAuth = () => {
  // Utiliser makeRedirectUri pour générer l'URI native correcte
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'pushit',
    preferLocalhost: false,
  });

  console.log('🔑 Web Client ID:', GOOGLE_WEB_CLIENT_ID?.substring(0, 20) + '...');
  console.log('🔗 Redirect URI:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    },
    discovery
  );

  console.log('🔐 Request ready:', !!request);

  return {
    request,
    response,
    promptAsync,
  };
};

/**
 * Récupère les informations de l'utilisateur depuis Google
 */
export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUser> => {
  console.log('📞 [GoogleAuth] Appel API Google userinfo...');
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  console.log('📡 [GoogleAuth] Response status:', userInfoResponse.status);

  if (!userInfoResponse.ok) {
    console.error('❌ [GoogleAuth] Erreur API Google:', userInfoResponse.status);
    throw new Error('Failed to fetch user info');
  }

  const userInfo = await userInfoResponse.json();
  console.log('✅ [GoogleAuth] Infos utilisateur reçues:', userInfo.email);

  return {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  };
};
