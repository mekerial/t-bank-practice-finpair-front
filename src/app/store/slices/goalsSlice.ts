import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import {
  fetchGoalsRequest,
  createGoalRequest,
  updateGoalRequest,
  deleteGoalRequest
} from '../../../shared/api/goalsApi'
import type { RootState } from '../store'
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
  // Не показываем 100% и «выполнено», пока накопленная сумма реально не достигла цели:
  // Math.round давал 100% при остатке до ~0,5% от target — тогда «Ещё месяцев» выглядело ошибочно.
  const percent =
    target > 0
      ? collected >= target
        ? 100
        : Math.floor((collected / target) * 100)
      : 0
  const remainingFromApi = g.remainingAmount
  const remaining =
    typeof remainingFromApi === 'number' &&
    Number.isFinite(remainingFromApi)
      ? Math.max(0, remainingFromApi)
      : Math.max(0, target - collected)
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
    return apiGoals.map((g) => apiToGoal(g, false))
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return []
    }
    return rejectWithValue(getErrorMessage(e))
  }
})

export const completeGoal = createAsyncThunk<
  Goal,
  Goal['id'],
  { rejectValue: string; state: RootState }
>('goals/completeGoal', async (goalId, { rejectWithValue, getState }) => {
  try {
    const goal = getState().goals.items.find((g) => g.id === goalId)
    if (!goal) return rejectWithValue('Цель не найдена')
    if (goal.target <= 0) return rejectWithValue('Некорректная сумма цели')
    if (goal.collected >= goal.target) return rejectWithValue('Цель уже выполнена')
    const apiGoal = await updateGoalRequest(String(goalId), {
      currentAmount: goal.target
    })
    return apiToGoal(apiGoal, Boolean(goal.isMain))
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const deleteGoal = createAsyncThunk<
  Goal['id'],
  Goal['id'],
  { rejectValue: string }
>('goals/deleteGoal', async (goalId, { rejectWithValue }) => {
  try {
    await deleteGoalRequest(String(goalId))
    return goalId
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

    if (Number.isNaN(collected) || Number.isNaN(target)) {
      return rejectWithValue('Проверьте числовые поля в форме')
    }
    if (target <= 0 || collected < 0 || collected > target) {
      return rejectWithValue('Проверьте значения цели: они некорректны')
    }

    const apiGoal = await createGoalRequest({
      title: payload.title.trim(),
      targetAmount: target,
      currentAmount: collected,
      deadline: payload.deadline || undefined
    })

    return apiToGoal(apiGoal, Boolean(payload.isMain))
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
    },
    setMainGoal(state, action: { payload: Goal['id'] }) {
      const nextMainId = action.payload
      state.items = state.items.map((goal) => ({
        ...goal,
        isMain: goal.id === nextMainId
      }))
    },
    clearMainGoal(state) {
      state.items = state.items.map((goal) => ({ ...goal, isMain: false }))
    }
  },
  extraReducers(builder) {
    builder
      .addCase('auth/loginUser/fulfilled', () => initialState)
      .addCase('auth/tryRestoreSession/fulfilled', () => initialState)
      .addCase('auth/logoutUser/fulfilled', () => initialState)
      .addCase('auth/logoutUser/rejected', () => initialState)
      .addCase('auth/logout', () => initialState)
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
      .addCase(completeGoal.fulfilled, (state, action) => {
        const updated = action.payload
        state.items = state.items.map((g) => (g.id === updated.id ? updated : g))
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        const id = action.payload
        state.items = state.items.filter((g) => g.id !== id)
      })
  }
})

export const { clearCreateGoalError, setMainGoal, clearMainGoal } =
  goalsSlice.actions
export default goalsSlice.reducer
