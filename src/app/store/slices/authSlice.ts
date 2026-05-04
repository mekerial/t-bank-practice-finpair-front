import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest
} from '../../../shared/api/authApi'
import type { AuthUser } from '../../../shared/api/authApi'
import { setAccessToken } from '../../../shared/api/apiClient'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  restoreStatus: 'idle' | 'loading' | 'done'
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  restoreStatus: 'idle'
}

export const loginUser = createAsyncThunk<
  { user: AuthUser; accessToken: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (creds, { rejectWithValue }) => {
  try {
    const result = await loginRequest(creds)
    setAccessToken(result.accessToken)
    return { user: result.user, accessToken: result.accessToken }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const registerUser = createAsyncThunk<
  { user: AuthUser; accessToken: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const result = await registerRequest(payload)
    setAccessToken(result.accessToken)
    return { user: result.user, accessToken: result.accessToken }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const tryRestoreSession = createAsyncThunk<
  { user: AuthUser; accessToken: string },
  void,
  { rejectValue: string }
>('auth/tryRestoreSession', async (_, { rejectWithValue }) => {
  try {
    const result = await refreshRequest()
    setAccessToken(result.accessToken)
    const { getMeRequest } = await import('../../../shared/api/authApi')
    const user = await getMeRequest()
    return { user, accessToken: result.accessToken }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutRequest()
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    } finally {
      setAccessToken(null)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      setAccessToken(null)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
      })
      .addCase(tryRestoreSession.pending, (state) => {
        state.restoreStatus = 'loading'
      })
      .addCase(tryRestoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.restoreStatus = 'done'
      })
      .addCase(tryRestoreSession.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.restoreStatus = 'done'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null
        state.accessToken = null
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
