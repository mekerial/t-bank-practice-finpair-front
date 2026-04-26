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
  id: 'u-aleksey',
  name: 'Алексей Морозов',
  email: 'aleksey.morozov@yandex.ru',
  role: 'A',
  income: 185000,
  subtitle: 'Совладелец счёта'
}

export const mockPartner: User = {
  id: 'u-maria',
  name: 'Мария Волкова',
  email: 'maria.volkova@yandex.ru',
  role: 'B',
  income: 142000,
  subtitle: 'Совладелец счёта'
}

/** Сводка за текущий месяц: доходы обоих, фактические расходы, остаток */
export const mockFinancialLoad: FinancialLoad = {
  totalIncome: 327000,
  totalExpense: 181400,
  balance: 145600,
  loadPercent: 55.5,
  partnerSplit: { a: 57, b: 43 }
}

export const mockRecommendations: Recommendation[] = [
  {
    id: 1,
    text: 'Доля расходов Марии по «Авто» выше среднего: можно перенести часть платежей на общий бюджет или скорректировать цель «Новый автомобиль».'
  },
  {
    id: 2,
    text: 'Остаток после обязательных платежей позволяет увеличить взнос по цели «Ремонт квартиры» на 12 000 ₽ без риска для подушки.'
  },
  {
    id: 3,
    text: 'Расходы на продукты стабильны; включите напоминание по чекам — так проще ловить сезонные всплески.'
  }
]

export const mockMainExpenses: MainExpense[] = [
  {
    id: 1,
    category: 'Ипотека и ЖКХ',
    amount: 56800,
    payer: 'Общий',
    share: 100,
    fromBudget: 145600
  },
  {
    id: 2,
    category: 'Продукты и быт',
    amount: 48600,
    payer: 'Общий',
    share: 100,
    fromBudget: 88800
  },
  {
    id: 3,
    category: 'Детский сад и кружки',
    amount: 22400,
    payer: 'Б',
    share: 65,
    fromBudget: 40200
  },
  {
    id: 4,
    category: 'Авто: кредит, топливо, страховка',
    amount: 31200,
    payer: 'Б',
    share: 90,
    fromBudget: 17800
  },
  {
    id: 5,
    category: 'Подписки, связь, спорт',
    amount: 14200,
    payer: 'А',
    share: 55,
    fromBudget: 3600
  },
  {
    id: 6,
    category: 'Прочее и развлечения',
    amount: 8200,
    payer: 'А',
    share: 50,
    fromBudget: -4600
  }
]

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    category: 'Зарплата',
    date: '10 апр 2026',
    payer: 'Партнёр А',
    amount: 185000
  },
  {
    id: 2,
    category: 'Зарплата',
    date: '8 апр 2026',
    payer: 'Партнёр Б',
    amount: 142000
  },
  {
    id: 3,
    category: 'Ипотека',
    date: '5 апр 2026',
    payer: 'Партнёр А',
    amount: -45200
  },
  {
    id: 4,
    category: 'Продукты',
    date: '12 апр 2026',
    payer: 'Партнёр А',
    amount: -16800
  },
  {
    id: 5,
    category: 'Продукты',
    date: '9 апр 2026',
    payer: 'Партнёр Б',
    amount: -14200
  },
  {
    id: 6,
    category: 'Детский сад',
    date: '7 апр 2026',
    payer: 'Партнёр Б',
    amount: -18900
  },
  {
    id: 7,
    category: 'Коммунальные платежи',
    date: '6 апр 2026',
    payer: 'Партнёр Б',
    amount: -11600
  },
  {
    id: 8,
    category: 'Авто: страховка',
    date: '4 апр 2026',
    payer: 'Партнёр Б',
    amount: -8400
  },
  {
    id: 9,
    category: 'Бензин',
    date: '4 апр 2026',
    payer: 'Партнёр Б',
    amount: -5200
  },
  {
    id: 10,
    category: 'Ресторан',
    date: '3 апр 2026',
    payer: 'Партнёр Б',
    amount: -7600
  },
  {
    id: 11,
    category: 'Спортзал',
    date: '2 апр 2026',
    payer: 'Партнёр А',
    amount: -4500
  },
  {
    id: 12,
    category: 'Аптека и здоровье',
    date: '1 апр 2026',
    payer: 'Партнёр А',
    amount: -6200
  },
  {
    id: 13,
    category: 'Подписки и связь',
    date: '1 апр 2026',
    payer: 'Партнёр А',
    amount: -2190
  },
  {
    id: 14,
    category: 'Перевод на накопления',
    date: '30 мар 2026',
    payer: 'Партнёр А',
    amount: -35000
  },
  {
    id: 15,
    category: 'Кино и досуг',
    date: '29 мар 2026',
    payer: 'Партнёр А',
    amount: -2800
  }
]

export const mockTransactionsSummary: TransactionsSummary = {
  income: 327000,
  expense: 181400,
  balance: 145600,
  balanceChangePercent: 4.2,
  period: 'апрель 2026'
}

export const mockAnalyticsKpi: KpiItem[] = [
  {
    id: 'avg',
    label: 'Расходы за месяц',
    value: '181 400₽',
    hint: 'по всем категориям, апрель'
  },
  {
    id: 'top',
    label: 'Крупнейшая статья',
    value: 'Жильё',
    hint: 'ипотека и ЖКХ ≈ 45 200 ₽'
  },
  {
    id: 'bal',
    label: 'Свободный остаток',
    value: '145 600₽',
    hint: 'после обязательных платежей'
  },
  {
    id: 'goals',
    label: 'Прогресс по целям',
    value: '34%',
    hint: 'средневзвешенно по активным целям'
  }
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
  { name: 'Жильё и ЖКХ', value: 56800, color: '#6366f1' },
  { name: 'Продукты и быт', value: 48600, color: '#8b5cf6' },
  { name: 'Дети и образование', value: 22400, color: '#a78bfa' },
  { name: 'Автомобиль', value: 31200, color: '#c4b5fd' },
  { name: 'Здоровье и спорт', value: 10700, color: '#ddd6fe' },
  { name: 'Остальное', value: 11700, color: '#ede9fe' }
]

export const mockPartnerCompare: PartnerComparePoint[] = [
  { month: 'Дек', a: 108000, b: 82000 },
  { month: 'Янв', a: 112000, b: 91000 },
  { month: 'Фев', a: 105000, b: 88000 },
  { month: 'Март', a: 118000, b: 94000 },
  { month: 'Апр', a: 121000, b: 96000 }
]

export const mockInsights: Insight[] = [
  {
    id: 1,
    title: 'Расходы по неделям',
    text: 'Вторая половина апреля плотнее по мелким тратам: чаще всего продукты и транспорт. Имеет смысл заранее заложить недельный лимит.'
  },
  {
    id: 2,
    title: 'Баланс вкладов',
    text: 'По доле фактических трат ближе к доходу обоих партнёров распределение 57/43 — совпадает с выбранной схемой «по доходу».'
  },
  {
    id: 3,
    title: 'Цели',
    text: 'Три цели идут в графике: по «Отпуск в Италии» осталось меньше четырёх взносов при текущем темпе.'
  }
]

export const mockGoals: Goal[] = [
  {
    id: 1,
    title: 'Первый взнос за квартиру',
    deadline: 'декабрь 2027',
    percent: 31,
    collected: 930000,
    target: 3000000,
    monthly: 88000,
    remaining: 2070000,
    isMain: true
  },
  {
    id: 2,
    title: 'Отпуск в Италии',
    deadline: 'июль 2026',
    percent: 78,
    collected: 390000,
    target: 500000,
    monthly: 38000,
    remaining: 110000,
    isMain: false
  },
  {
    id: 3,
    title: 'Семейный автомобиль',
    deadline: 'март 2027',
    percent: 41,
    collected: 1020000,
    target: 2500000,
    monthly: 115000,
    remaining: 1480000,
    isMain: false
  },
  {
    id: 4,
    title: 'Обучение ребёнка',
    deadline: 'сентябрь 2026',
    percent: 44,
    collected: 352000,
    target: 800000,
    monthly: 52000,
    remaining: 448000,
    isMain: false
  },
  {
    id: 5,
    title: 'Ремонт гостиной',
    deadline: 'ноябрь 2026',
    percent: 52,
    collected: 624000,
    target: 1200000,
    monthly: 72000,
    remaining: 576000,
    isMain: false
  }
]

export const mockGoalTips: GoalTip[] = [
  {
    id: 1,
    title: 'Автоплатежи',
    text: 'Привяжите дату перевода на цели к дню зарплаты — меньше соблазнов потратить раньше.'
  },
  {
    id: 2,
    title: 'Приоритет',
    text: 'Две цели с близким дедлайном: разведите взносы по неделям, чтобы не перегружать один месяц.'
  },
  {
    id: 3,
    title: 'Резерв',
    text: 'Держите на отдельном счёте подушку 3–6 месяцев расходов — цели не пострадают при форс-мажоре.'
  }
]

export const mockSettings: AppSettings = {
  profiles: {
    a: { email: 'aleksey.morozov@yandex.ru', income: 185000 },
    b: { email: 'maria.volkova@yandex.ru', income: 142000 }
  },
  splitType: 'by-income',
  splitNote:
    'По доходам: Алексей — 57%, Мария — 43%. Можно переключить на 50/50 или задать доли вручную.',
  inviteCode: 'FP-7K2M-Q9L4',
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
