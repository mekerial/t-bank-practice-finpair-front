import { apiClient } from './apiClient'
import type {
  KpiItem,
  CategorySlice,
  MonthlyPoint,
  PartnerComparePoint,
  Insight
} from '../lib/financeView'
import { fetchTransactionsRequest } from './transactionsApi'
import { fetchGoalsRequest } from './goalsApi'
import { toRussianCategoryName } from '../lib/categoryLocalization'

interface ApiResponse<T> {
  data: T
  error: null | { code: string; message: string }
  meta: Record<string, unknown>
}

interface ItemsResponse<T> {
  items: T[]
}

interface CategoryAmount {
  name?: string
  category?: string
  amount: number
  color?: string
}

interface MonthlyDynamicsPoint {
  month: string
  amount?: number
  users?: Record<string, number>
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
  title?: string
  description?: string
  message?: string
}

const CATEGORY_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#ddd6fe',
  '#ede9fe'
]

const CATEGORY_NAME_RU_MAP: Record<string, string> = {
  products: 'Продукты',
  transport: 'Транспорт',
  mortgage: 'Ипотека',
  entertainment: 'Развлечения',
  utilities: 'Коммунальные',
  other: 'Прочее',
  salary: 'Зарплата',
  bonus: 'Премия'
}

export interface AnalyticsPageData {
  kpi: KpiItem[]
  categories: CategorySlice[]
  partnerCompare: PartnerComparePoint[]
  insights: Insight[]
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function toAbsAmount(value: unknown): number {
  return Math.abs(toNumber(value))
}

function normalizeCategoryName(name: string | undefined, index: number): string {
  const raw = (name ?? '').trim()
  if (!raw) return `Категория ${index + 1}`
  return toRussianCategoryName(raw)
}

function isGenericCategoryName(name: string): boolean {
  const value = name.trim().toLowerCase()
  return /^категория\s*\d+$/i.test(value) || /^category\s*\d+$/i.test(value)
}

function toFiniteOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = toNumber(value, Number.NaN)
  return Number.isFinite(parsed) ? parsed : null
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function pickItems<T>(payload: unknown, fallbackKey?: string): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const obj = asRecord(payload)
  const byItems = obj.items
  if (Array.isArray(byItems)) return byItems as T[]
  if (fallbackKey && Array.isArray(obj[fallbackKey])) return obj[fallbackKey] as T[]
  if (Array.isArray(obj.data)) return obj.data as T[]
  return []
}

export async function fetchAnalyticsSummary(): Promise<KpiItem[]> {
  const { data } = await apiClient.get<ApiResponse<SummaryResult>>(
    '/analytics/summary'
  )
  const s = asRecord(data.data)
  const averageExpense = toFiniteOrNull(s.averageExpense ?? s.avgExpense)
  const topCategory = (s.topCategory ?? s.maxCategory ?? '—') as string
  const topCategoryAmount = toFiniteOrNull(
    s.topCategoryAmount ?? s.maxCategoryAmount
  )
  const balance = toFiniteOrNull(s.balance)
  const goalsAchieved = toFiniteOrNull(s.goalsAchieved)
  const goalsTotal = toFiniteOrNull(s.goalsTotal)

  return [
    {
      id: 'avg',
      label: 'Средние расходы',
      value: averageExpense !== null
        ? `${new Intl.NumberFormat('ru-RU').format(Math.round(averageExpense))}₽`
        : '—',
      hint: 'в месяц'
    },
    {
      id: 'top',
      label: 'Самая большая категория',
      value: topCategory && topCategory !== '—' ? normalizeCategoryName(topCategory, 0) : '—',
      hint: topCategoryAmount !== null
        ? `${new Intl.NumberFormat('ru-RU').format(topCategoryAmount)}₽`
        : ''
    },
    {
      id: 'bal',
      label: 'Остаток',
      value: balance !== null
        ? `${new Intl.NumberFormat('ru-RU').format(balance)}₽`
        : '—',
      hint: 'доступная сумма'
    },
    {
      id: 'goals',
      label: 'Цели достигнуто',
      value:
        goalsAchieved !== null && goalsTotal !== null
          ? `${goalsAchieved} из ${goalsTotal}`
          : '—',
      hint:
        goalsAchieved !== null && goalsTotal !== null && goalsTotal > 0
          ? `${Math.round((goalsAchieved / goalsTotal) * 100)}%`
          : ''
    }
  ]
}

export async function fetchAnalyticsCategories(): Promise<CategorySlice[]> {
  const { data } = await apiClient.get<
    ApiResponse<ItemsResponse<CategoryAmount> | CategoryAmount[]>
  >('/analytics/categories')

  const raw = data.data
  const items: CategoryAmount[] = pickItems<CategoryAmount>(raw, 'categories')

  return items.map((c, i) => ({
    name: normalizeCategoryName(c.name ?? c.category, i),
    value: toNumber(c.amount),
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
  const items: MonthlyDynamicsPoint[] = pickItems<MonthlyDynamicsPoint>(
    raw,
    'dynamics'
  )

  const monthly: MonthlyPoint[] = items.map((p) => ({
    month: p.month ?? '',
    value:
      p.amount !== undefined
        ? toNumber(p.amount)
        : Object.values(p.users ?? {}).reduce((acc, value) => acc + toNumber(value), 0)
  }))

  const partnerCompare: PartnerComparePoint[] = items.map((p) => ({
    month: p.month ?? '',
    a:
      p.partnerAAmount !== undefined
        ? toNumber(p.partnerAAmount)
        : toNumber(Object.values(p.users ?? {})[0] ?? p.amount ?? 0),
    b:
      p.partnerBAmount !== undefined
        ? toNumber(p.partnerBAmount)
        : toNumber(Object.values(p.users ?? {})[1] ?? 0)
  }))

  return { monthly, partnerCompare }
}

export async function fetchAnalyticsInsights(): Promise<Insight[]> {
  const { data } = await apiClient.get<
    ApiResponse<ItemsResponse<InsightResult> | InsightResult[]>
  >('/analytics/insights')

  const raw = data.data
  const items: InsightResult[] = pickItems<InsightResult>(raw, 'insights')

  return items.map((item, i) => ({
    id: i + 1,
    title: (item.title ?? '').trim() || `Инсайт ${i + 1}`,
    text:
      (item.description ?? item.message ?? '').trim() ||
      'Рекомендация будет доступна после накопления данных.'
  }))
}

function monthKey(dateStr: string): string {
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? '—' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function previousMonthKey(key: string): string {
  const [y, m] = key.split('-').map((v) => Number(v))
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return key
  }
  const year = m === 1 ? y - 1 : y
  const month = m === 1 ? 12 : m - 1
  return `${year}-${String(month).padStart(2, '0')}`
}

function localizeKnownCategoriesInText(text: string): string {
  return Object.entries(CATEGORY_NAME_RU_MAP).reduce((acc, [en, ru]) => {
    const re = new RegExp(`\\b${en}\\b`, 'gi')
    return acc.replace(re, ru)
  }, text)
}

function normalizeInsightItem(item: Insight, index: number): Insight {
  const rawTitle = String(item.title ?? '').trim()
  let rawText = String(item.text ?? '').trim()
  const haystack = `${rawTitle} ${rawText}`.toLowerCase()

  if (
    haystack.includes('expenses are above 80%') ||
    (haystack.includes('expenses') && haystack.includes('income') && haystack.includes('80'))
  ) {
    return {
      id: item.id ?? index + 1,
      title: 'Финансовая нагрузка',
      text: 'Расходы выше 80% дохода. Проверьте регулярные платежи и сократите необязательные траты.'
    }
  }

  const topExpenseMatch = rawText.match(/top expense category is\s+(.+?)[:;,-]\s*([\d.,]+)/i)
  if (topExpenseMatch) {
    const category = normalizeCategoryName(topExpenseMatch[1], 0)
    const amount = Number(topExpenseMatch[2].replace(',', '.'))
    const formatted = Number.isFinite(amount)
      ? `${new Intl.NumberFormat('ru-RU').format(Math.round(amount))}₽`
      : ''
    return {
      id: item.id ?? index + 1,
      title: 'Главная категория расходов',
      text: `Больше всего тратится на категорию "${category}"${formatted ? ` — ${formatted}` : '.'}`
    }
  }

  rawText = localizeKnownCategoriesInText(rawText)
  if (!rawTitle || /^insight\s*\d*$/i.test(rawTitle)) {
    if (haystack.includes('category')) {
      return {
        id: item.id ?? index + 1,
        title: 'Категории расходов',
        text: rawText || 'Категории расходов будут доступны после накопления данных.'
      }
    }
    return {
      id: item.id ?? index + 1,
      title: `Рекомендация ${index + 1}`,
      text: rawText || 'Рекомендация будет доступна после накопления данных.'
    }
  }

  return {
    id: item.id ?? index + 1,
    title: rawTitle,
    text: rawText || 'Рекомендация будет доступна после накопления данных.'
  }
}

export async function fetchAnalyticsPageData(): Promise<AnalyticsPageData> {
  const [kpi, categories, dynamics, insights, tx, goals] = await Promise.all([
    fetchAnalyticsSummary().catch(() => [] as KpiItem[]),
    fetchAnalyticsCategories().catch(() => [] as CategorySlice[]),
    fetchAnalyticsDynamics().catch(() => ({ monthly: [], partnerCompare: [] })),
    fetchAnalyticsInsights().catch(() => [] as Insight[]),
    fetchTransactionsRequest().catch(() => []),
    fetchGoalsRequest().catch(() => [])
  ])

  const isType = (type: unknown, expected: 'income' | 'expense') =>
    String(type ?? '').toLowerCase() === expected
  const income = tx
    .filter((t) => isType(t.type, 'income'))
    .reduce((s, t) => s + toAbsAmount(t.amount), 0)
  const expense = tx
    .filter((t) => isType(t.type, 'expense'))
    .reduce((s, t) => s + toAbsAmount(t.amount), 0)
  const expenseCount = tx.filter((t) => isType(t.type, 'expense')).length
  const top = tx
    .filter((t) => isType(t.type, 'expense'))
    .reduce<Record<string, number>>((acc, t) => {
      const k = t.category || 'Прочее'
      acc[k] = (acc[k] ?? 0) + toAbsAmount(t.amount)
      return acc
    }, {})
  const topEntry = Object.entries(top).sort((a, b) => b[1] - a[1])[0]

  const goalsDone = goals.filter((g) => {
    const current = toNumber(
      (g as { currentAmount?: unknown; savedAmount?: unknown }).currentAmount ??
        (g as { currentAmount?: unknown; savedAmount?: unknown }).savedAmount
    )
    const target = toNumber((g as { targetAmount?: unknown }).targetAmount)
    return target > 0 && current >= target
  }).length

  const fallbackKpi: KpiItem[] = [
    {
      id: 'avg',
      label: 'Средние расходы',
      value: `${new Intl.NumberFormat('ru-RU').format(
        Math.round(expense / Math.max(1, expenseCount))
      )}₽`,
      hint: 'по расходным операциям'
    },
    {
      id: 'top',
      label: 'Самая большая категория',
      value: topEntry ? normalizeCategoryName(topEntry[0], 0) : '—',
      hint: topEntry
        ? `${new Intl.NumberFormat('ru-RU').format(Math.round(topEntry[1]))}₽`
        : ''
    },
    {
      id: 'bal',
      label: 'Остаток',
      value: `${new Intl.NumberFormat('ru-RU').format(
        Math.round(income - expense)
      )}₽`,
      hint: 'доходы - расходы'
    },
    {
      id: 'goals',
      label: 'Цели достигнуто',
      value: `${goalsDone} из ${goals.length}`,
      hint: goals.length ? `${Math.round((goalsDone / goals.length) * 100)}%` : ''
    }
  ]

  const fallbackById = Object.fromEntries(fallbackKpi.map((x) => [x.id, x]))
  const safeKpi =
    kpi.length > 0
      ? kpi.map((item) => {
          const fallback = fallbackById[item.id]
          if (!fallback) return item
          const shouldReplaceValue =
            item.value === '—' || item.value === '' || item.value === null
          const shouldReplaceHint = !item.hint
          return {
            ...item,
            value: shouldReplaceValue ? fallback.value : item.value,
            hint: shouldReplaceHint ? fallback.hint : item.hint
          }
        })
      : fallbackKpi

  const txExpenseByCategory = tx
    .filter((t) => isType(t.type, 'expense'))
    .reduce<Record<string, number>>((acc, t) => {
      const key = t.category || 'Прочее'
      acc[key] = (acc[key] ?? 0) + toAbsAmount(t.amount)
      return acc
    }, {})

  // Всегда приоритетно считаем категории из актуальных транзакций,
  // чтобы новые операции появлялись в аналитике сразу.
  let safeCategories =
    Object.keys(txExpenseByCategory).length > 0
      ? Object.entries(txExpenseByCategory).map(([name, value], i) => ({
          name: normalizeCategoryName(name, i),
          value,
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
        }))
      : categories

  if (safeCategories.some((c) => isGenericCategoryName(c.name))) {
    const preferredNames = Object.entries(
      tx
        .filter((t) => isType(t.type, 'expense'))
        .reduce<Record<string, number>>((acc, t) => {
          const key = normalizeCategoryName(t.category || 'Прочее', 0)
          acc[key] = (acc[key] ?? 0) + toAbsAmount(t.amount)
          return acc
        }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)

    let pointer = 0
    safeCategories = safeCategories.map((c, i) => {
      if (!isGenericCategoryName(c.name)) return c
      const replacement = preferredNames[pointer]
      pointer += 1
      return {
        ...c,
        name: replacement || `Категория ${i + 1}`
      }
    })
  }

  const txUserOrder = Array.from(
    new Set(tx.filter((t) => t.userId).map((t) => String(t.userId)))
  )
  const [userAId, userBId] = txUserOrder
  const txByMonth = tx
    .filter((t) => isType(t.type, 'expense'))
    .reduce<Record<string, { a: number; b: number }>>((acc, t) => {
      const key = monthKey(t.date)
      const amount = toAbsAmount(t.amount)
      if (!acc[key]) acc[key] = { a: 0, b: 0 }

      if (String(t.userId ?? '') === String(userAId ?? '')) {
        acc[key].a += amount
      } else if (String(t.userId ?? '') === String(userBId ?? '')) {
        acc[key].b += amount
      } else {
        acc[key].a += amount
      }
      return acc
    }, {})

  // Всегда приоритетно берем динамику из актуальных транзакций.
  let safePartnerCompare =
    Object.keys(txByMonth).length > 0
      ? Object.entries(txByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, values]) => ({ month, a: values.a, b: values.b }))
      : dynamics.partnerCompare

  // Если есть только один месяц, линия выглядит как одна точка.
  // Добавляем предыдущий месяц с нулевыми значениями для наглядного графика.
  if (safePartnerCompare.length === 1) {
    const only = safePartnerCompare[0]
    safePartnerCompare = [
      { month: previousMonthKey(only.month), a: 0, b: 0 },
      only
    ]
  }

  const defaultInsights: Insight[] = [
    {
      id: 1001,
      title: 'Финансовая нагрузка',
      text: (() => {
        if (income <= 0) {
          return 'Доходов за период не найдено. Добавьте доходные операции для корректной аналитики.'
        }
        const ratio = expense / Math.max(income, 1)
        if (ratio >= 1.2) {
          return 'Расходы сейчас выше доходов. Проверьте регулярные списания и сократите необязательные траты.'
        }
        if (ratio >= 0.8) {
          return 'Нагрузка повышенная: держите под контролем крупные категории расходов.'
        }
        if (ratio >= 0.5) {
          return 'Баланс в рабочей зоне: продолжайте текущую стратегию и следите за динамикой.'
        }
        return 'Нагрузка комфортная. Можно увеличить взносы в накопления и финансовые цели.'
      })()
    },
    {
      id: 1002,
      title: 'Главная категория расходов',
      text: topEntry
        ? `Больше всего тратится на категорию "${normalizeCategoryName(topEntry[0], 0)}" — ${new Intl.NumberFormat('ru-RU').format(Math.round(topEntry[1]))}₽.`
        : 'Пока недостаточно данных для выделения главной категории расходов.'
    },
    {
      id: 1003,
      title: 'Рекомендация по целям',
      text:
        goals.length > 0
          ? goalsDone === goals.length
            ? 'Отличный результат: все текущие цели достигнуты. Можно поставить новую цель с большим горизонтом.'
            : `Достигнуто целей: ${goalsDone} из ${goals.length}. Регулярные пополнения ускорят прогресс.`
          : 'Создайте первую цель, чтобы получать персональные рекомендации по накоплениям.'
    }
  ]

  const seenInsightTitles = new Set<string>()
  const normalizedBackendInsights = insights.map((item, index) =>
    normalizeInsightItem(item, index)
  )
  const safeInsights = [...defaultInsights, ...normalizedBackendInsights]
    .filter((item) => {
      const key = String(item.title ?? '')
        .trim()
        .toLowerCase()
      if (!key || seenInsightTitles.has(key)) return false
      seenInsightTitles.add(key)
      return true
    })
    .slice(0, 4)

  return {
    kpi: safeKpi,
    categories: safeCategories,
    partnerCompare: safePartnerCompare,
    insights: safeInsights
  }
}
