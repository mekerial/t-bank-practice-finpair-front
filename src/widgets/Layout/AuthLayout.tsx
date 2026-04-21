import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../../shared/constants/app'
import './layout.css'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__inner">
        <div className="auth-layout__brand">
          <div className="auth-layout__brand-title">{APP_NAME}</div>
          <div className="auth-layout__brand-subtitle">Финансы вдвоём</div>
        </div>
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
