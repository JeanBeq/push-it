import { getDatabase } from './database';

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
  last_login: string;
}

/**
 * Crée ou met à jour un utilisateur depuis Google
 */
export const upsertUser = async (userData: {
  google_id: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> => {
  console.log('👤 [UserRepo] upsertUser appelé pour:', userData.email);
  const db = getDatabase();

  // Vérifier si l'utilisateur existe
  console.log('🔍 [UserRepo] Recherche de l\'utilisateur existant...');
  const existingUser = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE google_id = ?',
    [userData.google_id]
  );

  if (existingUser) {
    console.log('✅ [UserRepo] Utilisateur existant trouvé, ID:', existingUser.id);
    // Mettre à jour last_login
    await db.runAsync(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE google_id = ?',
      [userData.google_id]
    );
    console.log('✅ [UserRepo] last_login mis à jour');
    return {
      ...existingUser,
      last_login: new Date().toISOString(),
    };
  } else {
    console.log('➕ [UserRepo] Nouvel utilisateur, création dans la DB...');
    // Créer un nouvel utilisateur
    const result = await db.runAsync(
      'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
      [userData.google_id, userData.email, userData.name || null, userData.picture || null]
    );
    console.log('✅ [UserRepo] Utilisateur inséré, lastInsertRowId:', result.lastInsertRowId);

    const newUser = await db.getFirstAsync<User>(
      'SELECT * FROM users WHERE id = ?',
      [result.lastInsertRowId]
    );

    if (!newUser) {
      console.error('❌ [UserRepo] Échec de la récupération du nouvel utilisateur');
      throw new Error('Failed to create user');
    }

    console.log('✅ [UserRepo] Nouvel utilisateur créé avec succès:', newUser.email);
    return newUser;
  }
};

/**
 * Récupère un utilisateur par son Google ID
 */
export const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  const db = getDatabase();
  const user = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE google_id = ?',
    [googleId]
  );
  return user || null;
};

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (id: number): Promise<User | null> => {
  const db = getDatabase();
  const user = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return user || null;
};
