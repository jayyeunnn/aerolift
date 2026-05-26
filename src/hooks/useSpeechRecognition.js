import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for Web Speech API (SpeechRecognition)
 *
 * @param {Object} options
 * @param {string} options.lang - Language code (default: 'id-ID')
 * @param {boolean} options.continuous - Keep listening (default: false)
 * @param {Function} options.onResult - Callback with transcript when speech ends
 * @returns {Object} { isListening, transcript, startListening, stopListening, isSupported, error }
 */
export function useSpeechRecognition(options = {}) {
  const {
    lang = 'id-ID',
    continuous = false,
    onResult = null,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech Recognition tidak didukung di browser ini.')
      return
    }

    // Abort existing recognition if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {}
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      if (finalTranscript && onResultRef.current) {
        onResultRef.current(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      let message = 'Terjadi kesalahan pada pengenalan suara.'
      switch (event.error) {
        case 'no-speech':
          message = 'Tidak ada suara yang terdeteksi. Silakan coba lagi.'
          break
        case 'audio-capture':
          message = 'Mikrofon tidak ditemukan. Pastikan perangkat memiliki mikrofon.'
          break
        case 'not-allowed':
          message = 'Akses mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser.'
          break
        case 'network':
          message = 'Koneksi jaringan bermasalah.'
          break
        default:
          break
      }
      setError(message)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setError(null)

    try {
      recognition.start()
    } catch (err) {
      setError('Gagal memulai pengenalan suara.')
      setIsListening(false)
    }
  }, [isSupported, lang, continuous])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  }
}

