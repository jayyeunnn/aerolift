import { useEffect } from 'react'

/**
 * Bottom sheet / modal overlay
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={`relative w-full ${sizes[size]} bg-surface-900 border border-white/5 
          rounded-t-[32px] sm:rounded-[32px] p-6 animate-slide-up 
          max-h-[85vh] overflow-y-auto`}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-12 h-1.5 bg-surface-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-400 hover:text-white transition"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
