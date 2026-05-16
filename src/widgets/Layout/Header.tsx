import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ThemeToggle from '../../shared/ui/ThemeToggle/ThemeToggle'
import { IconChevronDown, IconClose, IconMenu } from '../../shared/ui/icons'

type HeaderProps = {
  navOpen: boolean
  onToggleNav: () => void
}

export default function Header({ navOpen, onToggleNav }: HeaderProps) {
  const location = useLocation()
  const [introExpanded, setIntroExpanded] = useState(false)

  useEffect(() => {
    setIntroExpanded(false)
  }, [location.pathname])

  const toggleIntro = () => setIntroExpanded((open) => !open)

  return (
    <header
      className={
        'header' + (introExpanded ? ' header--intro-expanded' : ' header--intro-collapsed')
      }
    >
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
        <button
          type="button"
          className="header__intro-toggle"
          onClick={toggleIntro}
          aria-expanded={introExpanded}
          aria-controls="header-intro-body"
          aria-label={
            introExpanded
              ? 'Свернуть приветствие'
              : 'Развернуть: Добро пожаловать в FinPair'
          }
        >
          <span className="header__title-wrap">
            <span className="header__title header__title--short" aria-hidden={introExpanded}>
              FinPair
            </span>
            <span
              className="header__title header__title--full"
              aria-hidden={!introExpanded}
            >
              Добро пожаловать в FinPair
            </span>
          </span>
          <IconChevronDown
            className={
              'header__intro-chevron' +
              (introExpanded ? ' header__intro-chevron--up' : '')
            }
            width={20}
            height={20}
            aria-hidden
          />
        </button>
        <div id="header-intro-body" className="header__intro-body">
          <p className="header__subtitle">
            Управляйте финансами вместе легко и прозрачно
          </p>
        </div>
      </div>
      <ThemeToggle mode="header" className="header__theme" />
    </header>
  )
}
