import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionsReducer from './slices/transactionsSlice'
import goalsReducer from './slices/goalsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    goals: goalsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
