import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../services/database/userRepository';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      console.log('🔄 [Redux] setUser:', action.payload.user.email);
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      console.log('✅ [Redux] State mis à jour, isAuthenticated:', true);
    },
    clearAuth: (state) => {
      console.log('🔄 [Redux] clearAuth appelé');
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      console.log('✅ [Redux] Auth cleared, isAuthenticated:', false);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('🔄 [Redux] setLoading:', action.payload);
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
