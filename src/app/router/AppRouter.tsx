import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '../../shared/config/routes'
import MainLayout from '../../widgets/Layout/MainLayout'
import AuthLayout from '../../widgets/Layout/AuthLayout'
import AuthGuard from './AuthGuard'
import LoginPage from '../../pages/auth/LoginPage'
import RegisterPage from '../../pages/auth/RegisterPage'
import DashboardPage from '../../pages/dashboard/DashboardPage'
import TransactionsPage from '../../pages/transactions/TransactionsPage'
import AnalyticsPage from '../../pages/analytics/AnalyticsPage'
import GoalsPage from '../../pages/goals/GoalsPage'
import SettingsPage from '../../pages/settings/SettingsPage'
import SupportPage from '../../pages/support/SupportPage'
import NotFoundPage from '../../pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.GOALS} element={<GoalsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
