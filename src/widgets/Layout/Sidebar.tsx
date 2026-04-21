import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../shared/config/routes'
import { APP_NAME } from '../../shared/constants/app'
import { mockUser } from '../../shared/lib/mocks'

export default function Sidebar() {
  return (
    <aside className="sidebar">
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
        <div className="sidebar__avatar">
          {mockUser.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{mockUser.name}</div>
          <div className="sidebar__user-email">{mockUser.email}</div>
        </div>
      </div>
    </aside>
  )
}
