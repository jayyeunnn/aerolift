import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useOfflineStore } from '../../stores/offlineStore'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

/**
 * Main profile view - native-app style hub with avatar, name, and navigation buttons
 */
export default function ProfileMainView({ onNavigate, onLogout }) {
  const { user, profile } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { isOnline, pendingCount, syncNow, isSyncing } = useOfflineStore()

  const displayName = profile?.display_name || 'User'
  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=27272a`

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      {/* Hero Avatar Section */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="relative mb-5">
          {/* Glow ring behind avatar */}
          <div className="absolute -inset-2 rounded-full bg-brand/10 blur-xl animate-pulse" />
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden border-[3px] border-brand/30 shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(195, 244, 0, 0.15)' }}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          {displayName}
        </h1>
        <p className="text-surface-500 text-sm">{user?.email}</p>
      </div>

      {/* Action Buttons */}
      <GlassCard className="w-full flex flex-col gap-3" padding="p-4">
        {/* Edit Profil */}
        <button
          id="profile-nav-edit"
          onClick={() => onNavigate('edit')}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-brand" style={{ fontSize: '22px' }}>
              edit
            </span>
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-white font-semibold text-[15px]">Edit Profil</span>
            <span className="text-surface-500 text-xs">
              Ubah nama, avatar, dan kata sandi
            </span>
          </div>
          <span className="material-symbols-rounded text-surface-600 group-hover:text-surface-400 transition-colors" style={{ fontSize: '20px' }}>
            chevron_right
          </span>
        </button>

        {/* Tentang Aplikasi */}
        <button
          id="profile-nav-about"
          onClick={() => onNavigate('about')}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-brand" style={{ fontSize: '22px' }}>
              info
            </span>
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-white font-semibold text-[15px]">Tentang Aplikasi</span>
            <span className="text-surface-500 text-xs">
              Versi, teknologi, dan informasi lainnya
            </span>
          </div>
          <span className="material-symbols-rounded text-surface-600 group-hover:text-surface-400 transition-colors" style={{ fontSize: '20px' }}>
            chevron_right
          </span>
        </button>
      </GlassCard>

      {/* Quick Settings */}
      <GlassCard className="w-full flex flex-col gap-3" padding="p-4">
        {/* Theme toggle */}
        <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded text-surface-400" style={{ fontSize: '20px' }}>
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-sm text-surface-300 font-medium">Mode Gelap</span>
          </div>
          <button
            id="profile-theme-toggle"
            onClick={toggleTheme}
            className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
              isDark ? 'bg-brand' : 'bg-surface-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform duration-300 ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Online status */}
        <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className={`material-symbols-rounded ${isOnline ? 'text-brand' : 'text-amber-500'}`} style={{ fontSize: '20px' }}>
              {isOnline ? 'cloud_done' : 'cloud_off'}
            </span>
            <span className="text-sm text-surface-300 font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {pendingCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={syncNow}
              loading={isSyncing}
              icon="sync"
              disabled={!isOnline}
            >
              Sinkronkan ({pendingCount})
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Logout button */}
      <Button
        variant="danger"
        fullWidth
        onClick={onLogout}
        icon="logout"
        className="mb-4"
        id="profile-logout"
      >
        Keluar dari Akun
      </Button>
    </div>
  )
}
