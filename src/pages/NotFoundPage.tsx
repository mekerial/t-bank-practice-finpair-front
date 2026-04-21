import { Link } from 'react-router-dom'
import { ROUTES } from '../shared/config/routes'

export default function NotFoundPage() {
  return (
    <div style={{ padding: '64px 32px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Страница не найдена</p>
      <Link to={ROUTES.DASHBOARD}>На главную</Link>
    </div>
  )
}
