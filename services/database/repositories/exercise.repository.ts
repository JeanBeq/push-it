import type { Exercise } from '@/types';
import { getDatabase } from '../database.service';

/**
 * Repository pour la gestion des exercices
 */
export const exerciseRepository = {
  /**
   * Récupère tous les exercices
   */
  async getAll(): Promise<Exercise[]> {
    const db = getDatabase();
    return await db.getAllAsync<Exercise>('SELECT * FROM exercises ORDER BY name ASC');
  },

  /**
   * Récupère un exercice par son ID
   */
  async getById(id: number): Promise<Exercise | null> {
    const db = getDatabase();
    return await db.getFirstAsync<Exercise>('SELECT * FROM exercises WHERE id = ?', [id]);
  },

  /**
   * Crée un nouvel exercice personnalisé
   */
  async create(
    name: string,
    category: 'cardio' | 'strength' | 'flexibility' | 'other',
    description?: string
  ): Promise<number> {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO exercises (name, category, description, is_custom) VALUES (?, ?, ?, 1)',
      [name, category, description || null]
    );
    return result.lastInsertRowId;
  },

  /**
   * Supprime un exercice personnalisé
   */
  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM exercises WHERE id = ? AND is_custom = 1', [id]);
  },
};
