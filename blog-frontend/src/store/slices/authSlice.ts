import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse } from '../../services/auth';
import { login as loginApi, signup as signupApi } from '../../services/auth';
import type { AxiosError } from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginApi(data);
    localStorage.setItem('token', res.token);
    return res;
  } catch (err: unknown) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(error.response?.data?.error || 'Login failed');
  }
});

export const signupThunk = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/signup', async (data, { rejectWithValue }) => {
  try {
    const res = await signupApi(data);
    localStorage.setItem('token', res.token);
    return res;
  } catch (err: unknown) {
    const error = err as AxiosError<{ error?: string }>;
    return rejectWithValue(error.response?.data?.error || 'Signup failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 