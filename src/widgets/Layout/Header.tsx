import ThemeToggle from '../../shared/ui/ThemeToggle/ThemeToggle'

export default function Header() {
  return (
    <header className="header">
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
