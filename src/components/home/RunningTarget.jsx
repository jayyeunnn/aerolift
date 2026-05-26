import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { getWeekStart, getWeekEnd } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'
import MicroCard from '../ui/MicroCard'

export default function RunningTarget() {
  const { user, profile } = useAuthStore()
  const [weeklyData, setWeeklyData] = useState({
    totalDistance: 0,
    lastSession: null,
  })
  const [loading, setLoading] = useState(true)

  const weeklyTarget = profile?.weekly_running_target || 32

  useEffect(() => {
    if (!user) return

    async function fetchWeeklyRunning() {
      setLoading(true)
      const weekStart = getWeekStart()
      const weekEnd = getWeekEnd()

      const { data, error } = await supabase
        .from('running_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const totalDistance = data.reduce((sum, log) => sum + (parseFloat(log.distance) || 0), 0)
        setWeeklyData({
          totalDistance: Math.round(totalDistance * 100) / 100,
          lastSession: data[0] || null,
        })
      }
      setLoading(false)
    }

    fetchWeeklyRunning()
  }, [user])

  const remaining = Math.max(0, weeklyTarget - weeklyData.totalDistance)
  const percentage = weeklyTarget > 0 ? Math.round((weeklyData.totalDistance / weeklyTarget) * 100) : 0
  const last = weeklyData.lastSession

  return (
    <GlassCard className="flex flex-col md:col-span-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <span className="material-symbols-rounded">directions_run</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Target Lari</h2>
            <p className="text-surface-400 text-sm">Target Mingguan: {weeklyTarget} km</p>
          </div>
        </div>
        {percentage >= 100 && (
          <span className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-[11px] font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>emoji_events</span>
            Tercapai!
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-surface-800 rounded-xl w-32" />
            <div className="h-4 bg-surface-800 rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-extrabold text-white">
                {weeklyData.totalDistance}{' '}
                <span className="text-lg text-surface-500 font-medium">km</span>
              </span>
              <span className="text-sm font-medium text-brand">
                {Math.min(percentage, 100)}% Selesai
              </span>
            </div>
            <div className="w-full h-4 bg-surface-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-brand rounded-full relative transition-all duration-1000 ease-out progress-glow"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full rounded-full" />
              </div>
            </div>
            <p className="text-xs text-surface-500 mt-2 text-right">
              {remaining > 0
                ? `Sisa ${remaining.toFixed(1)} km lagi`
                : 'Target minggu ini tercapai! 🎉'}
            </p>
          </>
        )}
      </div>

      {/* Last Session Stats */}
      {last && (
        <>
          <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">
            Sesi Terakhir
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MicroCard label="JARAK" value={parseFloat(last.distance).toFixed(2)} unit="KM" />
            <MicroCard label="WAKTU" value={last.duration || '—'} />
            <MicroCard label="AVG PACE" value={last.avg_pace || '—'} />
            <MicroCard
              label="HEART RATE"
              value={
                <span className="flex items-center gap-1">
                  {last.avg_heart_rate || '—'}
                  {last.avg_heart_rate > 0 && (
                    <span
                      className="material-symbols-rounded text-red-400"
                      style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  )}
                </span>
              }
            />
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !last && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="material-symbols-rounded text-surface-700 mb-2" style={{ fontSize: '40px' }}>
            sprint
          </span>
          <p className="text-surface-500 text-sm">Belum ada sesi lari minggu ini.</p>
          <p className="text-surface-600 text-xs mt-1">Mulai berlari dan catat progresmu!</p>
        </div>
      )}
    </GlassCard>
  )
}
