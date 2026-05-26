import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../config/supabase'
import { getWeekStart, getWeekEnd, formatRelativeTime } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'
import MicroCard from '../ui/MicroCard'

const ROUTINES = ['Push', 'Pull', 'Legs']

export default function GymCycle() {
  const { user } = useAuthStore()
  const [completedRoutines, setCompletedRoutines] = useState([])
  const [latestLogs, setLatestLogs] = useState({})
  const [activeRoutine, setActiveRoutine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchWeeklyGym() {
      setLoading(true)
      const weekStart = getWeekStart()
      const weekEnd = getWeekEnd()

      // Fetch all logs recently to find latest for each routine
      const { data, error } = await supabase
        .from('gym_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (!error && data) {
        const completedThisWeek = new Set()
        const latest = {}

        data.forEach(log => {
          // Check if it's this week
          if (log.created_at >= weekStart && log.created_at <= weekEnd) {
            completedThisWeek.add(log.routine_name)
          }
          // Store latest log per routine
          if (!latest[log.routine_name]) {
            latest[log.routine_name] = log
          }
        })

        setCompletedRoutines([...completedThisWeek])
        setLatestLogs(latest)
        
        // Auto-select the most recently completed routine, or Push by default
        if (data.length > 0) {
          setActiveRoutine(data[0].routine_name)
        } else {
          setActiveRoutine('Push')
        }
      }
      setLoading(false)
    }

    fetchWeeklyGym()
  }, [user])

  const activeLog = latestLogs[activeRoutine]

  return (
    <GlassCard className="flex flex-col animate-fade-in" style={{ animationDelay: '60ms' }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
          <span className="material-symbols-rounded">fitness_center</span>
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">Siklus Gym</h2>
          <p className="text-surface-400 text-sm">
            {completedRoutines.length}/3 sesi selesai minggu ini
          </p>
        </div>
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
              <button
                key={routine}
                onClick={() => setActiveRoutine(routine)}
                className={`
                  flex-1 py-3 text-center rounded-2xl font-semibold text-sm transition-all duration-300 cursor-pointer select-none
                  ${activeRoutine === routine ? 'ring-2 ring-brand/50' : ''}
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
              </button>
            )
          })}
        </div>
      )}

      {/* Routine Detail */}
      {!loading && activeRoutine && (
        <div className="mt-5 pt-5 border-t border-white/5 animate-fade-in">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
              Sesi {activeRoutine} Terakhir
            </h3>
            {activeLog && (
              <span className="text-xs text-surface-400 font-medium">
                {formatRelativeTime(activeLog.created_at)}
              </span>
            )}
          </div>

          {activeLog ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MicroCard 
                  label="LATIHAN" 
                  value={activeLog.exercises?.length || 0} 
                  unit="MACAM" 
                />
                <MicroCard 
                  label="TOTAL SET" 
                  value={activeLog.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0} 
                />
                <MicroCard 
                  label="BEBAN MAX" 
                  value={Math.max(...(activeLog.exercises?.map(ex => ex.weight || 0) || [0]))} 
                  unit="KG" 
                />
                <MicroCard 
                  label="TOTAL REP" 
                  value={activeLog.exercises?.reduce((sum, ex) => sum + (ex.reps || 0), 0) || 0} 
                />
              </div>
              
              <div className="flex gap-2 flex-wrap mt-1">
                {activeLog.exercises?.slice(0, 3).map((ex, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-surface-800/50 text-xs text-surface-300 border border-white/5">
                    {ex.name}
                  </span>
                ))}
                {activeLog.exercises?.length > 3 && (
                  <span className="px-2.5 py-1 rounded-lg bg-surface-800/50 text-xs text-surface-500 border border-white/5">
                    +{activeLog.exercises.length - 3} lainnya
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-surface-500 text-sm">Belum ada sesi {activeRoutine}.</p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}
