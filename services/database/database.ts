import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'pushit.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialise la base de données SQLite
 */
export const initDatabase = async (): Promise<void> => {
  try {
    console.log('🗄️ [Database] Ouverture de la base de données:', DATABASE_NAME);
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('✅ [Database] Base de données ouverte');
    
    console.log('📋 [Database] Création des tables...');
    await createTables();
    console.log('✅ [Database] Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ [Database] Erreur initialisation DB:', error);
    throw error;
  }
};

/**
 * Crée les tables nécessaires
 */
const createTables = async (): Promise<void> => {
  if (!db) {
    console.error('❌ [Database] DB non initialisée dans createTables');
    throw new Error('Database not initialized');
  }

  console.log('📝 [Database] Exécution du script de création de la table users...');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ [Database] Table users créée ou déjà existante');
};

/**
 * Récupère l'instance de la base de données
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};
