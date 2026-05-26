import { useState } from 'react'
import GymForm from '../components/gym/GymForm'
import GymHistory from '../components/gym/GymHistory'

export default function GymPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <section className="flex flex-col gap-1 mb-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Gym
        </h1>
        <p className="text-surface-400 text-sm">
          Catat rutinitas dan progres latihan beban kamu.
        </p>
      </section>

      <GymForm onSuccess={handleSuccess} />
      <GymHistory refreshKey={refreshKey} />
    </>
  )
}
