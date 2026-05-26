import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import ProfileMainView from '../components/profile/ProfileMainView'
import ProfileEditView from '../components/profile/ProfileEditView'
import ProfileAboutView from '../components/profile/ProfileAboutView'

/**
 * Profile page orchestrator with multi-view state.
 * Uses conditional rendering (not routing) so the bottom nav stays visible.
 * Views: 'main' | 'edit' | 'about'
 */
export default function ProfilePage() {
  const [activeView, setActiveView] = useState('main')
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleNavigate = (view) => {
    setActiveView(view)
  }

  const handleBack = () => {
    setActiveView('main')
  }

  return (
    <>
      {activeView === 'main' && (
        <ProfileMainView
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'edit' && (
        <ProfileEditView onBack={handleBack} />
      )}

      {activeView === 'about' && (
        <ProfileAboutView onBack={handleBack} />
      )}
    </>
  )
}
