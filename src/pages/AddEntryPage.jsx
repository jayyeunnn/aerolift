import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'

const entries = [
  {
    label: 'Sesi Lari',
    description: 'Catat jarak, durasi, dan statistik lari',
    icon: 'directions_run',
    color: 'bg-brand/10 text-brand',
    path: '/running',
  },
  {
    label: 'Sesi Gym',
    description: 'Catat rutinitas dan latihan beban',
    icon: 'fitness_center',
    color: 'bg-blue-500/10 text-blue-400',
    path: '/gym',
  },
  {
    label: 'Catatan Nutrisi',
    description: 'Catat asupan makanan harian',
    icon: 'restaurant',
    color: 'bg-purple-500/10 text-purple-400',
    path: '/nutrition',
  },
]

export default function AddEntryPage() {
  const navigate = useNavigate()

  return (
    <>
      <section className="flex flex-col gap-1 mb-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Tambah Catatan
        </h1>
        <p className="text-surface-400 text-sm">
          Pilih jenis aktivitas yang ingin dicatat.
        </p>
      </section>

      <div className="flex flex-col gap-4 stagger-children">
        {entries.map((entry) => (
          <GlassCard
            key={entry.path}
            hover
            onClick={() => navigate(entry.path)}
            className="flex items-center gap-4 cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${entry.color}`}>
              <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>
                {entry.icon}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{entry.label}</h3>
              <p className="text-surface-500 text-sm">{entry.description}</p>
            </div>
            <span className="material-symbols-rounded text-surface-600" style={{ fontSize: '24px' }}>
              chevron_right
            </span>
          </GlassCard>
        ))}
      </div>
    </>
  )
}
