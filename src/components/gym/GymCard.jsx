import { useState } from 'react'
import { formatRelativeTime } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'

export default function GymCard({ log, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const exercises = Array.isArray(log.exercises) ? log.exercises : []

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      <GlassCard className="animate-fade-in cursor-pointer hover:bg-white/[0.02] transition-colors" padding="p-5">
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
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(log)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-brand hover:bg-brand/10 transition"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(log.id)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
            </button>
          )}
        </div>
      </div>

      {!isExpanded && (
        <div className="flex items-center justify-center mt-2">
          <span className="material-symbols-rounded text-surface-600">expand_more</span>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col gap-4 animate-fade-in mt-4 pt-4 border-t border-white/5">
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
      {isExpanded && log.image_url && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="rounded-xl overflow-hidden bg-black/20">
            <img
              src={log.image_url}
              alt="Foto sesi"
              className="w-full h-auto object-contain max-h-[60vh]"
              loading="lazy"
            />
          </div>
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation()
              try {
                const response = await fetch(log.image_url)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `gym_${log.id}.jpg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
              } catch (err) {
                window.open(log.image_url, '_blank')
              }
            }}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/[0.04] border border-white/5 text-surface-300 hover:text-brand hover:border-brand/20 transition-all text-xs font-semibold self-start"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>download</span>
            Unduh Foto
          </button>
        </div>
      )}
      
      {isExpanded && (
        <div className="flex items-center justify-center mt-4">
          <span className="material-symbols-rounded text-surface-600">expand_less</span>
        </div>
      )}
        </div>
      )}
      </GlassCard>
    </div>
  )
}
