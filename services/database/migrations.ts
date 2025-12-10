import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

// Version actuelle de la base de données
const CURRENT_DB_VERSION = 2;

/**
 * Récupère la version actuelle de la base de données
 */
async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  try {
    // Créer la table de version si elle n'existe pas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM db_version ORDER BY version DESC LIMIT 1'
    );

    return result?.version || 0;
  } catch (error) {
    console.error('Error getting database version:', error);
    return 0;
  }
}

/**
 * Met à jour la version de la base de données
 */
async function updateVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    'INSERT INTO db_version (version) VALUES (?)',
    [version]
  );
}

/**
 * Migration v0 -> v1 : Création initiale des tables
 */
async function migrateToV1(db: SQLiteDatabase): Promise<void> {
  console.log('📦 Running migration v0 -> v1...');
  
  // Créer toutes les tables
  await db.execAsync(CREATE_TABLES);
  
  console.log('✅ Migration v1 completed');
}

/**
 * Migration v1 -> v2 : Seed d'exercices de base
 */
async function migrateToV2(db: SQLiteDatabase): Promise<void> {
  console.log('📦 Running migration v1 -> v2 (seed exercises)...');

  const defaults = [
    { name: 'Pompes', category: 'strength', description: 'Pompes classiques au sol' },
    { name: 'Squats', category: 'strength', description: 'Squat poids du corps' },
    { name: 'Fentes', category: 'strength', description: 'Fentes alternées' },
    { name: 'Burpees', category: 'cardio', description: 'Burpees complets' },
    { name: 'Mountain Climbers', category: 'cardio', description: 'Gainage dynamique' },
    { name: 'Planche', category: 'strength', description: 'Planche statique' },
    { name: 'Abdos crunch', category: 'strength', description: 'Crunch abdominaux' },
    { name: 'Jumping Jacks', category: 'cardio', description: 'Jumping jacks' },
    { name: 'Développé militaire', category: 'strength', description: 'Développé militaire avec haltères' },
    { name: 'Tractions', category: 'strength', description: 'Tractions à la barre fixe' },
    { name: 'Corde à sauter', category: 'cardio', description: 'Sauter à la corde' },
    { name: 'Développé couché', category: 'strength', description: 'Développé couché avec barre' },
  ];

  for (const ex of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO exercises (name, category, description, is_custom) VALUES (?, ?, ?, 0)',
      [ex.name, ex.category, ex.description]
    );
  }

  console.log('✅ Migration v2 completed (seed exercises)');
}

/**
 * Exécute toutes les migrations nécessaires
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  try {
    const currentVersion = await getCurrentVersion(db);
    console.log(`📊 Current database version: ${currentVersion}`);

    // Si déjà à jour, ne rien faire
    if (currentVersion >= CURRENT_DB_VERSION) {
      console.log('✅ Database is up to date');
      return;
    }

    // Exécuter les migrations dans l'ordre
    if (currentVersion < 1) {
      await migrateToV1(db);
      await updateVersion(db, 1);
    }

    if (currentVersion < 2) {
      await migrateToV2(db);
      await updateVersion(db, 2);
    }

    // Ajouter ici les futures migrations :
    // if (currentVersion < 2) {
    //   await migrateToV2(db);
    //   await updateVersion(db, 2);
    // }

    console.log(`✅ Database migrated to version ${CURRENT_DB_VERSION}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
