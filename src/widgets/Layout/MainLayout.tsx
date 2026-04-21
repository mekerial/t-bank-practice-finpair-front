import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__content">
        <Header />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
