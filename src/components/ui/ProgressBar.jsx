/**
 * Neon progress bar with glow effect
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  showPercentage = true,
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-end mb-2">
          {label && (
            <span className="text-3xl font-extrabold text-white">
              {value} <span className="text-lg text-surface-500 font-medium">{typeof max === 'number' ? '' : max}</span>
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-brand">
              {Math.round(percentage)}% Selesai
            </span>
          )}
        </div>
      )}
      <div className="w-full h-4 bg-surface-800 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-brand rounded-full relative transition-all duration-700 ease-out progress-glow"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
