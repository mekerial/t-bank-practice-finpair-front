import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS, ROUTES } from '../../shared/config/routes'
import '../../shared/ui/Button/Button.css'
import './guest-main.css'

function sectionLabel(pathname: string): string {
  const item = NAV_ITEMS.find((n) =>
    n.path === '/' ? pathname === '/' : pathname === n.path
  )
  return item?.label ?? 'Раздел'
}

const FEATURES = [
  {
    title: 'Общий бюджет',
    text: 'Доходы, расходы и цели в одном месте — без таблиц и переписки в мессенджере.'
  },
  {
    title: 'Справедливое распределение',
    text: 'Деление по доходу, 50/50 или свои правила — наглядно видно, кто и сколько вносит.'
  },
  {
    title: 'Цели на двоих',
    text: 'Отпуск, ремонт, подушка безопасности — прогресс и напоминания для обоих партнёров.'
  }
] as const

export default function GuestMainPlaceholder() {
  const { pathname } = useLocation()
  const sectionTitle = sectionLabel(pathname)

  return (
    <div className="guest-welcome">
      <div className="guest-welcome__hero">
        <div className="guest-welcome__hero-inner">
          <span className="guest-welcome__badge">FinPair</span>
          <h1 className="guest-welcome__headline">{sectionTitle}</h1>
          <p className="guest-welcome__lead">
            Здесь отображаются все финансовые разделы вашего профиля: нагрузка,
            транзакции, аналитика, цели и персональные настройки. Войдите в
            аккаунт или создайте новый, чтобы открыть полный доступ.
          </p>
          <div className="guest-welcome__metrics" aria-label="Ключевые возможности">
            <span className="guest-welcome__metric">Обновление в реальном времени</span>
            <span className="guest-welcome__metric">Совместный доступ</span>
            <span className="guest-welcome__metric">Персональные рекомендации</span>
          </div>
          <div className="guest-welcome__hero-actions">
            <Link
              to={ROUTES.LOGIN}
              className="btn btn--primary guest-welcome__btn guest-welcome__btn--lg"
            >
              Войти
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="btn btn--secondary guest-welcome__btn guest-welcome__btn--lg"
            >
              Создать аккаунт
            </Link>
          </div>
        </div>
        <div className="guest-welcome__hero-visual" aria-hidden="true">
          <div className="guest-welcome__orbit" />
          <div className="guest-welcome__orbit guest-welcome__orbit--2" />
        </div>
      </div>

      <ul className="guest-welcome__features">
        {FEATURES.map((f) => (
          <li key={f.title} className="guest-welcome__feature">
            <h2 className="guest-welcome__feature-title">{f.title}</h2>
            <p className="guest-welcome__feature-text">{f.text}</p>
          </li>
        ))}
      </ul>

      <div className="guest-welcome__footnote">
        <p>
          После входа вы увидите раздел «{sectionTitle}» с полным содержимым.
          Навигация слева доступна сразу — так удобнее ориентироваться в сервисе.
        </p>
      </div>
    </div>
  )
}
