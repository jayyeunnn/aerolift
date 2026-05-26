import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

/**
 * VoiceInputModal component
 * A bottom sheet overlay that provides interactive speech recognition
 * and allows users to record and parse transactions or sessions.
 * 
 * Props:
 * - isOpen (boolean): Modal visibility
 * - onClose (function): Modal close callback
 * - onResult (function): Callback triggered when speech parsing is accepted
 * - onParse (function): Function to parse the accumulated transcript text
 * - title (string): Modal title
 * - subtitle (string): Modal subtitle
 * - exampleText (string): Optional example phrase to read
 * - renderPreview (function): Function rendering a preview of the parsed results
 * - brandColor (string): CSS color code for accenting success states and buttons
 */
export default function VoiceInputModal({
  isOpen,
  onClose,
  onResult,
  onParse,
  title = 'Pencatatan Otomatis dengan Suara',
  subtitle = 'Sebutkan detail sesi latihan Anda.',
  exampleText = '',
  renderPreview = null,
  brandColor = '#c3f400', // Default neon green
}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [success, setSuccess] = useState(false)
  const [parsedPreview, setParsedPreview] = useState(null)
  const [isClosing, setIsClosing] = useState(false)

  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  // Keep transcriptRef up to date immediately
  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false // Auto stop when user stops speaking
    recognition.interimResults = true // Show results in real time
    recognition.lang = 'id-ID' // Indonesian language support

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setSuccess(false)
      setTranscript('')
      transcriptRef.current = ''
      setParsedPreview(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e)
      setIsListening(false)
      if (e.error === 'not-allowed') {
        setError('Akses mikrofon ditolak. Harap izinkan mikrofon di pengaturan browser Anda.')
      } else if (e.error === 'no-speech') {
        setError('Suara tidak terdeteksi. Silakan coba lagi.')
      } else if (e.error === 'network') {
        setError('Koneksi ke server pengenal suara terganggu (Network Error). VPN/Proxy yang aktif dapat menghalangi koneksi ke server transkripsi browser.')
      } else {
        setError(`Error: ${e.error}. Silakan coba lagi.`)
      }
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const text = (finalTranscript + interimTranscript).trim()
      transcriptRef.current = text
      setTranscript(text)
    }

    recognitionRef.current = recognition
  }, [])

  // Auto-start recording when modal opens
  useEffect(() => {
    if (isOpen && isSupported && recognitionRef.current) {
      const timer = setTimeout(() => {
        startListening()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isSupported])

  // Stop recording when modal is closed
  useEffect(() => {
    if (!isOpen) {
      stopListening()
      setTranscript('')
      setError('')
      setSuccess(false)
      setParsedPreview(null)
    }
  }, [isOpen])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return
    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Start listening error:', err)
    }
  }

  const stopListening = () => {
    if (!isSupported || !recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch (err) {
      // Ignore if already stopped
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    stopListening()
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250)
  }

  const handleProcess = () => {
    stopListening()
    const finalTranscript = transcriptRef.current || transcript
    if (!finalTranscript.trim()) {
      setError('Tidak ada suara yang direkam. Silakan bicara terlebih dahulu.')
      return
    }

    // Process and parse transaction
    if (onParse) {
      const parsed = onParse(finalTranscript)
      setParsedPreview(parsed)
      setSuccess(true)

      // Delay calling onResult so the user gets a nice visual success checkmark
      setTimeout(() => {
        onResult(parsed)
        onClose()
      }, 1200)
    } else {
      onResult(finalTranscript)
      onClose()
    }
  }

  // Handle keypress Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Auto-process on silence (onend)
  useEffect(() => {
    // If not listening, and we have a transcript but haven't parsed yet, auto-process
    if (!isListening && transcriptRef.current.trim() && !success && !error && isOpen) {
      handleProcess()
    }
  }, [isListening])

  if (!isOpen) return null

  const modalRoot = document.getElementById('modal-root') || document.body

  const content = (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Stylesheet injector for voice-specific animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voiceRipple {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes voiceWave {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .voice-ripple-1 {
          animation: voiceRipple 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .voice-ripple-2 {
          animation: voiceRipple 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 0.6s;
        }
        .voice-ripple-3 {
          animation: voiceRipple 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 1.2s;
        }
        .voice-wave-bar {
          animation: voiceWave 0.7s ease-in-out infinite;
        }
      ` }} />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'
        }`}
        onClick={handleClose}
      />

      {/* Sheet Container */}
      <div
        className={`
          relative w-full max-w-lg bg-surface-900 border-t border-white/5
          rounded-t-[32px] shadow-2xl
          max-h-[85dvh] overflow-y-auto
          p-6 pb-8 pb-safe flex flex-col items-center z-10
          transition-transform duration-200
          ${isClosing ? 'translate-y-full' : 'translate-y-0 animate-slide-up'}
        `}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-surface-700 rounded-full mb-6" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-800 transition-colors"
          aria-label="Tutup"
        >
          <span className="material-symbols-rounded text-surface-400">close</span>
        </button>

        <h3 className="text-lg font-bold text-white text-center mb-1">
          {title}
        </h3>
        <p className="text-sm text-surface-400 text-center mb-4 max-w-xs leading-relaxed">
          {subtitle}
        </p>

        {exampleText && (
          <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-center mb-6 max-w-xs leading-relaxed">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-0.5">Contoh:</p>
            <p className="text-xs text-surface-300 italic">
              "{exampleText}"
            </p>
          </div>
        )}

        {/* Microphones Visualizer Area */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {success ? (
            /* Success State */
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-black shadow-lg animate-scale-in"
              style={{ backgroundColor: brandColor }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '44px', fontWeight: 'bold' }}>check</span>
            </div>
          ) : !isSupported ? (
            /* Not Supported State */
            <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-md">
              <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>mic_off</span>
            </div>
          ) : (
            /* Recording/Idle State */
            <>
              {/* Ripple Rings */}
              {isListening && (
                <>
                  <div className="absolute w-24 h-24 rounded-full bg-red-500/20 voice-ripple-1"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-red-500/20 voice-ripple-2"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-red-500/20 voice-ripple-3"></div>
                </>
              )}

              {/* Central Mic Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`
                  relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300
                  ${isListening ? 'bg-red-500 scale-105 shadow-red-500/30' : 'bg-surface-800 hover:bg-surface-700 hover:scale-102'}
                `}
              >
                <span className={`material-symbols-rounded ${isListening ? 'animate-pulse' : ''}`} style={{ fontSize: '36px' }}>
                  {isListening ? 'stop' : 'mic'}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Equalizer Sound Waves (Only visible when listening) */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-6 mb-6">
            <div className="w-1 h-3 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }}></div>
            <div className="w-1 h-5 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }}></div>
            <div className="w-1 h-2 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }}></div>
            <div className="w-1 h-6 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}></div>
            <div className="w-1 h-4 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.5s', animationDuration: '0.6s' }}></div>
            <div className="w-1 h-5 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.6s', animationDuration: '0.9s' }}></div>
            <div className="w-1 h-2 bg-red-500 rounded-full voice-wave-bar" style={{ animationDelay: '0.7s', animationDuration: '0.4s' }}></div>
          </div>
        )}

        {/* Status Text */}
        <div className="text-center font-medium text-sm mb-4">
          {success ? (
            <span className="flex items-center justify-center gap-1 font-semibold" style={{ color: brandColor }}>
              <span className="material-symbols-rounded text-base font-bold">check</span> Berhasil dianalisis!
            </span>
          ) : isListening ? (
            <span className="text-red-400 animate-pulse flex items-center justify-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> Mendengarkan...
            </span>
          ) : error ? (
            <span className="text-red-400 flex items-center justify-center gap-1 px-4 text-xs">
              <span className="material-symbols-rounded text-sm shrink-0">error</span> {error}
            </span>
          ) : !isSupported ? (
            <span className="text-surface-400">Browser tidak mendukung input suara.</span>
          ) : transcript ? (
            <span className="text-surface-300">Selesai berbicara. Menganalisis...</span>
          ) : (
            <span className="text-surface-400">Ketuk mikrofon untuk mulai berbicara.</span>
          )}
        </div>

        {/* Transcript Box */}
        {(transcript || isListening) && (
          <div className="w-full bg-surface-950 rounded-2xl p-4 mb-6 border border-white/5 min-h-[80px] max-h-[140px] overflow-y-auto flex items-center justify-center">
            <p className={`text-center text-sm ${transcript ? 'text-white font-medium' : 'text-surface-500 italic'}`}>
              {transcript || 'Teks ucapan Anda akan muncul di sini...'}
            </p>
          </div>
        )}

        {/* Success Preview */}
        {success && parsedPreview && renderPreview && (
          <div 
            className="w-full rounded-2xl p-4 mb-6 border animate-fade-in flex flex-col gap-2"
            style={{ 
              backgroundColor: `${brandColor}0d`, // 5% opacity
              borderColor: `${brandColor}33` // 20% opacity
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: brandColor }}>Hasil Deteksi</div>
            {renderPreview(parsedPreview)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex gap-3 mt-auto">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleClose}
            disabled={success}
          >
            Batal
          </Button>

          {isSupported && (
            <Button
              variant="primary"
              fullWidth
              disabled={!transcript.trim() || success}
              onClick={handleProcess}
              style={{
                backgroundColor: success ? undefined : brandColor,
                color: success ? undefined : '#000000',
              }}
            >
              Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(content, modalRoot)
}
