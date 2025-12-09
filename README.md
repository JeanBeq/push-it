# Push-It 🏋️# Welcome to your Expo app 👋



Application mobile complète de gestion d'entraînement sportif développée avec React Native et Expo.This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).



## 📱 À propos## Get started



Push-It est une application qui permet de créer, planifier et suivre vos séances d'entraînement sportif. Elle supporte différents types de séances (AMRAP, HIIT, EMOM) et offre un suivi complet de votre progression.1. Install dependencies



## 🚀 Technologies utilisées   ```bash

   npm install

- **Framework** : Expo ~54.0.12 avec React Native 0.81.4   ```

- **Langage** : TypeScript

- **Routage** : Expo Router ~6.0.10 (file-based routing)2. Start the app

- **State Management** : Redux Toolkit 2.9.0 + React Redux 9.2.0

- **Base de données** : Expo SQLite 16.0.8   ```bash

- **Formulaires** : React Hook Form + Zod   npx expo start

- **UI** : Composants personnalisés avec support dark/light mode   ```



## 📋 Fonctionnalités actuelles (Phase 2 - CRUD de base)In the output, you'll find options to open the app in a



### ✅ Programmes d'entraînement- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- Créer un programme avec nom et description- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- Lister tous les programmes- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

- Supprimer un programme- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- Voir les détails d'un programme

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### ✅ Séances d'entraînement

- Créer une séance avec :## Get a fresh project

  - Type (AMRAP, HIIT, EMOM)

  - Durée en minutesWhen you're ready, run:

  - Planification (date et heure)

  - Récurrence (aucune, quotidien, hebdomadaire, mensuel)```bash

- Lister toutes les séancesnpm run reset-project

- Associer une séance à un programme```

- Supprimer une séance

- Voir les détails d'une séanceThis command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.



### ✅ Base de données SQLite## Learn more

- Schéma complet avec 6 tables

- Repositories pour l'accès aux donnéesTo learn more about developing your project with Expo, look at the following resources:

- Migrations automatiques

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

### ✅ Interface utilisateur- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

- Design moderne avec support du mode sombre

- Formulaires validés avec React Hook Form + Zod## Join the community

- Navigation intuitive avec Expo Router

- États de chargement et messages d'erreurJoin our community of developers creating universal apps.



## 🏗️ Architecture du projet- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

```
push-it/
├── app/                          # Navigation Expo Router
│   ├── (tabs)/                   # Onglets principaux
│   │   ├── index.tsx            # Liste des programmes
│   │   ├── explore.tsx          # Liste des séances
│   │   └── _layout.tsx
│   ├── program/[id].tsx         # Détails d'un programme
│   ├── session/[id].tsx         # Détails d'une séance
│   └── _layout.tsx              # Layout racine avec Redux Provider
│
├── features/                     # Logique métier par domaine
│   ├── programs/                 # Gestion des programmes
│   │   ├── components/
│   │   │   ├── program-form.tsx
│   │   │   └── program-card.tsx
│   │   └── schemas/
│   │       └── program.schema.ts
│   └── sessions/                 # Gestion des séances
│       ├── components/
│       │   ├── session-form.tsx
│       │   └── session-card.tsx
│       └── schemas/
│           └── session.schema.ts
│
├── store/                        # State management Redux Toolkit
│   ├── slices/
│   │   ├── programs.slice.ts
│   │   ├── sessions.slice.ts
│   │   ├── exercises.slice.ts
│   │   └── index.ts
│   ├── hooks.ts                  # Hooks typés Redux
│   └── store.ts
│
├── services/                     # Services techniques
│   └── database/                 # SQLite
│       ├── database.service.ts
│       ├── schema.ts
│       ├── migrations.ts
│       └── repositories/
│           ├── program.repository.ts
│           ├── session.repository.ts
│           └── exercise.repository.ts
│
├── components/                   # Composants réutilisables
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/
│
├── types/                        # Types TypeScript globaux
│   └── index.ts
│
└── constants/                    # Constantes
    └── theme.ts
```

## 🔧 Installation

### Prérequis
- Node.js >= 20.14.0
- npm >= 10.7.0
- Expo Go (pour tester sur mobile)

### Installation des dépendances

```bash
npm install
```

## 🚀 Lancer l'application

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android

# Lancer sur le web
npm run web
```

## 📊 Schéma de la base de données

```sql
programs                    # Programmes d'entraînement
├── id (PK)
├── name
├── description
├── created_at
└── updated_at

sessions                    # Séances planifiées
├── id (PK)
├── program_id (FK)
├── name
├── type (AMRAP/HIIT/EMOM)
├── scheduled_date
├── scheduled_time
├── recurrence
├── duration
└── created_at

exercises                   # Exercices (prédéfinis + custom)
├── id (PK)
├── name
├── description
├── category
├── is_custom
└── created_at

session_exercises          # Exercices dans une séance
├── id (PK)
├── session_id (FK)
├── exercise_id (FK)
├── order_index
├── sets
├── reps
├── duration
└── rest_time

session_logs               # Historique des séances effectuées
├── id (PK)
├── session_id (FK)
├── completed_at
├── total_time
├── total_reps
└── global_comment

exercise_logs              # Détails des exercices effectués
├── id (PK)
├── session_log_id (FK)
├── exercise_id (FK)
├── reps_completed
├── comment
└── audio_path
```

## 🗓️ Roadmap

### Phase 1 : Architecture (✅ Terminée)
- [x] Configuration Expo + TypeScript
- [x] Structure des dossiers
- [x] Base de données SQLite
- [x] Repositories
- [x] Types TypeScript

### Phase 2 : CRUD de base (✅ Terminée)
- [x] Feature programs/ avec CRUD complet
- [x] Feature sessions/ avec CRUD complet
- [x] Redux Toolkit + slices
- [x] React Hook Form + Zod
- [x] Navigation Expo Router
- [x] Interface utilisateur avec dark mode

### Phase 3 : Logique métier avancée (🚧 À venir)
- [ ] Gestion des exercices (ajout à une séance)
- [ ] Chronomètre et timer (AMRAP/HIIT/EMOM)
- [ ] Mode workout actif
- [ ] Suivi des répétitions en temps réel
- [ ] Gestion des pauses automatiques

### Phase 4 : Feedback et historique (🚧 À venir)
- [ ] Commentaires post-séance
- [ ] Dictée vocale (expo-av)
- [ ] Historique des séances effectuées
- [ ] Dashboard de statistiques
- [ ] Graphiques de progression

### Phase 5 : Fonctionnalités avancées (🚧 À venir)
- [ ] Sons d'encouragement (expo-av)
- [ ] Utilisation des capteurs (accéléromètre, etc.)
- [ ] Notifications push (bonus)
- [ ] Authentification Google (bonus)

### Phase 6 : Tests et polish (🚧 À venir)
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] Optimisations performances
- [ ] Polissage UI/UX

## 📖 Guide d'utilisation

### Créer un programme
1. Aller sur l'onglet "Programmes"
2. Appuyer sur le bouton "+" en bas à droite
3. Remplir le formulaire (nom obligatoire, description optionnelle)
4. Cliquer sur "Créer"

### Créer une séance
1. Aller sur l'onglet "Séances"
2. Appuyer sur le bouton "+" en bas à droite
3. Remplir le formulaire :
   - Nom de la séance
   - Type (AMRAP, HIIT ou EMOM)
   - Durée en minutes
   - Date et heure de planification (optionnel)
   - Récurrence (optionnel)
4. Cliquer sur "Créer"

### Associer une séance à un programme
1. Aller sur un programme
2. Cliquer sur "Ajouter" dans la section Séances
3. Remplir le formulaire de séance (le programme sera automatiquement associé)

## 🤝 Contribuer

Ce projet est développé dans le cadre d'un projet académique (MBA2 - Développement Mobile).

**Équipe** : 2 étudiants  
**Repository** : [JeanBeq/push-it](https://github.com/JeanBeq/push-it)  
**Branche actuelle** : `CRUD-sessions-programs`

## 📝 Commits et bonnes pratiques

- Commits fréquents et explicites
- Format : `type: description`
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `refactor:` refactoring
  - `docs:` documentation
  - `style:` formatage
  - `test:` ajout de tests

## 📄 License

Projet académique - Tous droits réservés

---

**Développé avec ❤️ et Expo**
