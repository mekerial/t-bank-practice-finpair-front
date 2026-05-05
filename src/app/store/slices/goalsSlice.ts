import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import {
  fetchGoalsRequest,
  createGoalRequest
} from '../../../shared/api/goalsApi'
import type { ApiGoal } from '../../../shared/api/goalsApi'

export interface Goal {
  id: string | number
  title: string
  deadline: string
  percent: number
  collected: number
  target: number
  monthly: number
  remaining: number
  isMain?: boolean
}

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

function apiToGoal(g: ApiGoal, isMain = false): Goal {
  const collected = g.currentAmount ?? 0
  const target = g.targetAmount ?? 0
  const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0
  const remaining = Math.max(0, target - collected)
  const monthly = g.monthlyContribution ?? 0

  let deadline = g.deadline ?? ''
  if (deadline) {
    deadline = new Date(deadline).toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    id: g.id,
    title: g.title,
    deadline,
    percent,
    collected,
    target,
    monthly,
    remaining,
    isMain
  }
}

export const fetchGoals = createAsyncThunk<
  Goal[],
  void,
  { rejectValue: string }
>('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try {
    const apiGoals = await fetchGoalsRequest()
    return apiGoals.map((g, i) => apiToGoal(g, i === 0))
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
    const collected = Number(payload.collected)
    const target = Number(payload.target)
    const monthly = Number(payload.monthly)

    if (Number.isNaN(collected) || Number.isNaN(target) || Number.isNaN(monthly)) {
      return rejectWithValue('Проверьте числовые поля в форме')
    }
    if (target <= 0 || collected < 0 || monthly < 0 || collected > target) {
      return rejectWithValue('Проверьте значения цели: они некорректны')
    }

    const apiGoal = await createGoalRequest({
      title: payload.title.trim(),
      targetAmount: target,
      currentAmount: collected,
      monthlyContribution: monthly,
      deadline: payload.deadline || undefined
    })

    return apiToGoal(apiGoal, payload.isMain)
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
            ...state.items.map((g) => ({ ...g, isMain: false }))
          ]
        } else {
          state.items = [action.payload, ...state.items]
        }
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload ?? 'Не удалось создать цель'
      })
  }
})

export const { clearCreateGoalError } = goalsSlice.actions
export default goalsSlice.reducer
