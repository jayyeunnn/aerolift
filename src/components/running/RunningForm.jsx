import { useState, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { parseRunningVoice } from '../../utils/voiceParser'
import { applyWatermark, uploadWatermarkedImage } from '../../utils/canvasWatermark'
import { enqueueOperation } from '../../utils/offlineQueue'
import { useOfflineStore } from '../../stores/offlineStore'
import { supabase } from '../../config/supabase'
import { useToast } from '../ui/Toast'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import Button from '../ui/Button'
import VoiceButton from '../ui/VoiceButton'

export default function RunningForm({ onSuccess }) {
  const { user } = useAuthStore()
  const isOnline = useOnlineStatus()
  const { refreshPendingCount } = useOfflineStore()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    distance: '',
    duration: '',
    avg_pace: '',
    avg_heart_rate: '',
    total_steps: '',
    pre_workout_notes: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Voice input
  const { isListening, transcript, startListening, stopListening, isSupported } =
    useSpeechRecognition({
      onResult: (finalTranscript) => {
        const parsed = parseRunningVoice(finalTranscript)
        setForm((prev) => ({
          ...prev,
          ...(parsed.distance !== null && { distance: String(parsed.distance) }),
          ...(parsed.duration !== null && { duration: parsed.duration }),
          ...(parsed.avgHeartRate !== null && { avg_heart_rate: String(parsed.avgHeartRate) }),
          ...(parsed.totalSteps !== null && { total_steps: String(parsed.totalSteps) }),
          ...(parsed.preWorkoutNotes !== null && { pre_workout_notes: parsed.preWorkoutNotes }),
        }))
        addToast('Data suara berhasil diproses!', 'success')
      },
    })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
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

    const distance = parseFloat(form.distance)
    if (!distance || distance <= 0) {
      addToast('Jarak harus diisi dengan angka yang valid.', 'error')
      return
    }

    setLoading(true)

    try {
      let imageUrl = ''

      // Watermark and upload image if present
      if (imageFile && isOnline) {
        const watermarkedBlob = await applyWatermark(imageFile, {
          text: 'AeroLift',
          subtitle: `Running • ${distance} km`,
        })
        imageUrl = await uploadWatermarkedImage(supabase, watermarkedBlob, user.id, 'running')
      }

      const logData = {
        user_id: user.id,
        distance,
        duration: form.duration || '00:00',
        avg_pace: form.avg_pace || '',
        avg_heart_rate: parseInt(form.avg_heart_rate) || 0,
        total_steps: parseInt(form.total_steps) || 0,
        pre_workout_notes: form.pre_workout_notes || '',
        image_url: imageUrl,
      }

      if (isOnline) {
        const { error } = await supabase.from('running_logs').insert(logData)
        if (error) throw error
        addToast('Sesi lari berhasil disimpan! 🏃', 'success')
      } else {
        await enqueueOperation({ table: 'running_logs', type: 'insert', data: logData })
        await refreshPendingCount()
        addToast('Disimpan offline. Akan disinkronkan saat online.', 'info')
      }

      // Reset form
      setForm({
        distance: '',
        duration: '',
        avg_pace: '',
        avg_heart_rate: '',
        total_steps: '',
        pre_workout_notes: '',
      })
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
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <span className="material-symbols-rounded">directions_run</span>
          </div>
          <h2 className="font-bold text-lg text-white">Catat Sesi Lari</h2>
        </div>

        {/* Voice input button */}
        <VoiceButton
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
          isSupported={isSupported}
        />
      </div>

      {/* Voice transcript display */}
      {isListening && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Mendengarkan...</span>
          </div>
          <p className="text-sm text-surface-300">{transcript || 'Ucapkan data lari Anda...'}</p>
          <p className="text-xs text-surface-500 mt-1">
            Contoh: "jarak 5 kilometer waktu 30 menit heart rate 145"
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Row 1: Distance + Duration */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="running-distance"
            label="Jarak (km)"
            type="number"
            step="0.01"
            placeholder="5.00"
            icon="straighten"
            value={form.distance}
            onChange={handleChange('distance')}
            required
          />
          <Input
            id="running-duration"
            label="Durasi (mm:ss)"
            type="text"
            placeholder="30:00"
            icon="timer"
            value={form.duration}
            onChange={handleChange('duration')}
          />
        </div>

        {/* Row 2: Pace + Heart Rate */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="running-pace"
            label="Avg Pace"
            type="text"
            placeholder="6'00&quot;"
            icon="speed"
            value={form.avg_pace}
            onChange={handleChange('avg_pace')}
          />
          <Input
            id="running-heart-rate"
            label="Heart Rate"
            type="number"
            placeholder="145"
            icon="favorite"
            value={form.avg_heart_rate}
            onChange={handleChange('avg_heart_rate')}
          />
        </div>

        {/* Row 3: Steps */}
        <Input
          id="running-steps"
          label="Total Langkah"
          type="number"
          placeholder="6000"
          icon="footprint"
          value={form.total_steps}
          onChange={handleChange('total_steps')}
        />

        {/* Row 4: Pre-workout notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-400">Catatan Pre-Workout</label>
          <textarea
            id="running-notes"
            rows={2}
            placeholder="Pemanasan, stretching, atau catatan lainnya..."
            value={form.pre_workout_notes}
            onChange={handleChange('pre_workout_notes')}
            className="w-full rounded-2xl bg-surface-900/50 border border-white/5 px-4 py-3.5 text-white placeholder:text-surface-600 focus:border-brand/30 transition-colors resize-none"
          />
        </div>

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
          id="running-submit"
        >
          Simpan Sesi Lari
        </Button>
      </form>
    </GlassCard>
  )
}
