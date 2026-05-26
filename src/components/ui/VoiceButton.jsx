/**
 * Microphone button with recording pulse animation
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
        relative w-12 h-12 rounded-2xl flex items-center justify-center
        transition-all duration-300
        ${isListening
          ? 'bg-red-500 text-white glow-brand-lg scale-110'
          : 'bg-surface-800/50 border border-white/5 text-surface-400 hover:text-brand hover:border-brand/20'
        }
        ${className}
      `}
      title={isListening ? 'Hentikan perekaman' : 'Mulai input suara'}
    >
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
        style={{ fontSize: '22px' }}
      >
        {isListening ? 'stop' : 'mic'}
      </span>
    </button>
  )
}
