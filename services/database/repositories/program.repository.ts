import type { Program } from '@/types';
import { getDatabase } from '../database.service';

/**
 * Repository pour la gestion des programmes
 */
export const programRepository = {
  /**
   * Récupère tous les programmes
   */
  async getAll(): Promise<Program[]> {
    const db = getDatabase();
    return await db.getAllAsync<Program>('SELECT * FROM programs ORDER BY created_at DESC');
  },

  /**
   * Récupère un programme par son ID
   */
  async getById(id: number): Promise<Program | null> {
    const db = getDatabase();
    return await db.getFirstAsync<Program>('SELECT * FROM programs WHERE id = ?', [id]);
  },

  /**
   * Crée un nouveau programme
   */
  async create(name: string, description?: string): Promise<number> {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO programs (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return result.lastInsertRowId;
  },

  /**
   * Met à jour un programme
   */
  async update(id: number, name: string, description?: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE programs SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || null, id]
    );
  },

  /**
   * Supprime un programme
   */
  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM programs WHERE id = ?', [id]);
  },
};
