import { fetchDashboard } from '../api/dashboardApi'
import {
  fetchAnalyticsSummary,
  fetchAnalyticsCategories,
  fetchAnalyticsDynamics,
  fetchAnalyticsInsights
} from '../api/analyticsApi'
import type {
  CategorySlice,
  FinancialLoad,
  Insight,
  KpiItem,
  MainExpense,
  PartnerComparePoint,
  Recommendation
} from './mocks'

export interface DashboardPageData {
  financialLoad: FinancialLoad
  recommendations: Recommendation[]
  mainExpenses: MainExpense[]
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  return fetchDashboard()
}

export interface AnalyticsPageData {
  kpi: KpiItem[]
  categories: CategorySlice[]
  partnerCompare: PartnerComparePoint[]
  insights: Insight[]
}

export async function loadAnalyticsPageData(): Promise<AnalyticsPageData> {
  const [kpi, categories, dynamics, insights] = await Promise.all([
    fetchAnalyticsSummary(),
    fetchAnalyticsCategories(),
    fetchAnalyticsDynamics(),
    fetchAnalyticsInsights()
  ])

  return {
    kpi,
    categories,
    partnerCompare: dynamics.partnerCompare,
    insights
  }
}
