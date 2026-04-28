import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Goal } from '../../../shared/lib/mocks'
import { mockGoals } from '../../../shared/lib/mocks'
import { delay, getErrorMessage } from '../../../shared/lib/asyncUtils'

export interface CreateGoalPayload {
  title: string
  deadline: string
  collected: string
  target: string
  monthly: string
  isMain: boolean
}

interface GoalsState {
  items: Goal[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  createError: string | null
}

const initialState: GoalsState = {
  items: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null
}

export const fetchGoals = createAsyncThunk<
  Goal[],
  void,
  { rejectValue: string }
>('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try {
    await delay(350)
    return mockGoals
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const createGoal = createAsyncThunk<
  Goal,
  CreateGoalPayload,
  { rejectValue: string }
>('goals/createGoal', async (payload, { rejectWithValue }) => {
  try {
    await delay(250)
    const collected = Number(payload.collected)
    const target = Number(payload.target)
    const monthly = Number(payload.monthly)

    if (Number.isNaN(collected) || Number.isNaN(target) || Number.isNaN(monthly)) {
      return rejectWithValue('Проверьте числовые поля в форме')
    }

    if (target <= 0 || collected < 0 || monthly < 0 || collected > target) {
      return rejectWithValue('Проверьте значения цели: они некорректны')
    }

    const remaining = Math.max(target - collected, 0)
    const percent = Math.min(100, Math.round((collected / target) * 100))

    return {
      id: Date.now(),
      title: payload.title.trim(),
      deadline: payload.deadline.trim(),
      collected,
      target,
      monthly,
      remaining,
      percent,
      isMain: payload.isMain
    }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearCreateGoalError(state) {
      state.createError = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Не удалось загрузить цели'
      })
      .addCase(createGoal.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        if (action.payload.isMain) {
          state.items = [
            action.payload,
            ...state.items.map((goal) => ({ ...goal, isMain: false }))
          ]
          return
        }

        state.items = [action.payload, ...state.items]
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload ?? 'Не удалось создать цель'
      })
  }
})

export const { clearCreateGoalError } = goalsSlice.actions
export default goalsSlice.reducer
