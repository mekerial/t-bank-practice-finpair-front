import { apiClient } from './apiClient'
import type {
  KpiItem,
  CategorySlice,
  MonthlyPoint,
  PartnerComparePoint,
  Insight
} from '../lib/mocks'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface ItemsResponse<T> {
  items: T[]
}

interface CategoryAmount {
  name: string
  amount: number
  color?: string
}

interface MonthlyDynamicsPoint {
  month: string
  amount: number
  partnerAAmount?: number
  partnerBAmount?: number
}

interface SummaryResult {
  totalIncome?: number
  totalExpense?: number
  averageExpense?: number
  topCategory?: string
  topCategoryAmount?: number
  balance?: number
  goalsAchieved?: number
  goalsTotal?: number
}

interface InsightResult {
  title: string
  description: string
}

const CATEGORY_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
  '#ede9fe'
]

export async function fetchAnalyticsSummary(): Promise<KpiItem[]> {
  const { data } = await apiClient.get<ApiResponse<SummaryResult>>(
    '/analytics/summary'
  )
  const s = data.data

  return [
    {
      id: 'avg',
      label: 'Средние расходы',
      value: s.averageExpense
        ? `${new Intl.NumberFormat('ru-RU').format(Math.round(s.averageExpense))}₽`
        : '—',
      hint: 'в месяц'
    },
    {
      id: 'top',
      label: 'Самая большая категория',
      value: s.topCategory ?? '—',
      hint: s.topCategoryAmount
        ? `${new Intl.NumberFormat('ru-RU').format(s.topCategoryAmount)}₽`
        : ''
    },
    {
      id: 'bal',
      label: 'Остаток',
      value: s.balance !== undefined
        ? `${new Intl.NumberFormat('ru-RU').format(s.balance)}₽`
        : '—',
      hint: 'доступная сумма'
    },
    {
      id: 'goals',
      label: 'Цели достигнуто',
      value:
        s.goalsAchieved !== undefined && s.goalsTotal !== undefined
          ? `${s.goalsAchieved} из ${s.goalsTotal}`
          : '—',
      hint:
        s.goalsAchieved !== undefined && s.goalsTotal && s.goalsTotal > 0
          ? `${Math.round((s.goalsAchieved / s.goalsTotal) * 100)}%`
          : ''
    }
  ]
}

export async function fetchAnalyticsCategories(): Promise<CategorySlice[]> {
  const { data } = await apiClient.get<
    ApiResponse<ItemsResponse<CategoryAmount> | CategoryAmount[]>
  >('/analytics/categories')

  const raw = data.data
  const items: CategoryAmount[] = Array.isArray(raw)
    ? raw
    : (raw as ItemsResponse<CategoryAmount>).items ?? []

  return items.map((c, i) => ({
    name: c.name,
    value: c.amount,
    color: c.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }))
}

export async function fetchAnalyticsDynamics(): Promise<{
  monthly: MonthlyPoint[]
  partnerCompare: PartnerComparePoint[]
}> {
  const { data } = await apiClient.get<
    ApiResponse<ItemsResponse<MonthlyDynamicsPoint> | MonthlyDynamicsPoint[]>
  >('/analytics/dynamics')

  const raw = data.data
  const items: MonthlyDynamicsPoint[] = Array.isArray(raw)
    ? raw
    : (raw as ItemsResponse<MonthlyDynamicsPoint>).items ?? []

  const monthly: MonthlyPoint[] = items.map((p) => ({
    month: p.month,
    value: p.amount
  }))

  const partnerCompare: PartnerComparePoint[] = items.map((p) => ({
    month: p.month,
    a: p.partnerAAmount ?? p.amount,
    b: p.partnerBAmount ?? 0
  }))

  return { monthly, partnerCompare }
}

export async function fetchAnalyticsInsights(): Promise<Insight[]> {
  const { data } = await apiClient.get<
    ApiResponse<ItemsResponse<InsightResult> | InsightResult[]>
  >('/analytics/insights')

  const raw = data.data
  const items: InsightResult[] = Array.isArray(raw)
    ? raw
    : (raw as ItemsResponse<InsightResult>).items ?? []

  return items.map((item, i) => ({
    id: i + 1,
    title: item.title,
    text: item.description
  }))
}
