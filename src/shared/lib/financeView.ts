export interface FinancialLoad {
  totalIncome: number
  totalExpense: number
  balance: number
  loadPercent: number
  partnerSplit: { a: number; b: number }
}

export interface Recommendation {
  id: number
  text: string
}

export interface KpiItem {
  id: string
  label: string
  value: string
  hint: string
}

export interface MonthlyPoint {
  month: string
  value: number
}

export interface CategorySlice {
  name: string
  value: number
  color: string
}

export interface PartnerComparePoint {
  month: string
  a: number
  b: number
}

export interface Insight {
  id: number
  title: string
  text: string
}

export type SplitType = '50-50' | 'by-income' | 'custom'

export interface NotificationSettings {
  newTransactions: boolean
  goalsProgress: boolean
  monthlyReports: boolean
}

export type HouseholdCurrency = 'RUB' | 'USD' | 'EUR'

export function currencySymbol(currency: HouseholdCurrency): string {
  if (currency === 'USD') return '$'
  if (currency === 'EUR') return '€'
  return '₽'
}

export const formatMoney = (
  value: number,
  currency: HouseholdCurrency = 'RUB'
): string => {
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('ru-RU').format(abs)
  return `${sign}${formatted}${currencySymbol(currency)}`
}

export const formatMoneyPlain = (
  value: number,
  currency: HouseholdCurrency = 'RUB'
): string => {
  const sign = value < 0 ? '−' : ''
  const formatted = new Intl.NumberFormat('ru-RU').format(Math.abs(value))
  return `${sign}${formatted}${currencySymbol(currency)}`
}