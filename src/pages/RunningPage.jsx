import { useState } from 'react'
import { createPortal } from 'react-dom'
import RunningForm from '../components/running/RunningForm'
import RunningHistory from '../components/running/RunningHistory'
import Modal from '../components/ui/Modal'

export default function RunningPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
    setIsFormOpen(false)
  }

  const handleEditSuccess = () => {
    setRefreshKey((k) => k + 1)
    setEditingLog(null)
  }

  return (
    <>
      <p className="text-surface-400 text-sm mb-6 animate-fade-in">
        Catat dan pantau setiap sesi lari kamu.
      </p>

      <RunningHistory refreshKey={refreshKey} onEdit={setEditingLog} />

      {/* FAB */}
      {createPortal(
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-[100px] right-6 w-14 h-14 bg-brand text-black rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(195,244,0,0.4)] hover:scale-105 active:scale-95 transition-all z-40"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>add</span>
        </button>,
        document.body
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          <span className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>directions_run</span>
            </span>
            <span>Catat Sesi Lari</span>
          </span>
        }
      >
        <RunningForm onSuccess={handleSuccess} />
      </Modal>

      {/* Edit Modal Form */}
      <Modal
        isOpen={!!editingLog}
        onClose={() => setEditingLog(null)}
        title={
          <span className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>directions_run</span>
            </span>
            <span>Ubah Sesi Lari</span>
          </span>
        }
      >
        <RunningForm log={editingLog} onSuccess={handleEditSuccess} />
      </Modal>
    </>
  )
}


