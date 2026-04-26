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
}

const initialState: AuthState = {
  user: null
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
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
