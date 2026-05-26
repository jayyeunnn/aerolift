import { useState, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../ui/Toast'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import Button from '../ui/Button'

/**
 * Edit profile view - avatar upload, display name, weekly target, password change
 */
export default function ProfileEditView({ onBack }) {
  const { user, profile, updateProfile, updatePassword, uploadAvatar } = useAuthStore()
  const { addToast } = useToast()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [weeklyTarget, setWeeklyTarget] = useState(
    profile?.weekly_running_target?.toString() || '32'
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || 'user'}&backgroundColor=27272a`

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    const result = await updateProfile({
      display_name: displayName.trim(),
      weekly_running_target: parseFloat(weeklyTarget) || 32,
    })
    if (result.success) {
      addToast('Profil berhasil diperbarui!', 'success')
    } else {
      addToast(`Gagal memperbarui profil: ${result.error}`, 'error')
    }
    setSavingProfile(false)
  }

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      addToast('Kata sandi minimal 6 karakter.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi kata sandi tidak cocok.', 'error')
      return
    }

    setSavingPassword(true)
    const result = await updatePassword(newPassword)
    if (result.success) {
      addToast('Kata sandi berhasil diperbarui!', 'success')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      addToast(`Gagal memperbarui kata sandi: ${result.error}`, 'error')
    }
    setSavingPassword(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const result = await uploadAvatar(file)
    if (result.success) {
      addToast('Avatar berhasil diperbarui!', 'success')
    } else {
      addToast(`Gagal mengunggah avatar: ${result.error}`, 'error')
    }
    setUploadingAvatar(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back header */}
      <button
        id="profile-edit-back"
        onClick={onBack}
        className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors self-start -ml-1 active:scale-95"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>
          arrow_back
        </span>
        <span className="font-semibold text-sm">Kembali</span>
      </button>

      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Edit Profil
        </h1>
        <p className="text-surface-500 text-sm">
          Perbarui informasi akun kamu.
        </p>
      </section>

      {/* Avatar Upload */}
      <GlassCard className="flex flex-col items-center py-8">
        <div className="relative mb-4">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-brand/20"
            style={{ boxShadow: '0 0 20px rgba(195, 244, 0, 0.1)' }}
          >
            {uploadingAvatar ? (
              <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                <span className="material-symbols-rounded animate-spin text-brand">
                  progress_activity
                </span>
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button
            id="profile-edit-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-brand text-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
              photo_camera
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="text-surface-500 text-xs">Ketuk ikon kamera untuk mengganti avatar</p>
      </GlassCard>

      {/* Profile Settings */}
      <GlassCard>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '20px' }}>
            person
          </span>
          Pengaturan Profil
        </h3>

        <div className="flex flex-col gap-4">
          <Input
            id="profile-display-name"
            label="Nama Tampilan"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            icon="badge"
          />
          <Input
            id="profile-weekly-target"
            label="Target Lari Mingguan (km)"
            type="number"
            step="0.5"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(e.target.value)}
            icon="flag"
          />
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            loading={savingProfile}
            icon="save"
            id="profile-save"
          >
            Simpan Profil
          </Button>
        </div>
      </GlassCard>

      {/* Change Password */}
      <GlassCard>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '20px' }}>
            lock
          </span>
          Ubah Kata Sandi
        </h3>

        <div className="flex flex-col gap-4">
          <Input
            id="profile-new-password"
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon="lock"
          />
          <Input
            id="profile-confirm-password"
            label="Konfirmasi Kata Sandi"
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon="lock"
          />
          <Button
            variant="secondary"
            onClick={handleSavePassword}
            loading={savingPassword}
            icon="key"
            disabled={!newPassword}
            id="profile-change-password"
          >
            Ubah Kata Sandi
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
