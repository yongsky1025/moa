import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { authApi } from '../../api/authApi';
import type { AuthUser, LoginRequest, SignUpRequest } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (req: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.login(req);
      localStorage.setItem('accessToken', res.data.accessToken);
      return res.data.user as AuthUser;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (typeof message === 'string' && message.trim()) {
          return rejectWithValue(message);
        }
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('로그인 실패');
    }
  },
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (req: SignUpRequest, { rejectWithValue }) => {
    try {
      await authApi.signup(req);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (typeof message === 'string' && message.trim()) {
          return rejectWithValue(message);
        }
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('회원가입 실패');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
  localStorage.removeItem('accessToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setAuthFromOAuth(state, action) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
      });
  },
});

export const { clearError, setAuthFromOAuth } = authSlice.actions;
export default authSlice.reducer;
