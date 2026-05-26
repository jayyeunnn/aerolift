import GlassCard from '../ui/GlassCard'

/**
 * About app view - app description, features, and version info
 */
export default function ProfileAboutView({ onBack }) {
  const features = [
    { icon: 'directions_run', text: 'Pencatatan Kardio & Angkat Beban' },
    { icon: 'mic', text: 'Input Suara Pintar' },
    { icon: 'restaurant', text: 'Jurnal Nutrisi Harian' },
    { icon: 'cloud_off', text: 'Dukungan Offline Penuh' },
    { icon: 'monitoring', text: 'Statistik & Grafik Kemajuan' },
    { icon: 'timer', text: 'Pelacak Target Mingguan' },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back header */}
      <button
        id="profile-about-back"
        onClick={onBack}
        className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors self-start -ml-1 active:scale-95"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '22px' }}>
          arrow_back
        </span>
        <span className="font-semibold text-sm">Kembali</span>
      </button>

      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Tentang Aplikasi
        </h1>
        <p className="text-surface-500 text-sm">
          Kenali lebih dekat tentang AeroLift.
        </p>
      </section>

      {/* App identity card */}
      <GlassCard className="flex flex-col items-center py-8">
        <div
          className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center mb-4"
          style={{ boxShadow: '0 0 30px rgba(195, 244, 0, 0.12)' }}
        >
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '40px' }}>
            fitness_center
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">
          AeroLift
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
            v1.0.0
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-surface-400 text-xs font-medium">
            PWA
          </span>
        </div>
      </GlassCard>

      {/* App description */}
      <GlassCard>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '20px' }}>
            description
          </span>
          Deskripsi
        </h3>
        <p className="text-sm text-surface-400 leading-relaxed">
          AeroLift adalah pelacak kebugaran minimalis yang dirancang untuk membantu kamu mencatat
          aktivitas olahraga dan nutrisi secara cepat dan mudah — kapan saja, di mana saja,
          bahkan tanpa koneksi internet.
        </p>
      </GlassCard>

      {/* Features */}
      <GlassCard className="mb-4">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-brand" style={{ fontSize: '20px' }}>
            stars
          </span>
          Fitur Utama
        </h3>

        <div className="flex flex-col gap-2">
          {features.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.02]"
            >
              <span
                className="material-symbols-rounded text-brand"
                style={{ fontSize: '20px' }}
              >
                {item.icon}
              </span>
              <span className="text-sm text-surface-300 font-medium">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
