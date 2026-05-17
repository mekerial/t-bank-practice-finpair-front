import { apiClient } from './apiClient'
import type { FinancialLoad, Recommendation } from '../lib/financeView'
import axios from 'axios'
import { fetchTransactionsRequest } from './transactionsApi'
import { toRussianCategoryName } from '../lib/categoryLocalization'
import {
  calendarMonthTitleRu,
  totalsForCalendarMonthFromApi
} from '../lib/transactionMonthTotals'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface DashboardResult {
  totalIncome?: number
  totalExpense?: number
  balance?: number
  financialLoadPercent?: number
  partnerSummary?: Array<{
    userId: string
    income: number
    expense: number
    sharePercent: number
  }>
}

export interface DashboardMainExpense {
  id: number
  userId?: string
  category: string
  amount: number
  payer: 'А' | 'Б' | 'Общий'
  share: number
  fromBudget: number
}

export interface DashboardPageData {
  financialLoad: FinancialLoad
  overviewMonthLabel: string
  recommendations: Recommendation[]
  mainExpenses: DashboardMainExpense[]
  partnerStats: Array<{
    userId: string
    income: number
    expense: number
    sharePercent: number
  }>
}

function toSafePercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function toLoadPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export async function fetchDashboard(): Promise<DashboardPageData> {
  let data: ApiResponse<DashboardResult>
  try {
    const response = await apiClient.get<ApiResponse<DashboardResult>>(
      '/finance/dashboard'
    )
    data = response.data
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return {
        financialLoad: {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          loadPercent: 0,
          partnerSplit: { a: 0, b: 0 }
        },
        overviewMonthLabel: calendarMonthTitleRu(),
        recommendations: [
          {
            id: 1,
            text: 'Добавьте первые транзакции, чтобы увидеть персональные рекомендации.'
          }
        ],
        mainExpenses: [],
        partnerStats: []
      }
    }
    throw e
  }
  const d = data.data
  const partners = d.partnerSummary ?? []
  const transactions = await fetchTransactionsRequest().catch(() => [])
  const categoryRows = transactions
    .filter((t) => t.type === 'expense')
    .reduce<
      Map<
        string,
        {
          amount: number
          userId?: string
        }
      >
    >((acc, transaction) => {
      const key = toRussianCategoryName(transaction.category || 'Прочее')
      const current = acc.get(key) ?? { amount: 0, userId: transaction.userId }
      current.amount += Math.abs(Number(transaction.amount) || 0)
      if (!current.userId && transaction.userId) {
        current.userId = transaction.userId
      }
      acc.set(key, current)
      return acc
    }, new Map())

  const expensesFromTransactions = Array.from(categoryRows.values()).reduce(
    (sum, row) => sum + row.amount,
    0
  )
  const totalExpenseForShare =
    (d.totalExpense ?? 0) > 0 ? (d.totalExpense ?? 0) : expensesFromTransactions

  const now = new Date()
  const overviewMonthLabel = calendarMonthTitleRu(now)
  const monthlyFromTx = totalsForCalendarMonthFromApi(transactions, now)

  const topExpenses = Array.from(categoryRows.entries())
    .map(([category, value], index) => {
      const ownerIndex = partners.findIndex((p) => p.userId === value.userId)
      const payer: DashboardMainExpense['payer'] =
        ownerIndex === 0 ? 'А' : ownerIndex === 1 ? 'Б' : 'Общий'
      const fromBudget = value.amount
      const share =
        totalExpenseForShare > 0
          ? toSafePercent((fromBudget / Math.max(totalExpenseForShare, 1)) * 100)
          : 0
      return {
        id: index + 1,
        userId: value.userId,
        category,
        amount: value.amount,
        payer,
        share,
        fromBudget
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const financialLoad: FinancialLoad = {
    totalIncome: monthlyFromTx.income,
    totalExpense: monthlyFromTx.expense,
    balance: monthlyFromTx.balance,
    loadPercent: toLoadPercent(monthlyFromTx.financialLoadPercent),
    partnerSplit: {
      a: toSafePercent(partners[0]?.sharePercent ?? 0),
      b: toSafePercent(partners[1]?.sharePercent ?? 0)
    }
  }

  const loadPercent = monthlyFromTx.financialLoadPercent
  const recommendations: Recommendation[] = [
    {
      id: 1,
      text:
        loadPercent >= 75
          ? 'Нагрузка высокая: проверьте крупные расходы и на время сократите необязательные траты.'
          : 'Нагрузка в норме: удерживайте темп и следите за категориями расходов.'
    },
    {
      id: 2,
      text:
        monthlyFromTx.balance <= 0
          ? 'Баланс на нуле или в минусе: добавьте доходные операции и пересмотрите регулярные списания.'
          : 'Часть положительного баланса направляйте в цели, чтобы ускорить накопления.'
    },
    {
      id: 3,
      text:
        (d.partnerSummary?.length ?? 0) > 1
          ? 'Сверяйте вклад партнёров в «Настройках» и при необходимости меняйте способ деления расходов.'
          : 'Подключите партнёра по коду приглашения, чтобы видеть совместную аналитику и общий прогресс.'
    }
  ]

  const mainExpenses: DashboardMainExpense[] = topExpenses.map((e) => ({
    id: e.id,
    userId: e.userId,
    category: e.category,
    amount: e.amount,
    payer: e.payer,
    share: e.share ?? 0,
    fromBudget: e.fromBudget ?? 0
  }))

  return {
    financialLoad,
    overviewMonthLabel,
    recommendations,
    mainExpenses,
    partnerStats: d.partnerSummary ?? []
  }
}
