import { formatRelativeTime } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'

export default function GymCard({ log, onDelete }) {
  const exercises = Array.isArray(log.exercises) ? log.exercises : []

  return (
    <GlassCard className="animate-fade-in" padding="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            log.routine_name === 'Push'
              ? 'bg-brand/10 text-brand'
              : log.routine_name === 'Pull'
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-purple-500/10 text-purple-400'
          }`}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>fitness_center</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{log.routine_name} Day</span>
              <span className="px-2 py-0.5 rounded-lg bg-surface-800/50 text-[10px] font-semibold text-surface-400 uppercase">
                {exercises.length} latihan
              </span>
            </div>
            <p className="text-xs text-surface-500">{formatRelativeTime(log.created_at)}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(log.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
          </button>
        )}
      </div>

      {/* Exercises list */}
      {exercises.length > 0 && (
        <div className="flex flex-col gap-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02]">
              <span className="text-sm text-surface-300 font-medium">{ex.name}</span>
              <div className="flex items-center gap-3 text-xs text-surface-500">
                {ex.sets > 0 && <span>{ex.sets} set</span>}
                {ex.reps > 0 && <span>{ex.reps} rep</span>}
                {ex.weight > 0 && (
                  <span className="text-brand font-semibold">{ex.weight} kg</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image thumbnail */}
      {log.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={log.image_url}
            alt="Foto sesi"
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </div>
      )}
    </GlassCard>
  )
}
