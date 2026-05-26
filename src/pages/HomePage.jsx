import RunningTarget from '../components/home/RunningTarget'
import GymCycle from '../components/home/GymCycle'
import NutritionDonut from '../components/home/NutritionDonut'

export default function HomePage() {
  return (
    <>
      {/* Section heading */}
      <section className="flex flex-col gap-1 mb-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Ringkasan Mingguan
        </h1>
        <p className="text-surface-400 text-sm">
          Pantau progres dan konsistensi latihanmu minggu ini.
        </p>
      </section>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Running Target - Large card */}
        <RunningTarget />

        {/* Right column: Gym + Nutrition */}
        <div className="flex flex-col gap-6 md:col-span-4">
          <GymCycle />
          <NutritionDonut />
        </div>
      </div>
    </>
  )
}
