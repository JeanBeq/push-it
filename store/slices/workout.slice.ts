import type { SessionType } from '@/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ActiveWorkoutState = {
  activeSessionId: number | null;
  sessionName: string | null;
  sessionType: SessionType | null;
  startedAt: number | null; // timestamp in ms when current run started
  elapsedBeforePause: number; // milliseconds accumulated before last start/resume
  isPaused: boolean;
};

const initialState: ActiveWorkoutState = {
  activeSessionId: null,
  sessionName: null,
  sessionType: null,
  startedAt: null,
  elapsedBeforePause: 0,
  isPaused: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkout: (
      state,
      action: PayloadAction<{ sessionId: number; sessionName: string; sessionType: SessionType }>
    ) => {
      state.activeSessionId = action.payload.sessionId;
      state.sessionName = action.payload.sessionName;
      state.sessionType = action.payload.sessionType;
      state.startedAt = Date.now();
      state.elapsedBeforePause = 0;
      state.isPaused = false;
    },
    pauseWorkout: (state) => {
      if (!state.activeSessionId || state.isPaused) return;
      const now = Date.now();
      if (state.startedAt) {
        state.elapsedBeforePause += now - state.startedAt;
      }
      state.startedAt = null;
      state.isPaused = true;
    },
    resumeWorkout: (state) => {
      if (!state.activeSessionId || !state.isPaused) return;
      state.startedAt = Date.now();
      state.isPaused = false;
    },
    finishWorkout: (state) => {
      state.activeSessionId = null;
      state.sessionName = null;
      state.sessionType = null;
      state.startedAt = null;
      state.elapsedBeforePause = 0;
      state.isPaused = false;
    },
  },
});

export const { startWorkout, pauseWorkout, resumeWorkout, finishWorkout } = workoutSlice.actions;
export default workoutSlice.reducer;
