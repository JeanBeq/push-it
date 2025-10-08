// Types de base pour l'application

export type SessionType = 'AMRAP' | 'HIIT' | 'EMOM';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'other';

// Programme d'entraînement
export interface Program {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Séance planifiée
export interface Session {
  id: number;
  program_id: number | null;
  name: string;
  type: SessionType;
  scheduled_date: string | null;
  scheduled_time: string | null;
  recurrence: RecurrenceType;
  duration: number | null;
  created_at: string;
}

// Exercice
export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  is_custom: boolean;
  created_at: string;
}

// Exercice dans une séance (avec paramètres)
export interface SessionExercise {
  id: number;
  session_id: number;
  exercise_id: number;
  order_index: number;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  rest_time: number | null;
}

// Historique d'une séance effectuée
export interface SessionLog {
  id: number;
  session_id: number;
  completed_at: string;
  total_time: number;
  total_reps: number;
  global_comment: string | null;
}

// Détail d'un exercice effectué
export interface ExerciseLog {
  id: number;
  session_log_id: number;
  exercise_id: number;
  reps_completed: number;
  comment: string | null;
  audio_path: string | null;
}
