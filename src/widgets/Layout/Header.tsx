import ThemeToggle from '../../shared/ui/ThemeToggle/ThemeToggle'
import { IconClose, IconMenu } from '../../shared/ui/icons'

type HeaderProps = {
  navOpen: boolean
  onToggleNav: () => void
}

export default function Header({ navOpen, onToggleNav }: HeaderProps) {
  return (
    <header className="header">
      <button
        type="button"
        className="header__nav-toggle"
        onClick={onToggleNav}
        aria-expanded={navOpen}
        aria-controls="app-sidebar"
      >
        {navOpen ? <IconClose width={22} height={22} /> : <IconMenu width={22} height={22} />}
        <span className="header__nav-toggle-label">
          {navOpen ? 'Закрыть меню' : 'Открыть меню'}
        </span>
      </button>
      <div className="header__intro">
        <h1 className="header__title">Добро пожаловать в FinPair</h1>
        <p className="header__subtitle">
          Управляйте финансами вместе легко и прозрачно
        </p>
      </div>
      <ThemeToggle mode="header" className="header__theme" />
    </header>
  )
}
