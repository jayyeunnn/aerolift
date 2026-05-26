import { useState } from 'react'
import NutritionForm from '../components/nutrition/NutritionForm'
import NutritionHistory from '../components/nutrition/NutritionHistory'
import Modal from '../components/ui/Modal'

export default function NutritionPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingLog, setEditingLog] = useState(null)

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleEditSuccess = () => {
    setRefreshKey((k) => k + 1)
    setEditingLog(null)
  }

  return (
    <>
      <p className="text-surface-400 text-sm mb-4 animate-fade-in">
        Jurnal asupan makanan harianmu.
      </p>

      <NutritionForm onSuccess={handleSuccess} />
      <div className="mt-6">
        <NutritionHistory refreshKey={refreshKey} onEdit={setEditingLog} />
      </div>

      {/* Edit Modal Form */}
      <Modal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title={
          <span className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>restaurant</span>
            </span>
            <span>Ubah Catatan Makanan</span>
          </span>
        }
      >
        <NutritionForm log={editingLog} onSuccess={handleEditSuccess} />
      </Modal>
    </>
  )
}

