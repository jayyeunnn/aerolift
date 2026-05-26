import { useState, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { parseGymVoice } from '../../utils/voiceParser'
import { applyWatermark, uploadWatermarkedImage } from '../../utils/canvasWatermark'
import { enqueueOperation } from '../../utils/offlineQueue'
import { useOfflineStore } from '../../stores/offlineStore'
import { supabase } from '../../config/supabase'
import { useToast } from '../ui/Toast'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import VoiceButton from '../ui/VoiceButton'
import ExerciseRow from './ExerciseRow'
import RestTimer from './RestTimer'

const ROUTINES = ['Push', 'Pull', 'Legs']

const emptyExercise = () => ({ name: '', sets: '', reps: '', weight: '' })

export default function GymForm({ onSuccess }) {
  const { user } = useAuthStore()
  const isOnline = useOnlineStatus()
  const { refreshPendingCount } = useOfflineStore()
  const { addToast } = useToast()

  const [routineName, setRoutineName] = useState('Push')
  const [exercises, setExercises] = useState([emptyExercise()])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Voice input for adding exercises
  const { isListening, transcript, startListening, stopListening, isSupported } =
    useSpeechRecognition({
      onResult: (finalTranscript) => {
        const parsed = parseGymVoice(finalTranscript)
        if (parsed.name || parsed.sets || parsed.reps || parsed.weight) {
          const newExercise = {
            name: parsed.name || '',
            sets: parsed.sets ? String(parsed.sets) : '',
            reps: parsed.reps ? String(parsed.reps) : '',
            weight: parsed.weight ? String(parsed.weight) : '',
          }
          setExercises((prev) => {
            // Fill the last empty row, or add a new one
            const lastIdx = prev.length - 1
            if (prev[lastIdx] && !prev[lastIdx].name) {
              const updated = [...prev]
              updated[lastIdx] = newExercise
              return updated
            }
            return [...prev, newExercise]
          })
          addToast('Latihan ditambahkan dari suara!', 'success')
        }
      },
    })

  const handleExerciseChange = (index, updated) => {
    setExercises((prev) => {
      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  const addExercise = () => {
    setExercises((prev) => [...prev, emptyExercise()])
  }

  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    // Validate at least one exercise with a name
    const validExercises = exercises.filter((ex) => ex.name.trim())
    if (validExercises.length === 0) {
      addToast('Tambahkan minimal satu latihan.', 'error')
      return
    }

    setLoading(true)

    try {
      let imageUrl = ''

      if (imageFile && isOnline) {
        const watermarkedBlob = await applyWatermark(imageFile, {
          text: 'AeroLift',
          subtitle: `${routineName} Day • ${validExercises.length} latihan`,
        })
        imageUrl = await uploadWatermarkedImage(supabase, watermarkedBlob, user.id, 'gym')
      }

      const exercisesJson = validExercises.map((ex) => ({
        name: ex.name.trim(),
        sets: parseInt(ex.sets) || 0,
        reps: parseInt(ex.reps) || 0,
        weight: parseFloat(ex.weight) || 0,
      }))

      const logData = {
        user_id: user.id,
        routine_name: routineName,
        exercises: exercisesJson,
        image_url: imageUrl,
      }

      if (isOnline) {
        const { error } = await supabase.from('gym_logs').insert(logData)
        if (error) throw error
        addToast('Sesi gym berhasil disimpan! 💪', 'success')
      } else {
        await enqueueOperation({ table: 'gym_logs', type: 'insert', data: logData })
        await refreshPendingCount()
        addToast('Disimpan offline. Akan disinkronkan saat online.', 'info')
      }

      // Reset form
      setExercises([emptyExercise()])
      removeImage()
      onSuccess?.()
    } catch (err) {
      addToast(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-white">
            <span className="material-symbols-rounded">fitness_center</span>
          </div>
          <h2 className="font-bold text-lg text-white">Catat Sesi Gym</h2>
        </div>

        <VoiceButton
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
          isSupported={isSupported}
        />
      </div>

      {/* Voice transcript */}
      {isListening && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Mendengarkan...</span>
          </div>
          <p className="text-sm text-surface-300">{transcript || 'Ucapkan latihan Anda...'}</p>
          <p className="text-xs text-surface-500 mt-1">
            Contoh: "bench press 3 set 10 rep 60 kilo"
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Routine selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-400">Jenis Rutinitas</label>
          <div className="flex gap-2">
            {ROUTINES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoutineName(r)}
                className={`flex-1 py-3 text-center rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  routineName === r
                    ? 'bg-brand text-black glow-brand'
                    : 'bg-surface-800/50 border border-white/5 text-surface-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-surface-400">Daftar Latihan</label>
          {exercises.map((exercise, index) => (
            <ExerciseRow
              key={index}
              exercise={exercise}
              index={index}
              onChange={handleExerciseChange}
              onRemove={removeExercise}
              canRemove={exercises.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={addExercise}
            icon="add"
            size="sm"
          >
            Tambah Latihan
          </Button>
        </div>

        {/* Rest Timer */}
        <RestTimer />

        {/* Photo upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-surface-400">Foto Sesi (opsional)</label>
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span>
              </button>
              <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-brand/80 text-black text-xs font-bold">
                Watermark akan ditambahkan
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed border-surface-700 hover:border-brand/30 text-surface-500 hover:text-surface-300 transition-colors flex flex-col items-center gap-2"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>add_a_photo</span>
              <span className="text-sm">Tambahkan foto</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          icon="save"
          id="gym-submit"
        >
          Simpan Sesi Gym
        </Button>
      </form>
    </GlassCard>
  )
}
