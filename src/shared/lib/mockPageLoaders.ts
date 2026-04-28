import { delay } from './asyncUtils'
import {
  mockAnalyticsKpi,
  mockCategories,
  mockFinancialLoad,
  mockInsights,
  mockMainExpenses,
  mockPartnerCompare,
  mockRecommendations,
  type CategorySlice,
  type FinancialLoad,
  type Insight,
  type KpiItem,
  type MainExpense,
  type PartnerComparePoint,
  type Recommendation
} from './mocks'

/** Задержка загрузки страниц (мс). 0 — без ожидания. */
const MOCK_PAGE_DELAY_MS = 420

function shouldSimulatePageLoadFailure(): boolean {
  return import.meta.env.VITE_SIMULATE_PAGE_ERROR === 'true'
}

export interface DashboardPageData {
  financialLoad: FinancialLoad
  recommendations: Recommendation[]
  mainExpenses: MainExpense[]
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  await delay(MOCK_PAGE_DELAY_MS)
  if (shouldSimulatePageLoadFailure()) {
    throw new Error('Симуляция ошибки загрузки (VITE_SIMULATE_PAGE_ERROR).')
  }
  return {
    financialLoad: mockFinancialLoad,
    recommendations: mockRecommendations,
    mainExpenses: mockMainExpenses
  }
}

export interface AnalyticsPageData {
  kpi: KpiItem[]
  categories: CategorySlice[]
  partnerCompare: PartnerComparePoint[]
  insights: Insight[]
}

export async function loadAnalyticsPageData(): Promise<AnalyticsPageData> {
  await delay(MOCK_PAGE_DELAY_MS)
  if (shouldSimulatePageLoadFailure()) {
    throw new Error('Симуляция ошибки загрузки (VITE_SIMULATE_PAGE_ERROR).')
  }
  return {
    kpi: mockAnalyticsKpi,
    categories: mockCategories,
    partnerCompare: mockPartnerCompare,
    insights: mockInsights
  }
}
