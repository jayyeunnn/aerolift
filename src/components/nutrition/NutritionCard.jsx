import { formatRelativeTime } from '../../utils/formatters'

export default function NutritionCard({ log, onEdit, onDelete }) {
  return (
    <div className="micro-card p-4 flex items-center gap-4 animate-fade-in">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        log.is_healthy
          ? 'bg-brand/10 text-brand'
          : 'bg-red-500/10 text-red-400'
      }`}>
        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
          {log.is_healthy ? 'check_circle' : 'cancel'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-white text-sm block truncate">
          {log.food_name}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-semibold ${
            log.is_healthy ? 'text-brand' : 'text-red-400'
          }`}>
            {log.is_healthy ? 'Sehat' : 'Cheat'}
          </span>
          <span className="text-xs text-surface-600">•</span>
          <span className="text-xs text-surface-500">
            {formatRelativeTime(log.created_at)}
          </span>
        </div>
      </div>

      {/* Edit & Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(log)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-brand hover:bg-brand/10 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(log.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
          </button>
        )}
      </div>
    </div>
  )
}
