import { exerciseRepository } from '@/services/database';
import type { Exercise, ExerciseCategory } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ExercisesState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const initialState: ExercisesState = {
  exercises: [],
  loading: false,
  error: null,
};

// Thunks asynchrones
export const fetchExercises = createAsyncThunk('exercises/fetchAll', async () => {
  return await exerciseRepository.getAll();
});

export const createExercise = createAsyncThunk(
  'exercises/create',
  async ({
    name,
    category,
    description,
  }: {
    name: string;
    category: ExerciseCategory;
    description?: string;
  }) => {
    const id = await exerciseRepository.create(name, category, description);
    const exercise = await exerciseRepository.getById(id);
    return exercise!;
  }
);

export const deleteExercise = createAsyncThunk('exercises/delete', async (id: number) => {
  await exerciseRepository.delete(id);
  return id;
});

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch exercises
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.loading = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises';
      })
      // Create exercise
      .addCase(createExercise.fulfilled, (state, action) => {
        state.exercises.push(action.payload);
      })
      // Delete exercise
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.exercises = state.exercises.filter((e) => e.id !== action.payload);
      });
  },
});

export default exercisesSlice.reducer;
