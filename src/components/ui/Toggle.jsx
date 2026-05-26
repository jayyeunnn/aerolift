/**
 * Healthy/Unhealthy toggle switch
 */
export default function Toggle({
  checked = false,
  onChange,
  labelOn = 'Sehat',
  labelOff = 'Cheat',
  className = '',
  id,
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl
        border transition-all duration-300 cursor-pointer
        ${checked
          ? 'bg-brand/10 border-brand/20 text-brand'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
        }
        ${className}
      `}
    >
      <span
        className="material-symbols-rounded transition-transform duration-300"
        style={{ fontSize: '20px' }}
      >
        {checked ? 'check_circle' : 'cancel'}
      </span>
      <span className="font-semibold text-sm">
        {checked ? labelOn : labelOff}
      </span>

      {/* Animated dot indicator */}
      <div
        className={`
          w-2.5 h-2.5 rounded-full ml-auto transition-colors duration-300
          ${checked ? 'bg-brand' : 'bg-red-400'}
        `}
      />
    </button>
  )
}
