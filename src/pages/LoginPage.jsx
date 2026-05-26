import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!email || !password) return

    const result = await login(email, password)
    if (result.success) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center mb-10 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center mb-4">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '40px' }}>
            fitness_center
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AeroLift</h1>
        <p className="text-surface-500 text-sm mt-1">Pelacak Kebugaran Minimalis</p>
      </div>

      {/* Login Form */}
      <div className="glass-card p-8 w-full max-w-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-bold text-white mb-1">Masuk</h2>
        <p className="text-surface-500 text-sm mb-6">Masuk ke akun AeroLift kamu</p>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 animate-fade-in">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="login-email"
            label="Email"
            type="email"
            icon="mail"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div className="relative">
            <Input
              id="login-password"
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-surface-500 hover:text-surface-300 transition"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="mt-2"
            id="login-submit"
          >
            Masuk
          </Button>
        </form>
      </div>

      {/* Register link */}
      <p className="text-surface-500 text-sm mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        Belum punya akun?{' '}
        <Link to="/register" className="text-brand font-semibold hover:underline">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  )
}
