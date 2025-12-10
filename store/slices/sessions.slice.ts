import type { SessionExerciseFormData } from '@/features/sessions/schemas/session.schema';
import { exerciseRepository, sessionExerciseRepository, sessionRepository } from '@/services/database';
import type { Session } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface SessionsState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
}

const initialState: SessionsState = {
  sessions: [],
  loading: false,
  error: null,
};

// Thunks asynchrones
export const fetchSessions = createAsyncThunk('sessions/fetchAll', async () => {
  return await sessionRepository.getAll();
});

export const fetchSessionsByProgram = createAsyncThunk(
  'sessions/fetchByProgram',
  async (programId: number) => {
    return await sessionRepository.getByProgramId(programId);
  }
);

export const createSession = createAsyncThunk(
  'sessions/create',
  async ({ session, exercises }: { session: Omit<Session, 'id' | 'created_at'>; exercises: SessionExerciseFormData[] }) => {
    const id = await sessionRepository.create(session);

    const preparedExercises = [] as {
      exercise_id: number;
      order_index: number;
      sets?: number | null;
      reps?: number | null;
      duration?: number | null;
      rest_time?: number | null;
    }[];

    for (let i = 0; i < exercises.length; i++) {
      const item = exercises[i];
      let exerciseId = item.exercise_id;
      if (!exerciseId) {
        exerciseId = await exerciseRepository.create(item.name, 'other');
      }
      preparedExercises.push({
        exercise_id: exerciseId,
        order_index: i,
        sets: item.sets ?? null,
        reps: item.reps ?? null,
        duration: item.duration ?? null,
        rest_time: item.rest_time ?? null,
      });
    }

    if (preparedExercises.length > 0) {
      await sessionExerciseRepository.replaceForSession(id, preparedExercises);
    }

    const newSession = await sessionRepository.getById(id);
    return newSession!;
  }
);

export const updateSession = createAsyncThunk(
  'sessions/update',
  async ({ id, data, exercises }: { id: number; data: Partial<Omit<Session, 'id' | 'created_at'>>; exercises?: SessionExerciseFormData[] }) => {
    await sessionRepository.update(id, data);

    if (exercises) {
      const preparedExercises = [] as {
        exercise_id: number;
        order_index: number;
        sets?: number | null;
        reps?: number | null;
        duration?: number | null;
        rest_time?: number | null;
      }[];

      for (let i = 0; i < exercises.length; i++) {
        const item = exercises[i];
        let exerciseId = item.exercise_id;
        if (!exerciseId) {
          exerciseId = await exerciseRepository.create(item.name, 'other');
        }
        preparedExercises.push({
          exercise_id: exerciseId,
          order_index: i,
          sets: item.sets ?? null,
          reps: item.reps ?? null,
          duration: item.duration ?? null,
          rest_time: item.rest_time ?? null,
        });
      }

      await sessionExerciseRepository.replaceForSession(id, preparedExercises);
    }

    const session = await sessionRepository.getById(id);
    return session!;
  }
);

export const deleteSession = createAsyncThunk('sessions/delete', async (id: number) => {
  await sessionRepository.delete(id);
  return id;
});

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      // Fetch sessions by program
      .addCase(fetchSessionsByProgram.fulfilled, (state, action) => {
        state.sessions = action.payload;
      })
      // Create session
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
      })
      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
      })
      // Delete session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload);
      });
  },
});

export default sessionsSlice.reducer;
