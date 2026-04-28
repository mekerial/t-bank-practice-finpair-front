import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import {
  mockLoginRequest,
  mockRegisterRequest
} from '../../../shared/lib/authMockRequests'

export interface AuthUser {
  email: string
  displayName: string
}

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null
}

export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (creds, { rejectWithValue }) => {
  try {
    return await mockLoginRequest(creds)
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const registerUser = createAsyncThunk<
  AuthUser,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    return await mockRegisterRequest({
      name: payload.name,
      email: payload.email,
      password: payload.password
    })
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Не удалось выполнить вход'
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Не удалось зарегистрироваться'
      })
  }
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
