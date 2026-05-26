import { forwardRef } from 'react'

/**
 * Styled input component with label and error state
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    icon,
    type = 'text',
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-surface-400">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-surface-500" style={{ fontSize: '20px' }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full rounded-2xl bg-surface-900/50 dark:bg-surface-900/50 border border-white/5 
            px-4 py-3.5 text-white dark:text-white placeholder:text-surface-600 
            focus:border-brand/30 transition-colors
            ${icon ? 'pl-12' : ''} 
            ${error ? 'border-red-500/30' : ''} 
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
          {error}
        </span>
      )}
    </div>
  )
})

export default Input
