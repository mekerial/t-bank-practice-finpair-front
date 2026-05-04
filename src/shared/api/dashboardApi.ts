import { apiClient } from './apiClient'
import type { FinancialLoad, Recommendation, MainExpense } from '../lib/mocks'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface DashboardResult {
  totalIncome?: number
  totalExpense?: number
  balance?: number
  loadPercent?: number
  partnerSplit?: { a: number; b: number }
  recommendations?: Array<{ id: number; text: string }>
  mainExpenses?: Array<{
    id: number
    category: string
    amount: number
    payer?: string
    share?: number
    fromBudget?: number
  }>
}

export async function fetchDashboard(): Promise<{
  financialLoad: FinancialLoad
  recommendations: Recommendation[]
  mainExpenses: MainExpense[]
}> {
  const { data } = await apiClient.get<ApiResponse<DashboardResult>>(
    '/finance/dashboard'
  )
  const d = data.data

  const financialLoad: FinancialLoad = {
    totalIncome: d.totalIncome ?? 0,
    totalExpense: d.totalExpense ?? 0,
    balance: d.balance ?? 0,
    loadPercent: d.loadPercent ?? 0,
    partnerSplit: d.partnerSplit ?? { a: 50, b: 50 }
  }

  const recommendations: Recommendation[] = (d.recommendations ?? []).map(
    (r) => ({ id: r.id, text: r.text })
  )

  type PayerLabel = 'А' | 'Б' | 'Общий'
  const mainExpenses: MainExpense[] = (d.mainExpenses ?? []).map((e) => ({
    id: e.id,
    category: e.category,
    amount: e.amount,
    payer: (e.payer ?? 'Общий') as PayerLabel,
    share: e.share ?? 100,
    fromBudget: e.fromBudget ?? e.amount
  }))

  return { financialLoad, recommendations, mainExpenses }
}
