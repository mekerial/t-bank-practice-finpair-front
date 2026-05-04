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

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const displayName = user?.displayName ?? user?.email ?? ''

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .catch(() => {})
      .finally(() => dispatch(logout()))
  }

  return (
    <aside className={'sidebar' + (user ? '' : ' sidebar--guest')}>
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
            <div className="sidebar__avatar">{initials(displayName)}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{displayName}</div>
              <div className="sidebar__user-email">{user.email}</div>
              <button
                type="button"
                className="sidebar__logout"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </div>
          </>
        ) : (
          <div className="sidebar__guest">
            <p className="sidebar__guest-hint">
              Войдите, чтобы увидеть суммы, графики и сохранять изменения.
            </p>
            <NavLink to={ROUTES.LOGIN} className="sidebar__guest-btn">
              Войти
            </NavLink>
            <NavLink
              to={ROUTES.REGISTER}
              className="sidebar__guest-btn sidebar__guest-btn--secondary"
            >
              Регистрация
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  )
}
