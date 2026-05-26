import { formatRelativeTime } from '../../utils/formatters'
import GlassCard from '../ui/GlassCard'
import MicroCard from '../ui/MicroCard'

export default function RunningCard({ log, onDelete }) {
  return (
    <GlassCard className="animate-fade-in" padding="p-5">
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
        {onDelete && (
          <button
            onClick={() => onDelete(log.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MicroCard label="JARAK" value={parseFloat(log.distance).toFixed(2)} unit="KM" />
        <MicroCard label="WAKTU" value={log.duration || '—'} />
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
