import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/running', icon: 'directions_run', label: 'Lari' },
  { to: '/gym', icon: 'fitness_center', label: 'Gym' },
  { to: '/profile', icon: 'person', label: 'Profil' },
]

export default function BottomNav() {
  const location = useLocation()

  // Hide nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-surface-900/90 dark:bg-surface-900/90 light:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-[32px] shadow-2xl" />

      <div className="relative flex justify-around items-center h-16 px-2">
        {/* Home */}
        <NavItem item={navItems[0]} isActive={location.pathname === '/'} />

        {/* Running */}
        <NavItem item={navItems[1]} isActive={location.pathname === '/running'} />

        {/* Central FAB */}
        <div className="relative -top-6">
          <NavLink
            to="/add"
            id="fab-add-entry"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-brand text-black shadow-[0_10px_30px_rgba(195,244,0,0.4)] border-[6px] border-surface-950 dark:border-surface-950 hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '32px', fontWeight: 700 }}>
              add
            </span>
          </NavLink>
        </div>

        {/* Gym */}
        <NavItem item={navItems[2]} isActive={location.pathname === '/gym'} />

        {/* Profile */}
        <NavItem item={navItems[3]} isActive={location.pathname === '/profile'} />
      </div>
    </nav>
  )
}

function NavItem({ item, isActive }) {
  return (
    <NavLink
      to={item.to}
      id={`nav-${item.label.toLowerCase()}`}
      className={`flex flex-col items-center justify-center w-12 h-12 transition-colors ${
        isActive
          ? 'text-brand'
          : 'text-surface-500 hover:text-surface-300'
      }`}
    >
      <span
        className={`material-symbols-rounded ${isActive ? '' : 'icon-outlined'}`}
        style={{ fontSize: '24px' }}
      >
        {item.icon}
      </span>
      {isActive && (
        <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
      )}
    </NavLink>
  )
}
