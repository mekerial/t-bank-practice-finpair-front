import type { ApiTransaction } from '../api/transactionsApi'

function transactionDateMs(isoDate: string): number {
  const ms = new Date(isoDate).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function monthBoundsMs(year: number, monthIndex: number): { start: number; end: number } {
  const start = new Date(year, monthIndex, 1).getTime()
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime()
  return { start, end }
}

export interface CalendarMonthTotals {
  income: number
  expense: number
  balance: number
  financialLoadPercent: number
}

export function totalsForCalendarMonthFromApi(
  items: ApiTransaction[],
  ref: Date = new Date()
): CalendarMonthTotals {
  const y = ref.getFullYear()
  const m = ref.getMonth()
  const { start, end } = monthBoundsMs(y, m)

  const inMonth = items.filter((t) => {
    const ms = transactionDateMs(t.date)
    return ms >= start && ms <= end
  })

  const income = inMonth
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0)
  const expense = inMonth
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0)
  const balance = income - expense
  let financialLoadPercent = 0
  if (income > 0) {
    financialLoadPercent = Math.round((expense / income) * 100)
  } else if (expense > 0) {
    financialLoadPercent = 100
  }

  return { income, expense, balance, financialLoadPercent }
}

export function calendarMonthTitleRu(ref: Date = new Date()): string {
  return ref.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}
