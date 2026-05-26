import { useState } from 'react'
import RunningForm from '../components/running/RunningForm'
import RunningHistory from '../components/running/RunningHistory'

export default function RunningPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <section className="flex flex-col gap-1 mb-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Lari
        </h1>
        <p className="text-surface-400 text-sm">
          Catat dan pantau setiap sesi lari kamu.
        </p>
      </section>

      <RunningForm onSuccess={handleSuccess} />
      <RunningHistory refreshKey={refreshKey} />
    </>
  )
}
