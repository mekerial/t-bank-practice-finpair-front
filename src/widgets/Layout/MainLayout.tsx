import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../app/store'
import GuestMainPlaceholder from './GuestMainPlaceholder'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

export default function MainLayout() {
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  const closeNav = useCallback(() => setNavOpen(false), [])
  const toggleNav = useCallback(() => setNavOpen((o) => !o), [])

  useEffect(() => {
    closeNav()
  }, [location.pathname, closeNav])

  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNav()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen, closeNav])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) closeNav()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [closeNav])

  useEffect(() => {
    if (navOpen) document.body.classList.add('layout-nav-open')
    else document.body.classList.remove('layout-nav-open')
    return () => document.body.classList.remove('layout-nav-open')
  }, [navOpen])

  return (
    <div
      className={
        'main-layout' + (navOpen ? ' main-layout--nav-open' : '')
      }
    >
      <Sidebar onNavigate={closeNav} />
      <button
        type="button"
        className="main-layout__backdrop"
        aria-label="Закрыть меню навигации"
        tabIndex={navOpen ? 0 : -1}
        onClick={closeNav}
      />
      <div className="main-layout__content">
        <Header navOpen={navOpen} onToggleNav={toggleNav} />
        <main className="main-layout__main">
          {user ? <Outlet /> : <GuestMainPlaceholder />}
        </main>
      </div>
    </div>
  )
}
