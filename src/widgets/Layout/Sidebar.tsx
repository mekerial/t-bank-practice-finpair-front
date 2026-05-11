import { NavLink } from 'react-router-dom'
import { logout, logoutUser, useAppDispatch, useAppSelector } from '../../app/store'
import { NAV_ITEMS, ROUTES } from '../../shared/config/routes'
import { APP_NAME } from '../../shared/constants/app'

function initials(name: string) {
  return name
    .split(/[\s@]/)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function displayUserName(name?: string, displayName?: string, email?: string) {
  const resolved = name?.trim() || displayName?.trim()
  if (resolved) return resolved
  if (!email) return 'Пользователь'
  const local = email.split('@')[0] ?? email
  return local
}

type SidebarProps = {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const userName = displayUserName(user?.name, user?.displayName, user?.email)

  const handleLogout = () => {
    onNavigate?.()
    dispatch(logoutUser())
      .unwrap()
      .catch(() => {})
      .finally(() => dispatch(logout()))
  }

  return (
    <aside
      id="app-sidebar"
      className={'sidebar' + (user ? '' : ' sidebar--guest')}
      aria-label="Основная навигация"
    >
      <div className="sidebar__top">
        <div className="sidebar__brand">{APP_NAME}</div>
        <div className="sidebar__subtitle">Финансы вдвоём</div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
              }
            >
              <Icon className="sidebar__icon" />
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar__user">
        {user ? (
          <>
            <NavLink
              to={ROUTES.PROFILE}
              className="sidebar__user-link"
              onClick={() => onNavigate?.()}
            >
              <div className="sidebar__avatar">{initials(userName)}</div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name" title={userName}>
                  {userName}
                </div>
                <div className="sidebar__user-email" title={user.email}>
                  {user.email}
                </div>
              </div>
            </NavLink>
            <button
              type="button"
              className="sidebar__logout"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </>
        ) : (
          <div className="sidebar__guest">
            <p className="sidebar__guest-hint">
              Войдите, чтобы увидеть суммы, графики и сохранять изменения.
            </p>
            <NavLink
              to={ROUTES.LOGIN}
              className="sidebar__guest-btn"
              onClick={() => onNavigate?.()}
            >
              Войти
            </NavLink>
            <NavLink
              to={ROUTES.REGISTER}
              className="sidebar__guest-btn sidebar__guest-btn--secondary"
              onClick={() => onNavigate?.()}
            >
              Регистрация
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  )
}
