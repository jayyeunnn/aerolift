import { useState } from 'react'
import { formatRelativeTime } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'
import MicroCard from '../ui/MicroCard'

export default function RunningCard({ log, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      <GlassCard className="animate-fade-in cursor-pointer hover:bg-white/[0.02] transition-colors" padding="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>directions_run</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm">Sesi Lari</span>
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

      {/* Main Stats (Always visible) */}
      <div className="grid grid-cols-2 gap-2">
        <MicroCard label="JARAK" value={parseFloat(log.distance).toFixed(2)} unit="KM" />
        <MicroCard label="WAKTU" value={log.duration || '—'} />
      </div>

      {!isExpanded && (
        <div className="flex items-center justify-center mt-3">
          <span className="material-symbols-rounded text-surface-600">expand_more</span>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col gap-4 animate-fade-in mt-4 pt-4 border-t border-white/5">
          <div className="grid grid-cols-2 gap-2">
        {log.avg_pace && <MicroCard label="PACE" value={log.avg_pace} />}
        {log.avg_heart_rate > 0 && (
          <MicroCard
            label="HR"
            value={
              <span className="flex items-center gap-1">
                {log.avg_heart_rate}
                <span className="material-symbols-rounded text-red-400" style={{ fontSize: '12px' }}>favorite</span>
              </span>
            }
          />
        )}
      </div>

      {/* Steps */}
      {log.total_steps > 0 && (
        <div className="flex items-center gap-2 text-xs text-surface-400 mb-2">
          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>footprint</span>
          {log.total_steps.toLocaleString('id-ID')} langkah
        </div>
      )}

      {/* Pre-workout notes */}
      {log.pre_workout_notes && (
        <p className="text-xs text-surface-500 italic mt-1">
          📝 {log.pre_workout_notes}
        </p>
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
                link.download = `running_${log.id}.jpg`
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
