/**
 * CSS conic-gradient donut chart
 */
export default function DonutChart({
  percentage = 0,
  size = 100,
  strokeWidth = 12,
  color = 'var(--color-brand)',
  trackColor = '#27272a',
  children,
  className = '',
}) {
  const clampedPct = Math.min(100, Math.max(0, percentage))
  const holeSize = size - strokeWidth * 2

  return (
    <div
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `conic-gradient(${color} 0% ${clampedPct}%, ${trackColor} ${clampedPct}% 100%)`,
      }}
    >
      <div
        className="rounded-full flex flex-col items-center justify-center bg-surface-950 dark:bg-surface-950"
        style={{
          width: `${holeSize}px`,
          height: `${holeSize}px`,
        }}
      >
        {children || (
          <span className="text-xl font-bold text-white">{clampedPct}%</span>
        )}
      </div>
    </div>
  )
}
