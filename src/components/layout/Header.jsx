import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useOfflineStore } from '../../stores/offlineStore'

export default function Header() {
  const { profile, user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { isOnline, pendingCount } = useOfflineStore()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'AeroLift'
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=27272a`

  return (
    <header className="flex justify-between items-center px-6 pt-8 pb-4 animate-slide-down">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/20 flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Profil"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-surface-400 text-xs font-medium">
            Selamat datang kembali,
          </span>
          <span className="font-bold text-lg text-white dark:text-white tracking-tight">
            {displayName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-fade-in" title="Mode Offline">
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>cloud_off</span>
          </div>
        )}

        {/* Pending sync badge */}
        {pendingCount > 0 && isOnline && (
          <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand animate-fade-in relative" title={`${pendingCount} menunggu sinkronisasi`}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>sync</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle"
          className="w-10 h-10 rounded-full bg-surface-900 dark:bg-surface-900 border border-white/5 flex items-center justify-center text-surface-400 hover:text-white transition"
          aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        >
          <span className="material-symbols-rounded">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </header>
  )
}
