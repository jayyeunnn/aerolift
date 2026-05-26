import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { getWeekStart, getWeekEnd } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'

const ROUTINES = ['Push', 'Pull', 'Legs']

export default function GymCycle() {
  const { user } = useAuthStore()
  const [completedRoutines, setCompletedRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchWeeklyGym() {
      setLoading(true)
      const weekStart = getWeekStart()
      const weekEnd = getWeekEnd()

      const { data, error } = await supabase
        .from('gym_logs')
        .select('routine_name')
        .eq('user_id', user.id)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd)

      if (!error && data) {
        const completed = [...new Set(data.map((log) => log.routine_name))]
        setCompletedRoutines(completed)
      }
      setLoading(false)
    }

    fetchWeeklyGym()
  }, [user])

  return (
    <GlassCard className="flex flex-col animate-fade-in" style={{ animationDelay: '60ms' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-white">
          <span className="material-symbols-rounded">fitness_center</span>
        </div>
        <h2 className="font-bold text-lg text-white">Siklus Gym</h2>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-12 bg-surface-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          {ROUTINES.map((routine) => {
            const isCompleted = completedRoutines.includes(routine)
            return (
              <div
                key={routine}
                className={`
                  flex-1 py-3 text-center rounded-2xl font-semibold text-sm transition-all duration-300
                  ${isCompleted
                    ? 'bg-brand text-black font-bold shadow-[0_0_20px_rgba(195,244,0,0.3)]'
                    : 'bg-surface-800/50 border border-white/5 text-surface-400'
                  }
                `}
              >
                {routine}
                {isCompleted && (
                  <span className="material-symbols-rounded ml-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>
                    check
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Weekly count */}
      <p className="text-xs text-surface-500 mt-3 text-center">
        {completedRoutines.length}/3 sesi selesai minggu ini
      </p>
    </GlassCard>
  )
}
