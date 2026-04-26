import type { ComponentType } from 'react'
import {
  IconLoad,
  IconTransactions,
  IconAnalytics,
  IconGoals,
  IconSettings,
  IconHelp,
  type IconProps
} from '../ui/icons'

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  TRANSACTIONS: '/transactions',
  ANALYTICS: '/analytics',
  GOALS: '/goals',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  NOT_FOUND: '*'
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export interface NavItem {
  path: string
  label: string
  icon: ComponentType<IconProps>
}

export const NAV_ITEMS: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: 'Финансовая нагрузка', icon: IconLoad },
  { path: ROUTES.TRANSACTIONS, label: 'Транзакции', icon: IconTransactions },
  { path: ROUTES.ANALYTICS, label: 'Аналитика', icon: IconAnalytics },
  { path: ROUTES.GOALS, label: 'Цели', icon: IconGoals },
  { path: ROUTES.SETTINGS, label: 'Настройки', icon: IconSettings },
  { path: ROUTES.SUPPORT, label: 'Помощь', icon: IconHelp },
  { path: ROUTES.LOGIN, label: 'Вход', icon: IconHelp }, // для тестирования валидации 
  { path: ROUTES.REGISTER, label: 'Регистрация', icon: IconHelp } // для тестирования валидации
]
