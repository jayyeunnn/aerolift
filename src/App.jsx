import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useOfflineStore } from './stores/offlineStore'
import { ToastProvider } from './components/ui/Toast'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import RunningPage from './pages/RunningPage'
import GymPage from './pages/GymPage'
import NutritionPage from './pages/NutritionPage'
import ProfilePage from './pages/ProfilePage'
import AddEntryPage from './pages/AddEntryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-brand/10 flex items-center justify-center">
            <span className="material-symbols-rounded text-brand animate-pulse" style={{ fontSize: '32px' }}>
              fitness_center
            </span>
          </div>
          <span className="text-surface-500 text-sm font-medium">Memuat AeroLift...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return null
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const initOffline = useOfflineStore((s) => s.initialize)

  useEffect(() => {
    const unsubAuth = initialize()
    const unsubOffline = initOffline()
    return () => {
      if (typeof unsubAuth === 'function') unsubAuth()
      if (typeof unsubOffline === 'function') unsubOffline()
    }
  }, [initialize, initOffline])

  return (
    <ToastProvider>
      <Routes>
        {/* Auth routes (public only) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AppShell />
            </PublicRoute>
          }
        >
          <Route index element={<LoginPage />} />
        </Route>
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AppShell />
            </PublicRoute>
          }
        >
          <Route index element={<RegisterPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="running" element={<RunningPage />} />
          <Route path="gym" element={<GymPage />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="add" element={<AddEntryPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
