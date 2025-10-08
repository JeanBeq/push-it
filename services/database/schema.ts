// Schéma de la base de données SQLite

export const CREATE_TABLES = `
  -- Programmes d'entraînement
  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Séances planifiées
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('AMRAP', 'HIIT', 'EMOM')),
    scheduled_date DATE,
    scheduled_time TIME,
    recurrence TEXT DEFAULT 'none' CHECK(recurrence IN ('none', 'daily', 'weekly', 'monthly')),
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
  );

  -- Exercices prédéfinis ou personnalisés
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'other' CHECK(category IN ('cardio', 'strength', 'flexibility', 'other')),
    is_custom INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Exercices dans une séance (avec paramètres)
  CREATE TABLE IF NOT EXISTS session_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER,
    duration INTEGER,
    rest_time INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  -- Historique des séances effectuées
  CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_time INTEGER NOT NULL,
    total_reps INTEGER DEFAULT 0,
    global_comment TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  -- Détails des exercices effectués
  CREATE TABLE IF NOT EXISTS exercise_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_log_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    reps_completed INTEGER DEFAULT 0,
    comment TEXT,
    audio_path TEXT,
    FOREIGN KEY (session_log_id) REFERENCES session_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );
`;