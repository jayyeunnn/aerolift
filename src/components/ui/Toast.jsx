import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

/**
 * Toast notification system
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onRemove, 300)
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onRemove])

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  }

  const colors = {
    success: 'text-brand bg-brand/10 border-brand/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4 rounded-2xl border
        backdrop-blur-xl shadow-lg pointer-events-auto
        ${colors[toast.type]}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: '20px' }}>
        {icons[toast.type]}
      </span>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(onRemove, 300)
        }}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  )
}

/**
 * Hook to trigger toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
