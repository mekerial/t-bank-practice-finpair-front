import { Link } from 'react-router-dom'
import { ROUTES } from '../shared/config/routes'
import ThemeToggle from '../shared/ui/ThemeToggle/ThemeToggle'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <ThemeToggle mode="floating" className="not-found__theme" />
      <div className="not-found__inner">
        <h1 className="not-found__code">404</h1>
        <p className="not-found__text">Страница не найдена</p>
        <Link to={ROUTES.DASHBOARD}>На главную</Link>
      </div>
    </div>
  )
}
