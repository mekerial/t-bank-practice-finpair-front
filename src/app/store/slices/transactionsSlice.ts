import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import { toRussianCategoryName } from '../../../shared/lib/categoryLocalization'
import {
  fetchTransactionsRequest,
  createHouseholdTransactionRequest
} from '../../../shared/api/transactionsApi'
import type { ApiTransaction } from '../../../shared/api/transactionsApi'

export type { ApiTransaction }

export interface Transaction {
  id: string | number
  category: string
  date: string
  /** Время операции для сортировки (UTC ms из поля date API) */
  dateSortKey: number
  payer: string
  userId?: string
  amount: number
}

export type BalanceChangeSkipReason = 'no_previous_flow' | 'not_comparable'

export interface TransactionsSummary {
  income: number
  expense: number
  balance: number
  /**
   * Изменение чистого потока (доходы − расходы) текущего месяца к прошлому, в %.
   * `null`, если сравнение не показываем (см. `balanceChangeSkipReason`).
   */
  balanceChangePercent: number | null
  /** Заполняется только когда `balanceChangePercent === null` и нужно пояснить почему. */
  balanceChangeSkipReason?: BalanceChangeSkipReason
  period: string
}

export interface CreateTransactionPayload {
  category: string
  categoryId: string
  householdId: string
  payerUserId: string
  amount: string
  type: 'income' | 'expense'
  date: string
  description?: string
}

interface TransactionsState {
  items: Transaction[]
  summary: TransactionsSummary
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  addStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addError: string | null
}

const defaultSummary: TransactionsSummary = {
  income: 0,
  expense: 0,
  balance: 0,
  balanceChangePercent: null,
  period: ''
}

const initialState: TransactionsState = {
  items: [],
  summary: defaultSummary,
  status: 'idle',
  error: null,
  addStatus: 'idle',
  addError: null
}

function transactionDateSortKey(isoDate: string): number {
  const ms = new Date(isoDate).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function sortTransactionsByDateDesc(items: Transaction[]): Transaction[] {
  return [...items].sort((a, b) => {
    if (b.dateSortKey !== a.dateSortKey) {
      return b.dateSortKey - a.dateSortKey
    }
    return String(b.id).localeCompare(String(a.id))
  })
}

function apiToTransaction(t: ApiTransaction): Transaction {
  const dateStr = new Date(t.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const amount = t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount)
  return {
    id: t.id,
    category: toRussianCategoryName(t.title ?? t.category),
    date: dateStr,
    dateSortKey: transactionDateSortKey(t.date),
    payer: t.userId ? `U-${t.userId.slice(0, 4)}` : 'Участник',
    userId: t.userId,
    amount
  }
}

function monthBoundsMs(year: number, monthIndex: number): { start: number; end: number } {
  const start = new Date(year, monthIndex, 1).getTime()
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime()
  return { start, end }
}

function totalsInRange(items: Transaction[], startMs: number, endMs: number) {
  const inRange = items.filter((i) => i.dateSortKey >= startMs && i.dateSortKey <= endMs)
  const income = inRange
    .filter((i) => i.amount > 0)
    .reduce((acc, i) => acc + i.amount, 0)
  const expense = Math.abs(
    inRange.filter((i) => i.amount < 0).reduce((acc, i) => acc + i.amount, 0)
  )
  const balance = income - expense
  return { income, expense, balance }
}

/** Сводка за текущий календарный месяц; % — сравнение чистого потока с прошлым месяцем. */
export function calcSummary(
  items: Transaction[],
  referenceDate: Date = new Date()
): TransactionsSummary {
  const y = referenceDate.getFullYear()
  const m = referenceDate.getMonth()
  const cur = monthBoundsMs(y, m)
  const prevAnchor = new Date(y, m - 1, 1)
  const prev = monthBoundsMs(prevAnchor.getFullYear(), prevAnchor.getMonth())

  const current = totalsInRange(items, cur.start, cur.end)
  const previous = totalsInRange(items, prev.start, prev.end)

  const prevNet = previous.balance
  const curNet = current.balance
  /**
   * Процент (cur−prev)/|prev| при маленьком «prev» даёт +1000% и т.п. — бессмысленно в UI.
   * Нужна достаточная база прошлого месяца и разумный потолок |%|.
   */
  const MIN_ABS_BASE = 5_000
  const MIN_BASE_VS_CUR = 0.12
  const MAX_PERCENT_MAGNITUDE = 120

  let balanceChangePercent: number | null
  let balanceChangeSkipReason: BalanceChangeSkipReason | undefined

  if (prevNet === 0) {
    if (curNet === 0) {
      balanceChangePercent = 0
    } else {
      balanceChangePercent = null
      balanceChangeSkipReason = 'no_previous_flow'
    }
  } else {
    const prevAbs = Math.abs(prevNet)
    const curAbs = Math.abs(curNet)
    const floorVsCurrent = curAbs > 0 ? MIN_BASE_VS_CUR * curAbs : MIN_ABS_BASE
    const minMeaningfulBase = Math.max(MIN_ABS_BASE, floorVsCurrent)

    if (prevAbs < minMeaningfulBase) {
      balanceChangePercent = null
      balanceChangeSkipReason = 'not_comparable'
    } else {
      const rawPct = ((curNet - prevNet) / prevAbs) * 100
      const rounded = Math.round(rawPct)
      if (Math.abs(rounded) > MAX_PERCENT_MAGNITUDE) {
        balanceChangePercent = null
        balanceChangeSkipReason = 'not_comparable'
      } else {
        balanceChangePercent = rounded
      }
    }
  }

  return {
    income: current.income,
    expense: current.expense,
    balance: current.balance,
    balanceChangePercent,
    balanceChangeSkipReason,
    period: referenceDate.toLocaleString('ru-RU', { month: 'long' })
  }
}

export const fetchTransactions = createAsyncThunk<
  { items: Transaction[]; summary: TransactionsSummary },
  void,
  { rejectValue: string }
>('transactions/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    const apiItems = await fetchTransactionsRequest()
    const items = apiItems.map(apiToTransaction)
    return { items, summary: calcSummary(items) }
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return { items: [], summary: calcSummary([]) }
    }
    return rejectWithValue(getErrorMessage(e))
  }
})

export const createTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionPayload,
  { rejectValue: string }
>('transactions/createTransaction', async (payload, { rejectWithValue }) => {
  try {
    const amountNumber = Number(payload.amount.replace(',', '.').trim())
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      return rejectWithValue('Некорректная сумма')
    }
    const normalizedCategory = toRussianCategoryName(payload.category.trim() || 'Операция')
    const normalizedDescription =
      payload.description?.trim() ||
      `${payload.type === 'income' ? 'Доход' : 'Расход'}: ${normalizedCategory}`

    const apiItem = await createHouseholdTransactionRequest({
      householdId: payload.householdId,
      userId: payload.payerUserId,
      categoryId: payload.categoryId,
      type: payload.type,
      amount: amountNumber,
      description: normalizedDescription,
      date: payload.date
    })
    const created = apiToTransaction(apiItem)
    return { ...created, category: normalizedCategory }
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearCreateTransactionError(state) {
      state.addError = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase('auth/loginUser/fulfilled', () => initialState)
      .addCase('auth/tryRestoreSession/fulfilled', () => initialState)
      .addCase('auth/logoutUser/fulfilled', () => initialState)
      .addCase('auth/logoutUser/rejected', () => initialState)
      .addCase('auth/logout', () => initialState)
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = sortTransactionsByDateDesc(action.payload.items)
        state.summary = action.payload.summary
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Не удалось загрузить транзакции'
      })
      .addCase(createTransaction.pending, (state) => {
        state.addStatus = 'loading'
        state.addError = null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.addStatus = 'succeeded'
        state.items = sortTransactionsByDateDesc([
          action.payload,
          ...state.items
        ])
        state.summary = calcSummary(state.items)
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.addStatus = 'failed'
        state.addError = action.payload ?? 'Не удалось сохранить транзакцию'
      })
  }
})

export const { clearCreateTransactionError } = transactionsSlice.actions
export default transactionsSlice.reducer
