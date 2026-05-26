/**
 * Format duration in seconds to mm:ss or hh:mm:ss string
 */
export function formatDuration(totalSeconds) {
  if (typeof totalSeconds === 'string') return totalSeconds
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Parse a duration string (mm:ss or hh:mm:ss) to total seconds
 */
export function parseDuration(str) {
  if (!str) return 0
  const parts = str.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

/**
 * Format pace as m'ss" (e.g., 5'30")
 */
export function formatPace(paceInMinutes) {
  if (typeof paceInMinutes === 'string') return paceInMinutes
  const mins = Math.floor(paceInMinutes)
  const secs = Math.round((paceInMinutes - mins) * 60)
  return `${mins}'${String(secs).padStart(2, '0')}"`
}

/**
 * Calculate pace from distance (km) and duration (total seconds)
 */
export function calculatePace(distanceKm, durationSeconds) {
  if (!distanceKm || distanceKm === 0 || !durationSeconds) return ''
  const paceMinutes = (durationSeconds / 60) / distanceKm
  return formatPace(paceMinutes)
}

/**
 * Format a date to locale-aware short date string (Indonesian)
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date to relative time (e.g., "2 jam lalu")
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return formatDate(dateString)
}

/**
 * Get the start of current week (Monday) as ISO string
 */
export function getWeekStart() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

/**
 * Get the end of current week (Sunday) as ISO string
 */
export function getWeekEnd() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7)
  const sunday = new Date(now.setDate(diff))
  sunday.setHours(23, 59, 59, 999)
  return sunday.toISOString()
}

/**
 * Get today's start and end as ISO strings
 */
export function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
