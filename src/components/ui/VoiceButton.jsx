/**
 * Microphone card button with recording pulse animation and text details
 */
export default function VoiceButton({
  isListening = false,
  onStart,
  onStop,
  isSupported = true,
  className = '',
}) {
  if (!isSupported) return null

  const handleClick = () => {
    if (isListening) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full p-4 rounded-2xl border flex items-center gap-4 text-left
        transition-all duration-300 active:scale-[0.99]
        ${isListening
          ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse'
          : 'bg-surface-800/40 border-white/5 hover:border-brand/20 hover:bg-surface-800/60'
        }
        ${className}
      `}
    >
      {/* Mic Icon Container */}
      <div className="relative shrink-0">
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isListening
            ? 'bg-red-500 text-white'
            : 'bg-brand/10 text-brand'
          }
        `}>
          {/* Pulse ring when listening */}
          {isListening && (
            <>
              <span
                className="absolute inset-0 rounded-2xl bg-red-500/30"
                style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
              />
              <span
                className="absolute inset-0 rounded-2xl bg-red-500/15"
                style={{ animation: 'pulse-ring 1.5s ease-out 0.5s infinite' }}
              />
            </>
          )}
          <span
            className="material-symbols-rounded relative z-10"
            style={{ fontSize: '24px' }}
          >
            {isListening ? 'stop' : 'mic'}
          </span>
        </div>
      </div>

      {/* Label and Info */}
      <div className="flex flex-col flex-1">
        <span className="text-white font-bold text-sm">
          {isListening ? 'Sedang Mendengarkan...' : 'Catat dengan Suara'}
        </span>
        <span className="text-surface-500 text-xs mt-0.5">
          {isListening 
            ? 'Ketuk untuk selesai berbicara' 
            : 'Gunakan suara untuk mengisi formulir otomatis'
          }
        </span>
      </div>
    </button>
  )
}

