/**
 * Micro stat card for displaying small data points
 */
export default function MicroCard({ label, value, unit, icon, className = '' }) {
  return (
    <div className={`micro-card p-4 flex flex-col gap-1 ${className}`}>
      {icon && (
        <span className="material-symbols-rounded text-surface-500 mb-1" style={{ fontSize: '16px' }}>
          {icon}
        </span>
      )}
      <span className="text-surface-500 text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
      <span className="text-white font-bold text-xl">
        {value}
        {unit && (
          <span className="text-xs text-surface-500 ml-1">{unit}</span>
        )}
      </span>
    </div>
  )
}
