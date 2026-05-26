import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function AppShell() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {!isAuthPage && <Header />}

      <main
        className={`flex-1 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-6 ${
          isAuthPage ? '' : 'pb-nav mt-2'
        }`}
      >
        <div key={location.pathname} className="page-enter flex flex-col gap-6">
          <Outlet />
        </div>
      </main>

      {!isAuthPage && <BottomNav />}
    </div>
  )
}
