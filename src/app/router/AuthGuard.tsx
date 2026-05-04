import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store'
import { ROUTES } from '../../shared/config/routes'

export default function AuthGuard() {
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus)
  const user = useAppSelector((s) => s.auth.user)

  if (restoreStatus === 'loading' || restoreStatus === 'idle') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: 14,
          color: 'var(--color-text-muted)'
        }}
      >
        Загрузка…
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
