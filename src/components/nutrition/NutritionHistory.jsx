import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { getTodayRange } from '../../utils/formatters'
import { useToast } from '../ui/Toast'
import NutritionCard from './NutritionCard'

export default function NutritionHistory({ refreshKey, onEdit }) {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)

    const { start, end } = getTodayRange()

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })

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
      .from('nutrition_logs')
      .delete()
      .eq('id', id)

    if (error) {
      addToast('Gagal menghapus data.', 'error')
      return
    }

    setLogs((prev) => prev.filter((log) => log.id !== id))
    addToast('Data berhasil dihapus.', 'success')
  }

  const healthyCount = logs.filter((l) => l.is_healthy).length
  const cheatCount = logs.filter((l) => !l.is_healthy).length

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="micro-card p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-surface-800" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 bg-surface-800 rounded" />
              <div className="h-3 w-20 bg-surface-800 rounded" />
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
          restaurant
        </span>
        <p className="text-surface-400 font-medium">Belum ada catatan hari ini</p>
        <p className="text-surface-600 text-sm mt-1">Mulai catat asupan makananmu!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
          Catatan Hari Ini
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-brand font-semibold">{healthyCount} sehat</span>
          <span className="text-surface-600">•</span>
          <span className="text-red-400 font-semibold">{cheatCount} cheat</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <NutritionCard key={log.id} log={log} onEdit={onEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
