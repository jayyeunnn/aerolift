/**
 * Button component with primary/secondary/ghost variants
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-brand text-black hover:bg-brand-dim glow-brand',
    secondary: 'bg-surface-800/50 border border-white/5 text-surface-300 hover:bg-surface-800 hover:text-white',
    ghost: 'text-surface-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-rounded animate-spin" style={{ fontSize: '20px' }}>
          progress_activity
        </span>
      ) : (
        icon && (
          <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
            {icon}
          </span>
        )
      )}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
          {iconRight}
        </span>
      )}
    </button>
  )
}
