export { store } from './store'
export type { AppDispatch, RootState } from './store'
export { useAppDispatch, useAppSelector } from './hooks'
export {
  loginUser,
  registerUser,
  logout,
  logoutUser,
  tryRestoreSession,
  fetchAuthUser
} from './slices/authSlice'
export type { AuthUser } from '../../shared/api/authApi'
export {
  fetchTransactions,
  createTransaction,
  clearCreateTransactionError
} from './slices/transactionsSlice'
export {
  fetchGoals,
  createGoal,
  completeGoal,
  deleteGoal,
  clearCreateGoalError,
  setMainGoal,
  clearMainGoal
} from './slices/goalsSlice'
