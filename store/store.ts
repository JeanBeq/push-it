import { configureStore } from '@reduxjs/toolkit';
import { exercisesReducer, programsReducer, sessionsReducer, workoutReducer } from './slices';

export const store = configureStore({
  reducer: {
    programs: programsReducer,
    sessions: sessionsReducer,
    exercises: exercisesReducer,
    workout: workoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
