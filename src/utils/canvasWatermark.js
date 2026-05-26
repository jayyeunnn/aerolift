/**
 * Canvas Watermark Utility
 *
 * Composites a watermark overlay onto an uploaded photo before
 * uploading the resulting blob to Supabase Storage.
 */

/**
 * Apply AeroLift watermark to an image file
 * @param {File} file - The original image file
 * @param {Object} options - Watermark options
 * @param {string} options.text - Main watermark text (e.g., "AeroLift")
 * @param {string} options.subtitle - Secondary line (e.g., "Running • 4.0 km")
 * @param {string} options.date - Date string
 * @returns {Promise<Blob>} - Watermarked image as blob
 */
export function applyWatermark(file, options = {}) {
  const {
    text = 'AeroLift',
    subtitle = '',
    date = new Date().toLocaleDateString('id-ID'),
    brandColor = '#c3f400',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Semi-transparent gradient overlay at the bottom
        const gradientHeight = img.height * 0.35 // Slightly taller gradient for multi-line text
        const gradient = ctx.createLinearGradient(
          0,
          img.height - gradientHeight,
          0,
          img.height
        )
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, img.height - gradientHeight, img.width, gradientHeight)

        // Calculate responsive font sizes based on image width
        const baseFontSize = Math.max(16, Math.floor(img.width / 26))
        const subtitleFontSize = Math.max(12, Math.floor(baseFontSize * 0.6))
        const dateFontSize = Math.max(10, Math.floor(baseFontSize * 0.45))
        const padding = Math.max(16, Math.floor(img.width / 25))

        // Brand text setup
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'

        let currentY = img.height - padding

        // Date (smallest, bottom)
        if (date) {
          ctx.font = `500 ${dateFontSize}px Inter, sans-serif`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.fillText(date, padding, currentY)
          currentY -= dateFontSize + 6
        }

        // Subtitles (can be array for multi-line)
        if (subtitle) {
          const subtitles = Array.isArray(subtitle) ? subtitle : [subtitle]
          ctx.font = `600 ${subtitleFontSize}px Inter, sans-serif`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          
          for (let i = subtitles.length - 1; i >= 0; i--) {
            ctx.fillText(subtitles[i], padding, currentY)
            currentY -= subtitleFontSize + 6
          }
        }

        // Brand name
        ctx.font = `800 ${baseFontSize}px Inter, sans-serif`
        ctx.fillStyle = brandColor
        ctx.fillText(text, padding, currentY)

        // Small brand dot indicator in top-right
        const dotSize = Math.max(8, Math.floor(img.width / 60))
        ctx.beginPath()
        ctx.arc(img.width - padding - dotSize, padding + dotSize, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = brandColor
        ctx.fill()

        // Export as blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Gagal membuat watermark pada gambar.'))
            }
          },
          'image/jpeg',
          0.9
        )
      }

      img.onerror = () => reject(new Error('Gagal memuat gambar.'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload a watermarked image to Supabase Storage
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Blob} blob - Watermarked image blob
 * @param {string} userId - User ID for folder namespacing
 * @param {string} type - 'running' or 'gym'
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export async function uploadWatermarkedImage(supabase, blob, userId, type = 'running') {
  const timestamp = Date.now()
  const fileName = `${userId}/${type}_${timestamp}.jpg`

  const { error } = await supabase.storage
    .from('workout-photos')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Gagal mengunggah foto: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('workout-photos')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
