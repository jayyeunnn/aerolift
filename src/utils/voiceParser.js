/**
 * Voice Parser Utility
 *
 * Parses transcribed text from Web Speech API and extracts
 * structured data for running and gym forms using regex and
 * keyword mapping. Fully supports Indonesian spoken number words.
 */

/**
 * Parses Indonesian number words or digits from the start of a text string.
 * E.g., "lima" -> 5, "dua puluh lima" -> 25, "satu setengah" -> 1.5, "1.5" -> 1.5
 */
export function parseStartOfTextAsNumber(text) {
  if (!text) return null

  // 1. Try to match digits at the start, e.g. "5.2", "5", "5,2"
  const digitMatch = text.match(/^(\d+(?:[.,]\d+)?)/)
  if (digitMatch) {
    return parseFloat(digitMatch[1].replace(',', '.'))
  }

  // 2. Try to match Indonesian number words at the start
  const words = text.split(/\s+/)
  const wordValues = {
    'nol': 0, 'satu': 1, 'se': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'belas': 10, 'puluh': 10, 'ratus': 100, 'ribu': 1000,
    'koma': '.', 'dan': '', 'setengah': 0.5
  }

  let total = 0
  let group = 0
  let temp = 0
  let isParsingNumber = false
  let decimalMode = false
  let decimalPlace = 0.1

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    
    if (wordValues[w] !== undefined || w === 'koma') {
      isParsingNumber = true
      
      if (w === 'koma') {
        decimalMode = true
        continue
      }
      
      if (decimalMode) {
        const val = wordValues[w]
        if (val !== undefined && val < 10) {
          temp += val * decimalPlace
          decimalPlace *= 0.1
        }
        continue
      }

      if (w === 'setengah') {
        temp = (temp === 0) ? 0.5 : temp + 0.5
      } else if (w === 'ribu') {
        if (temp !== 0) {
          group += temp
          temp = 0
        }
        if (group === 0) group = 1
        total += group * 1000
        group = 0
      } else if (w === 'ratus') {
        if (temp === 0) temp = 1
        group += temp * 100
        temp = 0
      } else if (w === 'puluh') {
        if (temp === 0) temp = 1
        group += temp * 10
        temp = 0
      } else if (w === 'belas') {
        if (temp === 0) temp = 1
        group += temp + 10
        temp = 0
      } else {
        const val = wordValues[w]
        if (w === 'sebelas') {
          temp = 11
        } else if (w === 'sepuluh') {
          group += 10
        } else if (w === 'seratus') {
          group += 100
        } else if (w === 'seribu') {
          total += 1000
        } else {
          temp = val
        }
      }
    } else {
      if (isParsingNumber) {
        break
      }
    }
  }

  if (isParsingNumber) {
    if (temp !== 0) {
      group += temp
    }
    total += group
    return total
  }

  return null
}

/**
 * Extracts a number from the end of a words list (working backwards).
 */
function parseEndOfTextAsNumber(words) {
  if (!words || words.length === 0) return null

  const wordValues = {
    'nol': 0, 'satu': 1, 'se': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'belas': 10, 'puluh': 10, 'ratus': 100, 'ribu': 1000,
    'koma': '.', 'setengah': 0.5
  }

  const lastWord = words[words.length - 1]
  const digitMatch = lastWord.match(/^(\d+(?:[.,]\d+)?)$/)
  if (digitMatch) {
    return parseFloat(digitMatch[1].replace(',', '.'))
  }

  let numberWords = []
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i]
    if (wordValues[w] !== undefined || w === 'koma') {
      numberWords.unshift(w)
    } else {
      if (numberWords.length > 0) {
        break
      }
    }
  }

  if (numberWords.length > 0) {
    return parseStartOfTextAsNumber(numberWords.join(' '))
  }

  return null
}

/**
 * Extracts a number that immediately precedes a given keyword.
 */
function getNumberBeforeKeyword(text, keyword) {
  const lowercaseText = text.toLowerCase()
  const idx = lowercaseText.indexOf(keyword)
  if (idx !== -1) {
    const before = lowercaseText.substring(0, idx).trim()
    const words = before.split(/\s+/)
    return parseEndOfTextAsNumber(words)
  }
  return null
}

/**
 * Extracts a number that immediately follows any of the given keywords.
 */
function getNumberAfterKeywords(text, keywords) {
  const lowercaseText = text.toLowerCase()
  for (const kw of keywords) {
    const idx = lowercaseText.indexOf(kw)
    if (idx !== -1) {
      const after = lowercaseText.substring(idx + kw.length).trim()
      const num = parseStartOfTextAsNumber(after)
      if (num !== null) return num
    }
  }
  return null
}

/**
 * Extracts exercise name by grabbing words before the first number word/digit.
 */
function getGymExerciseName(text) {
  const words = text.split(/\s+/)
  const wordValues = {
    'nol': 0, 'satu': 1, 'se': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'belas': 10, 'puluh': 10, 'ratus': 100, 'ribu': 1000,
    'koma': '.', 'setengah': 0.5
  }

  const nameWords = []
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (w.match(/^\d/) || wordValues[w] !== undefined) {
      break
    }
    nameWords.push(w)
  }

  if (nameWords.length > 0) {
    return capitalizeWords(nameWords.join(' '))
  }
  return null
}

/**
 * Capitalizes the first letter of each word.
 */
function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Parse running-related voice transcript
 *
 * @param {string} transcript - Raw speech transcript
 * @returns {Object} Parsed fields { distance, duration, avgHeartRate, totalSteps, preWorkoutNotes }
 */
export function parseRunningVoice(transcript) {
  if (!transcript) return { distance: null, duration: null, avgPace: null, avgHeartRate: null, totalSteps: null, preWorkoutNotes: null }

  const text = transcript.toLowerCase().trim()
  
  // 1. Distance
  const distance = getNumberAfterKeywords(text, ['jarak', 'distance', 'lari'])

  // 2. Duration
  let duration = null
  const mins = getNumberBeforeKeyword(text, 'menit') || getNumberBeforeKeyword(text, 'minute') || getNumberBeforeKeyword(text, 'min')
  const secs = getNumberBeforeKeyword(text, 'detik') || getNumberBeforeKeyword(text, 'second') || getNumberBeforeKeyword(text, 'sec') || 0
  if (mins !== null) {
    duration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  } else {
    const rawDur = getNumberAfterKeywords(text, ['waktu', 'durasi', 'duration', 'tempo'])
    if (rawDur !== null) {
      duration = `${String(rawDur).padStart(2, '0')}:00`
    }
  }

  // 3. Heart Rate
  const avgHeartRate = getNumberAfterKeywords(text, ['heart rate', 'detak jantung', 'hr', 'bpm'])

  // 4. Total Steps
  const totalSteps = getNumberAfterKeywords(text, ['langkah', 'steps', 'total langkah'])

  // 5. Pre-workout notes
  let preWorkoutNotes = null
  const notesMatch = text.match(/(?:catatan|notes?|memo)\s+(.+)/)
  if (notesMatch) {
    preWorkoutNotes = notesMatch[1].trim()
  }

  // 6. Avg Pace
  let avgPace = null
  const paceKeywords = ['pace', 'ritme', 'kecepatan']
  for (const kw of paceKeywords) {
    const idx = text.indexOf(kw)
    if (idx !== -1) {
      const after = text.substring(idx + kw.length).trim()
      const minsPace = getNumberBeforeKeyword(after, 'menit') || getNumberBeforeKeyword(after, 'minute') || getNumberBeforeKeyword(after, 'min')
      const secsPace = getNumberBeforeKeyword(after, 'detik') || getNumberBeforeKeyword(after, 'second') || getNumberBeforeKeyword(after, 'sec')
      
      if (minsPace !== null) {
        if (secsPace !== null) {
          avgPace = `${minsPace}'${String(secsPace).padStart(2, '0')}"`
        } else {
          avgPace = `${minsPace}'00"`
        }
      } else {
        const firstNum = parseStartOfTextAsNumber(after)
        if (firstNum !== null) {
          const remainingText = after.replace(/^[a-zA-Z0-9.,\s]+?(?=\s|$)/, '').trim()
          const secondNum = parseStartOfTextAsNumber(remainingText)
          if (secondNum !== null && secondNum < 60 && !remainingText.includes('menit') && !remainingText.includes('detik')) {
            avgPace = `${firstNum}'${String(secondNum).padStart(2, '0')}"`
          } else {
            if (firstNum % 1 !== 0) {
              const wholeMins = Math.floor(firstNum)
              const fractionSecs = Math.round((firstNum - wholeMins) * 60)
              avgPace = `${wholeMins}'${String(fractionSecs).padStart(2, '0')}"`
            } else {
              avgPace = `${firstNum}'00"`
            }
          }
        }
      }
      if (avgPace) break
    }
  }

  return {
    distance,
    duration,
    avgPace,
    avgHeartRate,
    totalSteps,
    preWorkoutNotes,
  }
}

/**
 * Parse gym-related voice transcript
 *
 * @param {string} transcript - Raw speech transcript
 * @returns {Object} Parsed exercise { name, sets, reps, weight }
 */
export function parseGymVoice(transcript) {
  if (!transcript) return { name: null, sets: null, reps: null, weight: null }

  const text = transcript.toLowerCase().trim()

  const name = getGymExerciseName(text)
  const sets = getNumberBeforeKeyword(text, 'set')
  const reps = getNumberBeforeKeyword(text, 'rep') || getNumberBeforeKeyword(text, 'repetisi')
  const weight = getNumberBeforeKeyword(text, 'kg') || getNumberBeforeKeyword(text, 'kilo') || getNumberBeforeKeyword(text, 'kilogram')

  return {
    name,
    sets,
    reps,
    weight,
  }
}

