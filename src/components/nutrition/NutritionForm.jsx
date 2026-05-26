import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { enqueueOperation } from '../../utils/offlineQueue'
import { useOfflineStore } from '../../stores/offlineStore'
import { supabase } from '../../config/supabase'
import { useToast } from '../ui/Toast'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'

export default function NutritionForm({ log, onSuccess }) {
  const { user } = useAuthStore()
  const isOnline = useOnlineStatus()
  const { refreshPendingCount } = useOfflineStore()
  const { addToast } = useToast()

  const [foodName, setFoodName] = useState(log?.food_name || '')
  const [isHealthy, setIsHealthy] = useState(log ? log.is_healthy : true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    if (!foodName.trim()) {
      addToast('Nama makanan harus diisi.', 'error')
      return
    }

    setLoading(true)

    try {
      const logData = {
        user_id: user.id,
        food_name: foodName.trim(),
        is_healthy: isHealthy,
      }

      if (log) {
        // Edit mode
        if (isOnline) {
          const { error } = await supabase.from('nutrition_logs').update(logData).eq('id', log.id)
          if (error) throw error
          addToast('Catatan makanan berhasil diperbarui! 🍏', 'success')
        } else {
          await enqueueOperation({ table: 'nutrition_logs', type: 'update', id: log.id, data: logData })
          await refreshPendingCount()
          addToast('Disimpan offline. Catatan akan diperbarui saat online.', 'info')
        }
      } else {
        // Create mode
        if (isOnline) {
          const { error } = await supabase.from('nutrition_logs').insert(logData)
          if (error) throw error
          addToast(
            isHealthy ? 'Makanan sehat dicatat! 🥗' : 'Cheat meal dicatat! 🍕',
            'success'
          )
        } else {
          await enqueueOperation({ table: 'nutrition_logs', type: 'insert', data: logData })
          await refreshPendingCount()
          addToast('Disimpan offline. Akan disinkronkan saat online.', 'info')
        }
      }

      if (!log) {
        setFoodName('')
        setIsHealthy(true)
      }
      onSuccess?.()
    } catch (err) {
      addToast(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="animate-fade-in">
      {!log && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <span className="material-symbols-rounded">restaurant</span>
          </div>
          <h2 className="font-bold text-lg text-white">Catat Makanan</h2>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="nutrition-food-name"
          label="Nama Makanan"
          type="text"
          placeholder="Nasi goreng, salad, dll."
          icon="lunch_dining"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-400">Kategori</label>
          <Toggle
            id="nutrition-toggle"
            checked={isHealthy}
            onChange={setIsHealthy}
            labelOn="Sehat"
            labelOff="Cheat"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          icon="save"
          id="nutrition-submit"
        >
          {log ? 'Perbarui Catatan Makanan' : 'Simpan'}
        </Button>
      </form>
    </GlassCard>
  )
}
