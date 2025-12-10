import type { ExerciseCategory, SessionExercise } from '@/types';
import { getDatabase } from '../database.service';

export type SessionExerciseInput = {
  exercise_id: number;
  order_index: number;
  sets?: number | null;
  reps?: number | null;
  duration?: number | null;
  rest_time?: number | null;
};

export type SessionExerciseDetail = SessionExercise & {
  exercise_name: string;
  exercise_category: ExerciseCategory;
};

export const sessionExerciseRepository = {
  async getBySessionId(sessionId: number): Promise<SessionExercise[]> {
    const db = getDatabase();
    return await db.getAllAsync<SessionExercise>(
      'SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index ASC',
      [sessionId]
    );
  },

  async getDetailsBySessionId(sessionId: number): Promise<SessionExerciseDetail[]> {
    const db = getDatabase();
    return await db.getAllAsync<SessionExerciseDetail>(
      `SELECT se.*, e.name as exercise_name, e.category as exercise_category
       FROM session_exercises se
       JOIN exercises e ON e.id = se.exercise_id
       WHERE se.session_id = ?
       ORDER BY se.order_index ASC`,
      [sessionId]
    );
  },

  async replaceForSession(sessionId: number, items: SessionExerciseInput[]): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM session_exercises WHERE session_id = ?', [sessionId]);
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO session_exercises (session_id, exercise_id, order_index, sets, reps, duration, rest_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          item.exercise_id,
          item.order_index,
          item.sets ?? null,
          item.reps ?? null,
          item.duration ?? null,
          item.rest_time ?? null,
        ]
      );
    }
  },
};
