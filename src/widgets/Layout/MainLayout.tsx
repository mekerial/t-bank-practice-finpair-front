import { Outlet } from 'react-router-dom'
import { useAppSelector } from '../../app/store'
import GuestMainPlaceholder from './GuestMainPlaceholder'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

export default function MainLayout() {
  const user = useAppSelector((s) => s.auth.user)

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__content">
        <Header />
        <main className="main-layout__main">
          {user ? <Outlet /> : <GuestMainPlaceholder />}
        </main>
      </div>
    </div>
  )
}
