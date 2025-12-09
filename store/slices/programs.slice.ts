import { programRepository } from '@/services/database';
import type { Program } from '@/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ProgramsState {
  programs: Program[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgramsState = {
  programs: [],
  loading: false,
  error: null,
};

// Thunks asynchrones
export const fetchPrograms = createAsyncThunk('programs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    console.log('Fetching programs...');
    const programs = await programRepository.getAll();
    console.log('Programs fetched:', programs.length, 'items');
    return programs;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

export const createProgram = createAsyncThunk(
  'programs/create',
  async ({ name, description }: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      console.log('Creating program:', { name, description });
      const id = await programRepository.create(name, description);
      console.log('Program created with ID:', id);
      const program = await programRepository.getById(id);
      console.log('Program retrieved:', program);
      if (!program) {
        throw new Error('Failed to retrieve created program');
      }
      return program;
    } catch (error) {
      console.error('Error creating program:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateProgram = createAsyncThunk(
  'programs/update',
  async ({ id, name, description }: { id: number; name: string; description?: string }) => {
    await programRepository.update(id, name, description);
    const program = await programRepository.getById(id);
    return program!;
  }
);

export const deleteProgram = createAsyncThunk('programs/delete', async (id: number) => {
  await programRepository.delete(id);
  return id;
});

const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch programs
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch programs';
      })
      // Create program
      .addCase(createProgram.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.programs.unshift(action.payload);
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create program';
      })
      // Update program
      .addCase(updateProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
      })
      // Delete program
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.programs = state.programs.filter((p) => p.id !== action.payload);
      });
  },
});

export default programsSlice.reducer;
