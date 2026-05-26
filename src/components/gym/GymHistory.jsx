import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { useToast } from '../ui/Toast'
import GymCard from './GymCard'

export default function GymHistory({ refreshKey, onEdit }) {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === 'all') return true
    const logDate = new Date(log.created_at)
    const now = new Date()
    const diffTime = Math.abs(now - logDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (activeFilter === 'week') {
      return diffDays <= 7
    }
    if (activeFilter === 'month') {
      return diffDays <= 30
    }
    return true
  })

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('gym_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [user, refreshKey])

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('gym_logs')
      .delete()
      .eq('id', id)

    if (error) {
      addToast('Gagal menghapus data.', 'error')
      return
    }

    setLogs((prev) => prev.filter((log) => log.id !== id))
    addToast('Data berhasil dihapus.', 'success')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-surface-800" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-surface-800 rounded" />
                <div className="h-3 w-16 bg-surface-800 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-10 bg-surface-800/50 rounded-xl" />
              <div className="h-10 bg-surface-800/50 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-symbols-rounded text-surface-700 mb-3" style={{ fontSize: '48px' }}>
          fitness_center
        </span>
        <p className="text-surface-400 font-medium">Belum ada riwayat gym</p>
        <p className="text-surface-600 text-sm mt-1">Catat sesi gym pertamamu di atas!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
        Riwayat Gym
      </h3>

      {/* Segmented Filter Control */}
      <div className="flex gap-1 p-1 rounded-2xl bg-surface-900/60 border border-white/5">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'week', label: 'Minggu Ini' },
          { id: 'month', label: 'Bulan Ini' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
              activeFilter === f.id
                ? 'bg-brand text-black glow-brand'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="material-symbols-rounded text-surface-700 mb-2" style={{ fontSize: '36px' }}>
            filter_list_off
          </span>
          <p className="text-surface-400 text-sm font-medium">Tidak ada riwayat untuk periode ini</p>
          <p className="text-surface-600 text-xs mt-0.5">Coba ganti filter atau catat sesi baru!</p>
        </div>
      ) : (
        filteredLogs.map((log) => (
          <GymCard key={log.id} log={log} onEdit={onEdit} onDelete={handleDelete} />
        ))
      )}
    </div>
  )
}
