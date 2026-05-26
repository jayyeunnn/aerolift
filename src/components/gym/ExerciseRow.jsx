import Input from '../ui/Input'

/**
 * Single exercise input row for the gym form
 */
export default function ExerciseRow({ exercise, index, onChange, onRemove, canRemove }) {
  const handleChange = (field) => (e) => {
    onChange(index, { ...exercise, [field]: e.target.value })
  }

  return (
    <div className="micro-card p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
          Latihan #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      <Input
        label="Nama Latihan"
        type="text"
        placeholder="Bench Press"
        value={exercise.name}
        onChange={handleChange('name')}
        required
      />

      <div className="grid grid-cols-3 gap-2">
        <Input
          label="Set"
          type="number"
          placeholder="3"
          value={exercise.sets}
          onChange={handleChange('sets')}
        />
        <Input
          label="Rep"
          type="number"
          placeholder="10"
          value={exercise.reps}
          onChange={handleChange('reps')}
        />
        <Input
          label="Beban (kg)"
          type="number"
          step="0.5"
          placeholder="60"
          value={exercise.weight}
          onChange={handleChange('weight')}
        />
      </div>
    </div>
  )
}
