import { useTheme } from '../../../app/providers/ThemeProvider'
import { IconMoon, IconSun } from '../icons'
import './ThemeToggle.css'

export type ThemeToggleMode = 'header' | 'floating'

interface ThemeToggleProps {
  className?: string
  /** `header` — правый верх блока с приветствием; `floating` — угол экрана (вход, 404). */
  mode?: ThemeToggleMode
}

export default function ThemeToggle({
  className = '',
  mode = 'floating'
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const track = (
    <button
      type="button"
      className="theme-track"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark
          ? 'Включена тёмная тема. Нажмите, чтобы переключить на светлую'
          : 'Включена светлая тема. Нажмите, чтобы переключить на тёмную'
      }
      onClick={toggleTheme}
    >
      <span className="theme-track__icons" aria-hidden>
        <IconSun width={10} height={10} className="theme-track__sun" />
        <IconMoon width={10} height={10} className="theme-track__moon" />
      </span>
      <span className="theme-track__knob" aria-hidden />
    </button>
  )

  if (mode === 'header') {
    return (
      <div className={`theme-panel theme-panel--header ${className}`.trim()}>
        <span className="theme-panel__header-meta" aria-hidden>
          <span className="theme-panel__header-label">Тема</span>
          <span className="theme-panel__header-status">
            {isDark ? 'Тёмная' : 'Светлая'}
          </span>
        </span>
        {track}
      </div>
    )
  }

  return (
    <div className={`theme-panel theme-panel--floating ${className}`.trim()}>
      <span className="theme-panel__floating-label">Тема</span>
      {track}
      <span className="theme-panel__floating-status">
        {isDark ? 'Тёмная' : 'Светлая'}
      </span>
    </div>
  )
}
