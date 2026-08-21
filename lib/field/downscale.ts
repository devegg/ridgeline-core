/**
 * Shrink a camera photo before it goes anywhere.
 *
 * A modern phone camera produces a 3–6 MB JPEG. That is far more than a
 * business card needs, and it was the direct cause of a save failure in the
 * field: Next.js caps Server Action request bodies (1 MB by default), so the
 * upload was rejected before `saveCardAction` ever ran and the browser showed
 * a bare "client-side exception".
 *
 * The body limit is now raised in next.config.ts as a backstop, but sending
 * 5 MB over one bar of cell signal is the wrong fix. 1600px on the long edge
 * is plenty for OCR and for reading the card later, and lands around 200 KB.
 *
 * `imageOrientation: 'from-image'` applies the EXIF rotation, so a card shot
 * in portrait is not stored (or OCR'd) sideways.
 */
const MAX_EDGE = 1600
const QUALITY = 0.85

export async function downscaleImage(file: File): Promise<File> {
  // Not worth touching something already small, and never fail the capture
  // just because resizing did — the original still works below the limit.
  if (file.size < 400_000) return file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 3_000_000) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    )
    if (!blob) return file

    // If the "smaller" version somehow isn't, keep the original.
    if (blob.size >= file.size) return file

    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
