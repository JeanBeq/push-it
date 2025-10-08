# 🚨 CORRECTION URGENTE - Erreur Google OAuth

## Problème actuel

Vous obtenez l'erreur : **"Something went wrong trying to finish signing in"**

**Cause :** L'URI de redirection `https://auth.expo.io/@anonymous/push-it` n'est pas autorisée dans votre configuration Google OAuth.

---

## ✅ SOLUTION IMMÉDIATE

### Étape 1 : Ouvrir Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Sélectionnez votre projet (celui où vous avez créé les Client IDs)

### Étape 2 : Modifier le Web Client ID

1. Dans le menu de gauche, cliquez sur **APIs & Services**
2. Cliquez sur **Credentials**
3. Trouvez votre **Web Client ID** (celui qui se termine par `.apps.googleusercontent.com`)
   - Le vôtre : `232337883523-h88sst2is2ftdg6uc4d2c55sd03ntolr.apps.googleusercontent.com`
4. Cliquez dessus pour le modifier

### Étape 3 : Ajouter l'URI de redirection

Dans la section **Authorized redirect URIs**, ajoutez :

```
https://auth.expo.io/@anonymous/push-it
```

**⚠️ IMPORTANT :** 
- Copiez-collez exactement cette URI
- Pas d'espace avant ou après
- Vérifiez qu'il n'y a pas de `/` à la fin
- Cliquez sur **ADD URI** ou le bouton `+`

### Étape 4 : Sauvegarder

1. Cliquez sur **SAVE** en bas de la page
2. Attendez quelques secondes pour que la configuration se propage

### Étape 5 : Redémarrer l'application

Dans votre terminal :

```bash
# Arrêtez le serveur Expo (Ctrl+C)
# Puis relancez avec cache clear
npx expo start --clear
```

### Étape 6 : Tester

1. Scannez à nouveau le QR code avec Expo Go
2. Cliquez sur "Se connecter avec Google"
3. Choisissez votre compte Google
4. Autorisez l'application
5. ✅ Vous devriez être connecté avec succès !

---

## 📸 Capture d'écran de référence

Votre configuration dans Google Cloud Console devrait ressembler à :

```
OAuth 2.0 Client IDs

Web Client
Client ID: 232337883523-h88sst2is2ftdg6uc4d2c55sd03ntolr.apps.googleusercontent.com

Authorized JavaScript origins:
- https://auth.expo.io

Authorized redirect URIs:
- https://auth.expo.io/@anonymous/push-it    ← DOIT ÊTRE LÀ
```

---

## 🔍 Vérification

Pour vérifier que tout est OK, regardez les logs :

```
 LOG  🔗 Redirect URI: https://auth.expo.io/@anonymous/push-it
 LOG  📱 Platform: ios
 LOG  🔧 Dev Mode: true
 LOG  🔑 Client ID utilisé: 232337883523-h88sst...
 LOG  👆 [Login] Bouton Google cliqué
 LOG  🔍 [Login] Request status: ready
```

Puis après avoir cliqué :

```
 LOG  📨 [Login] Response changed: success    ← DOIT ÊTRE "success"
 LOG  🎉 [Login] Authentification réussie !
 LOG  🔑 [Login] handleGoogleSignIn appelé, accessToken: ✅
```

---

## ❌ Si ça ne marche toujours pas

### Erreur : "invalid_client"

**Cause :** Le Client ID est incorrect

**Solution :**
1. Vérifiez que le Client ID dans `.env` correspond exactement à celui dans Google Cloud
2. Pas d'espaces avant/après dans le fichier `.env`
3. Redémarrez avec `npx expo start --clear`

### Erreur : "redirect_uri_mismatch"

**Cause :** L'URI n'est pas exactement la même

**Solution :**
1. Vérifiez l'orthographe exacte : `https://auth.expo.io/@anonymous/push-it`
2. Pas de majuscules
3. Pas de caractères en trop
4. Attendez 1-2 minutes après avoir sauvegardé dans Google Cloud

### Toujours "Something went wrong"

**Solution :**
1. Supprimez l'app de vos apps autorisées Google :
   - Allez sur [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
   - Trouvez "Push-It" ou votre app
   - Révoquez l'accès
2. Réessayez la connexion

---

## 📱 Contacts

Si le problème persiste, vérifiez :
- ✅ Le Web Client ID est bien dans `.env`
- ✅ L'URI de redirection est bien ajoutée dans Google Cloud
- ✅ Vous avez redémarré le serveur Expo
- ✅ Vous utilisez Expo Go en mode développement

---

## 🎯 Checklist finale

- [ ] J'ai ouvert Google Cloud Console
- [ ] J'ai trouvé mon Web Client ID
- [ ] J'ai ajouté `https://auth.expo.io/@anonymous/push-it` dans les URIs autorisées
- [ ] J'ai cliqué sur SAVE
- [ ] J'ai attendu 30 secondes
- [ ] J'ai redémarré Expo avec `--clear`
- [ ] J'ai relancé l'app sur Expo Go
- [ ] ✅ Ça marche !

---

**Temps estimé :** 2-3 minutes

**Difficulté :** Facile ⭐

Bonne chance ! 🚀
