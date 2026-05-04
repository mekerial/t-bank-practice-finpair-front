import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getErrorMessage } from '../../../shared/lib/asyncUtils'
import {
  fetchTransactionsRequest,
  createTransactionRequest
} from '../../../shared/api/transactionsApi'
import type { ApiTransaction } from '../../../shared/api/transactionsApi'

export type { ApiTransaction }

export interface Transaction {
  id: string | number
  category: string
  date: string
  payer: string
  amount: number
}

export interface TransactionsSummary {
  income: number
  expense: number
  balance: number
  balanceChangePercent: number
  period: string
}

export interface CreateTransactionPayload {
  category: string
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
  balanceChangePercent: 0,
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

function apiToTransaction(t: ApiTransaction): Transaction {
  const dateStr = new Date(t.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const amount = t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount)
  return {
    id: t.id,
    category: t.title ?? t.category,
    date: dateStr,
    payer: '',
    amount
  }
}

function calcSummary(items: Transaction[]): TransactionsSummary {
  const income = items
    .filter((i) => i.amount > 0)
    .reduce((acc, i) => acc + i.amount, 0)
  const expense = Math.abs(
    items.filter((i) => i.amount < 0).reduce((acc, i) => acc + i.amount, 0)
  )
  return {
    income,
    expense,
    balance: income - expense,
    balanceChangePercent: 0,
    period: new Date().toLocaleString('ru-RU', { month: 'long' })
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
    const apiItem = await createTransactionRequest({
      type: payload.type,
      category: payload.category.trim(),
      amount: amountNumber,
      description: payload.description,
      date: payload.date
    })
    return apiToTransaction(apiItem)
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
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
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
        state.items = [action.payload, ...state.items]
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
