import { configureStore } from '@reduxjs/toolkit';
import { exercisesReducer, programsReducer, sessionsReducer } from './slices';

export const store = configureStore({
  reducer: {
    programs: programsReducer,
    sessions: sessionsReducer,
    exercises: exercisesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
