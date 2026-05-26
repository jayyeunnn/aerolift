import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { useToast } from '../ui/Toast'
import RunningCard from './RunningCard'

export default function RunningHistory({ refreshKey, onEdit }) {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('running_logs')
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
      .from('running_logs')
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-surface-800" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-surface-800 rounded" />
                <div className="h-3 w-16 bg-surface-800 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-surface-800/50 rounded-xl" />
              <div className="h-16 bg-surface-800/50 rounded-xl" />
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
          sprint
        </span>
        <p className="text-surface-400 font-medium">Belum ada riwayat lari</p>
        <p className="text-surface-600 text-sm mt-1">Catat sesi lari pertamamu di atas!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
        Riwayat Lari
      </h3>
      {logs.map((log) => (
        <RunningCard key={log.id} log={log} onEdit={onEdit} onDelete={handleDelete} />
      ))}
    </div>
  )
}
