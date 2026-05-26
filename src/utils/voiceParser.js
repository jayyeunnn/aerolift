/**
 * Voice Parser Utility
 *
 * Parses transcribed text from Web Speech API and extracts
 * structured data for running and gym forms using regex and
 * keyword mapping.
 */

/**
 * Parse running-related voice transcript
 * Supports Indonesian and English keywords:
 * - "jarak 5 kilometer" / "distance 5 km"
 * - "waktu 30 menit 15 detik" / "duration 30 minutes"
 * - "heart rate 145" / "detak jantung 145"
 * - "langkah 6000" / "steps 6000"
 *
 * @param {string} transcript - Raw speech transcript
 * @returns {Object} Parsed fields { distance, duration, avgHeartRate, totalSteps }
 */
export function parseRunningVoice(transcript) {
  const text = transcript.toLowerCase().trim()
  const result = {
    distance: null,
    duration: null,
    avgHeartRate: null,
    totalSteps: null,
    preWorkoutNotes: null,
  }

  // Distance: "jarak 5.2 km" / "jarak 5 kilo" / "distance 5.2"
  const distanceMatch = text.match(
    /(?:jarak|distance|lari)\s+(\d+[.,]?\d*)\s*(?:km|kilo|kilometer)?/
  )
  if (distanceMatch) {
    result.distance = parseFloat(distanceMatch[1].replace(',', '.'))
  }

  // Duration: "waktu 30 menit 15 detik" / "waktu 30 menit" / "duration 35 minutes"
  const durationFullMatch = text.match(
    /(?:waktu|durasi|duration|tempo)\s+(\d+)\s*(?:menit|minutes?|min)\s*(?:(\d+)\s*(?:detik|seconds?|sec))?/
  )
  if (durationFullMatch) {
    const mins = parseInt(durationFullMatch[1], 10)
    const secs = durationFullMatch[2] ? parseInt(durationFullMatch[2], 10) : 0
    result.duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Heart Rate: "heart rate 145" / "detak jantung 145" / "hr 145"
  const hrMatch = text.match(
    /(?:heart\s*rate|detak\s*jantung|hr|bpm)\s+(\d{2,3})/
  )
  if (hrMatch) {
    result.avgHeartRate = parseInt(hrMatch[1], 10)
  }

  // Total Steps: "langkah 6000" / "steps 6000"
  const stepsMatch = text.match(
    /(?:langkah|steps?|total\s*langkah)\s+(\d+)/
  )
  if (stepsMatch) {
    result.totalSteps = parseInt(stepsMatch[1], 10)
  }

  // Pre-workout notes: "catatan ..." / "notes ..."
  const notesMatch = text.match(
    /(?:catatan|notes?|memo)\s+(.+)/
  )
  if (notesMatch) {
    result.preWorkoutNotes = notesMatch[1].trim()
  }

  return result
}

/**
 * Parse gym-related voice transcript
 * Supports:
 * - "bench press 3 set 10 rep 60 kilo"
 * - "squat 4 set 8 rep 80 kg"
 * - "push up 3 set 15 rep"
 *
 * @param {string} transcript - Raw speech transcript
 * @returns {Object} Parsed exercise { name, sets, reps, weight }
 */
export function parseGymVoice(transcript) {
  const text = transcript.toLowerCase().trim()
  const result = {
    name: null,
    sets: null,
    reps: null,
    weight: null,
  }

  // Pattern: "[exercise name] [N] set [N] rep [N] kg/kilo"
  const fullMatch = text.match(
    /^(.+?)\s+(\d+)\s*(?:set|sets)\s+(\d+)\s*(?:rep|reps|repetisi)\s*(?:(\d+[.,]?\d*)\s*(?:kg|kilo|kilogram))?/
  )

  if (fullMatch) {
    result.name = capitalizeWords(fullMatch[1].trim())
    result.sets = parseInt(fullMatch[2], 10)
    result.reps = parseInt(fullMatch[3], 10)
    if (fullMatch[4]) {
      result.weight = parseFloat(fullMatch[4].replace(',', '.'))
    }
  } else {
    // Fallback: try to extract individual fields
    const setsMatch = text.match(/(\d+)\s*(?:set|sets)/)
    const repsMatch = text.match(/(\d+)\s*(?:rep|reps|repetisi)/)
    const weightMatch = text.match(/(\d+[.,]?\d*)\s*(?:kg|kilo|kilogram)/)

    if (setsMatch) result.sets = parseInt(setsMatch[1], 10)
    if (repsMatch) result.reps = parseInt(repsMatch[1], 10)
    if (weightMatch) result.weight = parseFloat(weightMatch[1].replace(',', '.'))

    // Extract exercise name (everything before the first number)
    const nameMatch = text.match(/^([a-zA-Z\s]+?)(?:\s+\d)/)
    if (nameMatch) {
      result.name = capitalizeWords(nameMatch[1].trim())
    }
  }

  return result
}

/**
 * Capitalize the first letter of each word
 */
function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}
