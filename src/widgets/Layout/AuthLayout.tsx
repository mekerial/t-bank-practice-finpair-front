import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../../shared/constants/app'
import ThemeToggle from '../../shared/ui/ThemeToggle/ThemeToggle'
import './layout.css'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <ThemeToggle mode="floating" className="auth-layout__theme" />
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
