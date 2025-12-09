import { sessionRepository } from '@/services/database';
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
  async (session: Omit<Session, 'id' | 'created_at'>) => {
    const id = await sessionRepository.create(session);
    const newSession = await sessionRepository.getById(id);
    return newSession!;
  }
);

export const updateSession = createAsyncThunk(
  'sessions/update',
  async ({ id, data }: { id: number; data: Partial<Omit<Session, 'id' | 'created_at'>> }) => {
    await sessionRepository.update(id, data);
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
