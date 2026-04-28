import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Transaction, TransactionsSummary } from '../../../shared/lib/mocks'
import {
  mockTransactions,
  mockTransactionsSummary
} from '../../../shared/lib/mocks'
import { delay, getErrorMessage } from '../../../shared/lib/asyncUtils'
import type { PartnerLabel } from '../../../shared/lib/mocks'

export interface CreateTransactionPayload {
  category: string
  amount: string
  payer: PartnerLabel
  type: 'income' | 'expense'
  date: string
}

interface TransactionsState {
  items: Transaction[]
  summary: TransactionsSummary
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  addStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  addError: string | null
}

const initialState: TransactionsState = {
  items: [],
  summary: mockTransactionsSummary,
  status: 'idle',
  error: null,
  addStatus: 'idle',
  addError: null
}

function formatTransactionDate(value: string) {
  const date = new Date(value)

  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).formatToParts(date)

  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = (
    parts.find((part) => part.type === 'month')?.value ?? ''
  ).replace('.', '')
  const year = parts.find((part) => part.type === 'year')?.value ?? ''

  return `${day} ${month} ${year}`
}

function calculateSummary(items: Transaction[]): TransactionsSummary {
  const income = items
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0)
  const expense = Math.abs(
    items
      .filter((item) => item.amount < 0)
      .reduce((acc, item) => acc + item.amount, 0)
  )

  return {
    income,
    expense,
    balance: income - expense,
    balanceChangePercent: mockTransactionsSummary.balanceChangePercent,
    period: mockTransactionsSummary.period
  }
}

export const fetchTransactions = createAsyncThunk<
  { items: Transaction[]; summary: TransactionsSummary },
  void,
  { rejectValue: string }
>('transactions/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    await delay(350)
    return { items: mockTransactions, summary: mockTransactionsSummary }
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
    await delay(250)
    const amountNumber = Number(payload.amount.replace(',', '.').trim())
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      return rejectWithValue('Не удалось сохранить транзакцию: некорректная сумма')
    }

    return {
      id: Date.now(),
      category: payload.category.trim(),
      payer: payload.payer,
      date: formatTransactionDate(payload.date),
      amount: payload.type === 'income' ? amountNumber : -amountNumber
    }
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
        state.summary = calculateSummary(state.items)
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.addStatus = 'failed'
        state.addError = action.payload ?? 'Не удалось сохранить транзакцию'
      })
  }
})

export const { clearCreateTransactionError } = transactionsSlice.actions
export default transactionsSlice.reducer
