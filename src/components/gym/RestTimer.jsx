import { useState, useEffect, useRef, useCallback } from 'react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

/**
 * Customizable rest timer with Web Audio API beep
 */
export default function RestTimer() {
  const [duration, setDuration] = useState(90) // default 90 seconds
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const intervalRef = useRef(null)
  const audioContextRef = useRef(null)

  const presets = [30, 60, 90, 120, 180]

  // Web Audio API beep
  const playBeep = useCallback(() => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = ctx

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 note

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)

      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(1100, ctx.currentTime)
        gain2.gain.setValueAtTime(0.3, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.5)
      }, 300)
    } catch (e) {
      console.warn('Audio playback failed:', e)
    }
  }, [])

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            playBeep()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, remaining, playBeep])

  const startTimer = () => {
    setRemaining(duration)
    setIsRunning(true)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setRemaining(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? ((duration - remaining) / duration) * 100 : 0

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-800/50 border border-white/5 text-surface-400 hover:text-white transition text-sm"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>timer</span>
        Timer Istirahat
      </button>
    )
  }

  return (
    <GlassCard padding="p-4" className="animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '20px' }}>timer</span>
          <span className="font-bold text-sm text-white">Timer Istirahat</span>
        </div>
        <button
          type="button"
          onClick={() => { stopTimer(); setIsOpen(false) }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-600 hover:text-white transition"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>

      {/* Timer display */}
      <div className="text-center mb-4">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular progress ring */}
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={remaining > 0 ? '#c3f400' : 'rgba(255,255,255,0.05)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-3xl font-extrabold text-white">
            {isRunning ? formatTime(remaining) : formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Preset buttons */}
      {!isRunning && (
        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          {presets.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setDuration(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                duration === sec
                  ? 'bg-brand text-black'
                  : 'bg-surface-800/50 text-surface-400 hover:text-white'
              }`}
            >
              {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {isRunning ? (
          <Button variant="danger" fullWidth onClick={stopTimer} icon="stop">
            Berhenti
          </Button>
        ) : (
          <Button variant="primary" fullWidth onClick={startTimer} icon="play_arrow">
            Mulai
          </Button>
        )}
      </div>
    </GlassCard>
  )
}
