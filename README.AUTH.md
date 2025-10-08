# Configuration Google OAuth pour Push-It

## 🔑 Obtenir les Client IDs

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Notez le nom de votre projet

### 2. Activer l'API Google Identity Services

1. Dans le menu de gauche, allez à **APIs & Services** > **Library**
2. Recherchez "Google Identity Services API"
3. Cliquez sur **Enable**

### 3. Créer les identifiants OAuth 2.0

#### A. Web Client ID (Pour Expo Go et développement)

1. Allez à **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Sélectionnez **Web application**
4. Nom : `Push-It Web Client`
5. **Authorized JavaScript origins** :
   - `https://auth.expo.io`
6. **Authorized redirect URIs** :
   - `https://auth.expo.io/@anonymous/push-it`
   - `https://auth.expo.io/@YOUR-EXPO-USERNAME/push-it` (si vous êtes connecté à Expo)
7. Cliquez sur **Create**
8. Copiez le **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

#### B. iOS Client ID (Pour app standalone iOS)

1. Créez un nouveau **OAuth client ID**
2. Sélectionnez **iOS**
3. Nom : `Push-It iOS`
4. **Bundle ID** : `com.anonymous.pushit` (ou votre bundle ID)
5. Cliquez sur **Create**
6. Copiez le **Client ID**

#### C. Android Client ID (Pour app standalone Android)

1. Créez un nouveau **OAuth client ID**
2. Sélectionnez **Android**
3. Nom : `Push-It Android`
4. **Package name** : `com.anonymous.pushit` (ou votre package name)
5. **SHA-1 certificate fingerprint** : Obtenez-le avec :
   ```bash
   # Pour debug keystore
   keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Pour release keystore (production)
   keytool -list -v -keystore path/to/your/keystore -alias your-key-alias
   ```
6. Cliquez sur **Create**
7. Copiez le **Client ID**

## 📝 Configuration du projet

### 1. Créer le fichier .env

Créez un fichier `.env` à la racine du projet (ou copiez `.env.example`) :

```bash
cp .env.example .env
```

### 2. Remplir les Client IDs

Éditez le fichier `.env` et remplacez les valeurs :

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=votre-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=votre-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=votre-web-client-id.apps.googleusercontent.com
```

### 3. Redémarrer le serveur Expo

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm start -- --clear
```

## 🚀 Test de l'authentification

### En développement (Expo Go)

1. Scannez le QR code avec Expo Go
2. Cliquez sur "Se connecter avec Google"
3. Choisissez votre compte Google
4. Autorisez l'application
5. Vous devriez être redirigé vers l'app avec succès

### Erreurs communes

#### ❌ "Something went wrong trying to finish signing in"

**Causes possibles :**
1. L'URI de redirection n'est pas autorisée dans Google Cloud Console
2. Le Client ID est incorrect ou manquant
3. Le Web Client ID n'est pas utilisé avec Expo Go

**Solution :**
1. Vérifiez que `https://auth.expo.io/@anonymous/push-it` est dans les URIs autorisées
2. Vérifiez que votre `.env` contient les bons Client IDs
3. Redémarrez le serveur Expo après avoir modifié `.env`

#### ❌ "invalid_client"

**Cause :** Le Client ID est incorrect ou n'existe pas

**Solution :**
1. Vérifiez que vous avez bien copié le Client ID complet
2. Vérifiez qu'il n'y a pas d'espaces avant/après dans le `.env`
3. Assurez-vous d'utiliser le **Web Client ID** avec Expo Go

#### ❌ "redirect_uri_mismatch"

**Cause :** L'URI de redirection n'est pas autorisée

**Solution :**
1. Allez dans Google Cloud Console > Credentials
2. Éditez votre Web Client ID
3. Ajoutez `https://auth.expo.io/@anonymous/push-it` dans les URIs autorisées
4. Sauvegardez et attendez quelques minutes pour la propagation

## 📱 Pour les builds standalone

### iOS

1. Utilisez le **iOS Client ID** dans votre `.env`
2. Assurez-vous que le Bundle ID correspond à celui configuré dans Google Cloud
3. Ajoutez l'URI scheme dans `app.json` :
   ```json
   "ios": {
     "bundleIdentifier": "com.anonymous.pushit",
     "config": {
       "googleSignIn": {
         "reservedClientId": "com.googleusercontent.apps.XXXXX"
       }
     }
   }
   ```

### Android

1. Utilisez le **Android Client ID** dans votre `.env`
2. Générez et ajoutez votre SHA-1 dans Google Cloud Console
3. Assurez-vous que le package name correspond

## 🔍 Debugging

Pour voir les logs détaillés de l'authentification :

```bash
# Dans un terminal
npx expo start

# Dans un autre terminal, pour voir les logs iOS
npx react-native log-ios

# Pour Android
npx react-native log-android
```

Les logs afficheront :
- 🔗 L'URI de redirection utilisée
- 🔑 Le Client ID utilisé (tronqué)
- 📱 La plateforme détectée
- ✅/❌ Le statut de l'authentification

## 📚 Ressources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession](https://docs.expo.dev/guides/authentication/#google)
- [Google Cloud Console](https://console.cloud.google.com/)

## ⚠️ Sécurité

- ❌ Ne commitez JAMAIS votre fichier `.env`
- ✅ Ajoutez `.env` dans `.gitignore`
- ✅ Partagez `.env.example` avec votre équipe (sans les vraies valeurs)
- ✅ Pour la production, utilisez des secrets chiffrés (Expo Secrets, etc.)
