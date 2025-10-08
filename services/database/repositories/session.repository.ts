import type { Session } from '@/types';
import { getDatabase } from '../database.service';

/**
 * Repository pour la gestion des séances
 */
export const sessionRepository = {
  /**
   * Récupère toutes les séances
   */
  async getAll(): Promise<Session[]> {
    const db = getDatabase();
    return await db.getAllAsync<Session>('SELECT * FROM sessions ORDER BY created_at DESC');
  },

  /**
   * Récupère les séances d'un programme
   */
  async getByProgramId(programId: number): Promise<Session[]> {
    const db = getDatabase();
    return await db.getAllAsync<Session>(
      'SELECT * FROM sessions WHERE program_id = ? ORDER BY created_at DESC',
      [programId]
    );
  },

  /**
   * Récupère une séance par son ID
   */
  async getById(id: number): Promise<Session | null> {
    const db = getDatabase();
    return await db.getFirstAsync<Session>('SELECT * FROM sessions WHERE id = ?', [id]);
  },

  /**
   * Crée une nouvelle séance
   */
  async create(session: Omit<Session, 'id' | 'created_at'>): Promise<number> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO sessions (program_id, name, type, scheduled_date, scheduled_time, recurrence, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.program_id,
        session.name,
        session.type,
        session.scheduled_date,
        session.scheduled_time,
        session.recurrence,
        session.duration,
      ]
    );
    return result.lastInsertRowId;
  },

  /**
   * Met à jour une séance
   */
  async update(id: number, session: Partial<Omit<Session, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (session.name !== undefined) {
      fields.push('name = ?');
      values.push(session.name);
    }
    if (session.type !== undefined) {
      fields.push('type = ?');
      values.push(session.type);
    }
    if (session.scheduled_date !== undefined) {
      fields.push('scheduled_date = ?');
      values.push(session.scheduled_date);
    }
    if (session.scheduled_time !== undefined) {
      fields.push('scheduled_time = ?');
      values.push(session.scheduled_time);
    }
    if (session.recurrence !== undefined) {
      fields.push('recurrence = ?');
      values.push(session.recurrence);
    }
    if (session.duration !== undefined) {
      fields.push('duration = ?');
      values.push(session.duration);
    }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  /**
   * Supprime une séance
   */
  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
  },
};
