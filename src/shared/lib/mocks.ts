export interface User {
  id: string
  name: string
  email: string
  role: 'A' | 'B'
  income: number
  subtitle: string
}

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

export type PayerLabel = 'А' | 'Б' | 'Общий'

export interface MainExpense {
  id: number
  category: string
  amount: number
  payer: PayerLabel
  share: number
  fromBudget: number
}

export type PartnerLabel = 'Партнёр А' | 'Партнёр Б'

export interface Transaction {
  id: number
  category: string
  date: string
  payer: PartnerLabel
  amount: number
}

export interface TransactionsSummary {
  income: number
  expense: number
  balance: number
  balanceChangePercent: number
  period: string
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

export interface MainGoal {
  id: number
  label: string
  title: string
  deadline: string
  monthly: number
  collected: number
  target: number
  percent: number
  remaining: number
  monthsLeft: number
}

export interface Goal {
  id: number
  title: string
  deadline: string
  collected: number
  target: number
  monthly: number
  remaining: number
  percent: number
  isMain: boolean
}

export interface GoalTip {
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

export interface AppSettings {
  profiles: {
    a: { email: string; income: number }
    b: { email: string; income: number }
  }
  splitType: SplitType
  splitNote: string
  inviteCode: string
  currency: 'RUB' | 'USD' | 'EUR'
  notifications: NotificationSettings
}

export interface FaqItem {
  id: number
  question: string
  answer: string
}

export interface Contacts {
  email: string
  hours: string
  telegram: string
}

export const mockUser: User = {
  id: 'u-1',
  name: 'Партнёр А',
  email: 'partner@finpair.ru',
  role: 'A',
  income: 200000,
  subtitle: 'Основной аккаунт'
}

export const mockPartner: User = {
  id: 'u-2',
  name: 'Партнёр Б',
  email: 'partner-b@finpair.ru',
  role: 'B',
  income: 150000,
  subtitle: 'Второй аккаунт'
}

export const mockFinancialLoad: FinancialLoad = {
  totalIncome: 200000,
  totalExpense: 100000,
  balance: 100000,
  loadPercent: 50.5,
  partnerSplit: { a: 60, b: 40 }
}

export const mockRecommendations: Recommendation[] = [
  {
    id: 1,
    text: 'Партнёр Б может взять на себя оплату коммунальных услуг для баланса'
  },
  {
    id: 2,
    text: 'Рекомендуем создать цель «Отпуск 2026» с вкладом 30 000₽/мес от каждого'
  },
  {
    id: 3,
    text: 'Оптимизация расходов на продукты может сэкономить до 12 000₽ в месяц'
  }
]

export const mockMainExpenses: MainExpense[] = [
  { id: 1, category: 'Ипотека', amount: 30000, payer: 'А', share: 80, fromBudget: 120000 },
  { id: 2, category: 'Продукты', amount: 30000, payer: 'Общий', share: 100, fromBudget: 95000 },
  { id: 3, category: 'Авто', amount: 60000, payer: 'Б', share: 100, fromBudget: 105000 }
]

export const mockTransactions: Transaction[] = [
  { id: 1, category: 'Продукты', date: '12 апр 2026', payer: 'Партнёр А', amount: -12500 },
  { id: 2, category: 'Зарплата', date: '11 апр 2026', payer: 'Партнёр А', amount: 100000 },
  { id: 3, category: 'Ресторан', date: '10 апр 2026', payer: 'Партнёр Б', amount: -8900 },
  { id: 4, category: 'Бензин', date: '09 апр 2026', payer: 'Партнёр Б', amount: -6500 },
  { id: 5, category: 'Коммунальные', date: '08 апр 2026', payer: 'Партнёр А', amount: -15000 },
  { id: 6, category: 'Развлечения', date: '07 апр 2026', payer: 'Партнёр Б', amount: -4200 },
  { id: 7, category: 'Зарплата', date: '05 апр 2026', payer: 'Партнёр Б', amount: 100000 },
  { id: 8, category: 'Продукты', date: '04 апр 2026', payer: 'Партнёр А', amount: -18500 },
  { id: 9, category: 'Транспорт', date: '03 апр 2026', payer: 'Партнёр Б', amount: -2800 },
  { id: 10, category: 'Ипотека', date: '01 апр 2026', payer: 'Партнёр А', amount: -30000 }
]

export const mockTransactionsSummary: TransactionsSummary = {
  income: 200000,
  expense: 100000,
  balance: 100000,
  balanceChangePercent: 10.5,
  period: 'апрель'
}

export const mockAnalyticsKpi: KpiItem[] = [
  { id: 'avg', label: 'Средние расходы', value: '200 000₽', hint: 'в месяц' },
  { id: 'top', label: 'Самая большая категория', value: 'Ипотека', hint: '30 000₽' },
  { id: 'bal', label: 'Остаток', value: '100 000₽', hint: 'доступная сумма' },
  { id: 'goals', label: 'Цели достигнуто', value: '2 из 5', hint: '40%' }
]

export const mockMonthlyTrend: MonthlyPoint[] = [
  { month: 'Янв', value: 180000 },
  { month: 'Фев', value: 210000 },
  { month: 'Март', value: 195000 },
  { month: 'Апр', value: 230000 },
  { month: 'Май', value: 175000 },
  { month: 'Июнь', value: 200000 },
  { month: 'Июль', value: 220000 },
  { month: 'Авг', value: 205000 },
  { month: 'Сент', value: 240000 },
  { month: 'Окт', value: 215000 },
  { month: 'Нояб', value: 180000 },
  { month: 'Дек', value: 250000 }
]

export const mockCategories: CategorySlice[] = [
  { name: 'Ипотека', value: 420000, color: '#6366f1' },
  { name: 'Продукты', value: 180000, color: '#8b5cf6' },
  { name: 'Авто', value: 240000, color: '#a78bfa' },
  { name: 'Развлечения', value: 90000, color: '#c4b5fd' },
  { name: 'Коммунальные', value: 60000, color: '#ddd6fe' },
  { name: 'Другое', value: 30000, color: '#ede9fe' }
]

export const mockPartnerCompare: PartnerComparePoint[] = [
  { month: 'Дек', a: 95000, b: 85000 },
  { month: 'Янв', a: 120000, b: 100000 },
  { month: 'Фев', a: 110000, b: 92000 },
  { month: 'Март', a: 85000, b: 70000 },
  { month: 'Апр', a: 120000, b: 80000 }
]

export const mockInsights: Insight[] = [
  {
    id: 1,
    title: 'Тренд месяца',
    text: 'Расходы на развлечения выросли на 23% по сравнению с прошлым месяцем'
  },
  {
    id: 2,
    title: 'Возможность экономии',
    text: 'Оптимизация расходов на транспорт может сэкономить до 15 000₽ в месяц'
  }
]

export const mockGoals: Goal[] = [
  {
    id: 1,
    title: 'Новый дом 2026',
    deadline: 'Декабрь 2026',
    percent: 28,
    collected: 850000,
    target: 3000000,
    monthly: 150000,
    remaining: 2150000,
    isMain: true
  },
  {
    id: 2,
    title: 'Отпуск в Италии',
    deadline: 'Июль 2026',
    percent: 77,
    collected: 385000,
    target: 500000,
    monthly: 40000,
    remaining: 115000,
    isMain: false
  },
  {
    id: 3,
    title: 'Новый автомобиль',
    deadline: 'Март 2027',
    percent: 38,
    collected: 950000,
    target: 2500000,
    monthly: 120000,
    remaining: 1550000,
    isMain: false
  },
  {
    id: 4,
    title: 'Образование',
    deadline: 'Сент 2026',
    percent: 40,
    collected: 320000,
    target: 800000,
    monthly: 60000,
    remaining: 480000,
    isMain: false
  },
  {
    id: 5,
    title: 'Ремонт квартиры',
    deadline: 'Дек 2026',
    percent: 40,
    collected: 480000,
    target: 1200000,
    monthly: 80000,
    remaining: 720000,
    isMain: false
  }
]

export const mockGoalTips: GoalTip[] = [
  { id: 1, title: 'Автоматизация', text: 'Настройте автоматический перевод части зарплаты на цели' },
  { id: 2, title: 'Оптимизация', text: 'Сократите расходы на развлечения на 15% для быстрого достижения целей' },
  { id: 3, title: 'Инвестиции', text: 'Рассмотрите вклады с доходностью 8-10% годовых' }
]

export const mockSettings: AppSettings = {
  profiles: {
    a: { email: 'partner@finpair.ru', income: 200000 },
    b: { email: 'partner-b@finpair.ru', income: 150000 }
  },
  splitType: 'by-income',
  splitNote: 'На основе доходов: Партнёр А — 60%, Партнёр Б — 40%',
  inviteCode: 'FINPAIR-ABC123',
  currency: 'RUB',
  notifications: {
    newTransactions: true,
    goalsProgress: true,
    monthlyReports: false
  }
}

export const mockFaq: FaqItem[] = [
  {
    id: 1,
    question: 'Как добавить партнёра в FinPair?',
    answer:
      'Перейдите в Настройки, скопируйте код приглашения и передайте его партнёру. После ввода кода аккаунты будут связаны.'
  },
  {
    id: 2,
    question: 'Как изменить способ деления расходов?',
    answer:
      'В Настройках выберите один из трёх вариантов: 50/50, По доходу или Индивидуально — и сохраните изменения.'
  },
  {
    id: 3,
    question: 'Можно ли установить цель совместно с партнёром?',
    answer:
      'Да. При создании цели включите переключатель «Общая цель» — оба партнёра смогут пополнять её и видеть прогресс.'
  },
  {
    id: 4,
    question: 'Как работает умный баланс?',
    answer:
      'Система анализирует ваши доходы и расходы и предлагает рекомендации для оптимизации совместного бюджета.'
  },
  {
    id: 5,
    question: 'Безопасны ли мои финансовые данные?',
    answer:
      'Все данные шифруются при передаче и хранении. Мы не передаём ваши данные третьим лицам.'
  },
  {
    id: 6,
    question: 'Можно ли экспортировать данные?',
    answer:
      'Да, экспорт в CSV и PDF доступен на страницах «Транзакции» и «Аналитика».'
  }
]

export const mockContacts: Contacts = {
  email: 'support@finpair.ru',
  hours: 'Пн-Пт: 9:00 - 21:00 МСК',
  telegram: '@finpair_support'
}

export const formatMoney = (value: number): string => {
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('ru-RU').format(abs)
  return `${sign}${formatted}₽`
}

export const formatMoneyPlain = (value: number): string => {
  return `${new Intl.NumberFormat('ru-RU').format(Math.abs(value))}₽`
}
