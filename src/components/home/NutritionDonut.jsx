import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { getTodayRange } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'
import DonutChart from '../ui/DonutChart'

export default function NutritionDonut() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ healthy: 0, unhealthy: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchTodayNutrition() {
      setLoading(true)
      const { start, end } = getTodayRange()

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('is_healthy')
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lte('created_at', end)

      if (!error && data) {
        const healthy = data.filter((d) => d.is_healthy).length
        const unhealthy = data.filter((d) => !d.is_healthy).length
        setStats({ healthy, unhealthy })
      }
      setLoading(false)
    }

    fetchTodayNutrition()
  }, [user])

  const total = stats.healthy + stats.unhealthy
  const healthyPercentage = total > 0 ? Math.round((stats.healthy / total) * 100) : 0

  return (
    <GlassCard className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '120ms' }}>
      <div>
        <div className="flex items-center gap-4 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <span className="material-symbols-rounded">restaurant</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Nutrisi Harian</h2>
            <p className="text-surface-400 text-xs mt-0.5">
              {total > 0 ? 'Rasio konsumsi hari ini' : 'Belum ada catatan hari ini'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand" />
            <span className="text-sm text-surface-300 font-medium">
              Sehat ({total > 0 ? `${healthyPercentage}%` : '—'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="text-sm text-surface-500 font-medium">
              Cheat ({total > 0 ? `${100 - healthyPercentage}%` : '—'})
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-[100px] h-[100px] rounded-full bg-surface-800 animate-pulse" />
      ) : (
        <DonutChart
          percentage={total > 0 ? healthyPercentage : 0}
          size={100}
          strokeWidth={12}
        >
          {total > 0 ? (
            <span className="text-xl font-bold text-white">{healthyPercentage}%</span>
          ) : (
            <span className="text-xs text-surface-500 text-center">Belum<br/>ada data</span>
          )}
        </DonutChart>
      )}
    </GlassCard>
  )
}
