import { useState } from 'react'
import NutritionForm from '../components/nutrition/NutritionForm'
import NutritionHistory from '../components/nutrition/NutritionHistory'

export default function NutritionPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <section className="flex flex-col gap-1 mb-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Nutrisi
        </h1>
        <p className="text-surface-400 text-sm">
          Jurnal asupan makanan harianmu.
        </p>
      </section>

      <NutritionForm onSuccess={handleSuccess} />
      <NutritionHistory refreshKey={refreshKey} />
    </>
  )
}
